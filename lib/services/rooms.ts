import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/types'

type Room = Database['public']['Tables']['rooms']['Row']
type RoomInsert = Database['public']['Tables']['rooms']['Insert']
type RoomUpdate = Database['public']['Tables']['rooms']['Update']
type RoomParticipant = Database['public']['Tables']['room_participants']['Row']

export interface RoomWithParticipantCount extends Room {
  participant_count?: number
}

export interface CreateRoomData {
  name: string
  description?: string
}

export interface UpdateRoomData {
  name?: string
  description?: string
  is_public?: boolean
  max_participants?: number
  is_persistent?: boolean
}

export class RoomService {
  private supabase = createClient()

  async createRoom(data: CreateRoomData): Promise<{ data: Room | null; error: any }> {
    try {
      const { data: { user }, error: authError } = await this.supabase.auth.getUser()
      
      if (authError || !user) {
        return { data: null, error: authError || new Error('User not authenticated') }
      }

      // Generate unique slug for the room
      const { data: slugData, error: slugError } = await this.supabase
        .rpc('generate_room_slug', { room_name: data.name })

      if (slugError || !slugData) {
        return { data: null, error: slugError || new Error('Failed to generate room slug') }
      }

      const roomData: RoomInsert = {
        name: data.name,
        description: data.description || null,
        owner_id: user.id,
        slug: slugData
      }

      const { data: room, error } = await this.supabase
        .from('rooms')
        .insert(roomData)
        .select()
        .single()

      return { data: room, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  async getUserRooms(): Promise<{ data: RoomWithParticipantCount[] | null; error: any }> {
    try {
      const { data: { user }, error: authError } = await this.supabase.auth.getUser()
      
      if (authError || !user) {
        return { data: null, error: authError || new Error('User not authenticated') }
      }

      const { data: rooms, error } = await this.supabase
        .from('rooms')
        .select(`
          *,
          room_participants(count)
        `)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        return { data: null, error }
      }

      // Transform the data to include participant count
      const roomsWithCount: RoomWithParticipantCount[] = rooms?.map(room => ({
        ...room,
        participant_count: room.room_participants?.[0]?.count || 0
      })) || []

      return { data: roomsWithCount, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async getRoomBySlug(slug: string): Promise<{ data: Room | null; error: any }> {
    try {
      const { data: room, error } = await this.supabase
        .from('rooms')
        .select('*')
        .eq('slug', slug)
        .single()

      return { data: room, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  async updateRoom(roomId: string, updates: UpdateRoomData): Promise<{ data: Room | null; error: any }> {
    try {
      const { data: { user }, error: authError } = await this.supabase.auth.getUser()
      
      if (authError || !user) {
        return { data: null, error: authError || new Error('User not authenticated') }
      }

      // Verify user owns the room
      const { data: room, error: ownerError } = await this.supabase
        .from('rooms')
        .select('owner_id')
        .eq('id', roomId)
        .single()

      if (ownerError || !room) {
        return { data: null, error: ownerError || new Error('Room not found') }
      }

      if (room.owner_id !== user.id) {
        return { data: null, error: new Error('Unauthorized: You do not own this room') }
      }

      const { data: updatedRoom, error } = await this.supabase
        .from('rooms')
        .update(updates)
        .eq('id', roomId)
        .select()
        .single()

      return { data: updatedRoom, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  async deleteRoom(roomId: string): Promise<{ error: any }> {
    try {
      const { data: { user }, error: authError } = await this.supabase.auth.getUser()
      
      if (authError || !user) {
        return { error: authError || new Error('User not authenticated') }
      }

      // Verify user owns the room
      const { data: room, error: ownerError } = await this.supabase
        .from('rooms')
        .select('owner_id')
        .eq('id', roomId)
        .single()

      if (ownerError || !room) {
        return { error: ownerError || new Error('Room not found') }
      }

      if (room.owner_id !== user.id) {
        return { error: new Error('Unauthorized: You do not own this room') }
      }

      // Delete room (participants will be deleted via CASCADE)
      const { error } = await this.supabase
        .from('rooms')
        .delete()
        .eq('id', roomId)

      return { error }
    } catch (error) {
      return { error }
    }
  }

  async addParticipant(roomId: string, userId: string, role: 'member' | 'moderator' = 'member'): Promise<{ data: RoomParticipant | null; error: any }> {
    try {
      const { data: participant, error } = await this.supabase
        .from('room_participants')
        .insert({
          room_id: roomId,
          user_id: userId,
          role
        })
        .select()
        .single()

      return { data: participant, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  async removeParticipant(roomId: string, userId: string): Promise<{ error: any }> {
    try {
      const { error } = await this.supabase
        .from('room_participants')
        .delete()
        .eq('room_id', roomId)
        .eq('user_id', userId)

      return { error }
    } catch (error) {
      return { error }
    }
  }

  async getRoomParticipants(roomId: string): Promise<{ data: any[] | null; error: any }> {
    try {
      const { data: participants, error } = await this.supabase
        .from('room_participants')
        .select(`
          *,
          users (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('room_id', roomId)
        .order('joined_at', { ascending: false })

      return { data: participants, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  async isUserRoomOwner(roomId: string): Promise<{ isOwner: boolean; error: any }> {
    try {
      const { data: { user }, error: authError } = await this.supabase.auth.getUser()
      
      if (authError || !user) {
        return { isOwner: false, error: authError || new Error('User not authenticated') }
      }

      const { data: room, error } = await this.supabase
        .from('rooms')
        .select('owner_id')
        .eq('id', roomId)
        .single()

      if (error || !room) {
        return { isOwner: false, error }
      }

      return { isOwner: room.owner_id === user.id, error: null }
    } catch (error) {
      return { isOwner: false, error }
    }
  }

  async updateParticipantRole(roomId: string, participantId: string, newRole: 'member' | 'moderator'): Promise<{ error: any }> {
    try {
      const { data: { user }, error: authError } = await this.supabase.auth.getUser()
      
      if (authError || !user) {
        return { error: authError || new Error('User not authenticated') }
      }

      // Verify user owns the room
      const { data: room, error: ownerError } = await this.supabase
        .from('rooms')
        .select('owner_id')
        .eq('id', roomId)
        .single()

      if (ownerError || !room) {
        return { error: ownerError || new Error('Room not found') }
      }

      if (room.owner_id !== user.id) {
        return { error: new Error('Unauthorized: You do not own this room') }
      }

      const { error } = await this.supabase
        .from('room_participants')
        .update({ role: newRole })
        .eq('id', participantId)

      return { error }
    } catch (error) {
      return { error }
    }
  }
}

// Export singleton instance
export const roomService = new RoomService()