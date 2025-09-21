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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Plus, FileText, Users, Clock, CheckCircle, Eye, Edit, Trash2, Download } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export const dynamic = 'force-dynamic'

interface Assignment {
  id: string
  title: string
  description: string
  subject: string
  dueDate: Date
  totalMarks: number
  submissions: number
  totalStudents: number
  status: "ACTIVE" | "CLOSED" | "DRAFT"
  attachments?: string[]
}

interface Submission {
  id: string
  studentName: string
  rollNumber: string
  submittedAt: Date
  status: "SUBMITTED" | "LATE" | "NOT_SUBMITTED"
  marks?: number
  feedback?: string
  fileUrl?: string
}

export default function FacultyAssignmentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isViewSubmissionsOpen, setIsViewSubmissionsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("ALL")

  // Form states
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    subject: "",
    dueDate: new Date(),
    totalMarks: 100
  })

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user.role !== "FACULTY") {
      router.push("/auth/signin")
    }
  }, [session, status, router])

  useEffect(() => {
    // Mock data for assignments
    const mockAssignments: Assignment[] = [
      {
        id: "1",
        title: "Data Structures Assignment 1",
        description: "Implement a binary search tree with insertion, deletion, and traversal operations.",
        subject: "Data Structures",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        totalMarks: 100,
        submissions: 35,
        totalStudents: 40,
        status: "ACTIVE",
        attachments: ["assignment1.pdf", "requirements.docx"]
      },
      {
        id: "2",
        title: "Algorithm Analysis",
        description: "Analyze time and space complexity of various sorting algorithms.",
        subject: "Algorithms",
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        totalMarks: 50,
        submissions: 38,
        totalStudents: 38,
        status: "CLOSED"
      },
      {
        id: "3",
        title: "Database Design Project",
        description: "Design and implement a database system for a library management system.",
        subject: "Database Systems",
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        totalMarks: 150,
        submissions: 12,
        totalStudents: 35,
        status: "ACTIVE"
      }
    ]
    setAssignments(mockAssignments)
  }, [])

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.subject.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "ALL" || assignment.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const handleCreateAssignment = () => {
    const assignment: Assignment = {
      id: String(assignments.length + 1),
      ...newAssignment,
      submissions: 0,
      totalStudents: 40,
      status: "ACTIVE"
    }
    setAssignments([...assignments, assignment])
    setNewAssignment({
      title: "",
      description: "",
      subject: "",
      dueDate: new Date(),
      totalMarks: 100
    })
    setIsCreateDialogOpen(false)
  }

  const viewSubmissions = (assignment: Assignment) => {
    setSelectedAssignment(assignment)
    
    // Mock submissions data
    const mockSubmissions: Submission[] = [
      {
        id: "1",
        studentName: "John Doe",
        rollNumber: "CS001",
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: "SUBMITTED",
        marks: 85,
        feedback: "Good implementation, well documented",
        fileUrl: "/submissions/john_doe_assignment1.zip"
      },
      {
        id: "2",
        studentName: "Jane Smith",
        rollNumber: "CS002",
        submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        status: "LATE",
        marks: 78,
        feedback: "Late submission but good quality work",
        fileUrl: "/submissions/jane_smith_assignment1.zip"
      },
      {
        id: "3",
        studentName: "Bob Johnson",
        rollNumber: "CS003",
        submittedAt: new Date(),
        status: "SUBMITTED",
        fileUrl: "/submissions/bob_johnson_assignment1.zip"
      }
    ]
    setSubmissions(mockSubmissions)
    setIsViewSubmissionsOpen(true)
  }

  const updateSubmissionMarks = (submissionId: string, marks: number) => {
    setSubmissions(prev => prev.map(sub => 
      sub.id === submissionId ? { ...sub, marks } : sub
    ))
  }

  const updateSubmissionFeedback = (submissionId: string, feedback: string) => {
    setSubmissions(prev => prev.map(sub => 
      sub.id === submissionId ? { ...sub, feedback } : sub
    ))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="default">Active</Badge>
      case "CLOSED":
        return <Badge variant="secondary">Closed</Badge>
      case "DRAFT":
        return <Badge variant="outline">Draft</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getSubmissionStatusBadge = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return <Badge variant="default">Submitted</Badge>
      case "LATE":
        return <Badge variant="destructive">Late</Badge>
      case "NOT_SUBMITTED":
        return <Badge variant="outline">Not Submitted</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
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
              <h1 className="text-2xl font-bold text-gray-900">Assignment Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {session.user.name}
              </span>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Assignment
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Assignment</DialogTitle>
                    <DialogDescription>
                      Create a new assignment for your students
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Assignment Title</Label>
                      <Input
                        id="title"
                        value={newAssignment.title}
                        onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                        placeholder="Enter assignment title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Select value={newAssignment.subject} onValueChange={(value) => setNewAssignment({...newAssignment, subject: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Data Structures">Data Structures</SelectItem>
                          <SelectItem value="Algorithms">Algorithms</SelectItem>
                          <SelectItem value="Database Systems">Database Systems</SelectItem>
                          <SelectItem value="Web Development">Web Development</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newAssignment.description}
                        onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
                        placeholder="Enter assignment description"
                        rows={4}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Due Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !newAssignment.dueDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {newAssignment.dueDate ? format(newAssignment.dueDate, "PPP") : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={newAssignment.dueDate}
                              onSelect={(date) => date && setNewAssignment({...newAssignment, dueDate: date})}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div>
                        <Label htmlFor="totalMarks">Total Marks</Label>
                        <Input
                          id="totalMarks"
                          type="number"
                          value={newAssignment.totalMarks}
                          onChange={(e) => setNewAssignment({...newAssignment, totalMarks: parseInt(e.target.value) || 0})}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateAssignment}>
                        Create Assignment
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
        {/* Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex gap-4">
            <Input
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Assignments List */}
        <div className="grid gap-6">
          {filteredAssignments.map((assignment) => (
            <Card key={assignment.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      {assignment.title}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {assignment.description}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(assignment.status)}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => viewSubmissions(assignment)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Submissions
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Subject</p>
                    <p className="text-lg">{assignment.subject}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Due Date</p>
                    <p className="text-lg">{format(assignment.dueDate, "PPP")}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Marks</p>
                    <p className="text-lg">{assignment.totalMarks}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Submissions</p>
                    <p className="text-lg">{assignment.submissions}/{assignment.totalStudents}</p>
                  </div>
                </div>
                {assignment.attachments && assignment.attachments.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-500 mb-2">Attachments</p>
                    <div className="flex gap-2">
                      {assignment.attachments.map((attachment, index) => (
                        <Button key={index} variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          {attachment}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Submissions Dialog */}
        <Dialog open={isViewSubmissionsOpen} onOpenChange={setIsViewSubmissionsOpen}>
          <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Submissions - {selectedAssignment?.title}</DialogTitle>
              <DialogDescription>
                View and evaluate student submissions
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Roll Number</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Submitted At</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium">{submission.rollNumber}</TableCell>
                      <TableCell>{submission.studentName}</TableCell>
                      <TableCell>{format(submission.submittedAt, "PPp")}</TableCell>
                      <TableCell>{getSubmissionStatusBadge(submission.status)}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={submission.marks || ""}
                          onChange={(e) => updateSubmissionMarks(submission.id, parseInt(e.target.value) || 0)}
                          placeholder="Marks"
                          className="w-20"
                          max={selectedAssignment?.totalMarks}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}