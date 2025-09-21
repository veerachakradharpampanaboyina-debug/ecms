"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  MessageSquare, 
  Send, 
  Search, 
  Filter, 
  User, 
  Mail, 
  Phone,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Paperclip,
  MoreVertical,
  Reply,
  Forward,
  Trash2,
  Star,
  Archive,
  Inbox,
  Users,
  Bell,
  Info
} from "lucide-react"
import { format, differenceInHours, differenceInDays, isToday, isYesterday } from "date-fns"

interface Message {
  id: string
  subject: string
  content: string
  sender: {
    id: string
    name: string
    role: string
    avatar?: string
  }
  recipient: {
    id: string
    name: string
    role: string
  }
  timestamp: Date
  status: "READ" | "UNREAD" | "SENT" | "DRAFT"
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  category: "ACADEMIC" | "ADMINISTRATIVE" | "PERSONAL" | "NOTIFICATION"
  attachments?: string[]
  threadId?: string
  isThreaded?: boolean
  replyCount?: number
}

interface Conversation {
  id: string
  participants: {
    id: string
    name: string
    role: string
    avatar?: string
  }[]
  lastMessage: {
    content: string
    timestamp: Date
    sender: string
  }
  unreadCount: number
  isGroup: boolean
  groupName?: string
}

interface Contact {
  id: string
  name: string
  role: string
  email: string
  phone?: string
  avatar?: string
  department?: string
  isOnline: boolean
  lastSeen?: Date
}

