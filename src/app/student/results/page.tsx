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
import { 
  TrendingUp, 
  TrendingDown, 
  Award, 
  BookOpen, 
  Calendar, 
  Download,
  Search,
  Filter,
  Star,
  BarChart3,
  PieChart,
  Target,
  AlertCircle,
  CheckCircle
} from "lucide-react"
import { format } from "date-fns"

interface Grade {
  id: string
  subject: string
  subjectCode: string
  examType: "MID_TERM" | "FINAL" | "QUIZ" | "ASSIGNMENT" | "PRACTICAL"
  marksObtained: number
  totalMarks: number
  percentage: number
  grade: string
  gradePoints: number
  semester: string
  examDate: Date
  facultyName: string
  credits: number
  status: "PASSED" | "FAILED" | "PENDING"
  remarks?: string
}

interface SemesterGPA {
  semester: string
  sgpa: number
  totalCredits: number
  earnedCredits: number
  subjects: Grade[]
  academicYear: string
}

interface OverallPerformance {
  cgpa: number
  totalCredits: number
  earnedCredits: number
  semesters: SemesterGPA[]
  overallGrade: string
  classRank?: number
  totalStudents?: number
}

interface SubjectPerformance {
  subject: string
  subjectCode: string
  averageMarks: number
  highestMarks: number
  lowestMarks: number
  totalExams: number
  passedExams: number
  trend: "IMPROVING" | "DECLINING" | "STABLE"
}

