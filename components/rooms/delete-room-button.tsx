'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trash2, Loader2 } from 'lucide-react'
import { roomService } from '@/lib/services/rooms'
import { toast } from 'sonner'

interface Room {
  id: string
  name: string
  slug: string
}

interface DeleteRoomButtonProps {
  room: Room
}

export default function DeleteRoomButton({ room }: DeleteRoomButtonProps) {
  const [showDialog, setShowDialog] = useState(false)
  const [confirmationText, setConfirmationText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  const expectedConfirmation = `delete ${room.name}`
  const isConfirmationValid = confirmationText.toLowerCase() === expectedConfirmation.toLowerCase()

  const handleDeleteRoom = async () => {
    if (!isConfirmationValid) {
      toast.error('Please type the confirmation text correctly')
      return
    }

    setDeleting(true)
    try {
      const { error } = await roomService.deleteRoom(room.id)
      
      if (error) {
        console.error('Error deleting room:', error)
        toast.error('Failed to delete room. Please try again.')
        return
      }

      toast.success(`Room "${room.name}" has been permanently deleted`)
      setShowDialog(false)
      router.push('/dashboard')
    } catch (error) {
      console.error('Error deleting room:', error)
      toast.error('Failed to delete room. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  const handleDialogClose = (open: boolean) => {
    if (!deleting) {
      setShowDialog(open)
      if (!open) {
        setConfirmationText('')
      }
    }
  }

  return (
    <AlertDialog open={showDialog} onOpenChange={handleDialogClose}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Room
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Room</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              Are you sure you want to permanently delete <strong>"{room.name}"</strong>?
            </p>
            <p>This action will:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Remove all participants from the room</li>
              <li>Delete all room data and history</li>
              <li>Invalidate the room URL ({room.slug})</li>
              <li>Cannot be undone</li>
            </ul>
            <p className="text-sm">
              To confirm, type <strong>delete {room.name}</strong> below:
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2">
          <Label htmlFor="confirmation-input">Confirmation</Label>
          <Input
            id="confirmation-input"
            placeholder={`delete ${room.name}`}
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            disabled={deleting}
            className={!isConfirmationValid && confirmationText ? 'border-red-500' : ''}
          />
          {!isConfirmationValid && confirmationText && (
            <p className="text-sm text-red-500">
              Please type "delete {room.name}" exactly as shown
            </p>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteRoom}
            disabled={!isConfirmationValid || deleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting Room...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Room Forever
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}