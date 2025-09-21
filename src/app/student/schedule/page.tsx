"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User, 
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  Bell,
  AlertTriangle,
  CheckCircle
} from "lucide-react"
import { format, addWeeks, subWeeks, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday, parseISO } from "date-fns"
import { cn } from "@/lib/utils"

interface ClassSchedule {
  id: string
  subject: string
  subjectCode: string
  facultyName: string
  startTime: string
  endTime: string
  room: string
  dayOfWeek: string
  type: "THEORY" | "LAB" | "TUTORIAL"
  semester: string
  section: string
  color: string
}

interface SpecialClass {
  id: string
  subject: string
  startTime: string
  endTime: string
  room: string
  date: Date
  purpose: string
  type: "EXTRA" | "REPLACEMENT" | "MAKEUP"
  facultyName: string
}

interface ExamSchedule {
  id: string
  subject: string
  date: Date
  startTime: string
  endTime: string
  room: string
  type: "MID_TERM" | "FINAL" | "QUIZ"
  syllabus: string[]
}

interface Holiday {
  id: string
  name: string
  date: Date
  type: "HOLIDAY" | "EXAM" | "EVENT"
}

export default function StudentSchedulePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [schedules, setSchedules] = useState<ClassSchedule[]>([])
  const [specialClasses, setSpecialClasses] = useState<SpecialClass[]>([])
  const [examSchedules, setExamSchedules] = useState<ExamSchedule[]>([])
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date())
  const [activeTab, setActiveTab] = useState("weekly")
  const [filterSubject, setFilterSubject] = useState<string>("ALL")
  const [filterType, setFilterType] = useState<string>("ALL")

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user.role !== "STUDENT") {
      router.push("/auth/signin")
    }
  }, [session, status, router])

  useEffect(() => {
    // Mock data for regular schedules
    const mockSchedules: ClassSchedule[] = [
      {
        id: "1",
        subject: "Data Structures",
        subjectCode: "CS201",
        facultyName: "Dr. John Smith",
        startTime: "9:00",
        endTime: "10:00",
        room: "A101",
        dayOfWeek: "MONDAY",
        type: "THEORY",
        semester: "3rd",
        section: "A",
        color: "bg-blue-100 border-blue-300"
      },
      {
        id: "2",
        subject: "Algorithms",
        subjectCode: "CS202",
        facultyName: "Dr. Sarah Johnson",
        startTime: "10:00",
        endTime: "11:00",
        room: "A102",
        dayOfWeek: "MONDAY",
        type: "THEORY",
        semester: "3rd",
        section: "A",
        color: "bg-green-100 border-green-300"
      },
      {
        id: "3",
        subject: "Database Systems",
        subjectCode: "CS301",
        facultyName: "Prof. Michael Brown",
        startTime: "11:00",
        endTime: "12:00",
        room: "A201",
        dayOfWeek: "TUESDAY",
        type: "THEORY",
        semester: "3rd",
        section: "A",
        color: "bg-purple-100 border-purple-300"
      },
      {
        id: "4",
        subject: "Database Systems Lab",
        subjectCode: "CS301L",
        facultyName: "Prof. Michael Brown",
        startTime: "2:00",
        endTime: "4:00",
        room: "LAB301",
        dayOfWeek: "WEDNESDAY",
        type: "LAB",
        semester: "3rd",
        section: "A",
        color: "bg-purple-100 border-purple-300"
      },
      {
        id: "5",
        subject: "Web Development",
        subjectCode: "CS401",
        facultyName: "Dr. Emily Davis",
        startTime: "3:00",
        endTime: "4:00",
        room: "B101",
        dayOfWeek: "THURSDAY",
        type: "THEORY",
        semester: "3rd",
        section: "A",
        color: "bg-orange-100 border-orange-300"
      },
      {
        id: "6",
        subject: "Data Structures",
        subjectCode: "CS201",
        facultyName: "Dr. John Smith",
        startTime: "9:00",
        endTime: "10:00",
        room: "A101",
        dayOfWeek: "FRIDAY",
        type: "THEORY",
        semester: "3rd",
        section: "A",
        color: "bg-blue-100 border-blue-300"
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
        type: "EXTRA",
        facultyName: "Dr. John Smith"
      },
      {
        id: "2",
        subject: "Algorithms",
        startTime: "10:00",
        endTime: "11:00",
        room: "A201",
        date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        purpose: "Replacement class for holiday",
        type: "REPLACEMENT",
        facultyName: "Dr. Sarah Johnson"
      }
    ]
    setSpecialClasses(mockSpecialClasses)

    // Mock data for exam schedules
    const mockExamSchedules: ExamSchedule[] = [
      {
        id: "1",
        subject: "Data Structures",
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        startTime: "9:00",
        endTime: "11:00",
        room: "Exam Hall 1",
        type: "MID_TERM",
        syllabus: ["Arrays", "Linked Lists", "Stacks", "Queues"]
      },
      {
        id: "2",
        subject: "Algorithms",
        date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        startTime: "9:00",
        endTime: "11:00",
        room: "Exam Hall 2",
        type: "MID_TERM",
        syllabus: ["Sorting Algorithms", "Searching Algorithms", "Dynamic Programming"]
      }
    ]
    setExamSchedules(mockExamSchedules)

    // Mock data for holidays
    const mockHolidays: Holiday[] = [
      {
        id: "1",
        name: "Independence Day",
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        type: "HOLIDAY"
      },
      {
        id: "2",
        name: "College Annual Day",
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        type: "EVENT"
      }
    ]
    setHolidays(mockHolidays)
  }, [])

  const filteredSchedules = schedules.filter(schedule => {
    const matchesSubject = filterSubject === "ALL" || schedule.subject === filterSubject
    const matchesType = filterType === "ALL" || schedule.type === filterType
    return matchesSubject && matchesType
  })

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }) // Monday
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const getClassesForDay = (day: Date) => {
    const dayName = format(day, 'EEEE').toUpperCase()
    const regularClasses = filteredSchedules.filter(schedule => schedule.dayOfWeek === dayName)
    
    const specialClassesForDay = specialClasses.filter(specialClass => 
      isSameDay(specialClass.date, day)
    )

    const examsForDay = examSchedules.filter(exam => 
      isSameDay(exam.date, day)
    )

    const holidaysForDay = holidays.filter(holiday => 
      isSameDay(holiday.date, day)
    )

    return { regularClasses, specialClasses: specialClassesForDay, exams: examsForDay, holidays: holidaysForDay }
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

  const getClassTypeBadge = (type: string) => {
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

  const getExamTypeBadge = (type: string) => {
    switch (type) {
      case "MID_TERM":
        return <Badge variant="default">Mid-term</Badge>
      case "FINAL":
        return <Badge variant="destructive">Final</Badge>
      case "QUIZ":
        return <Badge variant="secondary">Quiz</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const getHolidayTypeBadge = (type: string) => {
    switch (type) {
      case "HOLIDAY":
        return <Badge variant="destructive">Holiday</Badge>
      case "EXAM":
        return <Badge variant="default">Exam</Badge>
      case "EVENT":
        return <Badge variant="secondary">Event</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const isTodayClass = (day: Date) => {
    return isToday(day)
  }

  const getUpcomingClasses = () => {
    const today = new Date()
    const upcoming = []
    
    // Check regular classes for today
    const todayName = format(today, 'EEEE').toUpperCase()
    const todayClasses = schedules.filter(s => s.dayOfWeek === todayName)
    
    for (const cls of todayClasses) {
      const [hours, minutes] = cls.startTime.split(':').map(Number)
      const classTime = new Date(today.setHours(hours, minutes, 0, 0))
      if (classTime > today) {
        upcoming.push({ ...cls, date: today, type: 'regular' })
      }
    }
    
    // Add special classes
    for (const special of specialClasses) {
      if (special.date > today) {
        upcoming.push({ ...special, type: 'special' })
      }
    }
    
    return upcoming.slice(0, 5).sort((a, b) => new Date(a.date || a.startTime).getTime() - new Date(b.date || b.startTime).getTime())
  }

  const upcomingClasses = getUpcomingClasses()

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
              <h1 className="text-2xl font-bold text-gray-900">Class Schedule</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {session.user.name}
              </span>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="weekly">Weekly View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="exams">Exam Schedule</TabsTrigger>
            <TabsTrigger value="holidays">Holidays</TabsTrigger>
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

            {/* Upcoming Classes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Upcoming Classes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingClasses.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No upcoming classes today</p>
                  ) : (
                    upcomingClasses.map((cls, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div>
                            <p className="font-medium">{cls.subject}</p>
                            <p className="text-sm text-gray-600">
                              {cls.type === 'regular' ? `${formatTime(cls.startTime)} - ${formatTime(cls.endTime)}` : format(cls.date, 'PPp')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{cls.room}</p>
                          <p className="text-xs text-gray-600">{cls.facultyName}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Weekly Calendar */}
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              {weekDays.map((day, index) => {
                const { regularClasses, specialClasses, exams, holidays } = getClassesForDay(day)
                const isToday = isTodayClass(day)
                
                return (
                  <Card key={index} className={`h-fit ${isToday ? 'ring-2 ring-blue-500' : ''}`}>
                    <CardHeader className="pb-3">
                      <CardTitle className={`text-center ${isToday ? 'text-blue-600' : ''}`}>
                        {format(day, 'EEE')}
                      </CardTitle>
                      <CardDescription className={`text-center ${isToday ? 'text-blue-600 font-medium' : ''}`}>
                        {format(day, 'MMM d')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {/* Holidays */}
                      {holidays.map((holiday) => (
                        <div key={holiday.id} className="p-2 bg-red-50 rounded border border-red-200">
                          <div className="text-center">
                            <p className="text-xs font-medium text-red-600">{holiday.name}</p>
                            {getHolidayTypeBadge(holiday.type)}
                          </div>
                        </div>
                      ))}
                      
                      {/* Exams */}
                      {exams.map((exam) => (
                        <div key={exam.id} className="p-2 bg-purple-50 rounded border border-purple-200">
                          <div className="text-center">
                            <p className="text-xs font-medium text-purple-600">{exam.subject}</p>
                            {getExamTypeBadge(exam.type)}
                            <p className="text-xs text-gray-600 mt-1">{exam.room}</p>
                          </div>
                        </div>
                      ))}
                      
                      {/* Regular Classes */}
                      {regularClasses.map((cls) => (
                        <div key={cls.id} className={`p-3 ${cls.color} rounded-lg border`}>
                          <div className="text-center">
                            <p className="text-sm font-medium">{cls.subject}</p>
                            <p className="text-xs text-gray-600">{formatTime(cls.startTime)} - {formatTime(cls.endTime)}</p>
                            <p className="text-xs text-gray-600">{cls.room}</p>
                            {getClassTypeBadge(cls.type)}
                          </div>
                        </div>
                      ))}
                      
                      {/* Special Classes */}
                      {specialClasses.map((cls) => (
                        <div key={cls.id} className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="text-center">
                            <p className="text-sm font-medium">{cls.subject}</p>
                            <p className="text-xs text-gray-600">{formatTime(cls.startTime)} - {formatTime(cls.endTime)}</p>
                            <p className="text-xs text-gray-600">{cls.room}</p>
                            {getSpecialClassTypeBadge(cls.type)}
                          </div>
                        </div>
                      ))}
                      
                      {regularClasses.length === 0 && specialClasses.length === 0 && exams.length === 0 && holidays.length === 0 && (
                        <div className="text-center text-gray-400 text-sm py-4">
                          No classes
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
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

            {/* Regular Schedule */}
            <Card>
              <CardHeader>
                <CardTitle>Regular Class Schedule</CardTitle>
                <CardDescription>Your weekly class timetable</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Faculty</TableHead>
                      <TableHead>Day</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSchedules.map((schedule) => (
                      <TableRow key={schedule.id}>
                        <TableCell className="font-medium">{schedule.subject}</TableCell>
                        <TableCell>{schedule.subjectCode}</TableCell>
                        <TableCell>{schedule.facultyName}</TableCell>
                        <TableCell>{schedule.dayOfWeek}</TableCell>
                        <TableCell>{formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}</TableCell>
                        <TableCell>{schedule.room}</TableCell>
                        <TableCell>{getClassTypeBadge(schedule.type)}</TableCell>
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
                      <TableHead>Faculty</TableHead>
                      <TableHead>Purpose</TableHead>
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
                        <TableCell>{specialClass.facultyName}</TableCell>
                        <TableCell>{specialClass.purpose}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exams" className="space-y-6">
            {/* Exam Schedule */}
            <div className="grid gap-6">
              {examSchedules.map((exam) => (
                <Card key={exam.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center">
                          <AlertTriangle className="h-5 w-5 mr-2" />
                          {exam.subject} - {getExamTypeBadge(exam.type)}
                        </CardTitle>
                        <CardDescription>
                          {format(exam.date, 'PPP')} • {formatTime(exam.startTime)} - {formatTime(exam.endTime)}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{exam.room}</p>
                        <p className="text-xs text-gray-500">Duration: {formatTime(exam.startTime)} - {formatTime(exam.endTime)}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <h4 className="font-medium mb-2">Syllabus</h4>
                      <div className="flex flex-wrap gap-2">
                        {exam.syllabus.map((topic, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="holidays" className="space-y-6">
            {/* Holidays List */}
            <div className="grid gap-4">
              {holidays.map((holiday) => (
                <Card key={holiday.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="flex items-center">
                          <Bell className="h-5 w-5 mr-2" />
                          {holiday.name}
                        </CardTitle>
                        <CardDescription>
                          {format(holiday.date, 'PPP')}
                        </CardDescription>
                      </div>
                      {getHolidayTypeBadge(holiday.type)}
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}