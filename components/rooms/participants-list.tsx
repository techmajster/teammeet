'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  MoreVertical, 
  Crown, 
  Shield, 
  User, 
  UserMinus, 
  Calendar,
  Loader2,
  UserCheck,
  UserX
} from 'lucide-react'
import { roomService } from '@/lib/services/rooms'
import { toast } from 'sonner'

interface Participant {
  id: string
  room_id: string
  user_id: string | null
  role: 'owner' | 'moderator' | 'member' | 'guest'
  joined_at: string
  last_seen: string
  guest_token_id: string | null
  users?: {
    id: string
    name: string
    email: string
    avatar_url: string | null
  } | null
}

interface ParticipantsListProps {
  participants: Participant[]
  roomOwnerId: string
  currentUserId: string
}

export default function ParticipantsList({ 
  participants, 
  roomOwnerId, 
  currentUserId 
}: ParticipantsListProps) {
  const [removingParticipant, setRemovingParticipant] = useState<string | null>(null)
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)
  const [participantToRemove, setParticipantToRemove] = useState<Participant | null>(null)
  const [changingRole, setChangingRole] = useState<string | null>(null)
  const router = useRouter()

  const isCurrentUserOwner = currentUserId === roomOwnerId

  const getRoleIcon = (role: Participant['role']) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-3 w-3" />
      case 'moderator':
        return <Shield className="h-3 w-3" />
      case 'member':
        return <User className="h-3 w-3" />
      case 'guest':
        return <User className="h-3 w-3" />
      default:
        return <User className="h-3 w-3" />
    }
  }

  const getRoleColor = (role: Participant['role']) => {
    switch (role) {
      case 'owner':
        return 'default'
      case 'moderator':
        return 'secondary'
      case 'member':
        return 'outline'
      case 'guest':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const formatJoinDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleRemoveParticipant = (participant: Participant) => {
    setParticipantToRemove(participant)
    setShowRemoveDialog(true)
  }

  const handlePromoteParticipant = async (participant: Participant) => {
    const newRole = participant.role === 'member' ? 'moderator' : 'member'
    setChangingRole(participant.id)
    
    try {
      const { error } = await roomService.updateParticipantRole(
        participant.room_id,
        participant.id,
        newRole
      )

      if (error) {
        console.error('Error updating participant role:', error)
        toast.error('Failed to update participant role. Please try again.')
        return
      }

      const action = newRole === 'moderator' ? 'promoted to moderator' : 'changed to member'
      toast.success(`Participant ${action} successfully`)
      router.refresh()
    } catch (error) {
      console.error('Error updating participant role:', error)
      toast.error('Failed to update participant role. Please try again.')
    } finally {
      setChangingRole(null)
    }
  }

  const confirmRemoveParticipant = async () => {
    if (!participantToRemove) return

    setRemovingParticipant(participantToRemove.id)
    try {
      const { error } = await roomService.removeParticipant(
        participantToRemove.room_id, 
        participantToRemove.user_id || ''
      )

      if (error) {
        console.error('Error removing participant:', error)
        toast.error('Failed to remove participant. Please try again.')
        return
      }

      toast.success('Participant removed successfully')
      setShowRemoveDialog(false)
      setParticipantToRemove(null)
      router.refresh()
    } catch (error) {
      console.error('Error removing participant:', error)
      toast.error('Failed to remove participant. Please try again.')
    } finally {
      setRemovingParticipant(null)
    }
  }

  if (participants.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <User className="mx-auto h-8 w-8 mb-2" />
        <p className="text-sm">No participants yet</p>
        <p className="text-xs">Invite people to join your room</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {participants.map((participant) => {
          const user = participant.users
          const displayName = user?.name || `Guest ${participant.id.slice(0, 8)}`
          const isOwner = participant.role === 'owner' || participant.user_id === roomOwnerId
          const canRemove = isCurrentUserOwner && !isOwner && participant.user_id !== currentUserId
          const canChangeRole = isCurrentUserOwner && !isOwner && participant.user_id !== currentUserId && 
                                (participant.role === 'member' || participant.role === 'moderator')

          return (
            <div
              key={participant.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar_url || ''} alt={displayName} />
                  <AvatarFallback className="text-xs">
                    {getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{displayName}</p>
                    <Badge 
                      variant={getRoleColor(participant.role)} 
                      className="text-xs h-5"
                    >
                      {getRoleIcon(participant.role)}
                      <span className="ml-1 capitalize">{participant.role}</span>
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Joined {formatJoinDate(participant.joined_at)}</span>
                  </div>
                </div>
              </div>

              {(canRemove || canChangeRole) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0" disabled={changingRole === participant.id}>
                      {changingRole === participant.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <MoreVertical className="h-4 w-4" />
                      )}
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {canChangeRole && (
                      <>
                        <DropdownMenuItem
                          onClick={() => handlePromoteParticipant(participant)}
                          disabled={changingRole === participant.id}
                        >
                          {participant.role === 'member' ? (
                            <>
                              <UserCheck className="mr-2 h-4 w-4" />
                              Promote to Moderator
                            </>
                          ) : (
                            <>
                              <UserX className="mr-2 h-4 w-4" />
                              Change to Member
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    {canRemove && (
                      <DropdownMenuItem
                        onClick={() => handleRemoveParticipant(participant)}
                        className="text-red-600 focus:text-red-600"
                        disabled={changingRole === participant.id}
                      >
                        <UserMinus className="mr-2 h-4 w-4" />
                        Remove from room
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )
        })}
      </div>

      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Participant</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove &quot;{participantToRemove?.users?.name || 'this participant'}&quot; from the room? 
              They will no longer have access to this room.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!removingParticipant}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveParticipant}
              disabled={!!removingParticipant}
              className="bg-red-600 hover:bg-red-700"
            >
              {removingParticipant ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                'Remove Participant'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}