'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Calendar, 
  MoreVertical, 
  Video, 
  Settings, 
  Trash2, 
  ExternalLink,
  Copy,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { roomService } from '@/lib/services/rooms'
import { toast } from 'sonner'

interface Room {
  id: string
  name: string
  description: string | null
  slug: string
  participant_count: number
  created_at: string
  owner_id: string
}

interface RoomCardProps {
  room: Room
}

export default function RoomCard({ room }: RoomCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  const handleJoinRoom = () => {
    // TODO: Implement room joining logic
    toast.info('Room joining functionality coming soon!')
  }

  const handleCopyLink = async () => {
    try {
      const roomUrl = `${window.location.origin}/rooms/${room.slug}`
      await navigator.clipboard.writeText(roomUrl)
      toast.success('Room link copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }

  const handleDeleteRoom = async () => {
    setDeleting(true)
    try {
      const { error } = await roomService.deleteRoom(room.id)
      
      if (error) {
        console.error('Error deleting room:', error)
        toast.error('Failed to delete room. Please try again.')
        return
      }

      toast.success(`Room "${room.name}" deleted successfully`)
      setShowDeleteDialog(false)
      router.refresh()
    } catch (error) {
      console.error('Error deleting room:', error)
      toast.error('Failed to delete room. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getParticipantText = (count: number) => {
    if (count === 0) return 'No participants'
    if (count === 1) return '1 participant'
    return `${count} participants`
  }

  return (
    <>
      <Card className="group hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">{room.name}</CardTitle>
              <CardDescription className="mt-1 line-clamp-2">
                {room.description || 'No description provided'}
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleJoinRoom}>
                  <Video className="mr-2 h-4 w-4" />
                  Join Room
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyLink}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Link
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/rooms/${room.slug}/settings`}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{getParticipantText(room.participant_count)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(room.created_at)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary" className="text-xs">
              {room.slug}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Active
            </Badge>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleJoinRoom}
              className="flex-1"
              size="sm"
            >
              <Video className="mr-2 h-4 w-4" />
              Join Room
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Room</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{room.name}"? This action cannot be undone.
              All participants will be removed and any room data will be permanently lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRoom}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Room'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}