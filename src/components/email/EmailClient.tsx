"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Mail, 
  Send, 
  Inbox, 
  Star, 
  Trash2, 
  Folder, 
  Search,
  Paperclip,
  Clock,
  UserPlus
} from 'lucide-react'
import { format } from 'date-fns'

interface Email {
  id: string
  from: string
  to: string
  subject: string
  body: string
  htmlBody?: string
  attachments?: string[]
  isRead: boolean
  isStarred: boolean
  isImportant: boolean
  folder: string
  size: number
  createdAt: string
}

interface EmailAccount {
  id: string
  email: string
  quota: number
  usedSpace: number
  isActive: boolean
}

export default function EmailClient() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [emails, setEmails] = useState<Email[]>([])
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [currentFolder, setCurrentFolder] = useState('inbox')
  const [emailAccount, setEmailAccount] = useState<EmailAccount | null>(null)
  const [loading, setLoading] = useState(true)
  const [composing, setComposing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [composeData, setComposeData] = useState({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    body: '',
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchEmailAccount()
      fetchEmails()
    }
  }, [session, currentFolder])

  const fetchEmailAccount = async () => {
    try {
      const response = await fetch('/api/email?action=account')
      if (response.ok) {
        const data = await response.json()
        setEmailAccount(data.emailAccount)
      }
    } catch (error) {
      console.error('Failed to fetch email account:', error)
    }
  }

  const fetchEmails = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/email?folder=${currentFolder}`)
      if (response.ok) {
        const data = await response.json()
        setEmails(data.emails)
      }
    } catch (error) {
      console.error('Failed to fetch emails:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendEmail = async () => {
    try {
      const response = await fetch('/api/email?action=send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(composeData),
      })

      if (response.ok) {
        setComposing(false)
        setComposeData({ to: '', cc: '', bcc: '', subject: '', body: '' })
        fetchEmails()
      }
    } catch (error) {
      console.error('Failed to send email:', error)
    }
  }

  const createEmailAccount = async () => {
    const email = prompt('Enter your desired email address (e.g., john.doe@college.edu):')
    const password = prompt('Enter your password:')

    if (email && password) {
      try {
        const response = await fetch('/api/email?action=create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })

        if (response.ok) {
          fetchEmailAccount()
        }
      } catch (error) {
        console.error('Failed to create email account:', error)
      }
    }
  }

  const markAsRead = async (emailId: string) => {
    try {
      await fetch(`/api/email?id=${emailId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
      })
      fetchEmails()
    } catch (error) {
      console.error('Failed to mark email as read:', error)
    }
  }

  const deleteEmail = async (emailId: string) => {
    try {
      await fetch(`/api/email?id=${emailId}`, {
        method: 'DELETE',
      })
      fetchEmails()
      if (selectedEmail?.id === emailId) {
        setSelectedEmail(null)
      }
    } catch (error) {
      console.error('Failed to delete email:', error)
    }
  }

  const toggleStar = async (emailId: string, isStarred: boolean) => {
    try {
      await fetch(`/api/email?id=${emailId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isStarred: !isStarred }),
      })
      fetchEmails()
    } catch (error) {
      console.error('Failed to toggle star:', error)
    }
  }

  const filteredEmails = emails.filter(email =>
    email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.body.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const folders = [
    { id: 'inbox', name: 'Inbox', icon: Inbox, count: emails.filter(e => e.folder === 'inbox' && !e.isRead).length },
    { id: 'sent', name: 'Sent', icon: Send, count: 0 },
    { id: 'drafts', name: 'Drafts', icon: Folder, count: 0 },
    { id: 'spam', name: 'Spam', icon: Folder, count: 0 },
    { id: 'trash', name: 'Trash', icon: Trash2, count: 0 },
  ]

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  if (!emailAccount) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              College Email Setup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              You don't have a college email account yet. Create one to get started with professional email communication.
            </p>
            <Button onClick={createEmailAccount} className="w-full">
              <UserPlus className="h-4 w-4 mr-2" />
              Create Email Account
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-8rem)]">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                {emailAccount.email}
              </CardTitle>
              <div className="text-sm text-gray-600">
                {Math.round(emailAccount.usedSpace / 1024 / 1024)}MB / {Math.round(emailAccount.quota / 1024 / 1024)}MB used
              </div>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setComposing(true)} className="w-full mb-4">
                <Send className="h-4 w-4 mr-2" />
                Compose
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                {folders.map((folder) => {
                  const Icon = folder.icon
                  return (
                    <button
                      key={folder.id}
                      onClick={() => setCurrentFolder(folder.id)}
                      className={`w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors ${
                        currentFolder === folder.id ? 'bg-blue-50 text-blue-600' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4" />
                        <span>{folder.name}</span>
                      </div>
                      {folder.count > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {folder.count}
                        </Badge>
                      )}
                    </button>
                  )
                })}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Email List */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search emails..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-16rem)]">
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredEmails.map((email) => (
                      <div
                        key={email.id}
                        onClick={() => {
                          setSelectedEmail(email)
                          if (!email.isRead) {
                            markAsRead(email.id)
                          }
                        }}
                        className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedEmail?.id === email.id ? 'bg-blue-50' : ''
                        } ${!email.isRead ? 'bg-gray-50' : ''}`}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {!email.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                            )}
                            <span className="font-medium truncate">{email.from}</span>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {email.isStarred && (
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            )}
                            <span className="text-xs text-gray-500">
                              {format(new Date(email.createdAt), 'MMM d')}
                            </span>
                          </div>
                        </div>
                        <div className="text-sm font-medium truncate mb-1">{email.subject}</div>
                        <div className="text-sm text-gray-600 truncate">{email.body}</div>
                        {email.attachments && email.attachments.length > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <Paperclip className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {email.attachments.length} attachment{email.attachments.length > 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Email Content / Compose */}
        <div className="lg:col-span-2">
          {composing ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Compose Email</CardTitle>
                  <Button variant="outline" onClick={() => setComposing(false)}>
                    Cancel
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="To"
                  value={composeData.to}
                  onChange={(e) => setComposeData({ ...composeData, to: e.target.value })}
                />
                <Input
                  placeholder="Cc (optional)"
                  value={composeData.cc}
                  onChange={(e) => setComposeData({ ...composeData, cc: e.target.value })}
                />
                <Input
                  placeholder="Subject"
                  value={composeData.subject}
                  onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                />
                <Textarea
                  placeholder="Message"
                  value={composeData.body}
                  onChange={(e) => setComposeData({ ...composeData, body: e.target.value })}
                  rows={10}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Save Draft</Button>
                  <Button onClick={sendEmail}>
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : selectedEmail ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{selectedEmail.subject}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleStar(selectedEmail.id, selectedEmail.isStarred)}
                    >
                      <Star className={`h-4 w-4 ${selectedEmail.isStarred ? 'text-yellow-500 fill-current' : ''}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteEmail(selectedEmail.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div>
                    <span className="font-medium">From:</span> {selectedEmail.from}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {format(new Date(selectedEmail.createdAt), 'MMM d, yyyy h:mm a')}
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">To:</span> {selectedEmail.to}
                </div>
                {selectedEmail.cc && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Cc:</span> {selectedEmail.cc}
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  {selectedEmail.htmlBody ? (
                    <div dangerouslySetInnerHTML={{ __html: selectedEmail.htmlBody }} />
                  ) : (
                    <div className="whitespace-pre-wrap">{selectedEmail.body}</div>
                  )}
                </div>
                {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-2">Attachments</h4>
                    <div className="space-y-2">
                      {selectedEmail.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 border rounded">
                          <Paperclip className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{attachment}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent>
                <div className="text-center text-gray-500">
                  <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Select an email to read</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}