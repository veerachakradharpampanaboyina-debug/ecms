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
  BookOpen, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Calendar,
  Filter,
  Download,
  MoreHorizontal,
  UserPlus,
  Clock,
  Target,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  FileText
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

interface Subject {
  id: string
  code: string
  name: string
  type: "core" | "elective" | "lab"
  credits: number
  semester: number
  department: string
  assignedFaculty: string[]
  maxStudents: number
  enrolledStudents: number
  description: string
  prerequisites: string[]
  status: "active" | "inactive"
}

interface Course {
  id: string
  name: string
  code: string
  duration: string
  totalSemesters: number
  subjects: Subject[]
  description: string
}

interface Faculty {
  id: string
  name: string
  email: string
  designation: string
  subjects: string[]
}

export default function SubjectManagement() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [faculty, setFaculty] = useState<Faculty[]>([])
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [courseFilter, setCourseFilter] = useState("all")
  const [semesterFilter, setSemesterFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [isAllocateDialogOpen, setIsAllocateDialogOpen] = useState(false)
  const [isAddSubjectDialogOpen, setIsAddSubjectDialogOpen] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user.role !== "HOD") {
      router.push("/auth/signin")
    }
  }, [session, status, router])

  useEffect(() => {
    // Mock data - in real app, this would come from API
    const mockFaculty: Faculty[] = [
      { id: "1", name: "Dr. John Doe", email: "john.doe@ecms.edu", designation: "Professor", subjects: ["CS101", "CS201"] },
      { id: "2", name: "Dr. Alice Smith", email: "alice.smith@ecms.edu", designation: "Associate Professor", subjects: ["CS301", "CS401"] },
      { id: "3", name: "Dr. Bob Johnson", email: "bob.johnson@ecms.edu", designation: "Assistant Professor", subjects: ["CS102", "CS202"] },
      { id: "4", name: "Dr. Carol White", email: "carol.white@ecms.edu", designation: "Associate Professor", subjects: ["CS302", "CS402"] },
      { id: "5", name: "Dr. David Brown", email: "david.brown@ecms.edu", designation: "Professor", subjects: ["CS103", "CS203"] }
    ]

    const mockSubjects: Subject[] = [
      {
        id: "1",
        code: "CS101",
        name: "Programming Fundamentals",
        type: "core",
        credits: 4,
        semester: 1,
        department: "Computer Science",
        assignedFaculty: ["1"],
        maxStudents: 60,
        enrolledStudents: 58,
        description: "Introduction to programming concepts and problem-solving",
        prerequisites: [],
        status: "active"
      },
      {
        id: "2",
        code: "CS102",
        name: "Digital Logic Design",
        type: "core",
        credits: 3,
        semester: 1,
        department: "Computer Science",
        assignedFaculty: ["3"],
        maxStudents: 60,
        enrolledStudents: 55,
        description: "Fundamentals of digital logic and computer architecture",
        prerequisites: [],
        status: "active"
      },
      {
        id: "3",
        code: "CS201",
        name: "Data Structures",
        type: "core",
        credits: 4,
        semester: 2,
        department: "Computer Science",
        assignedFaculty: ["1"],
        maxStudents: 60,
        enrolledStudents: 60,
        description: "Study of data structures and algorithms",
        prerequisites: ["CS101"],
        status: "active"
      },
      {
        id: "4",
        code: "CS202",
        name: "Database Systems",
        type: "core",
        credits: 3,
        semester: 2,
        department: "Computer Science",
        assignedFaculty: ["3"],
        maxStudents: 60,
        enrolledStudents: 52,
        description: "Introduction to database design and SQL",
        prerequisites: ["CS201"],
        status: "active"
      },
      {
        id: "5",
        code: "CS301",
        name: "Machine Learning",
        type: "elective",
        credits: 3,
        semester: 3,
        department: "Computer Science",
        assignedFaculty: ["2"],
        maxStudents: 40,
        enrolledStudents: 38,
        description: "Introduction to machine learning algorithms",
        prerequisites: ["CS201"],
        status: "active"
      },
      {
        id: "6",
        code: "CS302",
        name: "Software Engineering",
        type: "core",
        credits: 3,
        semester: 3,
        department: "Computer Science",
        assignedFaculty: ["4"],
        maxStudents: 60,
        enrolledStudents: 45,
        description: "Software development methodologies and practices",
        prerequisites: ["CS202"],
        status: "active"
      },
      {
        id: "7",
        code: "CS401",
        name: "Artificial Intelligence",
        type: "elective",
        credits: 3,
        semester: 4,
        department: "Computer Science",
        assignedFaculty: ["2"],
        maxStudents: 40,
        enrolledStudents: 35,
        description: "Fundamentals of artificial intelligence",
        prerequisites: ["CS301"],
        status: "active"
      },
      {
        id: "8",
        code: "CS402",
        name: "Computer Networks",
        type: "core",
        credits: 3,
        semester: 4,
        department: "Computer Science",
        assignedFaculty: ["4"],
        maxStudents: 60,
        enrolledStudents: 48,
        description: "Computer networks and communication protocols",
        prerequisites: ["CS302"],
        status: "active"
      }
    ]

    const mockCourses: Course[] = [
      {
        id: "1",
        name: "Bachelor of Technology in Computer Science",
        code: "B.Tech CS",
        duration: "4 Years",
        totalSemesters: 8,
        subjects: mockSubjects.filter(s => s.semester <= 4),
        description: "Undergraduate program in Computer Science and Engineering"
      }
    ]

    setFaculty(mockFaculty)
    setSubjects(mockSubjects)
    setFilteredSubjects(mockSubjects)
    setCourses(mockCourses)
  }, [])

  useEffect(() => {
    let filtered = subjects

    if (searchTerm) {
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (semesterFilter !== "all") {
      filtered = filtered.filter(s => s.semester.toString() === semesterFilter)
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter(s => s.type === typeFilter)
    }

    setFilteredSubjects(filtered)
  }, [subjects, searchTerm, semesterFilter, typeFilter])

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" })
    router.push("/")
  }

  const getSubjectTypeColor = (type: string) => {
    const colors = {
      "core": "bg-blue-100 text-blue-800",
      "elective": "bg-green-100 text-green-800",
      "lab": "bg-purple-100 text-purple-800"
    }
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getStatusColor = (status: string) => {
    return status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
  }

  const getFacultyName = (facultyId: string) => {
    const fac = faculty.find(f => f.id === facultyId)
    return fac ? fac.name : "Unassigned"
  }

  const getEnrollmentPercentage = (subject: Subject) => {
    return Math.round((subject.enrolledStudents / subject.maxStudents) * 100)
  }

  const getEnrollmentColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600"
    if (percentage >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const handleAllocateSubject = (subject: Subject) => {
    setSelectedSubject(subject)
    setIsAllocateDialogOpen(true)
  }

  const handleAddSubject = () => {
    setIsAddSubjectDialogOpen(true)
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
                <h1 className="text-2xl font-bold text-gray-900">Subject Management</h1>
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
              <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subjects.length}</div>
              <p className="text-xs text-muted-foreground">
                Across all semesters
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Faculty Assigned</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {subjects.filter(s => s.assignedFaculty.length > 0).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Subjects with faculty
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Enrollment</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {subjects.reduce((sum, s) => sum + s.enrolledStudents, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Students enrolled
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Capacity</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(subjects.reduce((sum, s) => sum + getEnrollmentPercentage(s), 0) / subjects.length)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Enrollment rate
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="subjects" className="space-y-6">
          <TabsList>
            <TabsTrigger value="subjects">Subject Allocation</TabsTrigger>
            <TabsTrigger value="courses">Course Structure</TabsTrigger>
            <TabsTrigger value="faculty">Faculty Load</TabsTrigger>
          </TabsList>

          {/* Subject Allocation Tab */}
          <TabsContent value="subjects">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Subject Allocation</span>
                  <div className="flex space-x-2">
                    <Button onClick={handleAddSubject}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Subject
                    </Button>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  Manage subjects and assign faculty members
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search subjects..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select value={semesterFilter} onValueChange={setSemesterFilter}>
                      <SelectTrigger className="w-[140px]">
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
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="core">Core</SelectItem>
                        <SelectItem value="elective">Elective</SelectItem>
                        <SelectItem value="lab">Lab</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Subjects Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Semester</TableHead>
                        <TableHead>Assigned Faculty</TableHead>
                        <TableHead>Enrollment</TableHead>
                        <TableHead>Credits</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSubjects.map((subject) => (
                        <TableRow key={subject.id}>
                          <TableCell className="font-medium">
                            <div>
                              <div className="font-medium">{subject.name}</div>
                              <div className="text-sm text-gray-500">{subject.code}</div>
                              <div className="text-xs text-gray-400">{subject.credits} credits</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getSubjectTypeColor(subject.type)}>
                              {subject.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">Semester {subject.semester}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              {subject.assignedFaculty.length > 0 ? (
                                <div className="space-y-1">
                                  {subject.assignedFaculty.slice(0, 2).map((facultyId, idx) => (
                                    <div key={idx} className="text-sm">
                                      {getFacultyName(facultyId)}
                                    </div>
                                  ))}
                                  {subject.assignedFaculty.length > 2 && (
                                    <div className="text-xs text-gray-500">
                                      +{subject.assignedFaculty.length - 2} more
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-sm text-gray-500">Unassigned</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm">{subject.enrolledStudents}/{subject.maxStudents}</span>
                                <span className={`text-xs font-medium ${getEnrollmentColor(getEnrollmentPercentage(subject))}`}>
                                  {getEnrollmentPercentage(subject)}%
                                </span>
                              </div>
                              <Progress value={getEnrollmentPercentage(subject)} className="w-20 h-1" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-medium">{subject.credits}</span>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(subject.status)}>
                              {subject.status}
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
                                <DropdownMenuItem onClick={() => handleAllocateSubject(subject)}>
                                  <Users className="mr-2 h-4 w-4" />
                                  Allocate Faculty
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Subject
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <FileText className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Subject
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
          </TabsContent>

          {/* Course Structure Tab */}
          <TabsContent value="courses">
            <Card>
              <CardHeader>
                <CardTitle>Course Structure</CardTitle>
                <CardDescription>
                  Overview of courses and their subject distribution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {courses.map((course) => (
                    <div key={course.id} className="border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">{course.name}</h3>
                          <p className="text-sm text-gray-600">{course.code} • {course.duration}</p>
                          <p className="text-sm text-gray-500 mt-1">{course.description}</p>
                        </div>
                        <Badge variant="outline">{course.totalSemesters} Semesters</Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((semester) => (
                          <div key={semester} className="border rounded-lg p-4">
                            <h4 className="font-medium mb-2">Semester {semester}</h4>
                            <div className="space-y-2">
                              {course.subjects
                                .filter(s => s.semester === semester)
                                .map((subject) => (
                                  <div key={subject.id} className="text-sm">
                                    <div className="font-medium">{subject.code}</div>
                                    <div className="text-gray-600">{subject.name}</div>
                                    <div className="flex items-center space-x-2 mt-1">
                                      <Badge className={getSubjectTypeColor(subject.type)} variant="secondary">
                                        {subject.type}
                                      </Badge>
                                      <span className="text-xs">{subject.credits} credits</span>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Faculty Load Tab */}
          <TabsContent value="faculty">
            <Card>
              <CardHeader>
                <CardTitle>Faculty Workload</CardTitle>
                <CardDescription>
                  Current subject allocation and workload distribution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {faculty.map((fac) => {
                    const assignedSubjects = subjects.filter(s => s.assignedFaculty.includes(fac.id))
                    const totalCredits = assignedSubjects.reduce((sum, s) => sum + s.credits, 0)
                    const totalStudents = assignedSubjects.reduce((sum, s) => sum + s.enrolledStudents, 0)
                    
                    return (
                      <div key={fac.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium">{fac.name}</h4>
                            <p className="text-sm text-gray-600">{fac.designation} • {fac.email}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline">{assignedSubjects.length} subjects</Badge>
                            <div className="text-sm text-gray-600 mt-1">{totalCredits} credits</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <span className="text-sm font-medium">Assigned Subjects:</span>
                            <div className="mt-1 space-y-1">
                              {assignedSubjects.map((subject) => (
                                <div key={subject.id} className="text-sm">
                                  {subject.code} - {subject.name}
                                </div>
                              ))}
                              {assignedSubjects.length === 0 && (
                                <div className="text-sm text-gray-500">No subjects assigned</div>
                              )}
                            </div>
                          </div>
                          <div>
                            <span className="text-sm font-medium">Student Load:</span>
                            <div className="mt-1">
                              <div className="text-lg font-semibold">{totalStudents} students</div>
                              <div className="text-xs text-gray-500">
                                Avg: {assignedSubjects.length > 0 ? Math.round(totalStudents / assignedSubjects.length) : 0} per subject
                              </div>
                            </div>
                          </div>
                          <div>
                            <span className="text-sm font-medium">Workload:</span>
                            <div className="mt-1">
                              <div className="text-lg font-semibold">{totalCredits} credits</div>
                              <div className="text-xs text-gray-500">
                                {totalCredits >= 12 ? "Full load" : totalCredits >= 8 ? "Moderate" : "Light"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Allocate Faculty Dialog */}
      <Dialog open={isAllocateDialogOpen} onOpenChange={setIsAllocateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Allocate Faculty to Subject</DialogTitle>
            <DialogDescription>
              Assign faculty members to {selectedSubject?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Subject Details</Label>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">{selectedSubject?.name} ({selectedSubject?.code})</p>
                <p className="text-sm text-gray-600">{selectedSubject?.credits} credits • Semester {selectedSubject?.semester}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Select Faculty Members</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {faculty.map((fac) => (
                  <div key={fac.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`faculty-${fac.id}`}
                      defaultChecked={selectedSubject?.assignedFaculty.includes(fac.id)}
                      className="rounded"
                    />
                    <Label htmlFor={`faculty-${fac.id}`} className="text-sm">
                      {fac.name} - {fac.designation}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsAllocateDialogOpen(false)}>
              Save Allocation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Subject Dialog */}
      <Dialog open={isAddSubjectDialogOpen} onOpenChange={setIsAddSubjectDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Subject</DialogTitle>
            <DialogDescription>
              Create a new subject for the department
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subjectCode">Subject Code *</Label>
                <Input id="subjectCode" placeholder="CS101" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subjectName">Subject Name *</Label>
                <Input id="subjectName" placeholder="Programming Fundamentals" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subjectType">Type *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="core">Core</SelectItem>
                    <SelectItem value="elective">Elective</SelectItem>
                    <SelectItem value="lab">Lab</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="credits">Credits *</Label>
                <Input id="credits" type="number" placeholder="4" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="semester">Semester *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Semester 1</SelectItem>
                    <SelectItem value="2">Semester 2</SelectItem>
                    <SelectItem value="3">Semester 3</SelectItem>
                    <SelectItem value="4">Semester 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxStudents">Max Students</Label>
                <Input id="maxStudents" type="number" placeholder="60" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prerequisites">Prerequisites</Label>
                <Input id="prerequisites" placeholder="CS101" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Subject description..." />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsAddSubjectDialogOpen(false)}>
              Add Subject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}