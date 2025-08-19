-- Add invitation system for controlling access
-- Run this in your Supabase SQL Editor AFTER running 001_initial_schema.sql
-- Note: Domain restriction (@bb8.pl) is handled by Google Workspace OAuth settings

-- Invitation tokens table for controlling access
CREATE TABLE public.invitation_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  token TEXT NOT NULL UNIQUE,
  created_by UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  used_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  role TEXT DEFAULT 'member' NOT NULL CHECK (role IN ('admin', 'member'))
);

-- Enable RLS on invitation_tokens table
ALTER TABLE public.invitation_tokens ENABLE ROW LEVEL SECURITY;

-- Create index for better performance
CREATE INDEX idx_invitation_tokens_email ON public.invitation_tokens(email);
CREATE INDEX idx_invitation_tokens_token ON public.invitation_tokens(token);
CREATE INDEX idx_invitation_tokens_expires_at ON public.invitation_tokens(expires_at);

-- RLS Policies for invitation_tokens table
CREATE POLICY "Admins can manage invitation tokens" ON public.invitation_tokens
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND id IN (
        SELECT created_by FROM public.invitation_tokens 
        WHERE role = 'admin'
        LIMIT 1
      )
    )
  );

CREATE POLICY "Anyone can view their own invitation" ON public.invitation_tokens
  FOR SELECT USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Update the existing handle_new_user function to check invitation tokens
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  -- Check if user has a valid invitation token (optional check)
  -- Note: This is optional since Google Workspace handles domain restriction
  IF NOT EXISTS (
    SELECT 1 FROM public.invitation_tokens 
    WHERE email = NEW.email 
    AND is_active = true 
    AND expires_at > NOW()
    AND used_at IS NULL
  ) THEN
    -- For now, we'll allow all bb8.pl users even without invitation
    -- You can uncomment the line below to enforce invitations:
    -- RAISE EXCEPTION 'Valid invitation token required for access';
    NULL;
  ELSE
    -- Mark invitation token as used if it exists
    UPDATE public.invitation_tokens 
    SET used_at = NOW(), used_by = NEW.id, is_active = false
    WHERE email = NEW.email AND used_at IS NULL;
  END IF;

  -- Create user profile
  INSERT INTO public.users (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create invitation tokens (for admins)
CREATE OR REPLACE FUNCTION public.create_invitation_token(
  target_email TEXT,
  expires_in_days INTEGER DEFAULT 7,
  user_role TEXT DEFAULT 'member'
)
RETURNS TEXT AS $$
DECLARE
  token_value TEXT;
BEGIN
  -- Generate random token
  token_value := encode(gen_random_bytes(32), 'base64');
  token_value := replace(replace(replace(token_value, '/', ''), '+', ''), '=', '');

  -- Insert invitation token
  INSERT INTO public.invitation_tokens (
    email, 
    token, 
    created_by, 
    expires_at,
    role
  ) VALUES (
    target_email,
    token_value,
    auth.uid(),
    NOW() + (expires_in_days || ' days')::INTERVAL,
    user_role
  )
  ON CONFLICT (email) 
  DO UPDATE SET 
    token = token_value,
    created_by = auth.uid(),
    expires_at = NOW() + (expires_in_days || ' days')::INTERVAL,
    used_at = NULL,
    used_by = NULL,
    is_active = true;

  RETURN token_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup expired invitation tokens
CREATE OR REPLACE FUNCTION cleanup_expired_invitations()
RETURNS void AS $$
BEGIN
  DELETE FROM public.invitation_tokens 
  WHERE expires_at < NOW() AND used_at IS NULL;
END;
$$ LANGUAGE plpgsql;