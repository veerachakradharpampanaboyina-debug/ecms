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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calculator, FileText, Users, TrendingUp, AlertTriangle, CheckCircle, Upload, Download, Save, Eye, Plus } from "lucide-react"
import { format } from "date-fns"

interface Student {
  id: string
  name: string
  rollNumber: string
  email: string
}

interface Assessment {
  id: string
  title: string
  type: "INTERNAL" | "MID_TERM" | "FINAL" | "ASSIGNMENT" | "QUIZ"
  subject: string
  maxMarks: number
  date: Date
  description: string
  weightage: number
}

interface MarkEntry {
  studentId: string
  marks: number
  feedback?: string
  isSubmitted: boolean
}

interface SubjectStats {
  subject: string
  totalStudents: number
  averageMarks: number
  highestMarks: number
  lowestMarks: number
  passPercentage: number
}

export default function FacultyMarksPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [markEntries, setMarkEntries] = useState<MarkEntry[]>([])
  const [subjectStats, setSubjectStats] = useState<SubjectStats[]>([])
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("entry")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSubject, setFilterSubject] = useState<string>("ALL")
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")

  // Form states
  const [newAssessment, setNewAssessment] = useState({
    title: "",
    type: "INTERNAL" as const,
    subject: "",
    maxMarks: 100,
    date: new Date(),
    description: "",
    weightage: 10
  })

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user.role !== "FACULTY") {
      router.push("/auth/signin")
    }
  }, [session, status, router])

  useEffect(() => {
    // Mock data for assessments
    const mockAssessments: Assessment[] = [
      {
        id: "1",
        title: "Internal Test 1",
        type: "INTERNAL",
        subject: "Data Structures",
        maxMarks: 30,
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        description: "First internal test covering arrays and linked lists",
        weightage: 10
      },
      {
        id: "2",
        title: "Mid-term Examination",
        type: "MID_TERM",
        subject: "Data Structures",
        maxMarks: 50,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        description: "Mid-term examination covering all topics",
        weightage: 30
      },
      {
        id: "3",
        title: "Assignment 1",
        type: "ASSIGNMENT",
        subject: "Algorithms",
        maxMarks: 20,
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        description: "Algorithm analysis assignment",
        weightage: 10
      }
    ]
    setAssessments(mockAssessments)

    // Mock data for students
    const mockStudents: Student[] = [
      { id: "1", name: "John Doe", rollNumber: "CS001", email: "john@example.com" },
      { id: "2", name: "Jane Smith", rollNumber: "CS002", email: "jane@example.com" },
      { id: "3", name: "Bob Johnson", rollNumber: "CS003", email: "bob@example.com" },
      { id: "4", name: "Alice Brown", rollNumber: "CS004", email: "alice@example.com" },
      { id: "5", name: "Charlie Wilson", rollNumber: "CS005", email: "charlie@example.com" }
    ]
    setStudents(mockStudents)

    // Mock data for subject stats
    const mockSubjectStats: SubjectStats[] = [
      {
        subject: "Data Structures",
        totalStudents: 40,
        averageMarks: 75.5,
        highestMarks: 95,
        lowestMarks: 45,
        passPercentage: 85
      },
      {
        subject: "Algorithms",
        totalStudents: 38,
        averageMarks: 72.3,
        highestMarks: 92,
        lowestMarks: 48,
        passPercentage: 82
      },
      {
        subject: "Database Systems",
        totalStudents: 35,
        averageMarks: 78.2,
        highestMarks: 98,
        lowestMarks: 52,
        passPercentage: 88
      }
    ]
    setSubjectStats(mockSubjectStats)
  }, [])

  useEffect(() => {
    if (selectedAssessment) {
      // Initialize mark entries for selected assessment
      const entries = students.map(student => ({
        studentId: student.id,
        marks: 0,
        feedback: "",
        isSubmitted: false
      }))
      setMarkEntries(entries)
    }
  }, [selectedAssessment, students])

  const filteredAssessments = assessments.filter(assessment => {
    const matchesSearch = assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assessment.subject.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubject = filterSubject === "ALL" || assessment.subject === filterSubject
    return matchesSearch && matchesSubject
  })

  const handleCreateAssessment = () => {
    const assessment: Assessment = {
      id: String(assessments.length + 1),
      ...newAssessment
    }
    setAssessments([...assessments, assessment])
    setNewAssessment({
      title: "",
      type: "INTERNAL",
      subject: "",
      maxMarks: 100,
      date: new Date(),
      description: "",
      weightage: 10
    })
    setIsCreateDialogOpen(false)
  }

  const updateMarkEntry = (studentId: string, marks: number) => {
    setMarkEntries(prev => prev.map(entry => 
      entry.studentId === studentId ? { ...entry, marks } : entry
    ))
  }

  const updateFeedback = (studentId: string, feedback: string) => {
    setMarkEntries(prev => prev.map(entry => 
      entry.studentId === studentId ? { ...entry, feedback } : entry
    ))
  }

  const saveMarks = async () => {
    setSaveStatus("saving")
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSaveStatus("saved")
      setTimeout(() => setSaveStatus("idle"), 2000)
    } catch (error) {
      setSaveStatus("error")
      setTimeout(() => setSaveStatus("idle"), 2000)
    }
  }

  const submitMarks = async () => {
    setSaveStatus("saving")
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setMarkEntries(prev => prev.map(entry => ({ ...entry, isSubmitted: true })))
      setSaveStatus("saved")
      setTimeout(() => setSaveStatus("idle"), 2000)
    } catch (error) {
      setSaveStatus("error")
      setTimeout(() => setSaveStatus("idle"), 2000)
    }
  }

  const getAssessmentTypeBadge = (type: string) => {
    switch (type) {
      case "INTERNAL":
        return <Badge variant="default">Internal</Badge>
      case "MID_TERM":
        return <Badge variant="secondary">Mid-term</Badge>
      case "FINAL":
        return <Badge variant="destructive">Final</Badge>
      case "ASSIGNMENT":
        return <Badge variant="outline">Assignment</Badge>
      case "QUIZ":
        return <Badge variant="secondary">Quiz</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const getStudentById = (studentId: string) => {
    return students.find(student => student.id === studentId)
  }

  const calculateStats = () => {
    if (!selectedAssessment || markEntries.length === 0) return null
    
    const validMarks = markEntries.filter(entry => entry.marks >= 0)
    const totalMarks = validMarks.reduce((sum, entry) => sum + entry.marks, 0)
    const averageMarks = totalMarks / validMarks.length
    const highestMarks = Math.max(...validMarks.map(entry => entry.marks))
    const lowestMarks = Math.min(...validMarks.map(entry => entry.marks))
    const passedCount = validMarks.filter(entry => entry.marks >= selectedAssessment.maxMarks * 0.4).length
    const passPercentage = (passedCount / validMarks.length) * 100

    return {
      averageMarks,
      highestMarks,
      lowestMarks,
      passPercentage
    }
  }

  const stats = calculateStats()

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
              <h1 className="text-2xl font-bold text-gray-900">Marks Entry</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {session.user.name}
              </span>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Assessment
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Assessment</DialogTitle>
                    <DialogDescription>
                      Create a new assessment for marks entry
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Assessment Title</Label>
                      <Input
                        id="title"
                        value={newAssessment.title}
                        onChange={(e) => setNewAssessment({...newAssessment, title: e.target.value})}
                        placeholder="Enter assessment title"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="type">Type</Label>
                        <Select value={newAssessment.type} onValueChange={(value: any) => setNewAssessment({...newAssessment, type: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="INTERNAL">Internal</SelectItem>
                            <SelectItem value="MID_TERM">Mid-term</SelectItem>
                            <SelectItem value="FINAL">Final</SelectItem>
                            <SelectItem value="ASSIGNMENT">Assignment</SelectItem>
                            <SelectItem value="QUIZ">Quiz</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="subject">Subject</Label>
                        <Select value={newAssessment.subject} onValueChange={(value) => setNewAssessment({...newAssessment, subject: value})}>
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
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="maxMarks">Max Marks</Label>
                        <Input
                          id="maxMarks"
                          type="number"
                          value={newAssessment.maxMarks}
                          onChange={(e) => setNewAssessment({...newAssessment, maxMarks: parseInt(e.target.value) || 0})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="weightage">Weightage (%)</Label>
                        <Input
                          id="weightage"
                          type="number"
                          value={newAssessment.weightage}
                          onChange={(e) => setNewAssessment({...newAssessment, weightage: parseInt(e.target.value) || 0})}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newAssessment.description}
                        onChange={(e) => setNewAssessment({...newAssessment, description: e.target.value})}
                        placeholder="Enter assessment description"
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateAssessment}>
                        Create Assessment
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="entry">Marks Entry</TabsTrigger>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="entry" className="space-y-6">
            {/* Assessment Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Assessment</CardTitle>
                <CardDescription>Choose an assessment to enter marks</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedAssessment?.id || ""} onValueChange={(value) => {
                  const assessment = assessments.find(a => a.id === value)
                  setSelectedAssessment(assessment || null)
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an assessment" />
                  </SelectTrigger>
                  <SelectContent>
                    {assessments.map((assessment) => (
                      <SelectItem key={assessment.id} value={assessment.id}>
                        {assessment.title} - {assessment.subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {selectedAssessment && (
              <>
                {/* Assessment Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      {selectedAssessment.title}
                    </CardTitle>
                    <CardDescription>{selectedAssessment.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Type</p>
                        <p>{getAssessmentTypeBadge(selectedAssessment.type)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Subject</p>
                        <p className="text-lg">{selectedAssessment.subject}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Max Marks</p>
                        <p className="text-lg">{selectedAssessment.maxMarks}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Date</p>
                        <p className="text-lg">{format(selectedAssessment.date, "PPP")}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Statistics */}
                {stats && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Marks</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.averageMarks.toFixed(1)}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Highest Marks</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.highestMarks}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Lowest Marks</CardTitle>
                        <TrendingUp className="h-4 w-4 text-red-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats.lowestMarks}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pass Percentage</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.passPercentage.toFixed(1)}%</div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Marks Entry Table */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Marks Entry</CardTitle>
                        <CardDescription>Enter marks for each student</CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Dialog open={isBulkUploadOpen} onOpenChange={setIsBulkUploadOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline">
                              <Upload className="h-4 w-4 mr-2" />
                              Bulk Upload
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Bulk Upload Marks</DialogTitle>
                              <DialogDescription>
                                Upload marks from a CSV or Excel file
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="file">Choose File</Label>
                                <Input id="file" type="file" accept=".csv,.xlsx" />
                              </div>
                              <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setIsBulkUploadOpen(false)}>
                                  Cancel
                                </Button>
                                <Button>Upload</Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Download Template
                        </Button>
                        <Button onClick={saveMarks} disabled={saveStatus === "saving"}>
                          <Save className="h-4 w-4 mr-2" />
                          {saveStatus === "saving" ? "Saving..." : "Save"}
                        </Button>
                        <Button onClick={submitMarks} disabled={saveStatus === "saving"}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Submit
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {saveStatus === "saved" && (
                      <Alert className="mb-4">
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>Marks saved successfully!</AlertDescription>
                      </Alert>
                    )}
                    {saveStatus === "error" && (
                      <Alert className="mb-4" variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>Error saving marks. Please try again.</AlertDescription>
                      </Alert>
                    )}
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Roll Number</TableHead>
                          <TableHead>Student Name</TableHead>
                          <TableHead>Marks (out of {selectedAssessment.maxMarks})</TableHead>
                          <TableHead>Feedback</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {markEntries.map((entry) => {
                          const student = getStudentById(entry.studentId)
                          if (!student) return null
                          
                          return (
                            <TableRow key={entry.studentId}>
                              <TableCell className="font-medium">{student.rollNumber}</TableCell>
                              <TableCell>{student.name}</TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  value={entry.marks}
                                  onChange={(e) => updateMarkEntry(entry.studentId, parseInt(e.target.value) || 0)}
                                  min={0}
                                  max={selectedAssessment.maxMarks}
                                  className="w-20"
                                  disabled={entry.isSubmitted}
                                />
                              </TableCell>
                              <TableCell>
                                <Textarea
                                  value={entry.feedback}
                                  onChange={(e) => updateFeedback(entry.studentId, e.target.value)}
                                  placeholder="Enter feedback"
                                  rows={1}
                                  disabled={entry.isSubmitted}
                                />
                              </TableCell>
                              <TableCell>
                                {entry.isSubmitted ? (
                                  <Badge variant="default">Submitted</Badge>
                                ) : (
                                  <Badge variant="outline">Draft</Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="assessments" className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex gap-4">
                <Input
                  placeholder="Search assessments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
                <Select value={filterSubject} onValueChange={setFilterSubject}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Subjects</SelectItem>
                    <SelectItem value="Data Structures">Data Structures</SelectItem>
                    <SelectItem value="Algorithms">Algorithms</SelectItem>
                    <SelectItem value="Database Systems">Database Systems</SelectItem>
                    <SelectItem value="Web Development">Web Development</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Assessments List */}
            <div className="grid gap-4">
              {filteredAssessments.map((assessment) => (
                <Card key={assessment.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center">
                          <FileText className="h-5 w-5 mr-2" />
                          {assessment.title}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {assessment.description}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getAssessmentTypeBadge(assessment.type)}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAssessment(assessment)
                            setActiveTab("entry")
                          }}
                        >
                          <Calculator className="h-4 w-4 mr-2" />
                          Enter Marks
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Subject</p>
                        <p className="text-lg">{assessment.subject}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Max Marks</p>
                        <p className="text-lg">{assessment.maxMarks}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Weightage</p>
                        <p className="text-lg">{assessment.weightage}%</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Date</p>
                        <p className="text-lg">{format(assessment.date, "PPP")}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Status</p>
                        <Badge variant="outline">Pending</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Subject-wise Analytics */}
            <div className="grid gap-6">
              {subjectStats.map((stats) => (
                <Card key={stats.subject}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      {stats.subject} - Performance Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Total Students</p>
                        <p className="text-2xl font-bold">{stats.totalStudents}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Average Marks</p>
                        <p className="text-2xl font-bold">{stats.averageMarks.toFixed(1)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Highest Marks</p>
                        <p className="text-2xl font-bold text-green-600">{stats.highestMarks}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Lowest Marks</p>
                        <p className="text-2xl font-bold text-red-600">{stats.lowestMarks}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Pass Percentage</p>
                        <p className="text-2xl font-bold">{stats.passPercentage.toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Pass Rate</span>
                        <span>{stats.passPercentage.toFixed(1)}%</span>
                      </div>
                      <Progress value={stats.passPercentage} className="h-2" />
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