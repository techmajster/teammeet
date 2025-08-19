'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'
import { toast } from 'sonner'

interface CopyUrlButtonProps {
  roomSlug: string
}

export default function CopyUrlButton({ roomSlug }: CopyUrlButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyUrl = async () => {
    try {
      const roomUrl = `${window.location.origin}/rooms/${roomSlug}`
      await navigator.clipboard.writeText(roomUrl)
      setCopied(true)
      toast.success('Room URL copied to clipboard!')
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (error) {
      console.error('Failed to copy URL:', error)
      toast.error('Failed to copy URL. Please try again.')
    }
  }

  return (
    <Button size="sm" variant="outline" onClick={handleCopyUrl}>
      {copied ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  )
}