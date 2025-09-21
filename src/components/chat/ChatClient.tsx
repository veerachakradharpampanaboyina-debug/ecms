"use client"

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  MessageSquare, 
  Send, 
  Users, 
  Plus, 
  Search,
  Paperclip,
  Smile,
  MoreVertical,
  Phone,
  Video,
  Info,
  LogOut
} from 'lucide-react'
import { format } from 'date-fns'
import { io, Socket } from 'socket.io-client'

interface ChatRoom {
  id: string
  name: string
  description?: string
  type: string
  isPrivate: boolean
  maxMembers: number
  createdBy: string
  createdAt: string
  updatedAt: string
  creator: {
    id: string
    name: string
    email: string
    profileImage?: string
  }
  members: Array<{
    id: string
    userId: string
    role: string
    joinedAt: string
    user: {
      id: string
      name: string
      email: string
      profileImage?: string
    }
  }>
  unreadCount: number
  _count: {
    members: number
    messages: number
  }
}

interface ChatMessage {
  id: string
  roomId: string
  senderId: string
  content: string
  messageType: string
  fileUrl?: string
  fileName?: string
  fileSize?: number
  replyToId?: string
  isEdited: boolean
  isDeleted: boolean
  createdAt: string
  sender: {
    id: string
    name: string
    email: string
    profileImage?: string
  }
  replyTo?: ChatMessage
  reactions: Array<{
    id: string
    emoji: string
    user: {
      id: string
      name: string
      email: string
      profileImage?: string
    }
  }>
}

