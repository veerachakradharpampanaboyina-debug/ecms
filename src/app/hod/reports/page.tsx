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
  FileText, 
  Search, 
  Download, 
  Filter,
  Calendar,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Target,
  Users,
  BookOpen,
  Award,
  Clock,
  ChevronLeft,
  MoreHorizontal,
  CheckCircle,
  AlertTriangle,
  Star,
  Activity,
  GraduationCap
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

interface Report {
  id: string
  title: string
  type: string
  category: string
  generatedDate: string
  generatedBy: string
  status: string
  size: string
  downloadUrl: string
}

interface PerformanceMetric {
  id: string
  metric: string
  currentValue: number
  previousValue: number
  target: number
  unit: string
  trend: "up" | "down" | "stable"
  status: "good" | "warning" | "critical"
}

interface FacultyPerformance {
  id: string
  name: string
  designation: string
  subjects: number
  studentSatisfaction: number
  attendance: number
  researchPapers: number
  overallScore: number
  status: string
}

interface SubjectPerformance {
  id: string
  subjectName: string
  subjectCode: string
  faculty: string
  averageScore: number
  passRate: number
  attendance: number
  studentCount: number
  status: string
}

export default function ReportsAnalytics() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([])
  const [facultyPerformance, setFacultyPerformance] = useState<FacultyPerformance[]>([])
  const [subjectPerformance, setSubjectPerformance] = useState<SubjectPerformance[]>([])
  const [reportType, setReportType] = useState("all")
  const [dateRange, setDateRange] = useState("this_month")
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user.role !== "HOD") {
      router.push("/auth/signin")
    }
  }, [session, status, router])

  useEffect(() => {
    // Mock data - in real app, this would come from API
    const mockReports: Report[] = [
      { id: "1", title: "Monthly Performance Report", type: "performance", category: "monthly", generatedDate: "2024-01-15", generatedBy: "Dr. John Doe", status: "completed", size: "2.4 MB", downloadUrl: "/reports/monthly-performance.pdf" },
      { id: "2", title: "Faculty Attendance Report", type: "attendance", category: "monthly", generatedDate: "2024-01-14", generatedBy: "Dr. Alice Smith", status: "completed", size: "1.8 MB", downloadUrl: "/reports/faculty-attendance.pdf" },
      { id: "3", title: "Student Results Analysis", type: "academic", category: "semester", generatedDate: "2024-01-10", generatedBy: "Dr. Bob Johnson", status: "completed", size: "3.2 MB", downloadUrl: "/reports/student-results.pdf" },
      { id: "4", title: "Department Annual Report", type: "comprehensive", category: "annual", generatedDate: "2024-01-01", generatedBy: "Dr. Carol White", status: "completed", size: "5.6 MB", downloadUrl: "/reports/annual-report.pdf" },
      { id: "5", title: "Research Publications Summary", type: "research", category: "quarterly", generatedDate: "2023-12-20", generatedBy: "Dr. David Brown", status: "completed", size: "1.2 MB", downloadUrl: "/reports/research-summary.pdf" }
    ]

    const mockPerformanceMetrics: PerformanceMetric[] = [
      { id: "1", metric: "Department Performance", currentValue: 87, previousValue: 82, target: 90, unit: "%", trend: "up", status: "good" },
      { id: "2", metric: "Faculty Attendance", currentValue: 94, previousValue: 91, target: 95, unit: "%", trend: "up", status: "good" },
      { id: "3", metric: "Student Attendance", currentValue: 85, previousValue: 88, target: 90, unit: "%", trend: "down", status: "warning" },
      { id: "4", metric: "Placement Rate", currentValue: 92, previousValue: 89, target: 95, unit: "%", trend: "up", status: "good" },
      { id: "5", metric: "Research Papers", currentValue: 15, previousValue: 12, target: 20, unit: "", trend: "up", status: "warning" },
      { id: "6", metric: "Student Satisfaction", currentValue: 91, previousValue: 89, target: 95, unit: "%", trend: "up", status: "good" }
    ]

    const mockFacultyPerformance: FacultyPerformance[] = [
      { id: "1", name: "Dr. John Doe", designation: "Professor", subjects: 4, studentSatisfaction: 95, attendance: 92, researchPapers: 12, overallScore: 93, status: "excellent" },
      { id: "2", name: "Dr. Alice Smith", designation: "Associate Professor", subjects: 3, studentSatisfaction: 92, attendance: 96, researchPapers: 8, overallScore: 90, status: "excellent" },
      { id: "3", name: "Dr. Bob Johnson", designation: "Assistant Professor", subjects: 3, studentSatisfaction: 89, attendance: 90, researchPapers: 5, overallScore: 85, status: "good" },
      { id: "4", name: "Dr. Carol White", designation: "Associate Professor", subjects: 2, studentSatisfaction: 94, attendance: 88, researchPapers: 6, overallScore: 88, status: "good" },
      { id: "5", name: "Dr. David Brown", designation: "Professor", subjects: 3, studentSatisfaction: 91, attendance: 94, researchPapers: 15, overallScore: 92, status: "excellent" }
    ]

    const mockSubjectPerformance: SubjectPerformance[] = [
      { id: "1", subjectName: "Data Structures", subjectCode: "CS201", faculty: "Dr. John Doe", averageScore: 85, passRate: 92, attendance: 95, studentCount: 60, status: "excellent" },
      { id: "2", subjectName: "Database Systems", subjectCode: "CS202", faculty: "Dr. Bob Johnson", averageScore: 78, passRate: 85, attendance: 89, studentCount: 58, status: "good" },
      { id: "3", subjectName: "Machine Learning", subjectCode: "CS301", faculty: "Dr. Alice Smith", averageScore: 88, passRate: 94, attendance: 96, studentCount: 38, status: "excellent" },
      { id: "4", subjectName: "Software Engineering", subjectCode: "CS302", faculty: "Dr. Carol White", averageScore: 82, passRate: 88, attendance: 87, studentCount: 45, status: "good" },
      { id: "5", subjectName: "Computer Networks", subjectCode: "CS402", faculty: "Dr. David Brown", averageScore: 86, passRate: 90, attendance: 93, studentCount: 48, status: "excellent" }
    ]

    setReports(mockReports)
    setPerformanceMetrics(mockPerformanceMetrics)
    setFacultyPerformance(mockFacultyPerformance)
    setSubjectPerformance(mockSubjectPerformance)
  }, [])

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" })
    router.push("/")
  }

  const getStatusColor = (status: string) => {
    const colors = {
      "completed": "bg-green-100 text-green-800",
      "processing": "bg-yellow-100 text-yellow-800",
      "failed": "bg-red-100 text-red-800",
      "excellent": "bg-green-100 text-green-800",
      "good": "bg-blue-100 text-blue-800",
      "warning": "bg-yellow-100 text-yellow-800",
      "critical": "bg-red-100 text-red-800"
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getTrendIcon = (trend: string) => {
    return trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Target
  }

  const getTrendColor = (trend: string) => {
    return trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-gray-600"
  }

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-blue-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const handleGenerateReport = async (reportType: string) => {
    setIsGenerating(true)
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsGenerating(false)
    alert(`${reportType} report generated successfully!`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
  }

  const getOverallStats = () => {
    const avgFacultyScore = facultyPerformance.reduce((sum, f) => sum + f.overallScore, 0) / facultyPerformance.length
    const avgSubjectScore = subjectPerformance.reduce((sum, s) => sum + s.averageScore, 0) / subjectPerformance.length
    const totalResearch = facultyPerformance.reduce((sum, f) => sum + f.researchPapers, 0)
    
    return {
      avgFacultyScore: Math.round(avgFacultyScore),
      avgSubjectScore: Math.round(avgSubjectScore),
      totalResearch
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
                <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
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
              <CardTitle className="text-sm font-medium">Avg Faculty Score</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgFacultyScore}%</div>
              <Progress value={stats.avgFacultyScore} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                Department average
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Subject Score</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgSubjectScore}%</div>
              <Progress value={stats.avgSubjectScore} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                Academic performance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Research Papers</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalResearch}</div>
              <p className="text-xs text-muted-foreground">
                Total publications
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reports Generated</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reports.length}</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList>
            <TabsTrigger value="dashboard">Analytics Dashboard</TabsTrigger>
            <TabsTrigger value="reports">Generated Reports</TabsTrigger>
            <TabsTrigger value="faculty">Faculty Performance</TabsTrigger>
            <TabsTrigger value="subjects">Subject Analytics</TabsTrigger>
          </TabsList>

          {/* Analytics Dashboard Tab */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Key Performance Indicators
                  </CardTitle>
                  <CardDescription>
                    Department performance metrics and trends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {performanceMetrics.map((metric) => {
                      const Icon = getTrendIcon(metric.trend)
                      const progressPercentage = Math.round((metric.currentValue / metric.target) * 100)
                      return (
                        <div key={metric.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">{metric.metric}</span>
                            <div className="flex items-center space-x-2">
                              <span className={`text-sm font-bold ${getPerformanceColor(metric.currentValue)}`}>
                                {metric.currentValue}{metric.unit}
                              </span>
                              <Icon className={`h-4 w-4 ${getTrendColor(metric.trend)}`} />
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                            <span>Target: {metric.target}{metric.unit}</span>
                            <span>Previous: {metric.previousValue}{metric.unit}</span>
                          </div>
                          <Progress value={progressPercentage} className="h-2" />
                          <div className="flex items-center justify-between mt-1">
                            <Badge className={getStatusColor(metric.status)}>
                              {metric.status}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {progressPercentage}% of target
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Quick Report Generation
                  </CardTitle>
                  <CardDescription>
                    Generate commonly requested reports
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-3">
                    <Button 
                      className="justify-start h-auto p-4" 
                      variant="outline"
                      onClick={() => handleGenerateReport("Monthly Performance")}
                      disabled={isGenerating}
                    >
                      <div className="flex items-center space-x-3">
                        <BarChart3 className="h-5 w-5" />
                        <div className="text-left">
                          <div className="font-medium">Monthly Performance Report</div>
                          <div className="text-xs text-gray-500">Department KPIs and metrics</div>
                        </div>
                      </div>
                    </Button>
                    
                    <Button 
                      className="justify-start h-auto p-4" 
                      variant="outline"
                      onClick={() => handleGenerateReport("Faculty Attendance")}
                      disabled={isGenerating}
                    >
                      <div className="flex items-center space-x-3">
                        <Users className="h-5 w-5" />
                        <div className="text-left">
                          <div className="font-medium">Faculty Attendance Report</div>
                          <div className="text-xs text-gray-500">Attendance patterns and trends</div>
                        </div>
                      </div>
                    </Button>
                    
                    <Button 
                      className="justify-start h-auto p-4" 
                      variant="outline"
                      onClick={() => handleGenerateReport("Student Results")}
                      disabled={isGenerating}
                    >
                      <div className="flex items-center space-x-3">
                        <GraduationCap className="h-5 w-5" />
                        <div className="text-left">
                          <div className="font-medium">Student Results Analysis</div>
                          <div className="text-xs text-gray-500">Academic performance summary</div>
                        </div>
                      </div>
                    </Button>
                    
                    <Button 
                      className="justify-start h-auto p-4" 
                      variant="outline"
                      onClick={() => handleGenerateReport("Research Summary")}
                      disabled={isGenerating}
                    >
                      <div className="flex items-center space-x-3">
                        <Award className="h-5 w-5" />
                        <div className="text-left">
                          <div className="font-medium">Research Publications</div>
                          <div className="text-xs text-gray-500">Papers and publications summary</div>
                        </div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Generated Reports Tab */}
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Generated Reports</span>
                  <div className="flex space-x-2">
                    <Select value={reportType} onValueChange={setReportType}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Report Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="performance">Performance</SelectItem>
                        <SelectItem value="attendance">Attendance</SelectItem>
                        <SelectItem value="academic">Academic</SelectItem>
                        <SelectItem value="research">Research</SelectItem>
                        <SelectItem value="comprehensive">Comprehensive</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={dateRange} onValueChange={setDateRange}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Date Range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="this_week">This Week</SelectItem>
                        <SelectItem value="this_month">This Month</SelectItem>
                        <SelectItem value="last_month">Last Month</SelectItem>
                        <SelectItem value="this_quarter">This Quarter</SelectItem>
                        <SelectItem value="this_year">This Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardTitle>
                <CardDescription>
                  View and download previously generated reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Report Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Generated Date</TableHead>
                        <TableHead>Generated By</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center space-x-2">
                              <FileText className="h-4 w-4 text-gray-400" />
                              <div>
                                <div className="font-medium">{report.title}</div>
                                <div className="text-sm text-gray-500">{report.category}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{report.type}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{formatDate(report.generatedDate)}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{report.generatedBy}</div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(report.status)}>
                              {report.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{report.size}</div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>View Details</DropdownMenuItem>
                                  <DropdownMenuItem>Share Report</DropdownMenuItem>
                                  <DropdownMenuItem>Delete Report</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Faculty Performance Tab */}
          <TabsContent value="faculty">
            <Card>
              <CardHeader>
                <CardTitle>Faculty Performance Analytics</CardTitle>
                <CardDescription>
                  Comprehensive performance analysis for department faculty
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Faculty Member</TableHead>
                        <TableHead>Designation</TableHead>
                        <TableHead>Subjects</TableHead>
                        <TableHead>Student Satisfaction</TableHead>
                        <TableHead>Attendance</TableHead>
                        <TableHead>Research Papers</TableHead>
                        <TableHead>Overall Score</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {facultyPerformance.map((faculty) => (
                        <TableRow key={faculty.id}>
                          <TableCell className="font-medium">
                            <div className="font-medium">{faculty.name}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{faculty.designation}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{faculty.subjects}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <span className={`text-sm font-medium ${getPerformanceColor(faculty.studentSatisfaction)}`}>
                                {faculty.studentSatisfaction}%
                              </span>
                              <Progress value={faculty.studentSatisfaction} className="w-16 h-1" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <span className={`text-sm font-medium ${getPerformanceColor(faculty.attendance)}`}>
                                {faculty.attendance}%
                              </span>
                              <Progress value={faculty.attendance} className="w-16 h-1" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{faculty.researchPapers}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <span className={`text-sm font-bold ${getPerformanceColor(faculty.overallScore)}`}>
                                {faculty.overallScore}%
                              </span>
                              <Progress value={faculty.overallScore} className="w-16 h-1" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(faculty.status)}>
                              {faculty.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subject Analytics Tab */}
          <TabsContent value="subjects">
            <Card>
              <CardHeader>
                <CardTitle>Subject Performance Analytics</CardTitle>
                <CardDescription>
                  Academic performance analysis for each subject
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead>Faculty</TableHead>
                        <TableHead>Average Score</TableHead>
                        <TableHead>Pass Rate</TableHead>
                        <TableHead>Attendance</TableHead>
                        <TableHead>Student Count</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subjectPerformance.map((subject) => (
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
                            <div className="flex items-center space-x-2">
                              <span className={`text-sm font-medium ${getPerformanceColor(subject.averageScore)}`}>
                                {subject.averageScore}%
                              </span>
                              <Progress value={subject.averageScore} className="w-16 h-1" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <span className={`text-sm font-medium ${getPerformanceColor(subject.passRate)}`}>
                                {subject.passRate}%
                              </span>
                              <Progress value={subject.passRate} className="w-16 h-1" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <span className={`text-sm font-medium ${getPerformanceColor(subject.attendance)}`}>
                                {subject.attendance}%
                              </span>
                              <Progress value={subject.attendance} className="w-16 h-1" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{subject.studentCount}</div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(subject.status)}>
                              {subject.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
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