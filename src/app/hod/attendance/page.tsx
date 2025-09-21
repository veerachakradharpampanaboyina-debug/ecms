"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Calendar, 
  Search, 
  Users, 
  UserCheck, 
  UserX, 
  Clock,
  Filter,
  Download,
  MoreHorizontal,
  ChevronLeft,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  CalendarDays,
  Target
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

interface AttendanceRecord {
  id: string
  date: string
  type: "faculty" | "student"
  present: number
  absent: number
  total: number
  percentage: number
  status: "good" | "warning" | "critical"
}

interface FacultyAttendance {
  id: string
  name: string
  email: string
  designation: string
  totalDays: number
  present: number
  absent: number
  late: number
  onLeave: number
  percentage: number
  status: string
  lastAttendance: string
}

interface StudentAttendance {
  id: string
  name: string
  rollNumber: string
  semester: number
  totalDays: number
  present: number
  absent: number
  percentage: number
  status: string
  lastAttendance: string
}

interface SubjectAttendance {
  id: string
  subjectName: string
  subjectCode: string
  faculty: string
  totalClasses: number
  conducted: number
  averageAttendance: number
  status: string
}

export default function AttendanceManagement() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [facultyAttendance, setFacultyAttendance] = useState<FacultyAttendance[]>([])
  const [studentAttendance, setStudentAttendance] = useState<StudentAttendance[]>([])
  const [subjectAttendance, setSubjectAttendance] = useState<SubjectAttendance[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [semesterFilter, setSemesterFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("")

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user.role !== "HOD") {
      router.push("/auth/signin")
    }
  }, [session, status, router])

  useEffect(() => {
    // Mock data - in real app, this would come from API
    const mockAttendanceRecords: AttendanceRecord[] = [
      { id: "1", date: "2024-01-15", type: "faculty", present: 11, absent: 1, total: 12, percentage: 91.7, status: "good" },
      { id: "2", date: "2024-01-15", type: "student", present: 456, absent: 29, total: 485, percentage: 94.0, status: "good" },
      { id: "3", date: "2024-01-14", type: "faculty", present: 10, absent: 2, total: 12, percentage: 83.3, status: "warning" },
      { id: "4", date: "2024-01-14", type: "student", present: 445, absent: 40, total: 485, percentage: 91.8, status: "good" },
      { id: "5", date: "2024-01-13", type: "faculty", present: 12, absent: 0, total: 12, percentage: 100, status: "good" },
      { id: "6", date: "2024-01-13", type: "student", present: 470, absent: 15, total: 485, percentage: 96.9, status: "good" }
    ]

    const mockFacultyAttendance: FacultyAttendance[] = [
      { id: "1", name: "Dr. John Doe", email: "john.doe@ecms.edu", designation: "Professor", totalDays: 65, present: 62, absent: 1, late: 2, onLeave: 0, percentage: 95.4, status: "active", lastAttendance: "2024-01-15" },
      { id: "2", name: "Dr. Alice Smith", email: "alice.smith@ecms.edu", designation: "Associate Professor", totalDays: 65, present: 60, absent: 2, late: 1, onLeave: 2, percentage: 92.3, status: "active", lastAttendance: "2024-01-15" },
      { id: "3", name: "Dr. Bob Johnson", email: "bob.johnson@ecms.edu", designation: "Assistant Professor", totalDays: 65, present: 58, absent: 3, late: 4, onLeave: 0, percentage: 89.2, status: "active", lastAttendance: "2024-01-15" },
      { id: "4", name: "Dr. Carol White", email: "carol.white@ecms.edu", designation: "Associate Professor", totalDays: 65, present: 55, absent: 0, late: 0, onLeave: 10, percentage: 84.6, status: "on_leave", lastAttendance: "2024-01-10" },
      { id: "5", name: "Dr. David Brown", email: "david.brown@ecms.edu", designation: "Professor", totalDays: 65, present: 61, absent: 1, late: 3, onLeave: 0, percentage: 93.8, status: "active", lastAttendance: "2024-01-15" }
    ]

    const mockStudentAttendance: StudentAttendance[] = [
      { id: "1", name: "John Doe", rollNumber: "CS2021001", semester: 4, totalDays: 45, present: 42, absent: 3, percentage: 93.3, status: "good", lastAttendance: "2024-01-15" },
      { id: "2", name: "Jane Smith", rollNumber: "CS2021002", semester: 4, totalDays: 45, present: 40, absent: 5, percentage: 88.9, status: "warning", lastAttendance: "2024-01-15" },
      { id: "3", name: "Mike Johnson", rollNumber: "CS2021003", semester: 3, totalDays: 45, present: 38, absent: 7, percentage: 84.4, status: "warning", lastAttendance: "2024-01-15" },
      { id: "4", name: "Sarah Wilson", rollNumber: "CS2021004", semester: 2, totalDays: 45, present: 44, absent: 1, percentage: 97.8, status: "good", lastAttendance: "2024-01-15" },
      { id: "5", name: "Tom Brown", rollNumber: "CS2021005", semester: 1, totalDays: 45, present: 35, absent: 10, percentage: 77.8, status: "critical", lastAttendance: "2024-01-15" }
    ]

    const mockSubjectAttendance: SubjectAttendance[] = [
      { id: "1", subjectName: "Data Structures", subjectCode: "CS201", faculty: "Dr. John Doe", totalClasses: 30, conducted: 28, averageAttendance: 92.5, status: "good" },
      { id: "2", subjectName: "Database Systems", subjectCode: "CS202", faculty: "Dr. Bob Johnson", totalClasses: 30, conducted: 26, averageAttendance: 89.3, status: "warning" },
      { id: "3", subjectName: "Machine Learning", subjectCode: "CS301", faculty: "Dr. Alice Smith", totalClasses: 25, conducted: 24, averageAttendance: 94.2, status: "good" },
      { id: "4", subjectName: "Software Engineering", subjectCode: "CS302", faculty: "Dr. Carol White", totalClasses: 25, conducted: 22, averageAttendance: 87.8, status: "warning" },
      { id: "5", subjectName: "Computer Networks", subjectCode: "CS402", faculty: "Dr. David Brown", totalClasses: 25, conducted: 23, averageAttendance: 91.6, status: "good" }
    ]

    setAttendanceRecords(mockAttendanceRecords)
    setFacultyAttendance(mockFacultyAttendance)
    setStudentAttendance(mockStudentAttendance)
    setSubjectAttendance(mockSubjectAttendance)
  }, [])

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" })
    router.push("/")
  }

  const getStatusColor = (status: string) => {
    const colors = {
      "good": "bg-green-100 text-green-800",
      "warning": "bg-yellow-100 text-yellow-800",
      "critical": "bg-red-100 text-red-800",
      "active": "bg-green-100 text-green-800",
      "on_leave": "bg-blue-100 text-blue-800"
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600"
    if (percentage >= 75) return "text-yellow-600"
    return "text-red-600"
  }

  const getAttendanceIcon = (percentage: number) => {
    if (percentage >= 90) return CheckCircle
    if (percentage >= 75) return AlertTriangle
    return UserX
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
  }

  const getOverallStats = () => {
    const facultyAvg = facultyAttendance.reduce((sum, f) => sum + f.percentage, 0) / facultyAttendance.length
    const studentAvg = studentAttendance.reduce((sum, s) => sum + s.percentage, 0) / studentAttendance.length
    const subjectAvg = subjectAttendance.reduce((sum, s) => sum + s.averageAttendance, 0) / subjectAttendance.length
    
    return {
      facultyAvg: Math.round(facultyAvg),
      studentAvg: Math.round(studentAvg),
      subjectAvg: Math.round(subjectAvg)
    }
  }

  const stats = getOverallStats()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/hod">
                <Button variant="outline" size="sm">
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
                <p className="text-sm text-gray-600">Computer Science Department</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
                <p className="text-xs text-gray-500">Last login: Today, 9:30 AM</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign Out
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
              <CardTitle className="text-sm font-medium">Faculty Attendance</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.facultyAvg}%</div>
              <Progress value={stats.facultyAvg} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                Department average
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Student Attendance</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.studentAvg}%</div>
              <Progress value={stats.studentAvg} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                Overall average
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Class Conduct Rate</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.subjectAvg}%</div>
              <Progress value={stats.subjectAvg} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                Classes conducted
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Attendance</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {studentAttendance.filter(s => s.percentage < 75).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Students below 75%
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="faculty">Faculty</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="subjects">Subjects</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Recent Attendance Summary
                  </CardTitle>
                  <CardDescription>
                    Daily attendance records for the last week
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {attendanceRecords.slice(0, 6).map((record) => (
                      <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 ${record.type === 'faculty' ? 'bg-blue-100' : 'bg-green-100'} rounded-full flex items-center justify-center`}>
                            {record.type === 'faculty' ? <UserCheck className="h-4 w-4 text-blue-600" /> : <Users className="h-4 w-4 text-green-600" />}
                          </div>
                          <div>
                            <p className="font-medium">{formatDate(record.date)}</p>
                            <p className="text-sm text-gray-600 capitalize">{record.type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm font-medium ${getAttendanceColor(record.percentage)}`}>
                              {record.percentage}%
                            </span>
                            {record.status === 'good' && <CheckCircle className="h-4 w-4 text-green-600" />}
                            {record.status === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                            {record.status === 'critical' && <UserX className="h-4 w-4 text-red-600" />}
                          </div>
                          <p className="text-xs text-gray-500">
                            {record.present}/{record.total} present
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Attendance Trends
                  </CardTitle>
                  <CardDescription>
                    Weekly comparison and trends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Faculty Attendance</span>
                        <span className={`text-sm font-medium ${getAttendanceColor(stats.facultyAvg)}`}>
                          {stats.facultyAvg}%
                        </span>
                      </div>
                      <Progress value={stats.facultyAvg} className="h-2" />
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500">This week</span>
                        <div className="flex items-center space-x-1">
                          {stats.facultyAvg >= 90 ? <TrendingUp className="h-3 w-3 text-green-600" /> : <TrendingDown className="h-3 w-3 text-red-600" />}
                          <span className="text-xs text-gray-500">
                            {stats.facultyAvg >= 90 ? '+2%' : '-1%'} from last week
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Student Attendance</span>
                        <span className={`text-sm font-medium ${getAttendanceColor(stats.studentAvg)}`}>
                          {stats.studentAvg}%
                        </span>
                      </div>
                      <Progress value={stats.studentAvg} className="h-2" />
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500">This week</span>
                        <div className="flex items-center space-x-1">
                          {stats.studentAvg >= 90 ? <TrendingUp className="h-3 w-3 text-green-600" /> : <TrendingDown className="h-3 w-3 text-red-600" />}
                          <span className="text-xs text-gray-500">
                            {stats.studentAvg >= 90 ? '+3%' : '-2%'} from last week
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Class Conduct Rate</span>
                        <span className={`text-sm font-medium ${getAttendanceColor(stats.subjectAvg)}`}>
                          {stats.subjectAvg}%
                        </span>
                      </div>
                      <Progress value={stats.subjectAvg} className="h-2" />
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500">This week</span>
                        <div className="flex items-center space-x-1">
                          {stats.subjectAvg >= 90 ? <TrendingUp className="h-3 w-3 text-green-600" /> : <TrendingDown className="h-3 w-3 text-red-600" />}
                          <span className="text-xs text-gray-500">
                            {stats.subjectAvg >= 90 ? '+1%' : '0%'} from last week
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Faculty Tab */}
          <TabsContent value="faculty">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Faculty Attendance</span>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                </CardTitle>
                <CardDescription>
                  Individual faculty attendance records and statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Faculty Member</TableHead>
                        <TableHead>Designation</TableHead>
                        <TableHead>Attendance Stats</TableHead>
                        <TableHead>Percentage</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Attendance</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {facultyAttendance.map((faculty) => {
                        const Icon = getAttendanceIcon(faculty.percentage)
                        return (
                          <TableRow key={faculty.id}>
                            <TableCell className="font-medium">
                              <div>
                                <div className="font-medium">{faculty.name}</div>
                                <div className="text-sm text-gray-500">{faculty.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{faculty.designation}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>Present: {faculty.present}</div>
                                <div>Absent: {faculty.absent}</div>
                                <div>Late: {faculty.late}</div>
                                {faculty.onLeave > 0 && <div>On Leave: {faculty.onLeave}</div>}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <span className={`text-sm font-medium ${getAttendanceColor(faculty.percentage)}`}>
                                  {faculty.percentage}%
                                </span>
                                <Icon className={`h-4 w-4 ${getAttendanceColor(faculty.percentage)}`} />
                              </div>
                              <Progress value={faculty.percentage} className="w-20 h-1 mt-1" />
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(faculty.status)}>
                                {faculty.status === "active" ? "Active" : "On Leave"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {formatDate(faculty.lastAttendance)}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem>View Details</DropdownMenuItem>
                                  <DropdownMenuItem>Generate Report</DropdownMenuItem>
                                  <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Student Attendance</span>
                  <div className="flex space-x-2">
                    <div className="flex gap-2">
                      <Select value={semesterFilter} onValueChange={setSemesterFilter}>
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Semester" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Semesters</SelectItem>
                          <SelectItem value="1">Semester 1</SelectItem>
                          <SelectItem value="2">Semester 2</SelectItem>
                          <SelectItem value="3">Semester 3</SelectItem>
                          <SelectItem value="4">Semester 4</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="warning">Warning</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  Individual student attendance records and low attendance alerts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Roll Number</TableHead>
                        <TableHead>Semester</TableHead>
                        <TableHead>Attendance Stats</TableHead>
                        <TableHead>Percentage</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Attendance</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentAttendance.map((student) => {
                        const Icon = getAttendanceIcon(student.percentage)
                        return (
                          <TableRow key={student.id}>
                            <TableCell className="font-medium">
                              <div className="font-medium">{student.name}</div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{student.rollNumber}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">Semester {student.semester}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>Present: {student.present}</div>
                                <div>Absent: {student.absent}</div>
                                <div>Total: {student.totalDays} days</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <span className={`text-sm font-medium ${getAttendanceColor(student.percentage)}`}>
                                  {student.percentage}%
                                </span>
                                <Icon className={`h-4 w-4 ${getAttendanceColor(student.percentage)}`} />
                              </div>
                              <Progress value={student.percentage} className="w-20 h-1 mt-1" />
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(student.status)}>
                                {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {formatDate(student.lastAttendance)}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem>View Details</DropdownMenuItem>
                                  <DropdownMenuItem>Generate Report</DropdownMenuItem>
                                  {student.status === "critical" && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem>Send Warning</DropdownMenuItem>
                                      <DropdownMenuItem>Contact Parent</DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subjects Tab */}
          <TabsContent value="subjects">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Subject-wise Attendance</span>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                </CardTitle>
                <CardDescription>
                  Attendance statistics for each subject and class conduct rate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead>Faculty</TableHead>
                        <TableHead>Class Conduct</TableHead>
                        <TableHead>Avg Attendance</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subjectAttendance.map((subject) => {
                        const Icon = getAttendanceIcon(subject.averageAttendance)
                        const conductPercentage = Math.round((subject.conducted / subject.totalClasses) * 100)
                        return (
                          <TableRow key={subject.id}>
                            <TableCell className="font-medium">
                              <div>
                                <div className="font-medium">{subject.subjectName}</div>
                                <div className="text-sm text-gray-500">{subject.subjectCode}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">{subject.faculty}</div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm">{subject.conducted}/{subject.totalClasses}</span>
                                  <span className={`text-xs font-medium ${getAttendanceColor(conductPercentage)}`}>
                                    {conductPercentage}%
                                  </span>
                                </div>
                                <Progress value={conductPercentage} className="w-20 h-1" />
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <span className={`text-sm font-medium ${getAttendanceColor(subject.averageAttendance)}`}>
                                  {subject.averageAttendance}%
                                </span>
                                <Icon className={`h-4 w-4 ${getAttendanceColor(subject.averageAttendance)}`} />
                              </div>
                              <Progress value={subject.averageAttendance} className="w-20 h-1 mt-1" />
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(subject.status)}>
                                {subject.status.charAt(0).toUpperCase() + subject.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem>View Details</DropdownMenuItem>
                                  <DropdownMenuItem>Generate Report</DropdownMenuItem>
                                  {subject.status === "warning" && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem>Send Reminder to Faculty</DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}