export default function StudentMessagesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [activeTab, setActiveTab] = useState("inbox")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("ALL")
  const [filterStatus, setFilterStatus] = useState<string>("ALL")
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const [newMessage, setNewMessage] = useState({
    recipient: "",
    subject: "",
    content: "",
    priority: "MEDIUM" as const,
    category: "ACADEMIC" as const
  })
  const [replyContent, setReplyContent] = useState("")

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user.role !== "STUDENT") {
      router.push("/auth/signin")
    }
  }, [session, status, router])

  useEffect(() => {
    // Mock data for messages
    const mockMessages: Message[] = [
      {
        id: "1",
        subject: "Assignment Submission Reminder",
        content: "This is a reminder that your Data Structures assignment is due in 2 days. Please ensure you submit it on time to avoid any late penalties.",
        sender: {
          id: "1",
          name: "Dr. John Smith",
          role: "FACULTY",
          avatar: "/avatars/faculty1.jpg"
        },
        recipient: {
          id: "student1",
          name: "Student Name",
          role: "STUDENT"
        },
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: "UNREAD",
        priority: "HIGH",
        category: "ACADEMIC"
      },
      {
        id: "2",
        subject: "Fee Payment Confirmation",
        content: "Your fee payment of ₹50,000 has been successfully processed. Transaction ID: TXN123456789. Thank you for your payment.",
        sender: {
          id: "admin1",
          name: "Accounts Department",
          role: "ADMIN"
        },
        recipient: {
          id: "student1",
          name: "Student Name",
          role: "STUDENT"
        },
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        status: "READ",
        priority: "MEDIUM",
        category: "ADMINISTRATIVE"
      },
      {
        id: "3",
        subject: "Mid-term Examination Schedule",
        content: "The mid-term examination schedule has been published. Please check the student portal for detailed timings and venues. Exams will start from next Monday.",
        sender: {
          id: "admin2",
          name: "Examination Cell",
          role: "ADMIN"
        },
        recipient: {
          id: "student1",
          name: "Student Name",
          role: "STUDENT"
        },
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        status: "READ",
        priority: "HIGH",
        category: "ACADEMIC"
      },
      {
        id: "4",
        subject: "Library Fine Notification",
        content: "You have an outstanding library fine of ₹50 for late return of books. Please clear the fine at the library counter to avoid any restrictions.",
        sender: {
          id: "librarian1",
          name: "Library Staff",
          role: "STAFF"
        },
        recipient: {
          id: "student1",
          name: "Student Name",
          role: "STUDENT"
        },
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: "UNREAD",
        priority: "LOW",
        category: "ADMINISTRATIVE"
      },
      {
        id: "5",
        subject: "Project Group Meeting",
        content: "Hi team, let's meet tomorrow at 3 PM in the lab to discuss our project progress. Please bring your updated work.",
        sender: {
          id: "student2",
          name: "Alex Johnson",
          role: "STUDENT"
        },
        recipient: {
          id: "student1",
          name: "Student Name",
          role: "STUDENT"
        },
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        status: "READ",
        priority: "MEDIUM",
        category: "PERSONAL"
      }
    ]
    setMessages(mockMessages)

    // Mock data for conversations
    const mockConversations: Conversation[] = [
      {
        id: "1",
        participants: [
          { id: "student1", name: "You", role: "STUDENT" },
          { id: "1", name: "Dr. John Smith", role: "FACULTY" }
        ],
        lastMessage: {
          content: "Please submit your assignment by Friday",
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          sender: "1"
        },
        unreadCount: 1,
        isGroup: false
      },
      {
        id: "2",
        participants: [
          { id: "student1", name: "You", role: "STUDENT" },
          { id: "student2", name: "Alex Johnson", role: "STUDENT" },
          { id: "student3", name: "Sarah Wilson", role: "STUDENT" }
        ],
        lastMessage: {
          content: "Meeting tomorrow at 3 PM",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          sender: "student2"
        },
        unreadCount: 0,
        isGroup: true,
        groupName: "Project Group"
      }
    ]
    setConversations(mockConversations)

    // Mock data for contacts
    const mockContacts: Contact[] = [
      {
        id: "1",
        name: "Dr. John Smith",
        role: "FACULTY",
        email: "john.smith@college.edu",
        phone: "+91 9876543210",
        department: "Computer Science",
        isOnline: true
      },
      {
        id: "2",
        name: "Dr. Sarah Johnson",
        role: "FACULTY",
        email: "sarah.johnson@college.edu",
        department: "Computer Science",
        isOnline: false,
        lastSeen: new Date(Date.now() - 30 * 60 * 1000)
      },
      {
        id: "3",
        name: "Alex Johnson",
        role: "STUDENT",
        email: "alex.johnson@student.edu",
        phone: "+91 9876543211",
        isOnline: true
      },
      {
        id: "4",
        name: "Sarah Wilson",
        role: "STUDENT",
        email: "sarah.wilson@student.edu",
        isOnline: false,
        lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: "admin1",
        name: "Accounts Department",
        role: "ADMIN",
        email: "accounts@college.edu",
        isOnline: false
      },
      {
        id: "librarian1",
        name: "Library Staff",
        role: "STAFF",
        email: "library@college.edu",
        isOnline: false
      }
    ]
    setContacts(mockContacts)
  }, [])

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.sender.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "ALL" || message.category === filterCategory
    const matchesStatus = filterStatus === "ALL" || message.status === filterStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "UNREAD":
        return <Badge variant="default">Unread</Badge>
      case "READ":
        return <Badge variant="secondary">Read</Badge>
      case "SENT":
        return <Badge variant="outline">Sent</Badge>
      case "DRAFT":
        return <Badge variant="outline">Draft</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return <Badge variant="destructive">Urgent</Badge>
      case "HIGH":
        return <Badge variant="destructive">High</Badge>
      case "MEDIUM":
        return <Badge variant="secondary">Medium</Badge>
      case "LOW":
        return <Badge variant="outline">Low</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "ACADEMIC":
        return <Badge variant="outline">Academic</Badge>
      case "ADMINISTRATIVE":
        return <Badge variant="secondary">Administrative</Badge>
      case "PERSONAL":
        return <Badge variant="default">Personal</Badge>
      case "NOTIFICATION":
        return <Badge variant="outline">Notification</Badge>
      default:
        return <Badge variant="outline">{category}</Badge>
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "FACULTY":
        return <Badge variant="default">Faculty</Badge>
      case "ADMIN":
        return <Badge variant="secondary">Admin</Badge>
      case "STUDENT":
        return <Badge variant="outline">Student</Badge>
      case "STAFF":
        return <Badge variant="outline">Staff</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
      }
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const hours = differenceInHours(now, timestamp)
    const days = differenceInDays(now, timestamp)

    if (hours < 1) {
      return "Just now"
    } else if (hours < 24) {
      return `${hours}h ago`
    } else if (days === 1) {
      return "Yesterday"
    } else if (days < 7) {
      return `${days}d ago`
    } else {
      return format(timestamp, "MMM d")
    }
  }

  const getUnreadCount = () => {
    return messages.filter(m => m.status === "UNREAD").length
  }

  const getHighPriorityCount = () => {
    return messages.filter(m => m.priority === "HIGH" || m.priority === "URGENT").length
  }

  const handleSendMessage = () => {
    if (!newMessage.recipient || !newMessage.subject || !newMessage.content) return

    const newMsg: Message = {
      id: Date.now().toString(),
      subject: newMessage.subject,
      content: newMessage.content,
      sender: {
        id: "student1",
        name: "You",
        role: "STUDENT"
      },
      recipient: contacts.find(c => c.id === newMessage.recipient)!,
      timestamp: new Date(),
      status: "SENT",
      priority: newMessage.priority,
      category: newMessage.category
    }

    setMessages(prev => [newMsg, ...prev])
    
    // Reset form
    setNewMessage({
      recipient: "",
      subject: "",
      content: "",
      priority: "MEDIUM",
      category: "ACADEMIC"
    })
    setIsComposeOpen(false)
  }

  const handleReply = () => {
    if (!selectedMessage || !replyContent) return

    const reply: Message = {
      id: Date.now().toString(),
      subject: `Re: ${selectedMessage.subject}`,
      content: replyContent,
      sender: {
        id: "student1",
        name: "You",
        role: "STUDENT"
      },
      recipient: selectedMessage.sender,
      timestamp: new Date(),
      status: "SENT",
      priority: "MEDIUM",
      category: selectedMessage.category,
      threadId: selectedMessage.threadId || selectedMessage.id
    }

    setMessages(prev => [reply, ...prev])
    setReplyContent("")
    setSelectedMessage(null)
  }

  const markAsRead = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, status: "READ" as const } : msg
    ))
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session || session.user.role !== "STUDENT") {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {session.user.name}
              </span>
              <Button onClick={() => setIsComposeOpen(true)}>
                <Send className="h-4 w-4 mr-2" />
                Compose
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{messages.length}</div>
              <p className="text-xs text-muted-foreground">
                In your inbox
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{getUnreadCount()}</div>
              <p className="text-xs text-muted-foreground">
                Need attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Priority</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{getHighPriorityCount()}</div>
              <p className="text-xs text-muted-foreground">
                Urgent messages
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contacts</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contacts.length}</div>
              <p className="text-xs text-muted-foreground">
                Available contacts
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="inbox">Inbox</TabsTrigger>
            <TabsTrigger value="conversations">Conversations</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="sent">Sent</TabsTrigger>
          </TabsList>

          <TabsContent value="inbox" className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search messages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Categories</SelectItem>
                    <SelectItem value="ACADEMIC">Academic</SelectItem>
                    <SelectItem value="ADMINISTRATIVE">Administrative</SelectItem>
                    <SelectItem value="PERSONAL">Personal</SelectItem>
                    <SelectItem value="NOTIFICATION">Notification</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="UNREAD">Unread</SelectItem>
                    <SelectItem value="READ">Read</SelectItem>
                    <SelectItem value="SENT">Sent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Messages List */}
            <div className="space-y-4">
              {filteredMessages.map((message) => (
                <Card 
                  key={message.id} 
                  className={`hover:shadow-md transition-shadow cursor-pointer ${message.status === "UNREAD" ? "border-blue-200 bg-blue-50" : ""}`}
                  onClick={() => {
                    setSelectedMessage(message)
                    if (message.status === "UNREAD") {
                      markAsRead(message.id)
                    }
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <Avatar>
                          <AvatarImage src={message.sender.avatar} />
                          <AvatarFallback>{message.sender.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium">{message.sender.name}</h3>
                            {getRoleBadge(message.sender.role)}
                            {getPriorityBadge(message.priority)}
                          </div>
                          <h4 className="font-medium text-gray-900 mb-1">{message.subject}</h4>
                          <p className="text-sm text-gray-600 line-clamp-2">{message.content}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>{formatTimestamp(message.timestamp)}</span>
                            {getCategoryBadge(message.category)}
                            {message.attachments && message.attachments.length > 0 && (
                              <span className="flex items-center">
                                <Paperclip className="h-3 w-3 mr-1" />
                                {message.attachments.length}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(message.status)}
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="conversations" className="space-y-6">
            {/* Conversations List */}
            <div className="space-y-4">
              {conversations.map((conversation) => (
                <Card key={conversation.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="flex -space-x-2">
                          {conversation.participants.slice(0, 3).map((participant, index) => (
                            <Avatar key={participant.id} className={index > 0 ? "ring-2 ring-white" : ""}>
                              <AvatarImage src={participant.avatar} />
                              <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                          ))}
                          {conversation.participants.length > 3 && (
                            <Avatar className="ring-2 ring-white">
                              <AvatarFallback>+{conversation.participants.length - 3}</AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">
                            {conversation.isGroup ? conversation.groupName : conversation.participants.find(p => p.id !== "student1")?.name}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-1">{conversation.lastMessage.content}</p>
                          <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                            <span>{formatTimestamp(conversation.lastMessage.timestamp)}</span>
                            {conversation.unreadCount > 0 && (
                              <Badge variant="default">{conversation.unreadCount}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="contacts" className="space-y-6">
            {/* Contacts List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contacts.map((contact) => (
                <Card key={contact.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <Avatar>
                        <AvatarImage src={contact.avatar} />
                        <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-medium">{contact.name}</h3>
                        <div className="flex items-center space-x-2">
                          {getRoleBadge(contact.role)}
                          <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-1 ${contact.isOnline ? "bg-green-500" : "bg-gray-400"}`}></div>
                            <span className="text-xs text-gray-500">
                              {contact.isOnline ? "Online" : "Offline"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>{contact.email}</p>
                      {contact.phone && <p>{contact.phone}</p>}
                      {contact.department && <p>{contact.department}</p>}
                    </div>
                    <div className="flex space-x-2 mt-3">
                      <Button size="sm" className="flex-1">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Message
                      </Button>
                      <Button variant="outline" size="sm">
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sent" className="space-y-6">
            {/* Sent Messages */}
            <div className="space-y-4">
              {messages
                .filter(m => m.sender.role === "STUDENT")
                .map((message) => (
                  <Card key={message.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <Avatar>
                            <AvatarImage src={message.recipient.avatar} />
                            <AvatarFallback>{message.recipient.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-medium">To: {message.recipient.name}</h3>
                              {getRoleBadge(message.recipient.role)}
                              {getPriorityBadge(message.priority)}
                            </div>
                            <h4 className="font-medium text-gray-900 mb-1">{message.subject}</h4>
                            <p className="text-sm text-gray-600 line-clamp-2">{message.content}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span>{formatTimestamp(message.timestamp)}</span>
                              {getCategoryBadge(message.category)}
                              {getStatusBadge(message.status)}
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Compose Message Dialog */}
      <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Compose Message</DialogTitle>
            <DialogDescription>
              Send a new message to faculty, staff, or students
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="recipient">To</Label>
              <Select value={newMessage.recipient} onValueChange={(value) => setNewMessage(prev => ({ ...prev, recipient: value }))}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select recipient" />
                </SelectTrigger>
                <SelectContent>
                  {contacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.name} ({contact.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Enter subject"
                value={newMessage.subject}
                onChange={(e) => setNewMessage(prev => ({ ...prev, subject: e.target.value }))}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={newMessage.priority} onValueChange={(value) => setNewMessage(prev => ({ ...prev, priority: value as any }))}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={newMessage.category} onValueChange={(value) => setNewMessage(prev => ({ ...prev, category: value as any }))}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACADEMIC">Academic</SelectItem>
                  <SelectItem value="ADMINISTRATIVE">Administrative</SelectItem>
                  <SelectItem value="PERSONAL">Personal</SelectItem>
                  <SelectItem value="NOTIFICATION">Notification</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="content">Message</Label>
              <Textarea
                id="content"
                placeholder="Type your message here..."
                value={newMessage.content}
                onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                className="mt-2"
                rows={4}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsComposeOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendMessage}>
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Message Detail Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedMessage?.subject}</DialogTitle>
            <DialogDescription>
              {selectedMessage && `From ${selectedMessage.sender.name} (${selectedMessage.sender.role})`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedMessage && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={selectedMessage.sender.avatar} />
                    <AvatarFallback>{selectedMessage.sender.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{selectedMessage.sender.name}</h3>
                    <p className="text-sm text-gray-600">{selectedMessage.sender.role}</p>
                    <p className="text-xs text-gray-500">{format(selectedMessage.timestamp, "PPPp")}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getPriorityBadge(selectedMessage.priority)}
                  {getCategoryBadge(selectedMessage.category)}
                </div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.content}</p>
              </div>
              
              {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-2">Attachments</h4>
                  <div className="space-y-2">
                    {selectedMessage.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-white rounded border">
                        <Paperclip className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{attachment}</span>
                        <Button variant="outline" size="sm">Download</Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setSelectedMessage(null)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setSelectedMessage(null)
                  setIsComposeOpen(true)
                  setNewMessage(prev => ({
                    ...prev,
                    recipient: selectedMessage.sender.id,
                    subject: `Re: ${selectedMessage.subject}`,
                    category: selectedMessage.category
                  }))
                }}>
                  <Reply className="h-4 w-4 mr-2" />
                  Reply
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}