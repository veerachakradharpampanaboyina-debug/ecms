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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  BookOpen, 
  Calendar as CalendarIcon, 
  Target,
  Award,
  AlertTriangle,
  CheckCircle,
  Download,
  Filter,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  FileText,
  Star
} from "lucide-react"
import { format, startOfMonth, endOfMonth, subMonths, isWithinInterval } from "date-fns"
import { cn } from "@/lib/utils"

interface SubjectPerformance {
  subject: string
  totalStudents: number
  averageMarks: number
  highestMarks: number
  lowestMarks: number
  passPercentage: number
  gradeDistribution: {
    A: number
    B: number
    C: number
    D: number
    F: number
  }
}

interface AttendanceStats {
  subject: string
  totalClasses: number
  averageAttendance: number
  highestAttendance: number
  lowestAttendance: number
  studentsBelowThreshold: number
}

interface AssignmentStats {
  subject: string
  totalAssignments: number
  averageSubmission: number
  averageMarks: number
  lateSubmissions: number
  notSubmitted: number
}

interface StudentPerformance {
  id: string
  name: string
  rollNumber: string
  overallGrade: string
  overallAttendance: number
  totalMarks: number
  rank: number
  trend: "up" | "down" | "stable"
}

interface MonthlyData {
  month: string
  attendance: number
  assignments: number
  marks: number
}

