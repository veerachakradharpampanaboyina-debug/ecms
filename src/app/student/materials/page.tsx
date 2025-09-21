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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  BookOpen, 
  Video, 
  Link, 
  FileText, 
  Download, 
  Eye, 
  Star,
  Clock,
  Search,
  Filter,
  Calendar,
  User,
  BookmarkPlus,
  Share2,
  Play
} from "lucide-react"
import { format } from "date-fns"

interface Material {
  id: string
  title: string
  description: string
  type: "DOCUMENT" | "VIDEO" | "LINK" | "PRESENTATION"
  subject: string
  topic: string
  facultyName: string
  uploadedAt: Date
  fileSize?: string
  duration?: string
  url?: string
  downloads: number
  views: number
  rating: number
  tags: string[]
  isBookmarked: boolean
}

interface Subject {
  id: string
  name: string
  code: string
  facultyName: string
  materialsCount: number
  lastUpdated: Date
}

interface RecentActivity {
  id: string
  materialTitle: string
  action: "VIEWED" | "DOWNLOADED" | "BOOKMARKED"
  timestamp: Date
}

export default function StudentMaterialsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [materials, setMaterials] = useState<Material[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [bookmarkedMaterials, setBookmarkedMaterials] = useState<Material[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSubject, setFilterSubject] = useState<string>("ALL")
  const [filterType, setFilterType] = useState<string>("ALL")
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user.role !== "STUDENT") {
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
        facultyName: "Dr. John Smith",
        materialsCount: 15,
        lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        id: "2",
        name: "Algorithms",
        code: "CS202",
        facultyName: "Dr. Sarah Johnson",
        materialsCount: 12,
        lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        id: "3",
        name: "Database Systems",
        code: "CS301",
        facultyName: "Prof. Michael Brown",
        materialsCount: 8,
        lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        id: "4",
        name: "Web Development",
        code: "CS401",
        facultyName: "Dr. Emily Davis",
        materialsCount: 10,
        lastUpdated: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      }
    ]
    setSubjects(mockSubjects)

    // Mock data for materials
    const mockMaterials: Material[] = [
      {
        id: "1",
        title: "Introduction to Arrays",
        description: "Comprehensive notes on array data structure and operations with detailed examples",
        type: "DOCUMENT",
        subject: "Data Structures",
        topic: "Arrays",
        facultyName: "Dr. John Smith",
        uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        fileSize: "2.5 MB",
        downloads: 45,
        views: 120,
        rating: 4.5,
        tags: ["arrays", "basics", "notes"],
        isBookmarked: true
      },
      {
        id: "2",
        title: "Linked Lists Implementation",
        description: "Video tutorial on implementing linked lists in C++ with practical examples",
        type: "VIDEO",
        subject: "Data Structures",
        topic: "Linked Lists",
        facultyName: "Dr. John Smith",
        uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        duration: "15:30",
        downloads: 38,
        views: 95,
        rating: 4.8,
        tags: ["linked lists", "video", "tutorial"],
        isBookmarked: false
      },
      {
        id: "3",
        title: "Quick Sort Algorithm",
        description: "Detailed explanation of quick sort algorithm with complexity analysis",
        type: "PRESENTATION",
        subject: "Algorithms",
        topic: "Sorting",
        facultyName: "Dr. Sarah Johnson",
        uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        fileSize: "5.1 MB",
        downloads: 52,
        views: 150,
        rating: 4.7,
        tags: ["sorting", "quick sort", "algorithms"],
        isBookmarked: true
      },
      {
        id: "4",
        title: "SQL Basics Tutorial",
        description: "External resource for learning SQL fundamentals with interactive exercises",
        type: "LINK",
        subject: "Database Systems",
        topic: "SQL",
        facultyName: "Prof. Michael Brown",
        uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        url: "https://example.com/sql-basics",
        downloads: 28,
        views: 75,
        rating: 4.3,
        tags: ["sql", "database", "tutorial"],
        isBookmarked: false
      },
      {
        id: "5",
        title: "React Components Guide",
        description: "Complete guide to building React components with best practices",
        type: "DOCUMENT",
        subject: "Web Development",
        topic: "React",
        facultyName: "Dr. Emily Davis",
        uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        fileSize: "3.2 MB",
        downloads: 35,
        views: 89,
        rating: 4.6,
        tags: ["react", "components", "web development"],
        isBookmarked: false
      }
    ]
    setMaterials(mockMaterials)
    setBookmarkedMaterials(mockMaterials.filter(m => m.isBookmarked))

    // Mock data for recent activity
    const mockRecentActivity: RecentActivity[] = [
      {
        id: "1",
        materialTitle: "Introduction to Arrays",
        action: "VIEWED",
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000)
      },
      {
        id: "2",
        materialTitle: "Quick Sort Algorithm",
        action: "DOWNLOADED",
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000)
      },
      {
        id: "3",
        materialTitle: "Linked Lists Implementation",
        action: "BOOKMARKED",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000)
      }
    ]
    setRecentActivity(mockRecentActivity)
  }, [])

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesSubject = filterSubject === "ALL" || material.subject === filterSubject
    const matchesType = filterType === "ALL" || material.type === filterType
    return matchesSearch && matchesSubject && matchesType
  })

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

  const getActionIcon = (action: string) => {
    switch (action) {
      case "VIEWED":
        return <Eye className="h-4 w-4 text-blue-600" />
      case "DOWNLOADED":
        return <Download className="h-4 w-4 text-green-600" />
      case "BOOKMARKED":
        return <BookmarkPlus className="h-4 w-4 text-yellow-600" />
      default:
        return <Eye className="h-4 w-4" />
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

  const toggleBookmark = (materialId: string) => {
    setMaterials(prev => prev.map(material => 
      material.id === materialId 
        ? { ...material, isBookmarked: !material.isBookmarked }
        : material
    ))
    setBookmarkedMaterials(prev => {
      const material = materials.find(m => m.id === materialId)
      if (!material) return prev
      if (material.isBookmarked) {
        return prev.filter(m => m.id !== materialId)
      } else {
        return [...prev, { ...material, isBookmarked: true }]
      }
    })
  }

  const openPreview = (material: Material) => {
    setSelectedMaterial(material)
    setIsPreviewOpen(true)
  }

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
              <h1 className="text-2xl font-bold text-gray-900">Study Materials</h1>
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
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Materials</TabsTrigger>
            <TabsTrigger value="subjects">By Subject</TabsTrigger>
            <TabsTrigger value="bookmarked">Bookmarked</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search materials..."
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
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.name}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Types</SelectItem>
                    <SelectItem value="DOCUMENT">Documents</SelectItem>
                    <SelectItem value="VIDEO">Videos</SelectItem>
                    <SelectItem value="LINK">Links</SelectItem>
                    <SelectItem value="PRESENTATION">Presentations</SelectItem>
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
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleBookmark(material.id)}
                        >
                          <BookmarkPlus className={`h-4 w-4 ${material.isBookmarked ? "text-yellow-500 fill-current" : ""}`} />
                        </Button>
                        {getTypeBadge(material.type)}
                      </div>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {material.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Subject</span>
                        <span className="font-medium">{material.subject}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Topic</span>
                        <span className="font-medium">{material.topic}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Faculty</span>
                        <span className="font-medium">{material.facultyName}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Uploaded</span>
                        <span className="font-medium">{format(material.uploadedAt, "PP")}</span>
                      </div>
                      {material.fileSize && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Size</span>
                          <span className="font-medium">{material.fileSize}</span>
                        </div>
                      )}
                      {material.duration && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Duration</span>
                          <span className="font-medium">{material.duration}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Rating</span>
                        {renderStars(material.rating)}
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Views</span>
                        <div className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>{material.views}</span>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Downloads</span>
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
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => openPreview(material)}>
                          {material.type === "VIDEO" ? (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Play
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </>
                          )}
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
                      {subject.code} • {subject.facultyName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Materials</span>
                        <span className="font-medium">{subject.materialsCount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Last Updated</span>
                        <span className="font-medium">{format(subject.lastUpdated, "PP")}</span>
                      </div>
                      <div className="pt-2">
                        <Button size="sm" className="w-full" onClick={() => {
                          setFilterSubject(subject.name)
                          setActiveTab("all")
                        }}>
                          View Materials
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="bookmarked" className="space-y-6">
            {/* Bookmarked Materials */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookmarkedMaterials.map((material) => (
                <Card key={material.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(material.type)}
                        <CardTitle className="text-lg">{material.title}</CardTitle>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleBookmark(material.id)}
                        >
                          <BookmarkPlus className="h-4 w-4 text-yellow-500 fill-current" />
                        </Button>
                        {getTypeBadge(material.type)}
                      </div>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {material.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Subject</span>
                        <span className="font-medium">{material.subject}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Topic</span>
                        <span className="font-medium">{material.topic}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Rating</span>
                        {renderStars(material.rating)}
                      </div>
                      <div className="flex space-x-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => openPreview(material)}>
                          {material.type === "VIDEO" ? (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Play
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </>
                          )}
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
        </Tabs>

        {/* Recent Activity Sidebar */}
        <div className="fixed right-4 top-24 w-80 hidden lg:block">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    {getActionIcon(activity.action)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.materialTitle}</p>
                      <p className="text-xs text-gray-500">
                        {activity.action.toLowerCase()} • {format(activity.timestamp, "PPp")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Material Preview Dialog */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedMaterial?.title}</DialogTitle>
              <DialogDescription>
                {selectedMaterial?.description}
              </DialogDescription>
            </DialogHeader>
            {selectedMaterial && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Subject:</span> {selectedMaterial.subject}
                  </div>
                  <div>
                    <span className="font-medium">Topic:</span> {selectedMaterial.topic}
                  </div>
                  <div>
                    <span className="font-medium">Faculty:</span> {selectedMaterial.facultyName}
                  </div>
                  <div>
                    <span className="font-medium">Type:</span> {selectedMaterial.type}
                  </div>
                </div>
                
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="text-center text-gray-500">
                    {selectedMaterial.type === "VIDEO" ? (
                      <div className="space-y-4">
                        <Play className="h-16 w-16 mx-auto text-gray-400" />
                        <p>Video Player</p>
                        <p>Duration: {selectedMaterial.duration}</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <FileText className="h-16 w-16 mx-auto text-gray-400" />
                        <p>Document Preview</p>
                        {selectedMaterial.fileSize && (
                          <p>File Size: {selectedMaterial.fileSize}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    {renderStars(selectedMaterial.rating)}
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Eye className="h-4 w-4" />
                      <span>{selectedMaterial.views}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Download className="h-4 w-4" />
                      <span>{selectedMaterial.downloads}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    <Button>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}