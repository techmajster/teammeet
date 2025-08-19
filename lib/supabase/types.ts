export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      guest_tokens: {
        Row: {
          created_at: string
          created_by: string
          current_uses: number
          expires_at: string
          id: string
          is_active: boolean
          max_uses: number
          name: string
          room_id: string
          token_hash: string
        }
        Insert: {
          created_at?: string
          created_by: string
          current_uses?: number
          expires_at: string
          id?: string
          is_active?: boolean
          max_uses?: number
          name: string
          room_id: string
          token_hash: string
        }
        Update: {
          created_at?: string
          created_by?: string
          current_uses?: number
          expires_at?: string
          id?: string
          is_active?: boolean
          max_uses?: number
          name?: string
          room_id?: string
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "guest_tokens_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guest_tokens_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          }
        ]
      }
      room_participants: {
        Row: {
          guest_token_id: string | null
          id: string
          joined_at: string
          last_seen: string
          role: Database["public"]["Enums"]["participant_role"]
          room_id: string
          user_id: string | null
        }
        Insert: {
          guest_token_id?: string | null
          id?: string
          joined_at?: string
          last_seen?: string
          role?: Database["public"]["Enums"]["participant_role"]
          room_id: string
          user_id?: string | null
        }
        Update: {
          guest_token_id?: string | null
          id?: string
          joined_at?: string
          last_seen?: string
          role?: Database["public"]["Enums"]["participant_role"]
          room_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "room_participants_guest_token_id_fkey"
            columns: ["guest_token_id"]
            isOneToOne: false
            referencedRelation: "guest_tokens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      rooms: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_persistent: boolean
          is_public: boolean
          max_participants: number
          name: string
          owner_id: string
          settings: Json
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_persistent?: boolean
          is_public?: boolean
          max_participants?: number
          name: string
          owner_id: string
          settings?: Json
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_persistent?: boolean
          is_public?: boolean
          max_participants?: number
          name?: string
          owner_id?: string
          settings?: Json
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id: string
          name: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_guest_tokens: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_room_slug: {
        Args: {
          room_name: string
        }
        Returns: string
      }
    }
    Enums: {
      participant_role: "owner" | "moderator" | "member" | "guest"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}