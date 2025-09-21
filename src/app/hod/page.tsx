"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  User, 
  BookOpen, 
  Users, 
  Calendar, 
  FileText, 
  MessageSquare,
  LogOut,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Award,
  Target,
  BarChart3,
  Clock,
  Star,
  Activity,
  ChevronRight
} from "lucide-react"
import Link from "next/link"

export default function HODDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user.role !== "HOD") {
      router.push("/auth/signin")
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session || session.user.role !== "HOD") {
    return null
  }

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" })
    router.push("/")
  }

  // Enhanced mock data for dashboard
  const departmentStats = {
    name: "Computer Science",
    facultyCount: 12,
    studentCount: 485,
    courseCount: 3,
    subjectCount: 24,
    performance: 87,
    facultyAttendance: 94,
    studentAttendance: 85,
    pendingApprovals: 8,
    placementRate: 92,
    researchPapers: 15,
    projectsCompleted: 45
  }

  const quickActions = [
    { 
      title: "Faculty Management", 
      description: "Manage faculty and their assignments", 
      icon: Users, 
      href: "/hod/faculty",
      color: "blue",
      count: departmentStats.facultyCount
    },
    { 
      title: "Subject Allocation", 
      description: "Assign subjects to faculty members", 
      icon: BookOpen, 
      href: "/hod/subjects",
      color: "green",
      count: departmentStats.subjectCount
    },
    { 
      title: "Performance Reports", 
      description: "View department performance metrics", 
      icon: BarChart3, 
      href: "/hod/reports",
      color: "purple"
    },
    { 
      title: "Approvals", 
      description: "Review and approve requests", 
      icon: CheckCircle, 
      href: "/hod/approvals",
      color: "yellow",
      count: departmentStats.pendingApprovals
    },
    { 
      title: "Department Reports", 
      description: "Generate department-wise reports", 
      icon: FileText, 
      href: "/hod/department-reports",
      color: "indigo"
    },
    { 
      title: "Announcements", 
      description: "Post department circulars and notices", 
      icon: MessageSquare, 
      href: "/hod/announcements",
      color: "pink"
    }
  ]

  const facultyPerformance = [
    { 
      id: 1, 
      name: "Dr. John Doe", 
      subject: "Data Structures", 
      subjectsCount: 4, 
      satisfaction: 95, 
      attendance: 92, 
      research: 3,
      color: "blue"
    },
    { 
      id: 2, 
      name: "Dr. Alice Smith", 
      subject: "Algorithms", 
      subjectsCount: 3, 
      satisfaction: 92, 
      attendance: 96, 
      research: 5,
      color: "green"
    },
    { 
      id: 3, 
      name: "Dr. Bob Johnson", 
      subject: "Database Systems", 
      subjectsCount: 3, 
      satisfaction: 89, 
      attendance: 90, 
      research: 2,
      color: "purple"
    },
    { 
      id: 4, 
      name: "Dr. Carol White", 
      subject: "Software Engineering", 
      subjectsCount: 2, 
      satisfaction: 94, 
      attendance: 88, 
      research: 4,
      color: "pink"
    }
  ]

  const pendingApprovals = [
    { 
      id: 1, 
      type: "leave", 
      title: "Faculty Leave Application", 
      description: "Dr. Alice Smith - Medical Leave (3 days)", 
      priority: "high", 
      time: "2 hours ago" 
    },
    { 
      id: 2, 
      type: "certificate", 
      title: "Certificate Request", 
      description: "John Doe - Bonafide Certificate", 
      priority: "medium", 
      time: "5 hours ago" 
    },
    { 
      id: 3, 
      type: "subject", 
      title: "Subject Change Request", 
      description: "Student request for elective change", 
      priority: "medium", 
      time: "1 day ago" 
    },
    { 
      id: 4, 
      type: "marks", 
      title: "Internal Marks Approval", 
      description: "Database Systems - Mid-term marks", 
      priority: "low", 
      time: "2 days ago" 
    }
  ]

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: "bg-red-500",
      medium: "bg-yellow-500",
      low: "bg-blue-500"
    }
    return colors[priority as keyof typeof colors] || colors.low
  }

  const getQuickActionColor = (color: string) => {
    const colors = {
      blue: "bg-blue-100 text-blue-600 hover:bg-blue-200",
      green: "bg-green-100 text-green-600 hover:bg-green-200",
      purple: "bg-purple-100 text-purple-600 hover:bg-purple-200",
      yellow: "bg-yellow-100 text-yellow-600 hover:bg-yellow-200",
      indigo: "bg-indigo-100 text-indigo-600 hover:bg-indigo-200",
      pink: "bg-pink-100 text-pink-600 hover:bg-pink-200"
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  const getFacultyColor = (color: string) => {
    const colors = {
      blue: "bg-blue-100",
      green: "bg-green-100",
      purple: "bg-purple-100",
      pink: "bg-pink-100"
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">HOD Dashboard</h1>
              <Badge className="ml-3 bg-purple-100 text-purple-800">Head of Department</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{session.user.name}</p>
                <p className="text-xs text-gray-500">Last login: Today, 9:30 AM</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Department Info Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Department Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Department</p>
                <p className="text-lg font-semibold">{departmentStats.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Faculty</p>
                <p className="text-lg font-semibold">{departmentStats.facultyCount} Members</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Students</p>
                <p className="text-lg font-semibold">{departmentStats.studentCount} Students</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Courses</p>
                <p className="text-lg font-semibold">{departmentStats.courseCount} Courses</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Subjects</p>
                <p className="text-lg font-semibold">{departmentStats.subjectCount} Subjects</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Department Performance</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{departmentStats.performance}%</div>
              <Progress value={departmentStats.performance} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                +5% from last semester
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Faculty Attendance</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{departmentStats.facultyAttendance}%</div>
              <Progress value={departmentStats.facultyAttendance} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                This month average
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Student Attendance</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{departmentStats.studentAttendance}%</div>
              <Progress value={departmentStats.studentAttendance} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                Above college average
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{departmentStats.pendingApprovals}</div>
              <p className="text-xs text-muted-foreground">
                Require attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Placement Rate</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{departmentStats.placementRate}%</div>
              <Progress value={departmentStats.placementRate} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                Campus placements
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Research Papers</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{departmentStats.researchPapers}</div>
              <p className="text-xs text-muted-foreground">
                Published this year
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projects Completed</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{departmentStats.projectsCompleted}</div>
              <p className="text-xs text-muted-foreground">
                Student projects
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {quickActions.map((action, index) => (
            <Link key={index} href={action.href}>
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105">
                <CardHeader>
                  <div className={`w-12 h-12 ${getQuickActionColor(action.color)} rounded-lg flex items-center justify-center mb-4`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                    {action.count && (
                      <Badge variant="secondary" className="text-xs">
                        {action.count}
                      </Badge>
                    )}
                  </div>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Faculty Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Faculty Performance Overview</span>
                <Link href="/hod/faculty">
                  <Button variant="outline" size="sm">
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </CardTitle>
              <CardDescription>
                Key performance indicators for department faculty
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {facultyPerformance.map((faculty) => (
                  <div key={faculty.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 ${getFacultyColor(faculty.color)} rounded-full flex items-center justify-center`}>
                        <span className="text-sm font-medium">
                          {faculty.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{faculty.name}</p>
                        <p className="text-sm text-gray-600">{faculty.subject} | {faculty.subjectsCount} Subjects</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                          <span>📊 {faculty.research} papers</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div>
                        <p className="text-sm font-medium text-green-600">{faculty.satisfaction}% Satisfaction</p>
                        <Progress value={faculty.satisfaction} className="w-20 h-1" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">{faculty.attendance}% Attendance</p>
                        <Progress value={faculty.attendance} className="w-20 h-1" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pending Approvals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Pending Approvals</span>
                <Link href="/hod/approvals">
                  <Button variant="outline" size="sm">
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </CardTitle>
              <CardDescription>
                Requests requiring your approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingApprovals.map((approval) => (
                  <div key={approval.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <div className={`w-2 h-2 ${getPriorityColor(approval.priority)} rounded-full mt-2`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{approval.title}</p>
                      <p className="text-xs text-muted-foreground">{approval.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge 
                          variant={approval.priority === 'high' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {approval.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{approval.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}