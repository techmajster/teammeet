import { createClient } from '@/utils/supabase/server'
import UserMenu from '@/components/auth/user-menu'
import { redirect, notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Settings, 
  Users, 
  Link as LinkIcon, 
  Shield,
  Trash2,
  Copy,
  UserPlus,
  Crown
} from 'lucide-react'
import Link from 'next/link'
import RoomSettingsForm from '@/components/rooms/room-settings-form'
import ParticipantsList from '@/components/rooms/participants-list'
import CopyUrlButton from '@/components/rooms/copy-url-button'
import DeleteRoomButton from '@/components/rooms/delete-room-button'
import InviteParticipantDialog from '@/components/rooms/invite-participant-dialog'

interface RoomSettingsPageProps {
  params: { slug: string }
}

export default async function RoomSettingsPage({ params }: RoomSettingsPageProps) {
  const supabase = createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch room details
  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (roomError || !room) {
    notFound()
  }

  // Check if user is the room owner
  if (room.owner_id !== user.id) {
    redirect('/dashboard')
  }

  // Fetch room participants with user details
  const { data: participants, error: participantsError } = await supabase
    .from('room_participants')
    .select(`
      *,
      users (
        id,
        name,
        email,
        avatar_url
      )
    `)
    .eq('room_id', room.id)
    .order('joined_at', { ascending: false })

  const participantsList = participants || []

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Link>
              </Button>
              <div className="h-4 w-px bg-border" />
              <h1 className="text-lg font-semibold">Room Settings</h1>
            </div>
            <UserMenu user={user} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Room Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">{room.name}</h2>
              <p className="mt-2 text-muted-foreground">
                {room.description || 'No description provided'}
              </p>
              <div className="mt-4 flex items-center gap-4">
                <Badge variant="secondary">
                  <LinkIcon className="mr-1 h-3 w-3" />
                  {room.slug}
                </Badge>
                <Badge variant="outline">
                  <Users className="mr-1 h-3 w-3" />
                  {participantsList.length} participant{participantsList.length !== 1 ? 's' : ''}
                </Badge>
                <Badge variant="outline">
                  <Crown className="mr-1 h-3 w-3" />
                  Owner
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Room Settings */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Room Settings
                </CardTitle>
                <CardDescription>
                  Manage your room configuration and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RoomSettingsForm room={room} />
              </CardContent>
            </Card>

            {/* Access & Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Access & Security
                </CardTitle>
                <CardDescription>
                  Control who can access your room
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Room URL</label>
                  <div className="flex gap-2">
                    <div className="flex-1 rounded-md border bg-muted px-3 py-2 text-sm">
                      {`${process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'}/rooms/${room.slug}`}
                    </div>
                    <CopyUrlButton roomSlug={room.slug} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Privacy Settings</label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">Public Room</div>
                        <div className="text-xs text-muted-foreground">
                          Anyone with the link can join
                        </div>
                      </div>
                      <Badge variant={room.is_public ? "default" : "secondary"}>
                        {room.is_public ? "Public" : "Private"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">Max Participants</div>
                        <div className="text-xs text-muted-foreground">
                          Current limit: {room.max_participants}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <Trash2 className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  Irreversible actions that affect your room
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DeleteRoomButton room={room} />
                <p className="mt-2 text-xs text-muted-foreground">
                  This action cannot be undone. All participants will be removed.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Participants Management */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Participants
                </CardTitle>
                <CardDescription>
                  Manage who has access to this room
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <InviteParticipantDialog room={room} />
                  
                  <ParticipantsList 
                    participants={participantsList} 
                    roomOwnerId={room.owner_id}
                    currentUserId={user.id}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}