export default function ChatClient() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [creatingRoom, setCreatingRoom] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [message, setMessage] = useState('')
  const [socket, setSocket] = useState<Socket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [roomData, setRoomData] = useState({
    name: '',
    description: '',
    type: 'group',
    isPrivate: false,
    maxMembers: 100,
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchChatRooms()
      initializeSocket()
    }
  }, [session])

  useEffect(() => {
    if (selectedRoom) {
      fetchMessages()
      joinRoom(selectedRoom.id)
    }
  }, [selectedRoom])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const initializeSocket = () => {
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      auth: {
        token: session?.accessToken,
        userId: session?.user.id,
      },
    })

    socketInstance.on('connect', () => {
      console.log('Connected to chat server')
    })

    socketInstance.on('new_message', (newMessage: ChatMessage) => {
      if (selectedRoom && newMessage.roomId === selectedRoom.id) {
        setMessages(prev => [...prev, newMessage])
      }
    })

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from chat server')
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }

  const fetchChatRooms = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/chat?action=rooms')
      if (response.ok) {
        const data = await response.json()
        setChatRooms(data)
      }
    } catch (error) {
      console.error('Failed to fetch chat rooms:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async () => {
    if (!selectedRoom) return

    try {
      const response = await fetch(`/api/chat?action=messages&roomId=${selectedRoom.id}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages)
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }

  const createChatRoom = async () => {
    try {
      const response = await fetch('/api/chat?action=create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomData),
      })

      if (response.ok) {
        setCreatingRoom(false)
        setRoomData({
          name: '',
          description: '',
          type: 'group',
          isPrivate: false,
          maxMembers: 100,
        })
        fetchChatRooms()
      }
    } catch (error) {
      console.error('Failed to create chat room:', error)
    }
  }

  const sendMessage = async () => {
    if (!message.trim() || !selectedRoom) return

    try {
      const response = await fetch('/api/chat?action=send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: selectedRoom.id,
          content: message,
          messageType: 'text',
        }),
      })

      if (response.ok) {
        setMessage('')
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const joinRoom = (roomId: string) => {
    if (socket) {
      socket.emit('join_room', roomId)
    }
  }

  const leaveRoom = (roomId: string) => {
    if (socket) {
      socket.emit('leave_room', roomId)
    }
  }

  const handleJoinRoom = async (roomId: string) => {
    try {
      const response = await fetch(`/api/chat?action=join&roomId=${roomId}`, {
        method: 'POST',
      })

      if (response.ok) {
        fetchChatRooms()
      }
    } catch (error) {
      console.error('Failed to join room:', error)
    }
  }

  const handleLeaveRoom = async (roomId: string) => {
    try {
      const response = await fetch(`/api/chat?action=leave&roomId=${roomId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        if (selectedRoom?.id === roomId) {
          setSelectedRoom(null)
          setMessages([])
        }
        fetchChatRooms()
      }
    } catch (error) {
      console.error('Failed to leave room:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const filteredRooms = chatRooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-8rem)]">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  College Messenger
                </CardTitle>
                <Button size="sm" onClick={() => setCreatingRoom(true)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search rooms..."
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
                    {filteredRooms.map((room) => (
                      <div
                        key={room.id}
                        onClick={() => setSelectedRoom(room)}
                        className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedRoom?.id === room.id ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <Users className="h-5 w-5 text-blue-600" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium truncate">{room.name}</span>
                                {room.isPrivate && (
                                  <Badge variant="secondary" className="text-xs">
                                    Private
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-gray-600 truncate">
                                {room.description || `${room._count.members} members`}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            {room.unreadCount > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {room.unreadCount}
                              </Badge>
                            )}
                            <span className="text-xs text-gray-500">
                              {format(new Date(room.updatedAt), 'MMM d')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-3">
          {creatingRoom ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Create Chat Room</CardTitle>
                  <Button variant="outline" onClick={() => setCreatingRoom(false)}>
                    Cancel
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Room name"
                  value={roomData.name}
                  onChange={(e) => setRoomData({ ...roomData, name: e.target.value })}
                />
                <Textarea
                  placeholder="Description (optional)"
                  value={roomData.description}
                  onChange={(e) => setRoomData({ ...roomData, description: e.target.value })}
                  rows={3}
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Type</label>
                    <select
                      value={roomData.type}
                      onChange={(e) => setRoomData({ ...roomData, type: e.target.value })}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="group">Group</option>
                      <option value="course">Course</option>
                      <option value="department">Department</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Max Members</label>
                    <Input
                      type="number"
                      min="2"
                      max="1000"
                      value={roomData.maxMembers}
                      onChange={(e) => setRoomData({ ...roomData, maxMembers: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    checked={roomData.isPrivate}
                    onChange={(e) => setRoomData({ ...roomData, isPrivate: e.target.checked })}
                  />
                  <label htmlFor="isPrivate">Private Room</label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Cancel</Button>
                  <Button onClick={createChatRoom}>Create Room</Button>
                </div>
              </CardContent>
            </Card>
          ) : selectedRoom ? (
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{selectedRoom.name}</CardTitle>
                      <div className="text-sm text-gray-600">
                        {selectedRoom._count.members} members • {selectedRoom.type}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Info className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLeaveRoom(selectedRoom.id)}
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-3 ${
                          msg.senderId === session.user.id ? 'flex-row-reverse' : ''
                        }`}
                      >
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarImage src={msg.sender.profileImage} />
                          <AvatarFallback>
                            {msg.sender.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            msg.senderId === session.user.id
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100'
                          }`}
                        >
                          {msg.senderId !== session.user.id && (
                            <div className="text-xs font-medium mb-1">
                              {msg.sender.name}
                            </div>
                          )}
                          <div className="text-sm">{msg.content}</div>
                          {msg.fileUrl && (
                            <div className="mt-2">
                              <a
                                href={msg.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm underline"
                              >
                                <Paperclip className="h-4 w-4" />
                                {msg.fileName || 'File'}
                              </a>
                            </div>
                          )}
                          <div className="text-xs opacity-70 mt-1">
                            {format(new Date(msg.createdAt), 'h:mm a')}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          sendMessage()
                        }
                      }}
                      className="flex-1"
                    />
                    <Button variant="ghost" size="sm">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Smile className="h-4 w-4" />
                    </Button>
                    <Button onClick={sendMessage} disabled={!message.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent>
                <div className="text-center text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a chat room to start messaging</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}