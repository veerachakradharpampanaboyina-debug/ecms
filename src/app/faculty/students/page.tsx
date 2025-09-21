"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Users, 
  MessageSquare, 
  Mail, 
  Phone, 
  Calendar, 
  BookOpen, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Send,
  Eye,
  Edit,
  Star,
  Award,
  Target,
  Plus
} from "lucide-react"
import { format } from "date-fns"

interface Student {
  id: string
  name: string
  rollNumber: string
  email: string
  phone: string
  semester: string
  section: string
  department: string
  attendance: number
  overallGrade: string
  subjects: SubjectPerformance[]
  lastInteraction?: Date
  status: "ACTIVE" | "INACTIVE" | "ON_LEAVE"
}

interface SubjectPerformance {
  subject: string
  marks: number
  grade: string
  attendance: number
  assignmentsSubmitted: number
  totalAssignments: number
}

interface Message {
  id: string
  studentId: string
  studentName: string
  subject: string
  message: string
  sentAt: Date
  status: "READ" | "UNREAD"
  type: "INQUIRY" | "COMPLAINT" | "REQUEST" | "FEEDBACK"
}

interface Announcement {
  id: string
  title: string
  message: string
  targetAudience: "ALL" | "SECTION" | "SUBJECT"
  targetValue?: string
  sentAt: Date
  readBy: number
  totalRecipients: number
}

interface Meeting {
  id: string
  studentId: string
  studentName: string
  purpose: string
  scheduledAt: Date
  duration: number
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED"
  notes?: string
}

