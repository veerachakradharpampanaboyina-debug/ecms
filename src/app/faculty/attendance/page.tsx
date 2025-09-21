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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, CheckCircle, XCircle, Clock, Users, Search } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface Student {
  id: string
  name: string
  rollNumber: string
  status: "PRESENT" | "ABSENT" | "LATE"
  time?: string
}

interface Class {
  id: string
  subject: string
  time: string
  room: string
  students: Student[]
}

export default function FacultyAttendancePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")
  const [classes, setClasses] = useState<Class[]>([])
  const [attendanceMarked, setAttendanceMarked] = useState(false)

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user.role !== "FACULTY") {
      router.push("/auth/signin")
    }
  }, [session, status, router])

  useEffect(() => {
    // Mock data for classes
    const mockClasses: Class[] = [
      {
        id: "1",
        subject: "Data Structures",
        time: "9:00 AM - 10:00 AM",
        room: "A101",
        students: [
          { id: "1", name: "John Doe", rollNumber: "CS001", status: "PRESENT", time: "9:00 AM" },
          { id: "2", name: "Jane Smith", rollNumber: "CS002", status: "PRESENT", time: "9:02 AM" },
          { id: "3", name: "Bob Johnson", rollNumber: "CS003", status: "ABSENT" },
          { id: "4", name: "Alice Brown", rollNumber: "CS004", status: "LATE", time: "9:15 AM" },
          { id: "5", name: "Charlie Wilson", rollNumber: "CS005", status: "PRESENT", time: "9:01 AM" },
        ]
      },
      {
        id: "2",
        subject: "Algorithms",
        time: "10:00 AM - 11:00 AM",
        room: "A102",
        students: [
          { id: "6", name: "David Lee", rollNumber: "CS006", status: "PRESENT", time: "10:00 AM" },
          { id: "7", name: "Emma Davis", rollNumber: "CS007", status: "PRESENT", time: "10:01 AM" },
          { id: "8", name: "Frank Miller", rollNumber: "CS008", status: "ABSENT" },
        ]
      }
    ]
    setClasses(mockClasses)
  }, [])

  const currentClass = classes.find(c => c.id === selectedClass)

  const filteredStudents = currentClass?.students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const updateStudentStatus = (studentId: string, status: "PRESENT" | "ABSENT" | "LATE") => {
    if (!currentClass) return
    
    setClasses(prev => prev.map(cls => {
      if (cls.id === selectedClass) {
        return {
          ...cls,
          students: cls.students.map(student => ({
            ...student,
            status: student.id === studentId ? status : student.status,
            time: student.id === studentId && status === "PRESENT" ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : student.time
          }))
        }
      }
      return cls
    }))
  }

  const markAllPresent = () => {
    if (!currentClass) return
    
    setClasses(prev => prev.map(cls => {
      if (cls.id === selectedClass) {
        return {
          ...cls,
          students: cls.students.map(student => ({
            ...student,
            status: "PRESENT",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }))
        }
      }
      return cls
    }))
  }

  const submitAttendance = () => {
    // Here you would typically send the attendance data to the backend
    setAttendanceMarked(true)
    setTimeout(() => setAttendanceMarked(false), 3000)
  }

  const getAttendanceStats = () => {
    if (!currentClass) return { present: 0, absent: 0, late: 0, total: 0 }
    
    const present = currentClass.students.filter(s => s.status === "PRESENT").length
    const absent = currentClass.students.filter(s => s.status === "ABSENT").length
    const late = currentClass.students.filter(s => s.status === "LATE").length
    
    return { present, absent, late, total: currentClass.students.length }
  }

  const stats = getAttendanceStats()

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
              <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
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
        {/* Date and Class Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2" />
                Select Date
              </CardTitle>
              <CardDescription>Choose the date for attendance marking</CardDescription>
            </CardHeader>
            <CardContent>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Select Class
              </CardTitle>
              <CardDescription>Choose the class for attendance</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.subject} - {cls.time} - {cls.room}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        {currentClass && (
          <>
            {/* Class Info and Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Present</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.present}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Absent</CardTitle>
                  <XCircle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Late</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={markAllPresent}>
                  Mark All Present
                </Button>
                <Button onClick={submitAttendance}>
                  Submit Attendance
                </Button>
              </div>
            </div>

            {/* Attendance Table */}
            <Card>
              <CardHeader>
                <CardTitle>Student Attendance</CardTitle>
                <CardDescription>
                  {currentClass.subject} - {currentClass.time} - {currentClass.room}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Roll Number</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.rollNumber}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>
                          <Badge variant={
                            student.status === "PRESENT" ? "default" :
                            student.status === "ABSENT" ? "destructive" : "secondary"
                          }>
                            {student.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{student.time || "-"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant={student.status === "PRESENT" ? "default" : "outline"}
                              onClick={() => updateStudentStatus(student.id, "PRESENT")}
                            >
                              Present
                            </Button>
                            <Button
                              size="sm"
                              variant={student.status === "ABSENT" ? "destructive" : "outline"}
                              onClick={() => updateStudentStatus(student.id, "ABSENT")}
                            >
                              Absent
                            </Button>
                            <Button
                              size="sm"
                              variant={student.status === "LATE" ? "secondary" : "outline"}
                              onClick={() => updateStudentStatus(student.id, "LATE")}
                            >
                              Late
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}

        {!selectedClass && (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Class</h3>
                <p className="text-gray-600">Choose a class from the dropdown above to mark attendance</p>
              </div>
            </CardContent>
          </Card>
        )}

        {attendanceMarked && (
          <div className="fixed bottom-4 right-4">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="flex items-center p-4">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-green-800">Attendance submitted successfully!</span>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}