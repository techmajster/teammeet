'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Video, Users, Calendar } from 'lucide-react'
import CreateRoomDialog from './create-room-dialog'

export default function EmptyRoomsState() {
  return (
    <div className="text-center py-12">
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-muted p-3">
              <Video className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          
          <h3 className="text-lg font-semibold mb-2">No rooms yet</h3>
          <p className="text-muted-foreground mb-6">
            Get started by creating your first video conference room. 
            Invite your team and start collaborating instantly.
          </p>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Users className="h-4 w-4 text-green-600" />
              <span>Invite team members</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span>Schedule meetings</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Video className="h-4 w-4 text-purple-600" />
              <span>Start instant calls</span>
            </div>
          </div>
          
          <CreateRoomDialog />
        </CardContent>
      </Card>
    </div>
  )
}