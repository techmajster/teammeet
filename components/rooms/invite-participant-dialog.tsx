'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  UserPlus, 
  Copy, 
  Mail, 
  Link as LinkIcon, 
  Check, 
  Loader2,
  Users,
  Clock
} from 'lucide-react'
import { toast } from 'sonner'

interface Room {
  id: string
  name: string
  slug: string
}

interface InviteParticipantDialogProps {
  room: Room
}

export default function InviteParticipantDialog({ room }: InviteParticipantDialogProps) {
  const [open, setOpen] = useState(false)
  const [inviteMethod, setInviteMethod] = useState<'link' | 'email'>('link')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Email invite state
  const [emailList, setEmailList] = useState('')
  const [customMessage, setCustomMessage] = useState('')
  const [role, setRole] = useState<'member' | 'moderator'>('member')
  
  // Link invite state
  const [linkExpiry, setLinkExpiry] = useState('7d')
  const [maxUses, setMaxUses] = useState('10')

  const roomUrl = `${window.location.origin}/rooms/${room.slug}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(roomUrl)
      setCopied(true)
      toast.success('Room link copied to clipboard!')
      
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
      toast.error('Failed to copy link. Please try again.')
    }
  }

  const handleSendEmailInvites = async () => {
    if (!emailList.trim()) {
      toast.error('Please enter at least one email address')
      return
    }

    const emails = emailList
      .split(/[,\n]/)
      .map(email => email.trim())
      .filter(email => email && email.includes('@'))

    if (emails.length === 0) {
      toast.error('Please enter valid email addresses')
      return
    }

    setLoading(true)
    try {
      // TODO: Implement actual email sending
      await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate API call
      
      toast.success(`Invitations sent to ${emails.length} email${emails.length > 1 ? 's' : ''}`)
      setEmailList('')
      setCustomMessage('')
      setOpen(false)
    } catch (error) {
      console.error('Failed to send invites:', error)
      toast.error('Failed to send invitations. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateInviteLink = async () => {
    setLoading(true)
    try {
      // TODO: Implement guest token generation
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      toast.success('Invite link created successfully!')
      setOpen(false)
    } catch (error) {
      console.error('Failed to create invite link:', error)
      toast.error('Failed to create invite link. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getExpiryText = (value: string) => {
    const options: Record<string, string> = {
      '1h': '1 hour',
      '24h': '24 hours',
      '7d': '7 days',
      '30d': '30 days',
      'never': 'Never expires'
    }
    return options[value] || value
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="w-full">
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Participant
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Invite to &quot;{room.name}&quot;
          </DialogTitle>
          <DialogDescription>
            Add people to your room by sending email invitations or sharing a link.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={inviteMethod} onValueChange={(value) => setInviteMethod(value as 'link' | 'email')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="link" className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Share Link
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Invite
            </TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label>Room Link</Label>
                <div className="flex gap-2 mt-1">
                  <div className="flex-1 rounded-md border bg-muted px-3 py-2 text-sm">
                    {roomUrl}
                  </div>
                  <Button size="sm" variant="outline" onClick={handleCopyLink}>
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Anyone with this link can join the room
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="link-expiry">Expires</Label>
                  <Select value={linkExpiry} onValueChange={setLinkExpiry}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">1 hour</SelectItem>
                      <SelectItem value="24h">24 hours</SelectItem>
                      <SelectItem value="7d">7 days</SelectItem>
                      <SelectItem value="30d">30 days</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="max-uses">Max uses</Label>
                  <Select value={maxUses} onValueChange={setMaxUses}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 person</SelectItem>
                      <SelectItem value="5">5 people</SelectItem>
                      <SelectItem value="10">10 people</SelectItem>
                      <SelectItem value="25">25 people</SelectItem>
                      <SelectItem value="unlimited">Unlimited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Expires: {getExpiryText(linkExpiry)}</span>
                <span>•</span>
                <span>Max {maxUses === 'unlimited' ? 'unlimited' : maxUses} uses</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="email-list">Email addresses</Label>
                <Textarea
                  id="email-list"
                  placeholder="Enter email addresses (one per line or comma separated)&#10;john@company.com, jane@company.com"
                  value={emailList}
                  onChange={(e) => setEmailList(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Separate multiple emails with commas or new lines
                </p>
              </div>

              <div>
                <Label htmlFor="participant-role">Role</Label>
                <Select value={role} onValueChange={(value) => setRole(value as 'member' | 'moderator')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="custom-message">Custom message (optional)</Label>
                <Textarea
                  id="custom-message"
                  placeholder="Add a personal message to your invitation..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          {inviteMethod === 'email' ? (
            <Button onClick={handleSendEmailInvites} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Invitations
                </>
              )}
            </Button>
          ) : (
            <Button onClick={handleCreateInviteLink} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Create Link
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}