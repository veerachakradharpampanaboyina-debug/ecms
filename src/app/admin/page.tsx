"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  AlertCircle,
  LogOut,
  Settings,
  FileText,
  MessageSquare,
  UserPlus,
  Activity,
  CheckCircle,
  Clock,
  BarChart3,
  Database,
  Bell,
  ChevronRight,
  MoreHorizontal,
  GraduationCap,
  Building,
  Target,
  Zap,
  Shield,
  Globe,
  Server,
  Cpu,
  HardDrive,
  Wifi,
  BatteryCharging,
  Thermometer,
  Eye,
  MousePointer,
  Download,
  Upload,
  RefreshCw
} from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState("overview")
  const [systemStats, setSystemStats] = useState({
    cpu: 45,
    memory: 62,
    disk: 78,
    uptime: "15 days 4 hours"
  })

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user.role !== "ADMIN") {
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

  if (!session || session.user.role !== "ADMIN") {
    return null
  }

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" })
    router.push("/")
  }

  // Mock data for dashboard
  const stats = {
    totalStudents: 4850,
    totalFaculty: 220,
    totalDepartments: 6,
    totalCourses: 18,
    totalSubjects: 156,
    revenue: 1250000,
    pendingFees: 234000,
    attendanceRate: 87.5,
    placementRate: 94,
    activeUsers: 1240,
    systemLoad: 65
  }

  const recentActivities = [
    { id: 1, type: "user", action: "New student registration", user: "John Doe", time: "2 min ago", status: "success" },
    { id: 2, type: "payment", action: "Fee payment received", user: "Jane Smith", time: "15 min ago", amount: "$2,500", status: "success" },
    { id: 3, type: "faculty", action: "New faculty added", user: "Dr. Wilson", time: "1 hour ago", department: "Mathematics", status: "success" },
    { id: 4, type: "system", action: "System backup completed", time: "2 hours ago", status: "success" },
    { id: 5, type: "alert", action: "Low attendance alert", user: "Mike Johnson", time: "3 hours ago", attendance: "68%", status: "warning" },
    { id: 6, type: "admission", action: "New application received", user: "Sarah Brown", time: "4 hours ago", status: "success" },
    { id: 7, type: "exam", action: "Exam results published", user: "Dr. Chen", time: "5 hours ago", subject: "Data Structures", status: "success" },
    { id: 8, type: "leave", action: "Leave application submitted", user: "Prof. Davis", time: "6 hours ago", days: 2, status: "pending" }
  ]

  const pendingApprovals = [
    { id: 1, type: "leave", user: "Dr. Sarah Johnson", reason: "Medical Leave", days: 3, time: "2 hours ago", priority: "high" },
    { id: 2, type: "certificate", user: "John Doe", certificate: "Bonafide", time: "5 hours ago", priority: "medium" },
    { id: 3, type: "marks", user: "Dr. Michael Chen", subject: "Data Structures", time: "1 day ago", priority: "medium" },
    { id: 4, type: "admission", user: "Emily Wilson", application: "B.Tech CSE", time: "1 day ago", priority: "high" },
    { id: 5, type: "fee", user: "Robert Brown", amount: "$1,200", time: "2 days ago", priority: "low" }
  ]

  const quickActions = [
    { title: "User Management", description: "Add, edit, and manage users", icon: Users, href: "/admin/users", color: "blue" },
    { title: "Academic Setup", description: "Manage courses and subjects", icon: BookOpen, href: "#", color: "green" },
    { title: "Fee Management", description: "Create fee structures", icon: DollarSign, href: "#", color: "yellow" },
    { title: "Reports", description: "Generate reports", icon: FileText, href: "/admin/reports", color: "purple" },
    { title: "System Settings", description: "Configure system", icon: Settings, href: "/admin/settings", color: "red" },
    { title: "Notifications", description: "Send announcements", icon: Bell, href: "#", color: "indigo" }
  ]

  const systemMetrics = [
    { name: "CPU Usage", value: systemStats.cpu, icon: Cpu, color: "blue" },
    { name: "Memory Usage", value: systemStats.memory, icon: HardDrive, color: "green" },
    { name: "Disk Usage", value: systemStats.disk, icon: Database, color: "yellow" },
    { name: "Active Users", value: stats.activeUsers, icon: Users, color: "purple" },
    { name: "System Load", value: stats.systemLoad, icon: Activity, color: "red" },
    { name: "Uptime", value: systemStats.uptime, icon: Clock, color: "indigo" }
  ]

  const getQuickActionColor = (color: string) => {
    const colors = {
      blue: "bg-blue-100 text-blue-600",
      green: "bg-green-100 text-green-600",
      yellow: "bg-yellow-100 text-yellow-600",
      purple: "bg-purple-100 text-purple-600",
      red: "bg-red-100 text-red-600",
      indigo: "bg-indigo-100 text-indigo-600"
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  const getActivityIcon = (type: string) => {
    const icons = {
      user: UserPlus,
      payment: DollarSign,
      faculty: Users,
      system: Database,
      alert: AlertCircle,
      admission: GraduationCap,
      exam: FileText,
      leave: Calendar
    }
    return icons[type as keyof typeof icons] || Activity
  }

  const getStatusColor = (status: string) => {
    return status === "success" ? "text-green-600" : status === "warning" ? "text-yellow-600" : "text-red-600"
  }

  const getPriorityColor = (priority: string) => {
    return priority === "high" ? "border-red-500" : priority === "medium" ? "border-yellow-500" : "border-green-500"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <Badge className="ml-3 bg-blue-100 text-blue-800">Administrator</Badge>
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
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalStudents.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +12% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Faculty</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalFaculty}</div>
                  <p className="text-xs text-muted-foreground">
                    +2 new this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${(stats.revenue / 1000000).toFixed(1)}M</div>
                  <p className="text-xs text-muted-foreground">
                    +20.1% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Fees</CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${(stats.pendingFees / 1000).toFixed(0)}K</div>
                  <p className="text-xs text-muted-foreground">
                    23 students pending
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickActions.map((action, index) => (
                <Link key={index} href={action.href}>
                  <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105">
                    <CardHeader>
                      <div className={`w-12 h-12 ${getQuickActionColor(action.color)} rounded-lg flex items-center justify-center mb-4`}>
                        <action.icon className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-lg">{action.title}</CardTitle>
                      <CardDescription>{action.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Activity */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Recent Activity</span>
                      <Button variant="outline" size="sm">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        View All
                      </Button>
                    </CardTitle>
                    <CardDescription>
                      Latest system activities and updates
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivities.slice(0, 6).map((activity) => {
                        const Icon = getActivityIcon(activity.type)
                        return (
                          <div key={activity.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                            <div className={`w-8 h-8 ${activity.status === 'success' ? 'bg-green-100' : activity.status === 'warning' ? 'bg-yellow-100' : 'bg-red-100'} rounded-full flex items-center justify-center`}>
                              <Icon className={`h-4 w-4 ${getStatusColor(activity.status)}`} />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span>{activity.user}</span>
                                {activity.amount && <span>• {activity.amount}</span>}
                                {activity.department && <span>• {activity.department}</span>}
                                {activity.attendance && <span>• {activity.attendance}</span>}
                                {activity.subject && <span>• {activity.subject}</span>}
                                {activity.days && <span>• {activity.days} days</span>}
                                <span>• {activity.time}</span>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Pending Approvals */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Pending Approvals</span>
                      <Badge variant="outline">{pendingApprovals.length}</Badge>
                    </CardTitle>
                    <CardDescription>
                      Items requiring your attention
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {pendingApprovals.map((approval) => (
                        <div key={approval.id} className={`border-l-4 ${getPriorityColor(approval.priority)} pl-4`}>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium text-gray-900">{approval.user}</p>
                            <span className="text-xs text-gray-500">{approval.time}</span>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">
                            {approval.type === "leave" && `${approval.reason} - ${approval.days} days`}
                            {approval.type === "certificate" && `${approval.certificate} Certificate`}
                            {approval.type === "marks" && `${approval.subject} - Marks Entry`}
                            {approval.type === "admission" && `Application - ${approval.application}`}
                            {approval.type === "fee" && `Fee Payment - ${approval.amount}`}
                          </p>
                          <div className="flex space-x-2">
                            <Button size="sm" className="text-xs">Approve</Button>
                            <Button size="sm" variant="outline" className="text-xs">Review</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" className="w-full mt-4">
                      View All Approvals
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>

                {/* System Status */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Activity className="h-5 w-5 mr-2" />
                      System Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Database</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-green-600">Healthy</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">API Services</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-green-600">Operational</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Email Service</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-green-600">Active</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Backup Status</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-green-600">Completed</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Attendance Rate</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: `${stats.attendanceRate}%` }}></div>
                        </div>
                        <span className="text-sm font-medium">{stats.attendanceRate}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Placement Rate</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${stats.placementRate}%` }}></div>
                        </div>
                        <span className="text-sm font-medium">{stats.placementRate}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Fee Collection</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "82%" }}></div>
                        </div>
                        <span className="text-sm font-medium">82%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Student Satisfaction</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{ width: "91%" }}></div>
                        </div>
                        <span className="text-sm font-medium">91%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Department-wise Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "Computer Science", students: 1200, faculty: 45, color: "blue" },
                      { name: "Electronics", students: 980, faculty: 38, color: "green" },
                      { name: "Mechanical", students: 1100, faculty: 42, color: "red" },
                      { name: "Civil", students: 850, faculty: 35, color: "yellow" },
                      { name: "Electrical", students: 750, faculty: 32, color: "purple" },
                      { name: "Chemical", students: 620, faculty: 28, color: "indigo" }
                    ].map((dept, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 bg-${dept.color}-500 rounded-full`}></div>
                          <span className="text-sm font-medium">{dept.name}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-600">
                          <span>{dept.students} students</span>
                          <span>{dept.faculty} faculty</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {systemMetrics.map((metric, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <metric.icon className="h-5 w-5 mr-2" />
                      {metric.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {typeof metric.value === 'number' ? `${metric.value}%` : metric.value}
                    </div>
                    {typeof metric.value === 'number' && (
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className={`h-2 rounded-full ${
                            metric.value > 80 ? 'bg-red-500' : 
                            metric.value > 60 ? 'bg-yellow-500' : 'bg-green-500'
                          }`} 
                          style={{ width: `${metric.value}%` }}
                        ></div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Server className="h-5 w-5 mr-2" />
                    Server Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Server Name</p>
                        <p className="font-medium">ECMS-PROD-01</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">IP Address</p>
                        <p className="font-medium">192.168.1.100</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Operating System</p>
                        <p className="font-medium">Ubuntu 22.04 LTS</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Database</p>
                        <p className="font-medium">PostgreSQL 14</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Security Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Firewall Status</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-green-600">Active</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">SSL Certificate</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-green-600">Valid</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Last Security Scan</span>
                      <span className="text-xs text-gray-500">2 hours ago</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Failed Login Attempts</span>
                      <span className="text-xs text-gray-500">0 (24h)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Security Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        All security systems are operating normally
                      </AlertDescription>
                    </Alert>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">100%</div>
                        <div className="text-sm text-gray-600">Security Score</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">0</div>
                        <div className="text-sm text-gray-600">Security Incidents</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Recent Security Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Password Policy Updated</p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Security Audit Completed</p>
                        <p className="text-xs text-gray-500">1 day ago</p>
                      </div>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Firewall Rules Updated</p>
                        <p className="text-xs text-gray-500">3 days ago</p>
                      </div>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}