export default function FacultyStudentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false)
  const [isAnnouncementDialogOpen, setIsAnnouncementDialogOpen] = useState(false)
  const [isMeetingDialogOpen, setIsMeetingDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("directory")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSection, setFilterSection] = useState<string>("ALL")
  const [filterStatus, setFilterStatus] = useState<string>("ALL")

  // Form states
  const [newMessage, setNewMessage] = useState({
    studentId: "",
    subject: "",
    message: "",
    type: "INQUIRY" as const
  })

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    message: "",
    targetAudience: "ALL" as const,
    targetValue: ""
  })

  const [newMeeting, setNewMeeting] = useState({
    studentId: "",
    purpose: "",
    scheduledAt: new Date(),
    duration: 30
  })

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user.role !== "FACULTY") {
      router.push("/auth/signin")
    }
  }, [session, status, router])

  useEffect(() => {
    // Mock data for students
    const mockStudents: Student[] = [
      {
        id: "1",
        name: "John Doe",
        rollNumber: "CS001",
        email: "john@example.com",
        phone: "+1234567890",
        semester: "3rd",
        section: "A",
        department: "Computer Science",
        attendance: 85,
        overallGrade: "B+",
        subjects: [
          { subject: "Data Structures", marks: 78, grade: "B+", attendance: 90, assignmentsSubmitted: 4, totalAssignments: 5 },
          { subject: "Algorithms", marks: 82, grade: "A-", attendance: 88, assignmentsSubmitted: 3, totalAssignments: 4 },
          { subject: "Database Systems", marks: 75, grade: "B", attendance: 82, assignmentsSubmitted: 2, totalAssignments: 3 }
        ],
        lastInteraction: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: "ACTIVE"
      },
      {
        id: "2",
        name: "Jane Smith",
        rollNumber: "CS002",
        email: "jane@example.com",
        phone: "+1234567891",
        semester: "3rd",
        section: "A",
        department: "Computer Science",
        attendance: 92,
        overallGrade: "A",
        subjects: [
          { subject: "Data Structures", marks: 88, grade: "A", attendance: 95, assignmentsSubmitted: 5, totalAssignments: 5 },
          { subject: "Algorithms", marks: 90, grade: "A", attendance: 92, assignmentsSubmitted: 4, totalAssignments: 4 },
          { subject: "Database Systems", marks: 85, grade: "A-", attendance: 90, assignmentsSubmitted: 3, totalAssignments: 3 }
        ],
        lastInteraction: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        status: "ACTIVE"
      },
      {
        id: "3",
        name: "Bob Johnson",
        rollNumber: "CS003",
        email: "bob@example.com",
        phone: "+1234567892",
        semester: "3rd",
        section: "B",
        department: "Computer Science",
        attendance: 65,
        overallGrade: "C+",
        subjects: [
          { subject: "Data Structures", marks: 65, grade: "C+", attendance: 70, assignmentsSubmitted: 3, totalAssignments: 5 },
          { subject: "Algorithms", marks: 68, grade: "C+", attendance: 65, assignmentsSubmitted: 2, totalAssignments: 4 },
          { subject: "Database Systems", marks: 62, grade: "C", attendance: 60, assignmentsSubmitted: 1, totalAssignments: 3 }
        ],
        lastInteraction: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        status: "ACTIVE"
      }
    ]
    setStudents(mockStudents)

    // Mock data for messages
    const mockMessages: Message[] = [
      {
        id: "1",
        studentId: "1",
        studentName: "John Doe",
        subject: "Assignment Extension Request",
        message: "I need an extension for the Data Structures assignment due to personal reasons.",
        sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        status: "UNREAD",
        type: "REQUEST"
      },
      {
        id: "2",
        studentId: "2",
        studentName: "Jane Smith",
        subject: "Doubt in Algorithms",
        message: "I have a doubt in the dynamic programming topic. Can you please explain it again?",
        sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        status: "READ",
        type: "INQUIRY"
      }
    ]
    setMessages(mockMessages)

    // Mock data for announcements
    const mockAnnouncements: Announcement[] = [
      {
        id: "1",
        title: "Mid-term Examination Schedule",
        message: "Mid-term examinations will start from next Monday. Please check the schedule and prepare accordingly.",
        targetAudience: "ALL",
        sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        readBy: 35,
        totalRecipients: 40
      },
      {
        id: "2",
        title: "Extra Class - Data Structures",
        message: "Extra class scheduled for this Saturday at 10 AM in Room A101.",
        targetAudience: "SECTION",
        targetValue: "A",
        sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        readBy: 18,
        totalRecipients: 20
      }
    ]
    setAnnouncements(mockAnnouncements)

    // Mock data for meetings
    const mockMeetings: Meeting[] = [
      {
        id: "1",
        studentId: "3",
        studentName: "Bob Johnson",
        purpose: "Performance Discussion",
        scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        duration: 30,
        status: "SCHEDULED"
      },
      {
        id: "2",
        studentId: "1",
        studentName: "John Doe",
        purpose: "Assignment Feedback",
        scheduledAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        duration: 20,
        status: "COMPLETED",
        notes: "Discussed assignment performance and provided feedback for improvement."
      }
    ]
    setMeetings(mockMeetings)
  }, [])

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSection = filterSection === "ALL" || student.section === filterSection
    const matchesStatus = filterStatus === "ALL" || student.status === filterStatus
    return matchesSearch && matchesSection && matchesStatus
  })

  const handleSendMessage = () => {
    const message: Message = {
      id: String(messages.length + 1),
      studentId: newMessage.studentId,
      studentName: students.find(s => s.id === newMessage.studentId)?.name || "",
      subject: newMessage.subject,
      message: newMessage.message,
      sentAt: new Date(),
      status: "UNREAD",
      type: newMessage.type
    }
    setMessages([...messages, message])
    setNewMessage({
      studentId: "",
      subject: "",
      message: "",
      type: "INQUIRY"
    })
    setIsMessageDialogOpen(false)
  }

  const handleAnnouncement = () => {
    const announcement: Announcement = {
      id: String(announcements.length + 1),
      ...newAnnouncement,
      sentAt: new Date(),
      readBy: 0,
      totalRecipients: newAnnouncement.targetAudience === "ALL" ? 40 : 20
    }
    setAnnouncements([...announcements, announcement])
    setNewAnnouncement({
      title: "",
      message: "",
      targetAudience: "ALL",
      targetValue: ""
    })
    setIsAnnouncementDialogOpen(false)
  }

  const handleScheduleMeeting = () => {
    const meeting: Meeting = {
      id: String(meetings.length + 1),
      ...newMeeting,
      status: "SCHEDULED"
    }
    setMeetings([...meetings, meeting])
    setNewMeeting({
      studentId: "",
      purpose: "",
      scheduledAt: new Date(),
      duration: 30
    })
    setIsMeetingDialogOpen(false)
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A":
      case "A-":
        return "text-green-600"
      case "B+":
      case "B":
      case "B-":
        return "text-blue-600"
      case "C+":
      case "C":
        return "text-yellow-600"
      default:
        return "text-red-600"
    }
  }

  const getAttendanceColor = (attendance: number) => {
    if (attendance >= 85) return "text-green-600"
    if (attendance >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getMessageTypeBadge = (type: string) => {
    switch (type) {
      case "INQUIRY":
        return <Badge variant="default">Inquiry</Badge>
      case "COMPLAINT":
        return <Badge variant="destructive">Complaint</Badge>
      case "REQUEST":
        return <Badge variant="secondary">Request</Badge>
      case "FEEDBACK":
        return <Badge variant="outline">Feedback</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const getMeetingStatusBadge = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return <Badge variant="default">Scheduled</Badge>
      case "COMPLETED":
        return <Badge variant="secondary">Completed</Badge>
      case "CANCELLED":
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session || session.user.role !== "FACULTY") {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Student Interaction</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {session.user.name}
              </span>
              <div className="flex space-x-2">
                <Dialog open={isAnnouncementDialogOpen} onOpenChange={setIsAnnouncementDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Announcement
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create Announcement</DialogTitle>
                      <DialogDescription>
                        Send an announcement to students
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={newAnnouncement.title}
                          onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                          placeholder="Enter announcement title"
                        />
                      </div>
                      <div>
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                          id="message"
                          value={newAnnouncement.message}
                          onChange={(e) => setNewAnnouncement({...newAnnouncement, message: e.target.value})}
                          placeholder="Enter announcement message"
                          rows={4}
                        />
                      </div>
                      <div>
                        <Label htmlFor="targetAudience">Target Audience</Label>
                        <Select value={newAnnouncement.targetAudience} onValueChange={(value: any) => setNewAnnouncement({...newAnnouncement, targetAudience: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ALL">All Students</SelectItem>
                            <SelectItem value="SECTION">Specific Section</SelectItem>
                            <SelectItem value="SUBJECT">Specific Subject</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {newAnnouncement.targetAudience !== "ALL" && (
                        <div>
                          <Label htmlFor="targetValue">Target Value</Label>
                          <Input
                            id="targetValue"
                            value={newAnnouncement.targetValue}
                            onChange={(e) => setNewAnnouncement({...newAnnouncement, targetValue: e.target.value})}
                            placeholder={newAnnouncement.targetAudience === "SECTION" ? "e.g., A" : "e.g., Data Structures"}
                          />
                        </div>
                      )}
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsAnnouncementDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAnnouncement}>
                          Send Announcement
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="directory">Student Directory</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="meetings">Meetings</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
          </TabsList>

          <TabsContent value="directory" className="space-y-6">
            {/* Filters */}
            <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={filterSection} onValueChange={setFilterSection}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Sections</SelectItem>
                  <SelectItem value="A">Section A</SelectItem>
                  <SelectItem value="B">Section B</SelectItem>
                  <SelectItem value="C">Section C</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Student Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStudents.map((student) => (
                <Card key={student.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={`/api/placeholder/40/40`} />
                        <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{student.name}</CardTitle>
                        <CardDescription>{student.rollNumber}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Email</p>
                          <p className="truncate">{student.email}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Phone</p>
                          <p>{student.phone}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Semester</p>
                          <p>{student.semester}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Section</p>
                          <p>{student.section}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Attendance</p>
                          <div className="flex items-center space-x-2">
                            <Progress value={student.attendance} className="h-2 flex-1" />
                            <span className={`text-sm font-medium ${getAttendanceColor(student.attendance)}`}>
                              {student.attendance}%
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Overall Grade</p>
                          <span className={`text-lg font-bold ${getGradeColor(student.overallGrade)}`}>
                            {student.overallGrade}
                          </span>
                        </div>
                      </div>

                      {student.lastInteraction && (
                        <div className="text-sm text-gray-600">
                          <p>Last interaction: {format(student.lastInteraction, 'PP')}</p>
                        </div>
                      )}

                      <div className="flex space-x-2 pt-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => {
                            setSelectedStudent(student)
                            setIsMessageDialogOpen(true)
                            setNewMessage({...newMessage, studentId: student.id})
                          }}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => {
                            setSelectedStudent(student)
                            setIsMeetingDialogOpen(true)
                            setNewMeeting({...newMeeting, studentId: student.id})
                          }}
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Meet
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            {/* Messages List */}
            <Card>
              <CardHeader>
                <CardTitle>Student Messages</CardTitle>
                <CardDescription>Messages from students requiring your attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{message.studentName}</h4>
                          <p className="text-sm text-gray-600">{message.subject}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getMessageTypeBadge(message.type)}
                          {message.status === "UNREAD" && (
                            <Badge variant="destructive">Unread</Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{message.message}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          {format(message.sentAt, 'PPp')}
                        </span>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button size="sm" variant="outline">
                            <Send className="h-4 w-4 mr-2" />
                            Reply
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="meetings" className="space-y-6">
            {/* Meetings List */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Student Meetings</CardTitle>
                    <CardDescription>Scheduled and completed meetings with students</CardDescription>
                  </div>
                  <Dialog open={isMeetingDialogOpen} onOpenChange={setIsMeetingDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Schedule Meeting
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Schedule Meeting</DialogTitle>
                        <DialogDescription>
                          Schedule a meeting with a student
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="student">Student</Label>
                          <Select value={newMeeting.studentId} onValueChange={(value) => setNewMeeting({...newMeeting, studentId: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select student" />
                            </SelectTrigger>
                            <SelectContent>
                              {students.map((student) => (
                                <SelectItem key={student.id} value={student.id}>
                                  {student.name} - {student.rollNumber}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="purpose">Purpose</Label>
                          <Input
                            id="purpose"
                            value={newMeeting.purpose}
                            onChange={(e) => setNewMeeting({...newMeeting, purpose: e.target.value})}
                            placeholder="Enter meeting purpose"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="scheduledAt">Date & Time</Label>
                            <Input
                              id="scheduledAt"
                              type="datetime-local"
                              value={newMeeting.scheduledAt.toISOString().slice(0, 16)}
                              onChange={(e) => setNewMeeting({...newMeeting, scheduledAt: new Date(e.target.value)})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="duration">Duration (minutes)</Label>
                            <Input
                              id="duration"
                              type="number"
                              value={newMeeting.duration}
                              onChange={(e) => setNewMeeting({...newMeeting, duration: parseInt(e.target.value) || 30})}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setIsMeetingDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleScheduleMeeting}>
                            Schedule Meeting
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Scheduled At</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {meetings.map((meeting) => (
                      <TableRow key={meeting.id}>
                        <TableCell className="font-medium">{meeting.studentName}</TableCell>
                        <TableCell>{meeting.purpose}</TableCell>
                        <TableCell>{format(meeting.scheduledAt, 'PPp')}</TableCell>
                        <TableCell>{meeting.duration} minutes</TableCell>
                        <TableCell>{getMeetingStatusBadge(meeting.status)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="announcements" className="space-y-6">
            {/* Announcements List */}
            <div className="grid gap-4">
              {announcements.map((announcement) => (
                <Card key={announcement.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{announcement.title}</CardTitle>
                        <CardDescription>
                          {announcement.targetAudience === "ALL" ? "All Students" : 
                           announcement.targetAudience === "SECTION" ? `Section ${announcement.targetValue}` :
                           `${announcement.targetValue} Students`}
                        </CardDescription>
                      </div>
                      <div className="text-sm text-gray-500">
                        {format(announcement.sentAt, 'PPp')}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4">{announcement.message}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Read by: {announcement.readBy}/{announcement.totalRecipients}</span>
                        <Progress value={(announcement.readBy / announcement.totalRecipients) * 100} className="h-2 w-32" />
                      </div>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Message Dialog */}
      <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Message to Student</DialogTitle>
            <DialogDescription>
              Send a message to {selectedStudent?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={newMessage.subject}
                onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
                placeholder="Enter message subject"
              />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={newMessage.message}
                onChange={(e) => setNewMessage({...newMessage, message: e.target.value})}
                placeholder="Enter your message"
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="type">Message Type</Label>
              <Select value={newMessage.type} onValueChange={(value: any) => setNewMessage({...newMessage, type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INQUIRY">Inquiry</SelectItem>
                  <SelectItem value="REQUEST">Request</SelectItem>
                  <SelectItem value="FEEDBACK">Feedback</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsMessageDialogOpen(false)}>
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
    </div>
  )
}