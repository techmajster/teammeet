import { createClient } from '@/utils/supabase/server'
import UserMenu from '@/components/auth/user-menu'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Plus, Search, Users, Calendar, MoreVertical } from 'lucide-react'
import Link from 'next/link'
import CreateRoomDialog from '@/components/rooms/create-room-dialog'
import RoomCard from '@/components/rooms/room-card'
import EmptyRoomsState from '@/components/rooms/empty-rooms-state'

export default async function DashboardPage() {
  const supabase = createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch user's rooms with participant count
  const { data: rooms, error } = await supabase
    .from('rooms')
    .select(`
      *,
      room_participants(count)
    `)
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  const roomsWithCount = rooms?.map(room => ({
    ...room,
    participant_count: room.room_participants?.[0]?.count || 0
  })) || []

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">TeamMeet</h1>
            </div>
            <UserMenu user={user} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                Welcome back, {user.user_metadata.full_name || user.email?.split('@')[0]}!
              </h2>
              <p className="mt-2 text-muted-foreground">
                Manage your video conference rooms and start new meetings
              </p>
            </div>
            <CreateRoomDialog />
          </div>
        </div>

        {/* Search and Filter Bar */}
        {roomsWithCount.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search rooms..."
                  className="pl-8"
                  id="search-rooms"
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{roomsWithCount.length} room{roomsWithCount.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        {roomsWithCount.length > 0 && (
          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{roomsWithCount.length}</div>
                <p className="text-xs text-muted-foreground">
                  Your active conference rooms
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {roomsWithCount.reduce((total, room) => total + room.participant_count, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all your rooms
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Week</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {roomsWithCount.filter(room => {
                    const createdAt = new Date(room.created_at)
                    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    return createdAt >= weekAgo
                  }).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Rooms created this week
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Room List or Empty State */}
        {roomsWithCount.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Your Rooms</h3>
              <div className="text-sm text-muted-foreground">
                Sorted by most recent
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {roomsWithCount.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          </div>
        ) : (
          <EmptyRoomsState />
        )}
      </main>
    </div>
  )
}