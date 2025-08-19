'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Image from 'next/image'
import type { User } from '@supabase/supabase-js'

interface UserMenuProps {
  user: User
}

export default function UserMenu({ user }: UserMenuProps) {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleLogout = async () => {
    setIsLoading(true)
    
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Error logging out:', error.message)
    } else {
      router.push('/')
      router.refresh()
    }
    
    setIsLoading(false)
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-3">
        {user.user_metadata.avatar_url && (
          <Image
            src={user.user_metadata.avatar_url}
            alt={user.user_metadata.full_name || user.email || 'User avatar'}
            width={32}
            height={32}
            className="h-8 w-8 rounded-full"
          />
        )}
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">
            {user.user_metadata.full_name || user.email}
          </span>
          <span className="text-xs text-gray-500">{user.email}</span>
        </div>
      </div>
      
      <button
        onClick={handleLogout}
        disabled={isLoading}
        className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Signing out...' : 'Sign out'}
      </button>
    </div>
  )
}