export default function StudentResultsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [grades, setGrades] = useState<Grade[]>([])
  const [semesters, setSemesters] = useState<SemesterGPA[]>([])
  const [overallPerformance, setOverallPerformance] = useState<OverallPerformance | null>(null)
  const [subjectPerformance, setSubjectPerformance] = useState<SubjectPerformance[]>([])
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSemester, setFilterSemester] = useState<string>("ALL")
  const [filterExamType, setFilterExamType] = useState<string>("ALL")
  const [selectedSemester, setSelectedSemester] = useState<string>("")

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user.role !== "STUDENT") {
      router.push("/auth/signin")
    }
  }, [session, status, router])

  useEffect(() => {
    // Mock data for grades
    const mockGrades: Grade[] = [
      {
        id: "1",
        subject: "Data Structures",
        subjectCode: "CS201",
        examType: "MID_TERM",
        marksObtained: 42,
        totalMarks: 50,
        percentage: 84,
        grade: "A",
        gradePoints: 8.5,
        semester: "3rd",
        examDate: new Date("2024-02-15"),
        facultyName: "Dr. John Smith",
        credits: 4,
        status: "PASSED",
        remarks: "Excellent performance"
      },
      {
        id: "2",
        subject: "Data Structures",
        subjectCode: "CS201",
        examType: "FINAL",
        marksObtained: 78,
        totalMarks: 100,
        percentage: 78,
        grade: "B+",
        gradePoints: 7.5,
        semester: "3rd",
        examDate: new Date("2024-05-20"),
        facultyName: "Dr. John Smith",
        credits: 4,
        status: "PASSED",
        remarks: "Good understanding of concepts"
      },
      {
        id: "3",
        subject: "Algorithms",
        subjectCode: "CS202",
        examType: "MID_TERM",
        marksObtained: 38,
        totalMarks: 50,
        percentage: 76,
        grade: "B",
        gradePoints: 7.0,
        semester: "3rd",
        examDate: new Date("2024-02-18"),
        facultyName: "Dr. Sarah Johnson",
        credits: 4,
        status: "PASSED"
      },
      {
        id: "4",
        subject: "Algorithms",
        subjectCode: "CS202",
        examType: "FINAL",
        marksObtained: 82,
        totalMarks: 100,
        percentage: 82,
        grade: "A",
        gradePoints: 8.0,
        semester: "3rd",
        examDate: new Date("2024-05-22"),
        facultyName: "Dr. Sarah Johnson",
        credits: 4,
        status: "PASSED"
      },
      {
        id: "5",
        subject: "Database Systems",
        subjectCode: "CS301",
        examType: "MID_TERM",
        marksObtained: 35,
        totalMarks: 50,
        percentage: 70,
        grade: "B",
        gradePoints: 7.0,
        semester: "3rd",
        examDate: new Date("2024-02-20"),
        facultyName: "Prof. Michael Brown",
        credits: 3,
        status: "PASSED"
      },
      {
        id: "6",
        subject: "Database Systems",
        subjectCode: "CS301",
        examType: "FINAL",
        marksObtained: 75,
        totalMarks: 100,
        percentage: 75,
        grade: "B",
        gradePoints: 7.0,
        semester: "3rd",
        examDate: new Date("2024-05-25"),
        facultyName: "Prof. Michael Brown",
        credits: 3,
        status: "PASSED"
      },
      {
        id: "7",
        subject: "Web Development",
        subjectCode: "CS401",
        examType: "MID_TERM",
        marksObtained: 45,
        totalMarks: 50,
        percentage: 90,
        grade: "A+",
        gradePoints: 9.0,
        semester: "3rd",
        examDate: new Date("2024-02-22"),
        facultyName: "Dr. Emily Davis",
        credits: 3,
        status: "PASSED",
        remarks: "Outstanding performance"
      },
      {
        id: "8",
        subject: "Web Development",
        subjectCode: "CS401",
        examType: "FINAL",
        marksObtained: 88,
        totalMarks: 100,
        percentage: 88,
        grade: "A",
        gradePoints: 8.5,
        semester: "3rd",
        examDate: new Date("2024-05-28"),
        facultyName: "Dr. Emily Davis",
        credits: 3,
        status: "PASSED"
      },
      // Previous semester grades
      {
        id: "9",
        subject: "Programming Fundamentals",
        subjectCode: "CS101",
        examType: "FINAL",
        marksObtained: 85,
        totalMarks: 100,
        percentage: 85,
        grade: "A",
        gradePoints: 8.0,
        semester: "2nd",
        examDate: new Date("2023-11-20"),
        facultyName: "Dr. John Smith",
        credits: 4,
        status: "PASSED"
      },
      {
        id: "10",
        subject: "Mathematics I",
        subjectCode: "MATH101",
        examType: "FINAL",
        marksObtained: 72,
        totalMarks: 100,
        percentage: 72,
        grade: "B",
        gradePoints: 7.0,
        semester: "2nd",
        examDate: new Date("2023-11-25"),
        facultyName: "Prof. Robert Wilson",
        credits: 4,
        status: "PASSED"
      }
    ]
    setGrades(mockGrades)

    // Mock data for semesters
    const mockSemesters: SemesterGPA[] = [
      {
        semester: "3rd",
        sgpa: 7.9,
        totalCredits: 14,
        earnedCredits: 14,
        subjects: mockGrades.filter(g => g.semester === "3rd"),
        academicYear: "2023-2024"
      },
      {
        semester: "2nd",
        sgpa: 7.5,
        totalCredits: 16,
        earnedCredits: 16,
        subjects: mockGrades.filter(g => g.semester === "2nd"),
        academicYear: "2023-2024"
      },
      {
        semester: "1st",
        sgpa: 8.2,
        totalCredits: 16,
        earnedCredits: 16,
        subjects: [],
        academicYear: "2022-2023"
      }
    ]
    setSemesters(mockSemesters)

    // Mock data for overall performance
    const mockOverallPerformance: OverallPerformance = {
      cgpa: 7.9,
      totalCredits: 46,
      earnedCredits: 46,
      semesters: mockSemesters,
      overallGrade: "B+",
      classRank: 15,
      totalStudents: 120
    }
    setOverallPerformance(mockOverallPerformance)

    // Mock data for subject performance
    const mockSubjectPerformance: SubjectPerformance[] = [
      {
        subject: "Data Structures",
        subjectCode: "CS201",
        averageMarks: 81,
        highestMarks: 88,
        lowestMarks: 76,
        totalExams: 2,
        passedExams: 2,
        trend: "IMPROVING"
      },
      {
        subject: "Algorithms",
        subjectCode: "CS202",
        averageMarks: 79,
        highestMarks: 82,
        lowestMarks: 76,
        totalExams: 2,
        passedExams: 2,
        trend: "STABLE"
      },
      {
        subject: "Database Systems",
        subjectCode: "CS301",
        averageMarks: 72.5,
        highestMarks: 75,
        lowestMarks: 70,
        totalExams: 2,
        passedExams: 2,
        trend: "STABLE"
      },
      {
        subject: "Web Development",
        subjectCode: "CS401",
        averageMarks: 89,
        highestMarks: 90,
        lowestMarks: 88,
        totalExams: 2,
        passedExams: 2,
        trend: "IMPROVING"
      }
    ]
    setSubjectPerformance(mockSubjectPerformance)

    // Set default selected semester
    if (mockSemesters.length > 0) {
      setSelectedSemester(mockSemesters[0].semester)
    }
  }, [])

  const filteredGrades = grades.filter(grade => {
    const matchesSearch = grade.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         grade.subjectCode.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSemester = filterSemester === "ALL" || grade.semester === filterSemester
    const matchesExamType = filterExamType === "ALL" || grade.examType === filterExamType
    return matchesSearch && matchesSemester && matchesExamType
  })

  const getExamTypeBadge = (examType: string) => {
    switch (examType) {
      case "MID_TERM":
        return <Badge variant="outline">Mid-term</Badge>
      case "FINAL":
        return <Badge variant="default">Final</Badge>
      case "QUIZ":
        return <Badge variant="secondary">Quiz</Badge>
      case "ASSIGNMENT":
        return <Badge variant="outline">Assignment</Badge>
      case "PRACTICAL":
        return <Badge variant="secondary">Practical</Badge>
      default:
        return <Badge variant="outline">{examType}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PASSED":
        return <Badge variant="default" className="bg-green-100 text-green-800">Passed</Badge>
      case "FAILED":
        return <Badge variant="destructive">Failed</Badge>
      case "PENDING":
        return <Badge variant="secondary">Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A+":
        return "text-green-600 bg-green-100"
      case "A":
        return "text-green-600 bg-green-100"
      case "B+":
        return "text-blue-600 bg-blue-100"
      case "B":
        return "text-blue-600 bg-blue-100"
      case "C":
        return "text-yellow-600 bg-yellow-100"
      case "D":
        return "text-orange-600 bg-orange-100"
      case "F":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "IMPROVING":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "DECLINING":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      case "STABLE":
        return <Target className="h-4 w-4 text-blue-600" />
      default:
        return <Target className="h-4 w-4 text-gray-600" />
    }
  }

  const getPerformanceLevel = (cgpa: number) => {
    if (cgpa >= 9.0) return { level: "Excellent", color: "text-green-600", icon: "🏆" }
    if (cgpa >= 8.0) return { level: "Very Good", color: "text-blue-600", icon: "🌟" }
    if (cgpa >= 7.0) return { level: "Good", color: "text-blue-600", icon: "👍" }
    if (cgpa >= 6.0) return { level: "Average", color: "text-yellow-600", icon: "📊" }
    return { level: "Needs Improvement", color: "text-red-600", icon: "📈" }
  }

  const calculateAverageMarks = (subject: string) => {
    const subjectGrades = grades.filter(g => g.subject === subject)
    if (subjectGrades.length === 0) return 0
    const total = subjectGrades.reduce((sum, grade) => sum + grade.percentage, 0)
    return total / subjectGrades.length
  }

  const getSemesterGrades = (semester: string) => {
    return grades.filter(grade => grade.semester === semester)
  }

  const getOverallStats = () => {
    const totalExams = grades.length
    const passedExams = grades.filter(g => g.status === "PASSED").length
    const averagePercentage = grades.reduce((sum, grade) => sum + grade.percentage, 0) / grades.length
    
    return {
      totalExams,
      passedExams,
      averagePercentage,
      passRate: totalExams > 0 ? (passedExams / totalExams) * 100 : 0
    }
  }

  const overallStats = getOverallStats()

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
              <h1 className="text-2xl font-bold text-gray-900">Results & Grades</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {session.user.name}
              </span>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Transcript
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="grades">Grade Details</TabsTrigger>
            <TabsTrigger value="semesters">Semester-wise</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Overall Performance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">CGPA</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overallPerformance?.cgpa.toFixed(2) || "0.00"}</div>
                  <p className="text-xs text-muted-foreground">
                    Overall performance
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Credits Earned</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {overallPerformance?.earnedCredits || 0}/{overallPerformance?.totalCredits || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total credits
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {overallStats.passRate.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {overallStats.passedExams}/{overallStats.totalExams} exams passed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Class Rank</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {overallPerformance?.classRank || "N/A"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Out of {overallPerformance?.totalStudents || 0} students
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Performance Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Academic Performance</CardTitle>
                  <CardDescription>
                    Your overall academic performance summary
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Overall Grade</span>
                      <Badge variant="default" className="text-lg px-3 py-1">
                        {overallPerformance?.overallGrade || "N/A"}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Performance Level</span>
                      <span className={`text-sm font-medium ${getPerformanceLevel(overallPerformance?.cgpa || 0).color}`}>
                        {getPerformanceLevel(overallPerformance?.cgpa || 0).level} 
                        {getPerformanceLevel(overallPerformance?.cgpa || 0).icon}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Average Marks</span>
                      <span className="text-sm font-medium">
                        {overallStats.averagePercentage.toFixed(1)}%
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>CGPA Progress</span>
                        <span>{overallPerformance?.cgpa.toFixed(2)}/10.0</span>
                      </div>
                      <Progress value={(overallPerformance?.cgpa || 0) * 10} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Semester Performance</CardTitle>
                  <CardDescription>
                    Your semester-wise GPA trends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {semesters.map((semester, index) => (
                      <div key={semester.semester} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{semester.semester} Semester</p>
                          <p className="text-sm text-gray-600">{semester.academicYear}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">{semester.sgpa.toFixed(2)}</p>
                          <p className="text-sm text-gray-600">SGPA</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Results */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Results</CardTitle>
                <CardDescription>
                  Your latest examination results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {grades
                    .sort((a, b) => new Date(b.examDate).getTime() - new Date(a.examDate).getTime())
                    .slice(0, 5)
                    .map((grade) => (
                      <div key={grade.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium">{grade.subject}</h3>
                            {getExamTypeBadge(grade.examType)}
                            {getStatusBadge(grade.status)}
                          </div>
                          <p className="text-sm text-gray-600">
                            {format(grade.examDate, "PPP")} • {grade.facultyName}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(grade.grade)}`}>
                            {grade.grade}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {grade.marksObtained}/{grade.totalMarks}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="grades" className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search subjects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={filterSemester} onValueChange={setFilterSemester}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="All Semesters" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Semesters</SelectItem>
                    {semesters.map((semester) => (
                      <SelectItem key={semester.semester} value={semester.semester}>
                        {semester.semester}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterExamType} onValueChange={setFilterExamType}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Types</SelectItem>
                    <SelectItem value="MID_TERM">Mid-term</SelectItem>
                    <SelectItem value="FINAL">Final</SelectItem>
                    <SelectItem value="QUIZ">Quiz</SelectItem>
                    <SelectItem value="ASSIGNMENT">Assignment</SelectItem>
                    <SelectItem value="PRACTICAL">Practical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Grade Details */}
            <div className="space-y-4">
              {filteredGrades.map((grade) => (
                <Card key={grade.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                      <div className="md:col-span-2">
                        <h3 className="font-medium text-lg">{grade.subject}</h3>
                        <p className="text-sm text-gray-600">{grade.subjectCode}</p>
                        <p className="text-sm text-gray-500">{grade.facultyName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Exam Type</p>
                        {getExamTypeBadge(grade.examType)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Marks</p>
                        <p className="text-lg font-bold">
                          {grade.marksObtained}/{grade.totalMarks}
                        </p>
                        <p className="text-sm text-gray-600">{grade.percentage}%</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Grade</p>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(grade.grade)}`}>
                          {grade.grade}
                        </div>
                        <p className="text-sm text-gray-600">{grade.gradePoints} points</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Status</p>
                        {getStatusBadge(grade.status)}
                        <p className="text-sm text-gray-600">{grade.credits} credits</p>
                      </div>
                    </div>
                    
                    {grade.remarks && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-800">Remarks:</p>
                        <p className="text-sm text-blue-600">{grade.remarks}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="semesters" className="space-y-6">
            {/* Semester Selection */}
            <div className="flex gap-4 mb-6">
              {semesters.map((semester) => (
                <Button
                  key={semester.semester}
                  variant={selectedSemester === semester.semester ? "default" : "outline"}
                  onClick={() => setSelectedSemester(semester.semester)}
                >
                  {semester.semester} Semester
                </Button>
              ))}
            </div>

            {/* Selected Semester Details */}
            {selectedSemester && (
              <div className="space-y-6">
                {semesters
                  .filter(s => s.semester === selectedSemester)
                  .map((semester) => (
                    <div key={semester.semester}>
                      {/* Semester Summary */}
                      <Card className="mb-6">
                        <CardHeader>
                          <CardTitle>{semester.semester} Semester Summary</CardTitle>
                          <CardDescription>
                            Academic Year: {semester.academicYear}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="text-center">
                              <p className="text-2xl font-bold">{semester.sgpa.toFixed(2)}</p>
                              <p className="text-sm text-gray-600">SGPA</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold">{semester.totalCredits}</p>
                              <p className="text-sm text-gray-600">Total Credits</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-green-600">{semester.earnedCredits}</p>
                              <p className="text-sm text-gray-600">Credits Earned</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold">
                                {semester.subjects.length > 0 
                                  ? (semester.subjects.reduce((sum, s) => sum + s.gradePoints * s.credits, 0) / semester.totalCredits).toFixed(2)
                                  : "0.00"
                                }
                              </p>
                              <p className="text-sm text-gray-600">Grade Points Avg</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Semester Grades */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Subject-wise Performance</CardTitle>
                          <CardDescription>
                            Detailed performance for each subject in {semester.semester} semester
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {getSemesterGrades(semester.semester).map((grade) => (
                              <div key={grade.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h3 className="font-medium">{grade.subject}</h3>
                                    {getExamTypeBadge(grade.examType)}
                                  </div>
                                  <p className="text-sm text-gray-600">{grade.subjectCode}</p>
                                </div>
                                <div className="text-right">
                                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(grade.grade)}`}>
                                    {grade.grade}
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {grade.marksObtained}/{grade.totalMarks} ({grade.percentage}%)
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Subject Performance Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Subject Performance Trends</CardTitle>
                  <CardDescription>
                    Performance trends across different subjects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {subjectPerformance.map((subject) => (
                      <div key={subject.subjectCode} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium">{subject.subject}</h3>
                          <p className="text-sm text-gray-600">{subject.subjectCode}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <p className="text-lg font-bold">{subject.averageMarks.toFixed(1)}%</p>
                            <p className="text-sm text-gray-600">Average</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{subject.passedExams}/{subject.totalExams}</p>
                            <p className="text-sm text-gray-600">Passed</p>
                          </div>
                          {getTrendIcon(subject.trend)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Insights</CardTitle>
                  <CardDescription>
                    Key insights about your academic performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <h3 className="font-medium text-green-800">Strengths</h3>
                      </div>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• Excellent performance in Web Development</li>
                        <li>• Consistent improvement in Data Structures</li>
                        <li>• Strong practical skills</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                        <h3 className="font-medium text-yellow-800">Areas for Improvement</h3>
                      </div>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• Database Systems needs more focus</li>
                        <li>• Improve theoretical concepts in Algorithms</li>
                        <li>• Better time management for exams</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Target className="h-5 w-5 text-blue-600" />
                        <h3 className="font-medium text-blue-800">Recommendations</h3>
                      </div>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Focus on core concepts in Database Systems</li>
                        <li>• Practice more problem-solving in Algorithms</li>
                        <li>• Maintain consistency across all subjects</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Grade Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Grade Distribution</CardTitle>
                <CardDescription>
                  Distribution of grades across all examinations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { grade: "A+", count: grades.filter(g => g.grade === "A+").length, color: "bg-green-500" },
                    { grade: "A", count: grades.filter(g => g.grade === "A").length, color: "bg-green-400" },
                    { grade: "B+", count: grades.filter(g => g.grade === "B+").length, color: "bg-blue-500" },
                    { grade: "B", count: grades.filter(g => g.grade === "B").length, color: "bg-blue-400" },
                    { grade: "C", count: grades.filter(g => g.grade === "C").length, color: "bg-yellow-500" },
                    { grade: "D", count: grades.filter(g => g.grade === "D").length, color: "bg-orange-500" },
                    { grade: "F", count: grades.filter(g => g.grade === "F").length, color: "bg-red-500" }
                  ].map((item) => (
                    <div key={item.grade} className="text-center">
                      <div className={`w-16 h-16 rounded-full ${item.color} mx-auto mb-2 flex items-center justify-center text-white font-bold`}>
                        {item.count}
                      </div>
                      <p className="text-sm font-medium">{item.grade}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}