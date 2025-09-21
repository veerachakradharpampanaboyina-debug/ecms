"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Calendar } from "@/components/ui/calendar"
import { 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Target,
  BarChart3,
  PieChart,
  User,
  BookOpen,
  CalendarDays,
  Percent,
  Info
} from "lucide-react"
import { format, addDays, subDays, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from "date-fns"
import { cn } from "@/lib/utils"

export const dynamic = 'force-dynamic'

interface AttendanceRecord {
  id: string
  date: Date
  subject: string
  subjectCode: string
  facultyName: string
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED"
  timeIn?: string
  timeOut?: string
  remarks?: string
  semester: string
}

interface SubjectAttendance {
  subject: string
  subjectCode: string
  totalClasses: number
  presentClasses: number
  absentClasses: number
  lateClasses: number
  excusedClasses: number
  attendancePercentage: number
  facultyName: string
  semester: string
}

interface MonthlyAttendance {
  month: string
  year: number
  totalDays: number
  presentDays: number
  absentDays: number
  lateDays: number
  excusedDays: number
  attendancePercentage: number
}

interface AttendanceStats {
  overallAttendance: number
  totalClasses: number
  presentClasses: number
  absentClasses: number
  lateClasses: number
  excusedClasses: number
  consecutiveAbsent: number
  bestStreak: number
  currentStreak: number
}

export default function StudentAttendancePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [subjectAttendance, setSubjectAttendance] = useState<SubjectAttendance[]>([])
  const [monthlyAttendance, setMonthlyAttendance] = useState<MonthlyAttendance[]>([])
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date())
  const [filterSubject, setFilterSubject] = useState<string>("ALL")
  const [filterStatus, setFilterStatus] = useState<string>("ALL")
  const [calendarDate, setCalendarDate] = useState<Date>(new Date())

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user.role !== "STUDENT") {
      router.push("/auth/signin")
    }
  }, [session, status, router])

  useEffect(() => {
    // Mock data for attendance records
    const mockAttendanceRecords: AttendanceRecord[] = [
      {
        id: "1",
        date: new Date(),
        subject: "Data Structures",
        subjectCode: "CS201",
        facultyName: "Dr. John Smith",
        status: "PRESENT",
        timeIn: "9:00 AM",
        timeOut: "10:00 AM",
        semester: "3rd"
      },
      {
        id: "2",
        date: new Date(),
        subject: "Algorithms",
        subjectCode: "CS202",
        facultyName: "Dr. Sarah Johnson",
        status: "PRESENT",
        timeIn: "10:00 AM",
        timeOut: "11:00 AM",
        semester: "3rd"
      },
      {
        id: "3",
        date: subDays(new Date(), 1),
        subject: "Database Systems",
        subjectCode: "CS301",
        facultyName: "Prof. Michael Brown",
        status: "LATE",
        timeIn: "11:15 AM",
        timeOut: "12:00 PM",
        remarks: "Traffic delay",
        semester: "3rd"
      },
      {
        id: "4",
        date: subDays(new Date(), 1),
        subject: "Web Development",
        subjectCode: "CS401",
        facultyName: "Dr. Emily Davis",
        status: "PRESENT",
        timeIn: "3:00 PM",
        timeOut: "4:00 PM",
        semester: "3rd"
      },
      {
        id: "5",
        date: subDays(new Date(), 2),
        subject: "Data Structures",
        subjectCode: "CS201",
        facultyName: "Dr. John Smith",
        status: "ABSENT",
        semester: "3rd",
        remarks: "Medical leave"
      },
      {
        id: "6",
        date: subDays(new Date(), 3),
        subject: "Algorithms",
        subjectCode: "CS202",
        facultyName: "Dr. Sarah Johnson",
        status: "PRESENT",
        timeIn: "10:00 AM",
        timeOut: "11:00 AM",
        semester: "3rd"
      },
      {
        id: "7",
        date: subDays(new Date(), 4),
        subject: "Database Systems",
        subjectCode: "CS301",
        facultyName: "Prof. Michael Brown",
        status: "EXCUSED",
        semester: "3rd",
        remarks: "Approved leave"
      },
      {
        id: "8",
        date: subDays(new Date(), 5),
        subject: "Web Development",
        subjectCode: "CS401",
        facultyName: "Dr. Emily Davis",
        status: "PRESENT",
        timeIn: "3:00 PM",
        timeOut: "4:00 PM",
        semester: "3rd"
      }
    ]
    setAttendanceRecords(mockAttendanceRecords)

    // Mock data for subject attendance
    const mockSubjectAttendance: SubjectAttendance[] = [
      {
        subject: "Data Structures",
        subjectCode: "CS201",
        totalClasses: 25,
        presentClasses: 22,
        absentClasses: 2,
        lateClasses: 1,
        excusedClasses: 0,
        attendancePercentage: 88,
        facultyName: "Dr. John Smith",
        semester: "3rd"
      },
      {
        subject: "Algorithms",
        subjectCode: "CS202",
        totalClasses: 24,
        presentClasses: 21,
        absentClasses: 1,
        lateClasses: 2,
        excusedClasses: 0,
        attendancePercentage: 87.5,
        facultyName: "Dr. Sarah Johnson",
        semester: "3rd"
      },
      {
        subject: "Database Systems",
        subjectCode: "CS301",
        totalClasses: 20,
        presentClasses: 16,
        absentClasses: 2,
        lateClasses: 1,
        excusedClasses: 1,
        attendancePercentage: 80,
        facultyName: "Prof. Michael Brown",
        semester: "3rd"
      },
      {
        subject: "Web Development",
        subjectCode: "CS401",
        totalClasses: 18,
        presentClasses: 17,
        absentClasses: 0,
        lateClasses: 1,
        excusedClasses: 0,
        attendancePercentage: 94.4,
        facultyName: "Dr. Emily Davis",
        semester: "3rd"
      }
    ]
    setSubjectAttendance(mockSubjectAttendance)

    // Mock data for monthly attendance
    const mockMonthlyAttendance: MonthlyAttendance[] = [
      {
        month: "January",
        year: 2024,
        totalDays: 22,
        presentDays: 20,
        absentDays: 1,
        lateDays: 1,
        excusedDays: 0,
        attendancePercentage: 90.9
      },
      {
        month: "February",
        year: 2024,
        totalDays: 20,
        presentDays: 18,
        absentDays: 1,
        lateDays: 1,
        excusedDays: 0,
        attendancePercentage: 90
      },
      {
        month: "March",
        year: 2024,
        totalDays: 21,
        presentDays: 19,
        absentDays: 1,
        lateDays: 1,
        excusedDays: 0,
        attendancePercentage: 90.5
      }
    ]
    setMonthlyAttendance(mockMonthlyAttendance)

    // Mock data for attendance stats
    const totalClasses = mockSubjectAttendance.reduce((sum, subject) => sum + subject.totalClasses, 0)
    const presentClasses = mockSubjectAttendance.reduce((sum, subject) => sum + subject.presentClasses, 0)
    const absentClasses = mockSubjectAttendance.reduce((sum, subject) => sum + subject.absentClasses, 0)
    const lateClasses = mockSubjectAttendance.reduce((sum, subject) => sum + subject.lateClasses, 0)
    const excusedClasses = mockSubjectAttendance.reduce((sum, subject) => sum + subject.excusedClasses, 0)
    const overallAttendance = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0

    const mockAttendanceStats: AttendanceStats = {
      overallAttendance,
      totalClasses,
      presentClasses,
      absentClasses,
      lateClasses,
      excusedClasses,
      consecutiveAbsent: 1,
      bestStreak: 15,
      currentStreak: 3
    }
    setAttendanceStats(mockAttendanceStats)
  }, [])

  const filteredAttendanceRecords = attendanceRecords.filter(record => {
    const matchesSubject = filterSubject === "ALL" || record.subject === filterSubject
    const matchesStatus = filterStatus === "ALL" || record.status === filterStatus
    return matchesSubject && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PRESENT":
        return <Badge variant="default" className="bg-green-100 text-green-800">Present</Badge>
      case "ABSENT":
        return <Badge variant="destructive">Absent</Badge>
      case "LATE":
        return <Badge variant="secondary">Late</Badge>
      case "EXCUSED":
        return <Badge variant="outline">Excused</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PRESENT":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "ABSENT":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "LATE":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "EXCUSED":
        return <Info className="h-4 w-4 text-blue-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600"
    if (percentage >= 75) return "text-blue-600"
    if (percentage >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getAttendanceLevel = (percentage: number) => {
    if (percentage >= 90) return { level: "Excellent", color: "text-green-600", icon: "🏆" }
    if (percentage >= 75) return { level: "Good", color: "text-blue-600", icon: "👍" }
    if (percentage >= 60) return { level: "Average", color: "text-yellow-600", icon: "📊" }
    return { level: "Poor", color: "text-red-600", icon: "⚠️" }
  }

  const getAttendanceForDate = (date: Date) => {
    return attendanceRecords.filter(record => isSameDay(record.date, date))
  }

  const getMonthStats = () => {
    const monthStart = startOfMonth(selectedMonth)
    const monthEnd = endOfMonth(selectedMonth)
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })
    
    const monthRecords = attendanceRecords.filter(record => 
      record.date >= monthStart && record.date <= monthEnd
    )
    
    const totalDays = monthDays.length
    const presentDays = monthRecords.filter(r => r.status === "PRESENT").length
    const absentDays = monthRecords.filter(r => r.status === "ABSENT").length
    const lateDays = monthRecords.filter(r => r.status === "LATE").length
    const excusedDays = monthRecords.filter(r => r.status === "EXCUSED").length
    const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0
    
    return {
      totalDays,
      presentDays,
      absentDays,
      lateDays,
      excusedDays,
      attendancePercentage
    }
  }

  const monthStats = getMonthStats()

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
              <h1 className="text-2xl font-bold text-gray-900">Attendance Tracking</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {session.user.name}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="subjects">Subject-wise</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Attendance Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overall Attendance</CardTitle>
                  <Percent className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${getAttendanceColor(attendanceStats?.overallAttendance || 0)}`}>
                    {attendanceStats?.overallAttendance.toFixed(1) || "0"}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {getAttendanceLevel(attendanceStats?.overallAttendance || 0).level} 
                    {getAttendanceLevel(attendanceStats?.overallAttendance || 0).icon}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{attendanceStats?.totalClasses || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    This semester
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Present Days</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{attendanceStats?.presentClasses || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Classes attended
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{attendanceStats?.currentStreak || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Days in a row
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Attendance Progress */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Attendance Progress</CardTitle>
                <CardDescription>
                  Your overall attendance progress and requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Current Attendance</span>
                    <span className={`text-sm font-medium ${getAttendanceColor(attendanceStats?.overallAttendance || 0)}`}>
                      {attendanceStats?.overallAttendance.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={attendanceStats?.overallAttendance || 0} className="h-3" />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Required: 75%</span>
                    <span>Status: {attendanceStats && attendanceStats.overallAttendance >= 75 ? "✅ On Track" : "⚠️ Needs Improvement"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subject-wise Attendance */}
            <Card>
              <CardHeader>
                <CardTitle>Subject-wise Attendance</CardTitle>
                <CardDescription>
                  Attendance percentage for each subject
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subjectAttendance.map((subject) => (
                    <div key={subject.subjectCode} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium">{subject.subject}</h3>
                          <span className="text-sm text-gray-600">({subject.subjectCode})</span>
                        </div>
                        <p className="text-sm text-gray-600">{subject.facultyName}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>{subject.presentClasses}/{subject.totalClasses} classes</span>
                          <span>{subject.absentClasses} absent</span>
                          <span>{subject.lateClasses} late</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getAttendanceColor(subject.attendancePercentage)}`}>
                          {subject.attendancePercentage.toFixed(1)}%
                        </div>
                        <Progress value={subject.attendancePercentage} className="w-24 h-2 mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calendar */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Attendance Calendar</CardTitle>
                  <CardDescription>
                    View your daily attendance records
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={calendarDate}
                    onSelect={(date) => date && setCalendarDate(date)}
                    className="rounded-md border"
                    modifiers={{
                      present: (date) => attendanceRecords.some(r => isSameDay(r.date, date) && r.status === "PRESENT"),
                      absent: (date) => attendanceRecords.some(r => isSameDay(r.date, date) && r.status === "ABSENT"),
                      late: (date) => attendanceRecords.some(r => isSameDay(r.date, date) && r.status === "LATE"),
                      excused: (date) => attendanceRecords.some(r => isSameDay(r.date, date) && r.status === "EXCUSED")
                    }}
                    modifiersStyles={{
                      present: { backgroundColor: "#dcfce7" },
                      absent: { backgroundColor: "#fecaca" },
                      late: { backgroundColor: "#fef3c7" },
                      excused: { backgroundColor: "#dbeafe" }
                    }}
                  />
                  
                  <div className="mt-4 flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-200 rounded"></div>
                      <span>Present</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-200 rounded"></div>
                      <span>Absent</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-200 rounded"></div>
                      <span>Late</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-200 rounded"></div>
                      <span>Excused</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Day Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Day Details</CardTitle>
                  <CardDescription>
                    {format(calendarDate, "PPP")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {getAttendanceForDate(calendarDate).length > 0 ? (
                    <div className="space-y-3">
                      {getAttendanceForDate(calendarDate).map((record) => (
                        <div key={record.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(record.status)}
                              <h3 className="font-medium">{record.subject}</h3>
                            </div>
                            {getStatusBadge(record.status)}
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{record.facultyName}</p>
                          {record.timeIn && record.timeOut && (
                            <p className="text-sm text-gray-500">
                              {record.timeIn} - {record.timeOut}
                            </p>
                          )}
                          {record.remarks && (
                            <p className="text-sm text-blue-600 mt-1">{record.remarks}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-medium">No classes</p>
                      <p className="text-gray-500">No classes scheduled for this day</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Month Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Month Summary</CardTitle>
                <CardDescription>
                  {format(selectedMonth, "MMMM yyyy")} Attendance Summary
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{monthStats.totalDays}</p>
                    <p className="text-sm text-gray-600">Total Days</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{monthStats.presentDays}</p>
                    <p className="text-sm text-gray-600">Present</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{monthStats.absentDays}</p>
                    <p className="text-sm text-gray-600">Absent</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">{monthStats.lateDays}</p>
                    <p className="text-sm text-gray-600">Late</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${getAttendanceColor(monthStats.attendancePercentage)}`}>
                      {monthStats.attendancePercentage.toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600">Attendance</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subjects" className="space-y-6">
            {/* Subject Attendance Details */}
            <div className="space-y-4">
              {subjectAttendance.map((subject) => (
                <Card key={subject.subjectCode}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{subject.subject}</CardTitle>
                        <CardDescription>
                          {subject.subjectCode} • {subject.facultyName}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getAttendanceColor(subject.attendancePercentage)}`}>
                          {subject.attendancePercentage.toFixed(1)}%
                        </div>
                        <Progress value={subject.attendancePercentage} className="w-32 h-2 mt-1" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-lg font-bold">{subject.totalClasses}</p>
                        <p className="text-sm text-gray-600">Total Classes</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-green-600">{subject.presentClasses}</p>
                        <p className="text-sm text-gray-600">Present</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-red-600">{subject.absentClasses}</p>
                        <p className="text-sm text-gray-600">Absent</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-yellow-600">{subject.lateClasses}</p>
                        <p className="text-sm text-gray-600">Late</p>
                      </div>
                    </div>
                    
                    {subject.excusedClasses > 0 && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          {subject.excusedClasses} excused absence(s)
                        </p>
                      </div>
                    )}
                    
                    {subject.attendancePercentage < 75 && (
                      <div className="mt-4 p-3 bg-red-50 rounded-lg">
                        <p className="text-sm text-red-800">
                          ⚠️ Attendance below required 75%. Please improve your attendance.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            {/* Filters */}
            <div className="flex gap-4">
              <Select value={filterSubject} onValueChange={setFilterSubject}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Subjects</SelectItem>
                  {subjectAttendance.map((subject) => (
                    <SelectItem key={subject.subjectCode} value={subject.subject}>
                      {subject.subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="PRESENT">Present</SelectItem>
                  <SelectItem value="ABSENT">Absent</SelectItem>
                  <SelectItem value="LATE">Late</SelectItem>
                  <SelectItem value="EXCUSED">Excused</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Attendance History */}
            <div className="space-y-4">
              {filteredAttendanceRecords
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((record) => (
                  <Card key={record.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {getStatusIcon(record.status)}
                          <div>
                            <h3 className="font-medium">{record.subject}</h3>
                            <p className="text-sm text-gray-600">{record.subjectCode}</p>
                            <p className="text-sm text-gray-500">{format(record.date, "PPP")}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(record.status)}
                          {record.timeIn && record.timeOut && (
                            <p className="text-sm text-gray-600 mt-1">
                              {record.timeIn} - {record.timeOut}
                            </p>
                          )}
                          <p className="text-sm text-gray-500">{record.facultyName}</p>
                        </div>
                      </div>
                      {record.remarks && (
                        <div className="mt-3 p-2 bg-gray-50 rounded">
                          <p className="text-sm text-gray-700">
                            <strong>Remarks:</strong> {record.remarks}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}