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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Plus, Clock, MapPin, Users, Edit, Trash2, ChevronLeft, ChevronRight, Filter } from "lucide-react"
import { format, addWeeks, subWeeks, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO } from "date-fns"
import { cn } from "@/lib/utils"

interface ClassSchedule {
  id: string
  subject: string
  startTime: string
  endTime: string
  room: string
  dayOfWeek: string
  semester: string
  section: string
  studentCount: number
  type: "THEORY" | "LAB" | "TUTORIAL"
  recurring: boolean
  endDate?: Date
}

interface SpecialClass {
  id: string
  subject: string
  startTime: string
  endTime: string
  room: string
  date: Date
  purpose: string
  studentCount: number
  type: "EXTRA" | "REPLACEMENT" | "MAKEUP"
}

interface LeaveRequest {
  id: string
  date: Date
  reason: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  alternativeArrangement?: string
}

export default function FacultySchedulePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [schedules, setSchedules] = useState<ClassSchedule[]>([])
  const [specialClasses, setSpecialClasses] = useState<SpecialClass[]>([])
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date())
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isSpecialClassDialogOpen, setIsSpecialClassDialogOpen] = useState(false)
  const [isLeaveRequestDialogOpen, setIsLeaveRequestDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("weekly")
  const [filterSubject, setFilterSubject] = useState<string>("ALL")
  const [filterType, setFilterType] = useState<string>("ALL")

  // Form states
  const [newSchedule, setNewSchedule] = useState({
    subject: "",
    startTime: "",
    endTime: "",
    room: "",
    dayOfWeek: "",
    semester: "",
    section: "",
    studentCount: 0,
    type: "THEORY" as const,
    recurring: true,
    endDate: new Date()
  })

  const [newSpecialClass, setNewSpecialClass] = useState({
    subject: "",
    startTime: "",
    endTime: "",
    room: "",
    date: new Date(),
    purpose: "",
    studentCount: 0,
    type: "EXTRA" as const
  })

  const [newLeaveRequest, setNewLeaveRequest] = useState({
    date: new Date(),
    reason: "",
    alternativeArrangement: ""
  })

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user.role !== "FACULTY") {
      router.push("/auth/signin")
    }
  }, [session, status, router])

  useEffect(() => {
    // Mock data for regular schedules
    const mockSchedules: ClassSchedule[] = [
      {
        id: "1",
        subject: "Data Structures",
        startTime: "9:00",
        endTime: "10:00",
        room: "A101",
        dayOfWeek: "MONDAY",
        semester: "3rd",
        section: "A",
        studentCount: 40,
        type: "THEORY",
        recurring: true
      },
      {
        id: "2",
        subject: "Data Structures",
        startTime: "10:00",
        endTime: "11:00",
        room: "A102",
        dayOfWeek: "MONDAY",
        semester: "3rd",
        section: "B",
        studentCount: 38,
        type: "THEORY",
        recurring: true
      },
      {
        id: "3",
        subject: "Algorithms",
        startTime: "11:00",
        endTime: "12:00",
        room: "A201",
        dayOfWeek: "TUESDAY",
        semester: "3rd",
        section: "A",
        studentCount: 40,
        type: "THEORY",
        recurring: true
      },
      {
        id: "4",
        subject: "Database Systems",
        startTime: "2:00",
        endTime: "4:00",
        room: "LAB301",
        dayOfWeek: "WEDNESDAY",
        semester: "3rd",
        section: "A",
        studentCount: 40,
        type: "LAB",
        recurring: true
      },
      {
        id: "5",
        subject: "Web Development",
        startTime: "3:00",
        endTime: "4:00",
        room: "B101",
        dayOfWeek: "THURSDAY",
        semester: "3rd",
        section: "A",
        studentCount: 35,
        type: "THEORY",
        recurring: true
      }
    ]
    setSchedules(mockSchedules)

    // Mock data for special classes
    const mockSpecialClasses: SpecialClass[] = [
      {
        id: "1",
        subject: "Data Structures",
        startTime: "2:00",
        endTime: "3:00",
        room: "A101",
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        purpose: "Extra class for upcoming exam",
        studentCount: 40,
        type: "EXTRA"
      },
      {
        id: "2",
        subject: "Algorithms",
        startTime: "10:00",
        endTime: "11:00",
        room: "A201",
        date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        purpose: "Replacement class for holiday",
        studentCount: 40,
        type: "REPLACEMENT"
      }
    ]
    setSpecialClasses(mockSpecialClasses)

    // Mock data for leave requests
    const mockLeaveRequests: LeaveRequest[] = [
      {
        id: "1",
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        reason: "Personal work",
        status: "PENDING",
        alternativeArrangement: "Class to be handled by Prof. Smith"
      }
    ]
    setLeaveRequests(mockLeaveRequests)
  }, [])

  const filteredSchedules = schedules.filter(schedule => {
    const matchesSubject = filterSubject === "ALL" || schedule.subject === filterSubject
    const matchesType = filterType === "ALL" || schedule.type === filterType
    return matchesSubject && matchesType
  })

  const handleCreateSchedule = () => {
    const schedule: ClassSchedule = {
      id: String(schedules.length + 1),
      ...newSchedule
    }
    setSchedules([...schedules, schedule])
    setNewSchedule({
      subject: "",
      startTime: "",
      endTime: "",
      room: "",
      dayOfWeek: "",
      semester: "",
      section: "",
      studentCount: 0,
      type: "THEORY",
      recurring: true,
      endDate: new Date()
    })
    setIsCreateDialogOpen(false)
  }

  const handleCreateSpecialClass = () => {
    const specialClass: SpecialClass = {
      id: String(specialClasses.length + 1),
      ...newSpecialClass
    }
    setSpecialClasses([...specialClasses, specialClass])
    setNewSpecialClass({
      subject: "",
      startTime: "",
      endTime: "",
      room: "",
      date: new Date(),
      purpose: "",
      studentCount: 0,
      type: "EXTRA"
    })
    setIsSpecialClassDialogOpen(false)
  }

  const handleLeaveRequest = () => {
    const leaveRequest: LeaveRequest = {
      id: String(leaveRequests.length + 1),
      ...newLeaveRequest,
      status: "PENDING"
    }
    setLeaveRequests([...leaveRequests, leaveRequest])
    setNewLeaveRequest({
      date: new Date(),
      reason: "",
      alternativeArrangement: ""
    })
    setIsLeaveRequestDialogOpen(false)
  }

  const getScheduleTypeBadge = (type: string) => {
    switch (type) {
      case "THEORY":
        return <Badge variant="default">Theory</Badge>
      case "LAB":
        return <Badge variant="secondary">Lab</Badge>
      case "TUTORIAL":
        return <Badge variant="outline">Tutorial</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const getSpecialClassTypeBadge = (type: string) => {
    switch (type) {
      case "EXTRA":
        return <Badge variant="default">Extra</Badge>
      case "REPLACEMENT":
        return <Badge variant="secondary">Replacement</Badge>
      case "MAKEUP":
        return <Badge variant="destructive">Makeup</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const getLeaveRequestStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="secondary">Pending</Badge>
      case "APPROVED":
        return <Badge variant="default">Approved</Badge>
      case "REJECTED":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }) // Monday
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const getClassesForDay = (day: Date) => {
    const dayName = format(day, 'EEEE').toUpperCase()
    const regularClasses = filteredSchedules.filter(schedule => schedule.dayOfWeek === dayName)
    
    const specialClassesForDay = specialClasses.filter(specialClass => 
      isSameDay(specialClass.date, day)
    )

    return [...regularClasses, ...specialClassesForDay]
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(direction === 'prev' ? subWeeks(currentWeek, 1) : addWeeks(currentWeek, 1))
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
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
              <h1 className="text-2xl font-bold text-gray-900">Class Schedule</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {session.user.name}
              </span>
              <div className="flex space-x-2">
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Schedule
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add Class Schedule</DialogTitle>
                      <DialogDescription>
                        Add a new class to your regular schedule
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="subject">Subject</Label>
                          <Select value={newSchedule.subject} onValueChange={(value) => setNewSchedule({...newSchedule, subject: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select subject" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Data Structures">Data Structures</SelectItem>
                              <SelectItem value="Algorithms">Algorithms</SelectItem>
                              <SelectItem value="Database Systems">Database Systems</SelectItem>
                              <SelectItem value="Web Development">Web Development</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="type">Type</Label>
                          <Select value={newSchedule.type} onValueChange={(value: any) => setNewSchedule({...newSchedule, type: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="THEORY">Theory</SelectItem>
                              <SelectItem value="LAB">Lab</SelectItem>
                              <SelectItem value="TUTORIAL">Tutorial</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="startTime">Start Time</Label>
                          <Input
                            id="startTime"
                            type="time"
                            value={newSchedule.startTime}
                            onChange={(e) => setNewSchedule({...newSchedule, startTime: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="endTime">End Time</Label>
                          <Input
                            id="endTime"
                            type="time"
                            value={newSchedule.endTime}
                            onChange={(e) => setNewSchedule({...newSchedule, endTime: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="room">Room</Label>
                          <Input
                            id="room"
                            value={newSchedule.room}
                            onChange={(e) => setNewSchedule({...newSchedule, room: e.target.value})}
                            placeholder="Enter room number"
                          />
                        </div>
                        <div>
                          <Label htmlFor="dayOfWeek">Day</Label>
                          <Select value={newSchedule.dayOfWeek} onValueChange={(value) => setNewSchedule({...newSchedule, dayOfWeek: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select day" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="MONDAY">Monday</SelectItem>
                              <SelectItem value="TUESDAY">Tuesday</SelectItem>
                              <SelectItem value="WEDNESDAY">Wednesday</SelectItem>
                              <SelectItem value="THURSDAY">Thursday</SelectItem>
                              <SelectItem value="FRIDAY">Friday</SelectItem>
                              <SelectItem value="SATURDAY">Saturday</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="semester">Semester</Label>
                          <Input
                            id="semester"
                            value={newSchedule.semester}
                            onChange={(e) => setNewSchedule({...newSchedule, semester: e.target.value})}
                            placeholder="e.g., 3rd"
                          />
                        </div>
                        <div>
                          <Label htmlFor="section">Section</Label>
                          <Input
                            id="section"
                            value={newSchedule.section}
                            onChange={(e) => setNewSchedule({...newSchedule, section: e.target.value})}
                            placeholder="e.g., A"
                          />
                        </div>
                        <div>
                          <Label htmlFor="studentCount">Students</Label>
                          <Input
                            id="studentCount"
                            type="number"
                            value={newSchedule.studentCount}
                            onChange={(e) => setNewSchedule({...newSchedule, studentCount: parseInt(e.target.value) || 0})}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateSchedule}>
                          Add Schedule
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={isSpecialClassDialogOpen} onOpenChange={setIsSpecialClassDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Special Class
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Schedule Special Class</DialogTitle>
                      <DialogDescription>
                        Schedule a special class (extra, replacement, or makeup)
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="specialSubject">Subject</Label>
                          <Select value={newSpecialClass.subject} onValueChange={(value) => setNewSpecialClass({...newSpecialClass, subject: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select subject" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Data Structures">Data Structures</SelectItem>
                              <SelectItem value="Algorithms">Algorithms</SelectItem>
                              <SelectItem value="Database Systems">Database Systems</SelectItem>
                              <SelectItem value="Web Development">Web Development</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="specialType">Type</Label>
                          <Select value={newSpecialClass.type} onValueChange={(value: any) => setNewSpecialClass({...newSpecialClass, type: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="EXTRA">Extra Class</SelectItem>
                              <SelectItem value="REPLACEMENT">Replacement</SelectItem>
                              <SelectItem value="MAKEUP">Makeup Class</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="specialDate">Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !newSpecialClass.date && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {newSpecialClass.date ? format(newSpecialClass.date, "PPP") : <span>Pick a date</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={newSpecialClass.date}
                                onSelect={(date) => date && setNewSpecialClass({...newSpecialClass, date})}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div>
                          <Label htmlFor="specialRoom">Room</Label>
                          <Input
                            id="specialRoom"
                            value={newSpecialClass.room}
                            onChange={(e) => setNewSpecialClass({...newSpecialClass, room: e.target.value})}
                            placeholder="Enter room number"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="specialStartTime">Start Time</Label>
                          <Input
                            id="specialStartTime"
                            type="time"
                            value={newSpecialClass.startTime}
                            onChange={(e) => setNewSpecialClass({...newSpecialClass, startTime: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="specialEndTime">End Time</Label>
                          <Input
                            id="specialEndTime"
                            type="time"
                            value={newSpecialClass.endTime}
                            onChange={(e) => setNewSpecialClass({...newSpecialClass, endTime: e.target.value})}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="purpose">Purpose</Label>
                        <Input
                          id="purpose"
                          value={newSpecialClass.purpose}
                          onChange={(e) => setNewSpecialClass({...newSpecialClass, purpose: e.target.value})}
                          placeholder="Enter purpose of special class"
                        />
                      </div>
                      <div>
                        <Label htmlFor="specialStudentCount">Expected Students</Label>
                        <Input
                          id="specialStudentCount"
                          type="number"
                          value={newSpecialClass.studentCount}
                          onChange={(e) => setNewSpecialClass({...newSpecialClass, studentCount: parseInt(e.target.value) || 0})}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsSpecialClassDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateSpecialClass}>
                          Schedule Class
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="weekly">Weekly View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="leave">Leave Management</TabsTrigger>
          </TabsList>

          <TabsContent value="weekly" className="space-y-6">
            {/* Week Navigation */}
            <div className="flex justify-between items-center">
              <Button variant="outline" onClick={() => navigateWeek('prev')}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous Week
              </Button>
              <h2 className="text-xl font-semibold">
                {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
              </h2>
              <Button variant="outline" onClick={() => navigateWeek('next')}>
                Next Week
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>

            {/* Weekly Calendar */}
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              {weekDays.map((day, index) => (
                <Card key={index} className="h-fit">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-center">
                      {format(day, 'EEE')}
                    </CardTitle>
                    <CardDescription className="text-center">
                      {format(day, 'MMM d')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {getClassesForDay(day).map((classItem, classIndex) => {
                      const isSpecial = 'date' in classItem
                      return (
                        <div key={classIndex} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-sm">{classItem.subject}</h4>
                            {isSpecial ? getSpecialClassTypeBadge(classItem.type) : getScheduleTypeBadge(classItem.type)}
                          </div>
                          <div className="space-y-1 text-xs text-gray-600">
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatTime(classItem.startTime)} - {formatTime(classItem.endTime)}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {classItem.room}
                            </div>
                            <div className="flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              {classItem.studentCount} students
                            </div>
                            {isSpecial && (
                              <div className="text-xs text-blue-600 mt-1">
                                {classItem.purpose}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                    {getClassesForDay(day).length === 0 && (
                      <div className="text-center text-gray-400 text-sm py-4">
                        No classes
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="list" className="space-y-6">
            {/* Filters */}
            <div className="flex gap-4">
              <Select value={filterSubject} onValueChange={setFilterSubject}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Subjects</SelectItem>
                  <SelectItem value="Data Structures">Data Structures</SelectItem>
                  <SelectItem value="Algorithms">Algorithms</SelectItem>
                  <SelectItem value="Database Systems">Database Systems</SelectItem>
                  <SelectItem value="Web Development">Web Development</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="THEORY">Theory</SelectItem>
                  <SelectItem value="LAB">Lab</SelectItem>
                  <SelectItem value="TUTORIAL">Tutorial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Regular Schedules */}
            <Card>
              <CardHeader>
                <CardTitle>Regular Class Schedule</CardTitle>
                <CardDescription>Your weekly class schedule</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Day</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Semester</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSchedules.map((schedule) => (
                      <TableRow key={schedule.id}>
                        <TableCell className="font-medium">{schedule.subject}</TableCell>
                        <TableCell>{schedule.dayOfWeek}</TableCell>
                        <TableCell>{formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}</TableCell>
                        <TableCell>{schedule.room}</TableCell>
                        <TableCell>{getScheduleTypeBadge(schedule.type)}</TableCell>
                        <TableCell>{schedule.semester}</TableCell>
                        <TableCell>{schedule.section}</TableCell>
                        <TableCell>{schedule.studentCount}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Special Classes */}
            <Card>
              <CardHeader>
                <CardTitle>Special Classes</CardTitle>
                <CardDescription>Extra, replacement, and makeup classes</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {specialClasses.map((specialClass) => (
                      <TableRow key={specialClass.id}>
                        <TableCell className="font-medium">{specialClass.subject}</TableCell>
                        <TableCell>{format(specialClass.date, 'PPP')}</TableCell>
                        <TableCell>{formatTime(specialClass.startTime)} - {formatTime(specialClass.endTime)}</TableCell>
                        <TableCell>{specialClass.room}</TableCell>
                        <TableCell>{getSpecialClassTypeBadge(specialClass.type)}</TableCell>
                        <TableCell>{specialClass.purpose}</TableCell>
                        <TableCell>{specialClass.studentCount}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-4 w-4" />
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

          <TabsContent value="leave" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Leave Management</h2>
                <p className="text-gray-600">Manage your leave requests and track their status</p>
              </div>
              <Dialog open={isLeaveRequestDialogOpen} onOpenChange={setIsLeaveRequestDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Request Leave
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Request Leave</DialogTitle>
                    <DialogDescription>
                      Submit a leave request for approval
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="leaveDate">Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !newLeaveRequest.date && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newLeaveRequest.date ? format(newLeaveRequest.date, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={newLeaveRequest.date}
                            onSelect={(date) => date && setNewLeaveRequest({...newLeaveRequest, date})}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label htmlFor="reason">Reason</Label>
                      <Textarea
                        id="reason"
                        value={newLeaveRequest.reason}
                        onChange={(e) => setNewLeaveRequest({...newLeaveRequest, reason: e.target.value})}
                        placeholder="Enter reason for leave"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="alternativeArrangement">Alternative Arrangement</Label>
                      <Textarea
                        id="alternativeArrangement"
                        value={newLeaveRequest.alternativeArrangement}
                        onChange={(e) => setNewLeaveRequest({...newLeaveRequest, alternativeArrangement: e.target.value})}
                        placeholder="Describe alternative arrangements for your classes"
                        rows={2}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsLeaveRequestDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleLeaveRequest}>
                        Submit Request
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Leave Requests */}
            <Card>
              <CardHeader>
                <CardTitle>Leave Requests</CardTitle>
                <CardDescription>Track your leave request status</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Alternative Arrangement</TableHead>
                      <TableHead>Applied On</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaveRequests.map((leaveRequest) => (
                      <TableRow key={leaveRequest.id}>
                        <TableCell className="font-medium">{format(leaveRequest.date, 'PPP')}</TableCell>
                        <TableCell>{leaveRequest.reason}</TableCell>
                        <TableCell>{getLeaveRequestStatusBadge(leaveRequest.status)}</TableCell>
                        <TableCell>{leaveRequest.alternativeArrangement || "-"}</TableCell>
                        <TableCell>{format(new Date(), 'PPP')}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-4 w-4" />
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
        </Tabs>
      </div>
    </div>
  )
}