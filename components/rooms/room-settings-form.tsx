'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Save } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { roomService } from '@/lib/services/rooms'
import { toast } from 'sonner'

interface Room {
  id: string
  name: string
  description: string | null
  slug: string
  is_public: boolean
  max_participants: number
  is_persistent: boolean
}

interface RoomSettingsFormProps {
  room: Room
}

const roomSettingsSchema = z.object({
  name: z.string().min(3, 'Room name must be at least 3 characters').max(100, 'Room name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  is_public: z.boolean(),
  max_participants: z.number().min(2, 'Must allow at least 2 participants').max(100, 'Maximum 100 participants allowed'),
  is_persistent: z.boolean()
})

type RoomSettingsFormValues = z.infer<typeof roomSettingsSchema>

export default function RoomSettingsForm({ room }: RoomSettingsFormProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const form = useForm<RoomSettingsFormValues>({
    resolver: zodResolver(roomSettingsSchema),
    defaultValues: {
      name: room.name,
      description: room.description || '',
      is_public: room.is_public,
      max_participants: room.max_participants,
      is_persistent: room.is_persistent
    }
  })

  const onSubmit = async (data: RoomSettingsFormValues) => {
    setLoading(true)
    try {
      const { error } = await roomService.updateRoom(room.id, {
        name: data.name,
        description: data.description || undefined,
        is_public: data.is_public,
        max_participants: data.max_participants,
        is_persistent: data.is_persistent
      })

      if (error) {
        console.error('Error updating room:', error)
        toast.error('Failed to update room settings. Please try again.')
        return
      }

      toast.success('Room settings updated successfully!')
      router.refresh()
    } catch (error) {
      console.error('Error updating room:', error)
      toast.error('Failed to update room settings. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Room Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter room name" />
              </FormControl>
              <FormDescription>
                The display name for your room
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Brief description of the room's purpose"
                  rows={3}
                />
              </FormControl>
              <FormDescription>
                Optional description visible to participants
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="max_participants"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maximum Participants</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min="2"
                  max="100"
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 2)}
                />
              </FormControl>
              <FormDescription>
                Maximum number of people who can join this room
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_public"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Public Room</FormLabel>
                <FormDescription>
                  Allow anyone with the link to join this room
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_persistent"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Persistent Room</FormLabel>
                <FormDescription>
                  Keep this room available even when no one is present
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}