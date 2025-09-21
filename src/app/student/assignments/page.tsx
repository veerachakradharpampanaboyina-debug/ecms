"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { 
  FileText, 
  Upload, 
  Download, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  User,
  BookOpen,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Paperclip,
  Star
} from "lucide-react"
import { format, differenceInDays, isAfter, isBefore, addDays } from "date-fns"

interface Assignment {
  id: string
  title: string
  description: string
  subject: string
  subjectCode: string
  facultyName: string
  dueDate: Date
  totalMarks: number
  weightage: number
  type: "INDIVIDUAL" | "GROUP"
  status: "PENDING" | "SUBMITTED" | "GRADED" | "OVERDUE"
  submissionDate?: Date
  obtainedMarks?: number
  feedback?: string
  attachments: string[]
  instructions: string[]
  rubric?: string
}

interface Submission {
  id: string
  assignmentId: string
  studentId: string
  submittedAt: Date
  files: string[]
  comments: string
  status: "PENDING" | "REVIEWED" | "GRADED"
  grade?: number
  feedback?: string
}

export default function StudentAssignmentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSubject, setFilterSubject] = useState<string>("ALL")
  const [filterStatus, setFilterStatus] = useState<string>("ALL")
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false)
  const [submissionComment, setSubmissionComment] = useState("")
  const [submissionFiles, setSubmissionFiles] = useState<File[]>([])

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user.role !== "STUDENT") {
      router.push("/auth/signin")
    }
  }, [session, status, router])

  useEffect(() => {
    // Mock data for assignments
    const mockAssignments: Assignment[] = [
      {
        id: "1",
        title: "Data Structures - Linked Lists Implementation",
        description: "Implement a doubly linked list with all basic operations including insertion, deletion, and traversal.",
        subject: "Data Structures",
        subjectCode: "CS201",
        facultyName: "Dr. John Smith",
        dueDate: addDays(new Date(), 3),
        totalMarks: 100,
        weightage: 15,
        type: "INDIVIDUAL",
        status: "PENDING",
        attachments: ["assignment1.pdf", "sample_code.cpp"],
        instructions: [
          "Implement all operations in C++",
          "Include proper error handling",
          "Add comments for each function",
          "Submit both source code and documentation"
        ],
        rubric: "Correctness: 40%, Code Quality: 30%, Documentation: 20%, Testing: 10%"
      },
      {
        id: "2",
        title: "Algorithms - Sorting Algorithm Analysis",
        description: "Analyze and compare different sorting algorithms with time and space complexity.",
        subject: "Algorithms",
        subjectCode: "CS202",
        facultyName: "Dr. Sarah Johnson",
        dueDate: addDays(new Date(), 7),
        totalMarks: 80,
        weightage: 12,
        type: "INDIVIDUAL",
        status: "PENDING",
        attachments: ["sorting_requirements.pdf"],
        instructions: [
          "Analyze at least 3 sorting algorithms",
          "Include theoretical and practical analysis",
          "Provide comparison charts",
          "Submit as a PDF report"
        ]
      },
      {
        id: "3",
        title: "Database Systems - ER Diagram Design",
        description: "Design an ER diagram for a library management system with proper normalization.",
        subject: "Database Systems",
        subjectCode: "CS301",
        facultyName: "Prof. Michael Brown",
        dueDate: addDays(new Date(), -2),
        totalMarks: 60,
        weightage: 10,
        type: "GROUP",
        status: "OVERDUE",
        attachments: ["library_system_requirements.pdf"],
        instructions: [
          "Design up to 3NF normalization",
          "Include all necessary entities and relationships",
          "Provide data dictionary",
          "Submit ER diagram and schema design"
        ]
      },
      {
        id: "4",
        title: "Web Development - React Component Library",
        description: "Create a reusable component library using React and TypeScript.",
        subject: "Web Development",
        subjectCode: "CS401",
        facultyName: "Dr. Emily Davis",
        dueDate: addDays(new Date(), -5),
        totalMarks: 90,
        weightage: 18,
        type: "INDIVIDUAL",
        status: "SUBMITTED",
        submissionDate: addDays(new Date(), -6),
        attachments: ["component_requirements.pdf"],
        instructions: [
          "Create at least 5 reusable components",
          "Use TypeScript for type safety",
          "Include proper documentation",
          "Add unit tests for each component"
        ]
      },
      {
        id: "5",
        title: "Data Structures - Binary Search Tree",
        description: "Implement a binary search tree with traversal operations.",
        subject: "Data Structures",
        subjectCode: "CS201",
        facultyName: "Dr. John Smith",
        dueDate: addDays(new Date(), -10),
        totalMarks: 85,
        weightage: 12,
        type: "INDIVIDUAL",
        status: "GRADED",
        submissionDate: addDays(new Date(), -11),
        obtainedMarks: 78,
        feedback: "Good implementation. Could improve error handling and add more test cases.",
        attachments: ["bst_requirements.pdf"],
        instructions: [
          "Implement insertion, deletion, and search operations",
          "Include in-order, pre-order, and post-order traversals",
          "Add height calculation functionality",
          "Submit source code with proper documentation"
        ]
      }
    ]
    setAssignments(mockAssignments)

    // Mock data for submissions
    const mockSubmissions: Submission[] = [
      {
        id: "1",
        assignmentId: "4",
        studentId: "STU001",
        submittedAt: addDays(new Date(), -6),
        files: ["react_components.zip", "documentation.pdf"],
        comments: "Implemented Button, Input, Card, Modal, and Form components with TypeScript support.",
        status: "GRADED",
        grade: 82,
        feedback: "Excellent work! Components are well-structured and properly documented."
      },
      {
        id: "2",
        assignmentId: "5",
        studentId: "STU001",
        submittedAt: addDays(new Date(), -11),
        files: ["bst_implementation.cpp", "test_cases.cpp"],
        comments: "Completed all required operations with proper error handling.",
        status: "GRADED",
        grade: 78,
        feedback: "Good implementation. Could improve error handling and add more test cases."
      }
    ]
    setSubmissions(mockSubmissions)
  }, [])

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.subject.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubject = filterSubject === "ALL" || assignment.subject === filterSubject
    const matchesStatus = filterStatus === "ALL" || assignment.status === filterStatus
    return matchesSearch && matchesSubject && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline">Pending</Badge>
      case "SUBMITTED":
        return <Badge variant="secondary">Submitted</Badge>
      case "GRADED":
        return <Badge variant="default">Graded</Badge>
      case "OVERDUE":
        return <Badge variant="destructive">Overdue</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "INDIVIDUAL":
        return <Badge variant="outline">Individual</Badge>
      case "GROUP":
        return <Badge variant="secondary">Group</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const getDaysRemaining = (dueDate: Date) => {
    const today = new Date()
    const days = differenceInDays(dueDate, today)
    
    if (days < 0) {
      return { text: `${Math.abs(days)} days overdue`, color: "text-red-600" }
    } else if (days === 0) {
      return { text: "Due today", color: "text-orange-600" }
    } else if (days === 1) {
      return { text: "1 day remaining", color: "text-yellow-600" }
    } else {
      return { text: `${days} days remaining`, color: "text-green-600" }
    }
  }

  const getProgressPercentage = (assignment: Assignment) => {
    if (assignment.status === "GRADED" && assignment.obtainedMarks) {
      return (assignment.obtainedMarks / assignment.totalMarks) * 100
    }
    return 0
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      setSubmissionFiles(prev => [...prev, ...Array.from(files)])
    }
  }

  const removeFile = (index: number) => {
    setSubmissionFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmitAssignment = () => {
    if (!selectedAssignment) return
    
    // Create new submission
    const newSubmission: Submission = {
      id: Date.now().toString(),
      assignmentId: selectedAssignment.id,
      studentId: "STU001",
      submittedAt: new Date(),
      files: submissionFiles.map(f => f.name),
      comments: submissionComment,
      status: "PENDING"
    }
    
    setSubmissions(prev => [...prev, newSubmission])
    
    // Update assignment status
    setAssignments(prev => prev.map(assignment => 
      assignment.id === selectedAssignment.id 
        ? { ...assignment, status: "SUBMITTED", submissionDate: new Date() }
        : assignment
    ))
    
    // Reset form and close dialog
    setSubmissionComment("")
    setSubmissionFiles([])
    setIsSubmitDialogOpen(false)
    setSelectedAssignment(null)
  }

  const openSubmitDialog = (assignment: Assignment) => {
    setSelectedAssignment(assignment)
    setIsSubmitDialogOpen(true)
  }

  const getAssignmentsByStatus = (status: string) => {
    return assignments.filter(assignment => assignment.status === status)
  }

  const pendingAssignments = getAssignmentsByStatus("PENDING")
  const overdueAssignments = getAssignmentsByStatus("OVERDUE")
  const gradedAssignments = getAssignmentsByStatus("GRADED")

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
              <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assignments.length}</div>
              <p className="text-xs text-muted-foreground">
                This semester
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingAssignments.length}</div>
              <p className="text-xs text-muted-foreground">
                Need attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{overdueAssignments.length}</div>
              <p className="text-xs text-muted-foreground">
                Submit immediately
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {gradedAssignments.length > 0 
                  ? (gradedAssignments.reduce((sum, assignment) => sum + (assignment.obtainedMarks || 0), 0) / gradedAssignments.length).toFixed(1)
                  : "0"
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Out of 100
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Assignments</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="submitted">Submitted</TabsTrigger>
            <TabsTrigger value="graded">Graded</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search assignments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={filterSubject} onValueChange={setFilterSubject}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Subjects</SelectItem>
                    <SelectItem value="Data Structures">Data Structures</SelectItem>
                    <SelectItem value="Algorithms">Algorithms</SelectItem>
                    <SelectItem value="Database Systems">Database Systems</SelectItem>
                    <SelectItem value="Web Development">Web Development</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="SUBMITTED">Submitted</SelectItem>
                    <SelectItem value="GRADED">Graded</SelectItem>
                    <SelectItem value="OVERDUE">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Assignments List */}
            <div className="space-y-4">
              {filteredAssignments.map((assignment) => {
                const daysRemaining = getDaysRemaining(assignment.dueDate)
                const submission = submissions.find(s => s.assignmentId === assignment.id)
                
                return (
                  <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <CardTitle className="text-lg">{assignment.title}</CardTitle>
                            {getStatusBadge(assignment.status)}
                            {getTypeBadge(assignment.type)}
                          </div>
                          <CardDescription className="line-clamp-2">
                            {assignment.description}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          {assignment.status === "PENDING" && (
                            <Button 
                              size="sm" 
                              onClick={() => openSubmitDialog(assignment)}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Submit
                            </Button>
                          )}
                          {assignment.status === "SUBMITTED" && (
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Subject</p>
                          <p className="text-sm">{assignment.subject} ({assignment.subjectCode})</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Due Date</p>
                          <p className={`text-sm font-medium ${daysRemaining.color}`}>
                            {format(assignment.dueDate, "PPP")} - {daysRemaining.text}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Marks</p>
                          <p className="text-sm">{assignment.totalMarks} marks ({assignment.weightage}% weightage)</p>
                        </div>
                      </div>
                      
                      {assignment.status === "GRADED" && assignment.obtainedMarks && (
                        <div className="mt-4 p-3 bg-green-50 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">Grade: {assignment.obtainedMarks}/{assignment.totalMarks}</span>
                            <span className="text-sm text-gray-600">
                              {((assignment.obtainedMarks / assignment.totalMarks) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <Progress value={getProgressPercentage(assignment)} className="h-2" />
                          {assignment.feedback && (
                            <p className="text-sm text-gray-600 mt-2">
                              <strong>Feedback:</strong> {assignment.feedback}
                            </p>
                          )}
                        </div>
                      )}
                      
                      {assignment.attachments.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-500 mb-2">Attachments</p>
                          <div className="flex flex-wrap gap-2">
                            {assignment.attachments.map((attachment, index) => (
                              <Button key={index} variant="outline" size="sm">
                                <Paperclip className="h-4 w-4 mr-2" />
                                {attachment}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {submission && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm font-medium">Submitted on {format(submission.submittedAt, "PPP")}</p>
                          {submission.files.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {submission.files.map((file, index) => (
                                <Button key={index} variant="outline" size="sm">
                                  <Download className="h-4 w-4 mr-2" />
                                  {file}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {pendingAssignments.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-lg font-medium">No pending assignments</p>
                  <p className="text-gray-500">All assignments have been submitted or graded</p>
                </CardContent>
              </Card>
            ) : (
              pendingAssignments.map((assignment) => (
                <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <CardTitle className="text-lg">{assignment.title}</CardTitle>
                          {getTypeBadge(assignment.type)}
                        </div>
                        <CardDescription>{assignment.description}</CardDescription>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => openSubmitDialog(assignment)}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Submit
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Subject</p>
                        <p className="text-sm">{assignment.subject} ({assignment.subjectCode})</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Due Date</p>
                        <p className="text-sm font-medium text-orange-600">
                          {format(assignment.dueDate, "PPP")} - {getDaysRemaining(assignment.dueDate).text}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Marks</p>
                        <p className="text-sm">{assignment.totalMarks} marks ({assignment.weightage}% weightage)</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="submitted" className="space-y-4">
            {assignments.filter(a => a.status === "SUBMITTED").length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium">No submitted assignments</p>
                  <p className="text-gray-500">Submit assignments to see them here</p>
                </CardContent>
              </Card>
            ) : (
              assignments
                .filter(a => a.status === "SUBMITTED")
                .map((assignment) => {
                  const submission = submissions.find(s => s.assignmentId === assignment.id)
                  return (
                    <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <CardTitle className="text-lg">{assignment.title}</CardTitle>
                              <Badge variant="secondary">Submitted</Badge>
                            </div>
                            <CardDescription>{assignment.description}</CardDescription>
                          </div>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Subject</p>
                            <p className="text-sm">{assignment.subject} ({assignment.subjectCode})</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Submitted</p>
                            <p className="text-sm font-medium">
                              {assignment.submissionDate ? format(assignment.submissionDate, "PPP") : "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Marks</p>
                            <p className="text-sm">{assignment.totalMarks} marks ({assignment.weightage}% weightage)</p>
                          </div>
                        </div>
                        
                        {submission && (
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm font-medium">Submitted Files</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {submission.files.map((file, index) => (
                                <Button key={index} variant="outline" size="sm">
                                  <Download className="h-4 w-4 mr-2" />
                                  {file}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })
            )}
          </TabsContent>

          <TabsContent value="graded" className="space-y-4">
            {gradedAssignments.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium">No graded assignments</p>
                  <p className="text-gray-500">Graded assignments will appear here</p>
                </CardContent>
              </Card>
            ) : (
              gradedAssignments.map((assignment) => (
                <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <CardTitle className="text-lg">{assignment.title}</CardTitle>
                          <Badge variant="default">Graded</Badge>
                        </div>
                        <CardDescription>{assignment.description}</CardDescription>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Subject</p>
                        <p className="text-sm">{assignment.subject} ({assignment.subjectCode})</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Grade</p>
                        <p className="text-sm font-medium text-green-600">
                          {assignment.obtainedMarks}/{assignment.totalMarks} 
                          ({((assignment.obtainedMarks! / assignment.totalMarks) * 100).toFixed(1)}%)
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Weightage</p>
                        <p className="text-sm">{assignment.weightage}% of total grade</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm text-gray-600">
                          {((assignment.obtainedMarks! / assignment.totalMarks) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={getProgressPercentage(assignment)} className="h-2" />
                    </div>
                    
                    {assignment.feedback && (
                      <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700">Faculty Feedback:</p>
                        <p className="text-sm text-gray-600 mt-1">{assignment.feedback}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Submit Assignment Dialog */}
      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submit Assignment</DialogTitle>
            <DialogDescription>
              {selectedAssignment && `Submit your work for: ${selectedAssignment.title}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="files">Upload Files</Label>
              <div className="mt-2">
                <Input
                  id="files"
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="cursor-pointer"
                />
              </div>
              
              {submissionFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium">Selected Files:</p>
                  {submissionFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <Label htmlFor="comments">Comments (Optional)</Label>
              <Textarea
                id="comments"
                placeholder="Add any comments about your submission..."
                value={submissionComment}
                onChange={(e) => setSubmissionComment(e.target.value)}
                className="mt-2"
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsSubmitDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitAssignment}>
                <Upload className="h-4 w-4 mr-2" />
                Submit Assignment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}