export default function FacultyReportsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [subjectPerformance, setSubjectPerformance] = useState<SubjectPerformance[]>([])
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats[]>([])
  const [assignmentStats, setAssignmentStats] = useState<AssignmentStats[]>([])
  const [studentPerformance, setStudentPerformance] = useState<StudentPerformance[]>([])
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedSubject, setSelectedSubject] = useState<string>("ALL")
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date())
  const [isGenerateReportOpen, setIsGenerateReportOpen] = useState(false)

  // Report generation states
  const [reportType, setReportType] = useState<string>("performance")
  const [reportFormat, setReportFormat] = useState<string>("pdf")

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user.role !== "FACULTY") {
      router.push("/auth/signin")
    }
  }, [session, status, router])

  useEffect(() => {
    // Mock data for subject performance
    const mockSubjectPerformance: SubjectPerformance[] = [
      {
        subject: "Data Structures",
        totalStudents: 40,
        averageMarks: 75.5,
        highestMarks: 95,
        lowestMarks: 45,
        passPercentage: 85,
        gradeDistribution: { A: 8, B: 16, C: 10, D: 4, F: 2 }
      },
      {
        subject: "Algorithms",
        totalStudents: 38,
        averageMarks: 72.3,
        highestMarks: 92,
        lowestMarks: 48,
        passPercentage: 82,
        gradeDistribution: { A: 6, B: 14, C: 11, D: 5, F: 2 }
      },
      {
        subject: "Database Systems",
        totalStudents: 35,
        averageMarks: 78.2,
        highestMarks: 98,
        lowestMarks: 52,
        passPercentage: 88,
        gradeDistribution: { A: 10, B: 15, C: 7, D: 2, F: 1 }
      }
    ]
    setSubjectPerformance(mockSubjectPerformance)

    // Mock data for attendance stats
    const mockAttendanceStats: AttendanceStats[] = [
      {
        subject: "Data Structures",
        totalClasses: 24,
        averageAttendance: 85,
        highestAttendance: 95,
        lowestAttendance: 65,
        studentsBelowThreshold: 5
      },
      {
        subject: "Algorithms",
        totalClasses: 20,
        averageAttendance: 82,
        highestAttendance: 92,
        lowestAttendance: 60,
        studentsBelowThreshold: 7
      },
      {
        subject: "Database Systems",
        totalClasses: 18,
        averageAttendance: 88,
        highestAttendance: 96,
        lowestAttendance: 70,
        studentsBelowThreshold: 3
      }
    ]
    setAttendanceStats(mockAttendanceStats)

    // Mock data for assignment stats
    const mockAssignmentStats: AssignmentStats[] = [
      {
        subject: "Data Structures",
        totalAssignments: 5,
        averageSubmission: 92,
        averageMarks: 78,
        lateSubmissions: 8,
        notSubmitted: 3
      },
      {
        subject: "Algorithms",
        totalAssignments: 4,
        averageSubmission: 88,
        averageMarks: 75,
        lateSubmissions: 12,
        notSubmitted: 5
      },
      {
        subject: "Database Systems",
        totalAssignments: 3,
        averageSubmission: 95,
        averageMarks: 82,
        lateSubmissions: 4,
        notSubmitted: 2
      }
    ]
    setAssignmentStats(mockAssignmentStats)

    // Mock data for student performance
    const mockStudentPerformance: StudentPerformance[] = [
      { id: "1", name: "John Doe", rollNumber: "CS001", overallGrade: "B+", overallAttendance: 85, totalMarks: 235, rank: 5, trend: "up" },
      { id: "2", name: "Jane Smith", rollNumber: "CS002", overallGrade: "A", overallAttendance: 92, totalMarks: 268, rank: 1, trend: "stable" },
      { id: "3", name: "Bob Johnson", rollNumber: "CS003", overallGrade: "C+", overallAttendance: 65, totalMarks: 195, rank: 25, trend: "down" },
      { id: "4", name: "Alice Brown", rollNumber: "CS004", overallGrade: "A-", overallAttendance: 88, totalMarks: 255, rank: 3, trend: "up" },
      { id: "5", name: "Charlie Wilson", rollNumber: "CS005", overallGrade: "B", overallAttendance: 78, totalMarks: 225, rank: 8, trend: "stable" }
    ]
    setStudentPerformance(mockStudentPerformance)

    // Mock data for monthly trends
    const mockMonthlyData: MonthlyData[] = [
      { month: "Jan", attendance: 82, assignments: 85, marks: 74 },
      { month: "Feb", attendance: 85, assignments: 88, marks: 76 },
      { month: "Mar", attendance: 78, assignments: 82, marks: 72 },
      { month: "Apr", attendance: 88, assignments: 90, marks: 78 },
      { month: "May", attendance: 84, assignments: 86, marks: 75 },
      { month: "Jun", attendance: 86, assignments: 89, marks: 77 }
    ]
    setMonthlyData(mockMonthlyData)
  }, [])

  const filteredSubjectPerformance = selectedSubject === "ALL" 
    ? subjectPerformance 
    : subjectPerformance.filter(sp => sp.subject === selectedSubject)

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

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const generateReport = () => {
    // In a real application, this would generate and download a report
    console.log(`Generating ${reportType} report in ${reportFormat} format`)
    setIsGenerateReportOpen(false)
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
              <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {session.user.name}
              </span>
              <Dialog open={isGenerateReportOpen} onOpenChange={setIsGenerateReportOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Generate Report</DialogTitle>
                    <DialogDescription>
                      Select report type and format to generate
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="reportType">Report Type</Label>
                      <Select value={reportType} onValueChange={setReportType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="performance">Performance Report</SelectItem>
                          <SelectItem value="attendance">Attendance Report</SelectItem>
                          <SelectItem value="assignments">Assignment Report</SelectItem>
                          <SelectItem value="comprehensive">Comprehensive Report</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="reportFormat">Format</Label>
                      <Select value={reportFormat} onValueChange={setReportFormat}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="excel">Excel</SelectItem>
                          <SelectItem value="csv">CSV</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsGenerateReportOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={generateReport}>
                        Generate
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">113</div>
                  <p className="text-xs text-muted-foreground">
                    Across all subjects
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Attendance</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">85%</div>
                  <p className="text-xs text-muted-foreground">
                    +2% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Assignment Submission</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">88%</div>
                  <p className="text-xs text-muted-foreground">
                    Average submission rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">85%</div>
                  <p className="text-xs text-muted-foreground">
                    Overall pass percentage
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Subject-wise Performance Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Subject Performance Summary</CardTitle>
                  <CardDescription>Overall performance across subjects</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {subjectPerformance.map((subject) => (
                      <div key={subject.subject} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium">{subject.subject}</h4>
                          <p className="text-sm text-gray-600">{subject.totalStudents} students</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">{subject.averageMarks.toFixed(1)}%</div>
                          <div className="text-sm text-gray-600">{subject.passPercentage}% pass</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Trends</CardTitle>
                  <CardDescription>Performance trends over the last 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {monthlyData.map((month) => (
                      <div key={month.month} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{month.month}</span>
                          <span>{month.marks}% avg marks</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span>Attendance</span>
                              <span>{month.attendance}%</span>
                            </div>
                            <Progress value={month.attendance} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span>Assignments</span>
                              <span>{month.assignments}%</span>
                            </div>
                            <Progress value={month.assignments} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span>Marks</span>
                              <span>{month.marks}%</span>
                            </div>
                            <Progress value={month.marks} className="h-2" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Performers and At-risk Students */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="h-5 w-5 mr-2" />
                    Top Performers
                  </CardTitle>
                  <CardDescription>Students with highest overall performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {studentPerformance
                      .filter(student => student.rank <= 5)
                      .map((student) => (
                        <div key={student.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-green-600">#{student.rank}</span>
                            </div>
                            <div>
                              <p className="font-medium">{student.name}</p>
                              <p className="text-sm text-gray-600">{student.rollNumber}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">{student.overallGrade}</div>
                            <div className="text-sm text-gray-600">{student.totalMarks} marks</div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    At-risk Students
                  </CardTitle>
                  <CardDescription>Students requiring additional attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {studentPerformance
                      .filter(student => student.rank >= 20)
                      .slice(0, 5)
                      .map((student) => (
                        <div key={student.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-red-600">#{student.rank}</span>
                            </div>
                            <div>
                              <p className="font-medium">{student.name}</p>
                              <p className="text-sm text-gray-600">{student.rollNumber}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-red-600">{student.overallGrade}</div>
                            <div className="text-sm text-gray-600">{student.overallAttendance}% attendance</div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            {/* Filters */}
            <div className="flex gap-4">
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Subjects</SelectItem>
                  <SelectItem value="Data Structures">Data Structures</SelectItem>
                  <SelectItem value="Algorithms">Algorithms</SelectItem>
                  <SelectItem value="Database Systems">Database Systems</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Subject Performance Details */}
            <div className="grid gap-6">
              {filteredSubjectPerformance.map((subject) => (
                <Card key={subject.subject}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2" />
                      {subject.subject} Performance Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Total Students</p>
                        <p className="text-2xl font-bold">{subject.totalStudents}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Average Marks</p>
                        <p className="text-2xl font-bold">{subject.averageMarks.toFixed(1)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Highest Marks</p>
                        <p className="text-2xl font-bold text-green-600">{subject.highestMarks}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Lowest Marks</p>
                        <p className="text-2xl font-bold text-red-600">{subject.lowestMarks}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Pass Percentage</p>
                        <p className="text-2xl font-bold">{subject.passPercentage}%</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Grade Distribution</h4>
                      <div className="grid grid-cols-5 gap-4">
                        {Object.entries(subject.gradeDistribution).map(([grade, count]) => (
                          <div key={grade} className="text-center">
                            <div className="text-2xl font-bold mb-1">{count}</div>
                            <div className="text-sm text-gray-600">Grade {grade}</div>
                            <div className="text-xs text-gray-500">
                              {((count / subject.totalStudents) * 100).toFixed(1)}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Student Performance Ranking */}
            <Card>
              <CardHeader>
                <CardTitle>Student Performance Ranking</CardTitle>
                <CardDescription>Complete ranking of all students</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Roll Number</TableHead>
                      <TableHead>Overall Grade</TableHead>
                      <TableHead>Total Marks</TableHead>
                      <TableHead>Attendance</TableHead>
                      <TableHead>Trend</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentPerformance.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">#{student.rank}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.rollNumber}</TableCell>
                        <TableCell>
                          <span className={`font-bold ${getGradeColor(student.overallGrade)}`}>
                            {student.overallGrade}
                          </span>
                        </TableCell>
                        <TableCell>{student.totalMarks}</TableCell>
                        <TableCell>{student.overallAttendance}%</TableCell>
                        <TableCell>
                          {getTrendIcon(student.trend)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance" className="space-y-6">
            {/* Attendance Statistics */}
            <div className="grid gap-6">
              {attendanceStats.map((stats) => (
                <Card key={stats.subject}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="h-5 w-5 mr-2" />
                      {stats.subject} Attendance Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Total Classes</p>
                        <p className="text-2xl font-bold">{stats.totalClasses}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Average Attendance</p>
                        <p className="text-2xl font-bold">{stats.averageAttendance}%</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Highest Attendance</p>
                        <p className="text-2xl font-bold text-green-600">{stats.highestAttendance}%</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Lowest Attendance</p>
                        <p className="text-2xl font-bold text-red-600">{stats.lowestAttendance}%</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Below 75%</p>
                        <p className="text-2xl font-bold text-red-600">{stats.studentsBelowThreshold}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Average Attendance Rate</span>
                        <span>{stats.averageAttendance}%</span>
                      </div>
                      <Progress value={stats.averageAttendance} className="h-3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="assignments" className="space-y-6">
            {/* Assignment Statistics */}
            <div className="grid gap-6">
              {assignmentStats.map((stats) => (
                <Card key={stats.subject}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      {stats.subject} Assignment Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Total Assignments</p>
                        <p className="text-2xl font-bold">{stats.totalAssignments}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Submission Rate</p>
                        <p className="text-2xl font-bold">{stats.averageSubmission}%</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Average Marks</p>
                        <p className="text-2xl font-bold">{stats.averageMarks}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Late Submissions</p>
                        <p className="text-2xl font-bold text-yellow-600">{stats.lateSubmissions}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Not Submitted</p>
                        <p className="text-2xl font-bold text-red-600">{stats.notSubmitted}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Submission Status</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>On Time</span>
                            <span>{stats.averageSubmission - stats.lateSubmissions}%</span>
                          </div>
                          <Progress value={stats.averageSubmission - stats.lateSubmissions} className="h-2" />
                          <div className="flex justify-between text-sm">
                            <span>Late</span>
                            <span>{stats.lateSubmissions}%</span>
                          </div>
                          <Progress value={stats.lateSubmissions} className="h-2" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Performance Distribution</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Above 80%</span>
                            <span>65%</span>
                          </div>
                          <Progress value={65} className="h-2" />
                          <div className="flex justify-between text-sm">
                            <span>60-80%</span>
                            <span>25%</span>
                          </div>
                          <Progress value={25} className="h-2" />
                          <div className="flex justify-between text-sm">
                            <span>Below 60%</span>
                            <span>10%</span>
                          </div>
                          <Progress value={10} className="h-2" />
                        </div>
                      </div>
                    </div>
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