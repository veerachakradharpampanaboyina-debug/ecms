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
import { CalendarIcon, Plus, BookOpen, FileText, Video, Link, Download, Eye, Edit, Trash2, Users, Star } from "lucide-react"
import { format } from "date-fns"

interface Material {
  id: string
  title: string
  description: string
  type: "DOCUMENT" | "VIDEO" | "LINK" | "PRESENTATION"
  subject: string
  topic: string
  uploadedAt: Date
  fileSize?: string
  duration?: string
  url?: string
  downloads: number
  views: number
  rating: number
  tags: string[]
}

interface Subject {
  id: string
  name: string
  code: string
  materialsCount: number
  topics: string[]
}

export default function FacultyMaterialsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [materials, setMaterials] = useState<Material[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("ALL")
  const [filterSubject, setFilterSubject] = useState<string>("ALL")
  const [activeTab, setActiveTab] = useState("materials")

  // Form states
  const [newMaterial, setNewMaterial] = useState({
    title: "",
    description: "",
    type: "DOCUMENT" as const,
    subject: "",
    topic: "",
    url: "",
    tags: ""
  })

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user.role !== "FACULTY") {
      router.push("/auth/signin")
    }
  }, [session, status, router])

  useEffect(() => {
    // Mock data for subjects
    const mockSubjects: Subject[] = [
      {
        id: "1",
        name: "Data Structures",
        code: "CS201",
        materialsCount: 15,
        topics: ["Arrays", "Linked Lists", "Stacks", "Queues", "Trees", "Graphs"]
      },
      {
        id: "2",
        name: "Algorithms",
        code: "CS202",
        materialsCount: 12,
        topics: ["Sorting", "Searching", "Dynamic Programming", "Greedy Algorithms"]
      },
      {
        id: "3",
        name: "Database Systems",
        code: "CS301",
        materialsCount: 8,
        topics: ["SQL", "Normalization", "Transactions", "Indexing"]
      },
      {
        id: "4",
        name: "Web Development",
        code: "CS401",
        materialsCount: 10,
        topics: ["HTML/CSS", "JavaScript", "React", "Node.js", "Databases"]
      }
    ]
    setSubjects(mockSubjects)

    // Mock data for materials
    const mockMaterials: Material[] = [
      {
        id: "1",
        title: "Introduction to Arrays",
        description: "Comprehensive notes on array data structure and operations",
        type: "DOCUMENT",
        subject: "Data Structures",
        topic: "Arrays",
        uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        fileSize: "2.5 MB",
        downloads: 45,
        views: 120,
        rating: 4.5,
        tags: ["arrays", "basics", "notes"]
      },
      {
        id: "2",
        title: "Linked Lists Implementation",
        description: "Video tutorial on implementing linked lists in C++",
        type: "VIDEO",
        subject: "Data Structures",
        topic: "Linked Lists",
        uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        duration: "15:30",
        downloads: 38,
        views: 95,
        rating: 4.8,
        tags: ["linked lists", "video", "tutorial"]
      },
      {
        id: "3",
        title: "Quick Sort Algorithm",
        description: "Detailed explanation of quick sort algorithm with examples",
        type: "PRESENTATION",
        subject: "Algorithms",
        topic: "Sorting",
        uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        fileSize: "5.1 MB",
        downloads: 52,
        views: 150,
        rating: 4.7,
        tags: ["sorting", "quick sort", "algorithms"]
      },
      {
        id: "4",
        title: "SQL Basics Tutorial",
        description: "External resource for learning SQL fundamentals",
        type: "LINK",
        subject: "Database Systems",
        topic: "SQL",
        uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        url: "https://example.com/sql-basics",
        downloads: 28,
        views: 75,
        rating: 4.3,
        tags: ["sql", "database", "tutorial"]
      }
    ]
    setMaterials(mockMaterials)
  }, [])

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesType = filterType === "ALL" || material.type === filterType
    const matchesSubject = filterSubject === "ALL" || material.subject === filterSubject
    return matchesSearch && matchesType && matchesSubject
  })

  const handleUploadMaterial = () => {
    const material: Material = {
      id: String(materials.length + 1),
      ...newMaterial,
      uploadedAt: new Date(),
      downloads: 0,
      views: 0,
      rating: 0,
      tags: newMaterial.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    }
    setMaterials([...materials, material])
    setNewMaterial({
      title: "",
      description: "",
      type: "DOCUMENT",
      subject: "",
      topic: "",
      url: "",
      tags: ""
    })
    setIsUploadDialogOpen(false)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "DOCUMENT":
        return <FileText className="h-4 w-4" />
      case "VIDEO":
        return <Video className="h-4 w-4" />
      case "LINK":
        return <Link className="h-4 w-4" />
      case "PRESENTATION":
        return <FileText className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "DOCUMENT":
        return <Badge variant="default">Document</Badge>
      case "VIDEO":
        return <Badge variant="secondary">Video</Badge>
      case "LINK":
        return <Badge variant="outline">Link</Badge>
      case "PRESENTATION":
        return <Badge variant="destructive">Presentation</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    )
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
              <h1 className="text-2xl font-bold text-gray-900">Study Materials</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {session.user.name}
              </span>
              <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Material
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Upload Study Material</DialogTitle>
                    <DialogDescription>
                      Upload new study material for your students
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Material Title</Label>
                      <Input
                        id="title"
                        value={newMaterial.title}
                        onChange={(e) => setNewMaterial({...newMaterial, title: e.target.value})}
                        placeholder="Enter material title"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="type">Type</Label>
                        <Select value={newMaterial.type} onValueChange={(value: any) => setNewMaterial({...newMaterial, type: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="DOCUMENT">Document</SelectItem>
                            <SelectItem value="VIDEO">Video</SelectItem>
                            <SelectItem value="LINK">Link</SelectItem>
                            <SelectItem value="PRESENTATION">Presentation</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="subject">Subject</Label>
                        <Select value={newMaterial.subject} onValueChange={(value) => setNewMaterial({...newMaterial, subject: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects.map((subject) => (
                              <SelectItem key={subject.id} value={subject.name}>
                                {subject.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="topic">Topic</Label>
                      <Select value={newMaterial.topic} onValueChange={(value) => setNewMaterial({...newMaterial, topic: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select topic" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.find(s => s.name === newMaterial.subject)?.topics.map((topic) => (
                            <SelectItem key={topic} value={topic}>
                              {topic}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newMaterial.description}
                        onChange={(e) => setNewMaterial({...newMaterial, description: e.target.value})}
                        placeholder="Enter material description"
                        rows={3}
                      />
                    </div>
                    {newMaterial.type === "LINK" && (
                      <div>
                        <Label htmlFor="url">URL</Label>
                        <Input
                          id="url"
                          value={newMaterial.url}
                          onChange={(e) => setNewMaterial({...newMaterial, url: e.target.value})}
                          placeholder="Enter URL"
                        />
                      </div>
                    )}
                    <div>
                      <Label htmlFor="tags">Tags (comma-separated)</Label>
                      <Input
                        id="tags"
                        value={newMaterial.tags}
                        onChange={(e) => setNewMaterial({...newMaterial, tags: e.target.value})}
                        placeholder="Enter tags separated by commas"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleUploadMaterial}>
                        Upload Material
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="subjects">Subjects</TabsTrigger>
          </TabsList>

          <TabsContent value="materials" className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex gap-4">
                <Input
                  placeholder="Search materials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Types</SelectItem>
                    <SelectItem value="DOCUMENT">Documents</SelectItem>
                    <SelectItem value="VIDEO">Videos</SelectItem>
                    <SelectItem value="LINK">Links</SelectItem>
                    <SelectItem value="PRESENTATION">Presentations</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterSubject} onValueChange={setFilterSubject}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Subjects</SelectItem>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.name}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Materials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMaterials.map((material) => (
                <Card key={material.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(material.type)}
                        <CardTitle className="text-lg">{material.title}</CardTitle>
                      </div>
                      {getTypeBadge(material.type)}
                    </div>
                    <CardDescription className="line-clamp-2">
                      {material.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Subject:</span>
                        <span className="font-medium">{material.subject}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Topic:</span>
                        <span className="font-medium">{material.topic}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Uploaded:</span>
                        <span className="font-medium">{format(material.uploadedAt, "PP")}</span>
                      </div>
                      {material.fileSize && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Size:</span>
                          <span className="font-medium">{material.fileSize}</span>
                        </div>
                      )}
                      {material.duration && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Duration:</span>
                          <span className="font-medium">{material.duration}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Rating:</span>
                        {renderStars(material.rating)}
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Views:</span>
                        <div className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>{material.views}</span>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Downloads:</span>
                        <div className="flex items-center space-x-1">
                          <Download className="h-4 w-4" />
                          <span>{material.downloads}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-3">
                        {material.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex space-x-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="subjects" className="space-y-6">
            {/* Subjects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((subject) => (
                <Card key={subject.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BookOpen className="h-5 w-5 mr-2" />
                      {subject.name}
                    </CardTitle>
                    <CardDescription>
                      {subject.code} • {subject.materialsCount} materials
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-2">Topics Covered</p>
                        <div className="flex flex-wrap gap-1">
                          {subject.topics.map((topic, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="pt-2">
                        <Button size="sm" className="w-full">
                          <Users className="h-4 w-4 mr-2" />
                          View All Materials
                        </Button>
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