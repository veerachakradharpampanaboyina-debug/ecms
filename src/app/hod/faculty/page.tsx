"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  Calendar,
  Filter,
  Download,
  MoreHorizontal,
  UserPlus,
  Award,
  BookOpen,
  Star,
  TrendingUp,
  ChevronLeft,
  ChevronRight
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

interface Faculty {
  id: string
  name: string
  email: string
  phone: string
  designation: string
  specialization: string
  experience: number
  subjects: string[]
  studentSatisfaction: number
  attendance: number
  researchPapers: number
  status: string
  joinDate: string
}

export default function FacultyManagement() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [faculty, setFaculty] = useState<Faculty[]>([])
  const [filteredFaculty, setFilteredFaculty] = useState<Faculty[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [designationFilter, setDesignationFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null)

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user.role !== "HOD") {
      router.push("/auth/signin")
    }
  }, [session, status, router])

  useEffect(() => {
    // Mock data - in real app, this would come from API
    const mockFaculty: Faculty[] = [
      {
        id: "1",
        name: "Dr. John Doe",
        email: "john.doe@ecms.edu",
        phone: "+1 234-567-8901",
        designation: "Professor",
        specialization: "Data Structures & Algorithms",
        experience: 15,
        subjects: ["Data Structures", "Algorithms", "Database Systems", "Software Engineering"],
        studentSatisfaction: 95,
        attendance: 92,
        researchPapers: 12,
        status: "active",
        joinDate: "2010-07-15"
      },
      {
        id: "2",
        name: "Dr. Alice Smith",
        email: "alice.smith@ecms.edu",
        phone: "+1 234-567-8902",
        designation: "Associate Professor",
        specialization: "Machine Learning & AI",
        experience: 10,
        subjects: ["Machine Learning", "Artificial Intelligence", "Data Mining"],
        studentSatisfaction: 92,
        attendance: 96,
        researchPapers: 8,
        status: "active",
        joinDate: "2015-08-20"
      },
      {
        id: "3",
        name: "Dr. Bob Johnson",
        email: "bob.johnson@ecms.edu",
        phone: "+1 234-567-8903",
        designation: "Assistant Professor",
        specialization: "Database Systems",
        experience: 6,
        subjects: ["Database Systems", "Web Development", "Software Engineering"],
        studentSatisfaction: 89,
        attendance: 90,
        researchPapers: 5,
        status: "active",
        joinDate: "2019-01-10"
      },
      {
        id: "4",
        name: "Dr. Carol White",
        email: "carol.white@ecms.edu",
        phone: "+1 234-567-8904",
        designation: "Associate Professor",
        specialization: "Software Engineering",
        experience: 8,
        subjects: ["Software Engineering", "Web Development", "Project Management"],
        studentSatisfaction: 94,
        attendance: 88,
        researchPapers: 6,
        status: "on_leave",
        joinDate: "2017-03-15"
      },
      {
        id: "5",
        name: "Dr. David Brown",
        email: "david.brown@ecms.edu",
        phone: "+1 234-567-8905",
        designation: "Professor",
        specialization: "Computer Networks",
        experience: 18,
        subjects: ["Computer Networks", "Network Security", "Distributed Systems"],
        studentSatisfaction: 91,
        attendance: 94,
        researchPapers: 15,
        status: "active",
        joinDate: "2008-09-01"
      }
    ]
    setFaculty(mockFaculty)
    setFilteredFaculty(mockFaculty)
  }, [])

  useEffect(() => {
    let filtered = faculty

    if (searchTerm) {
      filtered = filtered.filter(f =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.subjects.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (designationFilter !== "all") {
      filtered = filtered.filter(f => f.designation === designationFilter)
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(f => f.status === statusFilter)
    }

    setFilteredFaculty(filtered)
  }, [faculty, searchTerm, designationFilter, statusFilter])

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" })
    router.push("/")
  }

  const getDesignationColor = (designation: string) => {
    const colors = {
      "Professor": "bg-purple-100 text-purple-800",
      "Associate Professor": "bg-blue-100 text-blue-800",
      "Assistant Professor": "bg-green-100 text-green-800"
    }
    return colors[designation as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getStatusColor = (status: string) => {
    const colors = {
      "active": "bg-green-100 text-green-800",
      "on_leave": "bg-yellow-100 text-yellow-800",
      "inactive": "bg-red-100 text-red-800"
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-yellow-600"
    return "text-red-600"
  }

  const handleEditFaculty = (fac: Faculty) => {
    setSelectedFaculty(fac)
    setIsEditDialogOpen(true)
  }

  const handleDeleteFaculty = (facultyId: string) => {
    if (confirm("Are you sure you want to remove this faculty member?")) {
      setFaculty(faculty.filter(f => f.id !== facultyId))
    }
  }

  const handleToggleFacultyStatus = (facultyId: string) => {
    setFaculty(faculty.map(f => 
      f.id === facultyId 
        ? { ...f, status: f.status === "active" ? "inactive" : "active" }
        : f
    ))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
  }

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
                <h1 className="text-2xl font-bold text-gray-900">Faculty Management</h1>
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
              <CardTitle className="text-sm font-medium">Total Faculty</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{faculty.length}</div>
              <p className="text-xs text-muted-foreground">
                Department strength
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Satisfaction</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(faculty.reduce((sum, f) => sum + f.studentSatisfaction, 0) / faculty.length)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Student feedback
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Research Papers</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {faculty.reduce((sum, f) => sum + f.researchPapers, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total publications
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Experience</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(faculty.reduce((sum, f) => sum + f.experience, 0) / faculty.length)}y
              </div>
              <p className="text-xs text-muted-foreground">
                Years of service
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Faculty Directory</span>
              <div className="flex space-x-2">
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Faculty
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Add New Faculty Member</DialogTitle>
                      <DialogDescription>
                        Add a new faculty member to the department
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name *</Label>
                          <Input id="name" placeholder="Dr. John Doe" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input id="email" type="email" placeholder="john.doe@ecms.edu" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input id="phone" placeholder="+1 234-567-8901" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="designation">Designation *</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select designation" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Professor">Professor</SelectItem>
                              <SelectItem value="Associate Professor">Associate Professor</SelectItem>
                              <SelectItem value="Assistant Professor">Assistant Professor</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="specialization">Specialization *</Label>
                        <Input id="specialization" placeholder="Data Structures & Algorithms" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="experience">Experience (years)</Label>
                          <Input id="experience" type="number" placeholder="10" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="joinDate">Join Date</Label>
                          <Input id="joinDate" type="date" />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={() => setIsAddDialogOpen(false)}>Add Faculty</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search faculty..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={designationFilter} onValueChange={setDesignationFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Designation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Designations</SelectItem>
                    <SelectItem value="Professor">Professor</SelectItem>
                    <SelectItem value="Associate Professor">Associate Professor</SelectItem>
                    <SelectItem value="Assistant Professor">Assistant Professor</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on_leave">On Leave</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Faculty Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Faculty Member</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Subjects</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFaculty.map((fac) => (
                    <TableRow key={fac.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {fac.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">{fac.name}</div>
                            <div className="text-sm text-gray-500">{fac.email}</div>
                            <div className="text-xs text-gray-400">{fac.phone} • {fac.experience} years exp.</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getDesignationColor(fac.designation)}>
                          {fac.designation}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="text-sm font-medium">{fac.specialization}</p>
                          <p className="text-xs text-gray-500">Since {formatDate(fac.joinDate)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm">Satisfaction:</span>
                            <span className={`text-sm font-medium ${getPerformanceColor(fac.studentSatisfaction)}`}>
                              {fac.studentSatisfaction}%
                            </span>
                          </div>
                          <Progress value={fac.studentSatisfaction} className="w-16 h-1" />
                          <div className="flex items-center space-x-2">
                            <span className="text-xs">Attendance:</span>
                            <span className={`text-xs font-medium ${getPerformanceColor(fac.attendance)}`}>
                              {fac.attendance}%
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <div className="flex flex-wrap gap-1">
                            {fac.subjects.slice(0, 2).map((subject, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {subject}
                              </Badge>
                            ))}
                            {fac.subjects.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{fac.subjects.length - 2} more
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            📊 {fac.researchPapers} papers
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(fac.status)}>
                          {fac.status === "active" ? "Active" : fac.status === "on_leave" ? "On Leave" : "Inactive"}
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
                            <DropdownMenuItem onClick={() => handleEditFaculty(fac)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleFacultyStatus(fac.id)}>
                              {fac.status === "active" ? (
                                <>
                                  <Users className="mr-2 h-4 w-4" />
                                  Mark On Leave
                                </>
                              ) : (
                                <>
                                  <UserPlus className="mr-2 h-4 w-4" />
                                  Mark Active
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteFaculty(fac.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}