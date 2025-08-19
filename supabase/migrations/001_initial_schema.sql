-- Initial schema for TeamMeet video conferencing app
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE participant_role AS ENUM ('owner', 'moderator', 'member', 'guest');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Rooms table for video conference rooms
CREATE TABLE public.rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  is_persistent BOOLEAN DEFAULT true NOT NULL,
  max_participants INTEGER DEFAULT 25 NOT NULL,
  is_public BOOLEAN DEFAULT false NOT NULL,
  settings JSONB DEFAULT '{}' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on rooms table
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- Room participants junction table
CREATE TABLE public.room_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  role participant_role DEFAULT 'member' NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_seen TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  guest_token_id UUID, -- Will reference guest_tokens after it's created
  UNIQUE(room_id, user_id)
);

-- Enable RLS on room_participants table
ALTER TABLE public.room_participants ENABLE ROW LEVEL SECURITY;

-- Guest access tokens for rooms
CREATE TABLE public.guest_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL, -- Guest display name
  expires_at TIMESTAMPTZ NOT NULL,
  max_uses INTEGER DEFAULT 1 NOT NULL,
  current_uses INTEGER DEFAULT 0 NOT NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL
);

-- Enable RLS on guest_tokens table
ALTER TABLE public.guest_tokens ENABLE ROW LEVEL SECURITY;

-- Add foreign key constraint to room_participants after guest_tokens is created
ALTER TABLE public.room_participants 
ADD CONSTRAINT fk_room_participants_guest_token 
FOREIGN KEY (guest_token_id) REFERENCES public.guest_tokens(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX idx_rooms_owner_id ON public.rooms(owner_id);
CREATE INDEX idx_rooms_slug ON public.rooms(slug);
CREATE INDEX idx_rooms_created_at ON public.rooms(created_at DESC);
CREATE INDEX idx_room_participants_room_id ON public.room_participants(room_id);
CREATE INDEX idx_room_participants_user_id ON public.room_participants(user_id);
CREATE INDEX idx_room_participants_joined_at ON public.room_participants(joined_at DESC);
CREATE INDEX idx_guest_tokens_room_id ON public.guest_tokens(room_id);
CREATE INDEX idx_guest_tokens_token_hash ON public.guest_tokens(token_hash);
CREATE INDEX idx_guest_tokens_expires_at ON public.guest_tokens(expires_at);

-- Auto-update updated_at timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON public.rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate unique room slugs
CREATE OR REPLACE FUNCTION generate_room_slug(room_name TEXT)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Create base slug from room name
    base_slug := lower(trim(regexp_replace(room_name, '[^a-zA-Z0-9\s]', '', 'g')));
    base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
    
    -- Ensure slug is not empty
    IF base_slug = '' THEN
        base_slug := 'room';
    END IF;
    
    final_slug := base_slug;
    
    -- Check for uniqueness and append counter if needed
    WHILE EXISTS (SELECT 1 FROM public.rooms WHERE slug = final_slug) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Clean up expired tokens function
CREATE OR REPLACE FUNCTION cleanup_expired_guest_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM public.guest_tokens 
  WHERE expires_at < NOW() OR current_uses >= max_uses;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for rooms table
CREATE POLICY "Anyone can view public rooms" ON public.rooms
  FOR SELECT USING (is_public = true OR auth.uid() = owner_id);

CREATE POLICY "Owners can manage their rooms" ON public.rooms
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Authenticated users can create rooms" ON public.rooms
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- RLS Policies for room_participants table
CREATE POLICY "Participants can view room membership" ON public.room_participants
  FOR SELECT USING (
    user_id = auth.uid() OR 
    room_id IN (SELECT id FROM public.rooms WHERE owner_id = auth.uid())
  );

CREATE POLICY "Room owners can manage participants" ON public.room_participants
  FOR ALL USING (
    room_id IN (SELECT id FROM public.rooms WHERE owner_id = auth.uid())
  );

-- RLS Policies for guest_tokens table
CREATE POLICY "Room owners can manage guest tokens" ON public.guest_tokens
  FOR ALL USING (
    room_id IN (SELECT id FROM public.rooms WHERE owner_id = auth.uid())
  );

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
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

-- Trigger to automatically create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();