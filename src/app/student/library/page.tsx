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
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { 
  BookOpen, 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Star,
  BookmarkPlus,
  Share2,
  Eye,
  MoreVertical,
  User,
  Tag,
  FileText,
  Video,
  Link,
  Headphones,
  Image,
  Archive,
  TrendingUp,
  Award,
  Bell,
  Info
} from "lucide-react"
import { format, differenceInDays, addDays, isAfter, isBefore } from "date-fns"

interface LibraryResource {
  id: string
  title: string
  description: string
  type: "BOOK" | "EBOOK" | "JOURNAL" | "VIDEO" | "AUDIO" | "DOCUMENT" | "LINK"
  category: string
  subcategory: string
  author: string
  publisher?: string
  publishedDate?: Date
  isbn?: string
  pages?: number
  duration?: string
  fileSize?: string
  format?: string
  language: string
  tags: string[]
  rating: number
  downloads: number
  views: number
  isBookmarked: boolean
  isAvailable: boolean
  dueDate?: Date
  borrowedDate?: Date
  fine?: number
  coverImage?: string
  url?: string
  accessLevel: "PUBLIC" | "STUDENT" | "FACULTY"
}

interface LibraryStats {
  totalResources: number
  borrowedResources: number
  overdueResources: number
  favoriteResources: number
  totalDownloads: number
  readingHours: number
}

interface ReadingHistory {
  id: string
  resource: LibraryResource
  accessedAt: Date
  duration: number
  progress: number
  completed: boolean
}

export default function StudentLibraryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [resources, setResources] = useState<LibraryResource[]>([])
  const [readingHistory, setReadingHistory] = useState<ReadingHistory[]>([])
  const [libraryStats, setLibraryStats] = useState<LibraryStats | null>(null)
  const [activeTab, setActiveTab] = useState("browse")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("ALL")
  const [filterCategory, setFilterCategory] = useState<string>("ALL")
  const [selectedResource, setSelectedResource] = useState<LibraryResource | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user.role !== "STUDENT") {
      router.push("/auth/signin")
    }
  }, [session, status, router])

  useEffect(() => {
    // Mock data for library resources
    const mockResources: LibraryResource[] = [
      {
        id: "1",
        title: "Introduction to Algorithms",
        description: "Comprehensive guide to algorithms and data structures with detailed explanations and examples.",
        type: "BOOK",
        category: "Computer Science",
        subcategory: "Algorithms",
        author: "Thomas H. Cormen",
        publisher: "MIT Press",
        publishedDate: new Date("2009-07-31"),
        isbn: "978-0262033848",
        pages: 1312,
        language: "English",
        tags: ["algorithms", "data structures", "computer science", "programming"],
        rating: 4.5,
        downloads: 1250,
        views: 3400,
        isBookmarked: true,
        isAvailable: true,
        coverImage: "/books/algorithms.jpg",
        accessLevel: "STUDENT"
      },
      {
        id: "2",
        title: "Clean Code: A Handbook of Agile Software Craftsmanship",
        description: "Learn how to write clean, maintainable code with practical examples and best practices.",
        type: "EBOOK",
        category: "Programming",
        subcategory: "Software Engineering",
        author: "Robert C. Martin",
        publisher: "Prentice Hall",
        publishedDate: new Date("2008-08-01"),
        isbn: "978-0132350884",
        pages: 464,
        fileSize: "5.2 MB",
        format: "PDF",
        language: "English",
        tags: ["clean code", "software engineering", "programming best practices", "agile"],
        rating: 4.7,
        downloads: 890,
        views: 2100,
        isBookmarked: false,
        isAvailable: true,
        coverImage: "/books/clean-code.jpg",
        url: "/library/clean-code.pdf",
        accessLevel: "STUDENT"
      },
      {
        id: "3",
        title: "Machine Learning Fundamentals",
        description: "Video series covering the fundamentals of machine learning algorithms and applications.",
        type: "VIDEO",
        category: "Artificial Intelligence",
        subcategory: "Machine Learning",
        author: "Dr. Andrew Ng",
        duration: "12:34:56",
        fileSize: "1.2 GB",
        format: "MP4",
        language: "English",
        tags: ["machine learning", "AI", "algorithms", "data science"],
        rating: 4.8,
        downloads: 567,
        views: 3400,
        isBookmarked: true,
        isAvailable: true,
        coverImage: "/videos/ml-fundamentals.jpg",
        url: "/library/ml-fundamentals.mp4",
        accessLevel: "STUDENT"
      },
      {
        id: "4",
        title: "Database System Concepts",
        description: "Comprehensive textbook covering database design, implementation, and management.",
        type: "BOOK",
        category: "Database",
        subcategory: "Database Systems",
        author: "Abraham Silberschatz",
        publisher: "McGraw-Hill",
        publishedDate: new Date("2019-03-15"),
        isbn: "978-1260084315",
        pages: 1376,
        language: "English",
        tags: ["database", "SQL", "data management", "DBMS"],
        rating: 4.3,
        downloads: 445,
        views: 1200,
        isBookmarked: false,
        isAvailable: false,
        borrowedDate: new Date("2024-01-15"),
        dueDate: new Date("2024-02-15"),
        fine: 50,
        coverImage: "/books/database-concepts.jpg",
        accessLevel: "STUDENT"
      },
      {
        id: "5",
        title: "Web Development Best Practices",
        description: "Comprehensive guide to modern web development practices and technologies.",
        type: "DOCUMENT",
        category: "Web Development",
        subcategory: "Frontend",
        author: "MDN Web Docs",
        fileSize: "3.8 MB",
        format: "PDF",
        language: "English",
        tags: ["web development", "HTML", "CSS", "JavaScript", "best practices"],
        rating: 4.6,
        downloads: 780,
        views: 1900,
        isBookmarked: true,
        isAvailable: true,
        coverImage: "/docs/web-dev.jpg",
        url: "/library/web-dev-practices.pdf",
        accessLevel: "PUBLIC"
      },
      {
        id: "6",
        title: "Computer Networks Podcast Series",
        description: "Weekly podcast discussing computer networking concepts and latest trends.",
        type: "AUDIO",
        category: "Computer Networks",
        subcategory: "Networking",
        author: "Network Experts",
        duration: "45:23",
        fileSize: "45 MB",
        format: "MP3",
        language: "English",
        tags: ["networking", "protocols", "security", "infrastructure"],
        rating: 4.2,
        downloads: 234,
        views: 890,
        isBookmarked: false,
        isAvailable: true,
        coverImage: "/audio/networks-podcast.jpg",
        url: "/library/networks-podcast.mp3",
        accessLevel: "STUDENT"
      }
    ]
    setResources(mockResources)

    // Mock data for reading history
    const mockReadingHistory: ReadingHistory[] = [
      {
        id: "1",
        resource: mockResources[0],
        accessedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        duration: 120,
        progress: 35,
        completed: false
      },
      {
        id: "2",
        resource: mockResources[1],
        accessedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        duration: 90,
        progress: 100,
        completed: true
      },
      {
        id: "3",
        resource: mockResources[2],
        accessedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        duration: 45,
        progress: 60,
        completed: false
      }
    ]
    setReadingHistory(mockReadingHistory)

    // Mock data for library stats
    const mockLibraryStats: LibraryStats = {
      totalResources: mockResources.length,
      borrowedResources: mockResources.filter(r => !r.isAvailable).length,
      overdueResources: mockResources.filter(r => r.dueDate && isAfter(new Date(), r.dueDate)).length,
      favoriteResources: mockResources.filter(r => r.isBookmarked).length,
      totalDownloads: mockResources.reduce((sum, r) => sum + r.downloads, 0),
      readingHours: 45
    }
    setLibraryStats(mockLibraryStats)
  }, [])

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesType = filterType === "ALL" || resource.type === filterType
    const matchesCategory = filterCategory === "ALL" || resource.category === filterCategory
    return matchesSearch && matchesType && matchesCategory
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "BOOK":
        return <BookOpen className="h-4 w-4" />
      case "EBOOK":
        return <FileText className="h-4 w-4" />
      case "VIDEO":
        return <Video className="h-4 w-4" />
      case "AUDIO":
        return <Headphones className="h-4 w-4" />
      case "DOCUMENT":
        return <FileText className="h-4 w-4" />
      case "LINK":
        return <Link className="h-4 w-4" />
      case "JOURNAL":
        return <Archive className="h-4 w-4" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "BOOK":
        return <Badge variant="default">Book</Badge>
      case "EBOOK":
        return <Badge variant="secondary">E-Book</Badge>
      case "VIDEO":
        return <Badge variant="destructive">Video</Badge>
      case "AUDIO":
        return <Badge variant="outline">Audio</Badge>
      case "DOCUMENT":
        return <Badge variant="secondary">Document</Badge>
      case "LINK":
        return <Badge variant="outline">Link</Badge>
      case "JOURNAL":
        return <Badge variant="default">Journal</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
      }
  }

  const getAvailabilityBadge = (resource: LibraryResource) => {
    if (resource.isAvailable) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Available</Badge>
    } else if (resource.dueDate && isAfter(new Date(), resource.dueDate)) {
      return <Badge variant="destructive">Overdue</Badge>
    } else {
      return <Badge variant="secondary">Borrowed</Badge>
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

  const toggleBookmark = (resourceId: string) => {
    setResources(prev => prev.map(resource => 
      resource.id === resourceId 
        ? { ...resource, isBookmarked: !resource.isBookmarked }
        : resource
    ))
  }

  const openPreview = (resource: LibraryResource) => {
    setSelectedResource(resource)
    setIsPreviewOpen(true)
  }

  const getDaysRemaining = (dueDate?: Date) => {
    if (!dueDate) return null
    
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

  const getBorrowedResources = () => {
    return resources.filter(r => !r.isAvailable)
  }

  const getOverdueResources = () => {
    return resources.filter(r => r.dueDate && isAfter(new Date(), r.dueDate))
  }

  const getBookmarkedResources = () => {
    return resources.filter(r => r.isBookmarked)
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
              <h1 className="text-2xl font-bold text-gray-900">Library & Resources</h1>
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
              <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{libraryStats?.totalResources}</div>
              <p className="text-xs text-muted-foreground">
                Available resources
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Borrowed</CardTitle>
              <BookmarkPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{libraryStats?.borrowedResources}</div>
              <p className="text-xs text-muted-foreground">
                Currently borrowed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{libraryStats?.overdueResources}</div>
              <p className="text-xs text-muted-foreground">
                Return immediately
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reading Hours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{libraryStats?.readingHours}</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="browse">Browse</TabsTrigger>
            <TabsTrigger value="borrowed">Borrowed</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search resources..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Types</SelectItem>
                    <SelectItem value="BOOK">Books</SelectItem>
                    <SelectItem value="EBOOK">E-Books</SelectItem>
                    <SelectItem value="VIDEO">Videos</SelectItem>
                    <SelectItem value="AUDIO">Audio</SelectItem>
                    <SelectItem value="DOCUMENT">Documents</SelectItem>
                    <SelectItem value="JOURNAL">Journals</SelectItem>
                    <SelectItem value="LINK">Links</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Categories</SelectItem>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="Programming">Programming</SelectItem>
                    <SelectItem value="Database">Database</SelectItem>
                    <SelectItem value="Web Development">Web Development</SelectItem>
                    <SelectItem value="Artificial Intelligence">Artificial Intelligence</SelectItem>
                    <SelectItem value="Computer Networks">Computer Networks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Resources Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
                <Card key={resource.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(resource.type)}
                        <CardTitle className="text-lg line-clamp-1">{resource.title}</CardTitle>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleBookmark(resource.id)}
                        >
                          <BookmarkPlus className={`h-4 w-4 ${resource.isBookmarked ? "text-yellow-500 fill-current" : ""}`} />
                        </Button>
                        {getTypeBadge(resource.type)}
                      </div>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {resource.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Author</span>
                        <span className="font-medium">{resource.author}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Category</span>
                        <span className="font-medium">{resource.category}</span>
                      </div>
                      {resource.pages && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Pages</span>
                          <span className="font-medium">{resource.pages}</span>
                        </div>
                      )}
                      {resource.duration && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Duration</span>
                          <span className="font-medium">{resource.duration}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Rating</span>
                        {renderStars(resource.rating)}
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Availability</span>
                        {getAvailabilityBadge(resource)}
                      </div>
                      
                      {resource.dueDate && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Due Date</span>
                          <span className={`font-medium ${getDaysRemaining(resource.dueDate)?.color}`}>
                            {format(resource.dueDate, "PPP")}
                          </span>
                        </div>
                      )}
                      
                      {resource.fine && resource.fine > 0 && (
                        <div className="p-2 bg-red-50 rounded">
                          <p className="text-sm text-red-600 font-medium">
                            Fine: ₹{resource.fine}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex space-x-2 pt-2">
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => openPreview(resource)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                        {resource.isAvailable && (
                          <Button size="sm" variant="outline">
                            <BookmarkPlus className="h-4 w-4 mr-2" />
                            Borrow
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="borrowed" className="space-y-6">
            <div className="space-y-4">
              {getBorrowedResources().length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium">No borrowed resources</p>
                    <p className="text-gray-500">You haven't borrowed any resources yet</p>
                  </CardContent>
                </Card>
              ) : (
                getBorrowedResources().map((resource) => (
                  <Card key={resource.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="w-16 h-20 bg-gray-200 rounded flex items-center justify-center">
                            {getTypeIcon(resource.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-medium text-lg">{resource.title}</h3>
                              {getTypeBadge(resource.type)}
                              {getAvailabilityBadge(resource)}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{resource.author}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>Borrowed: {resource.borrowedDate ? format(resource.borrowedDate, "PPP") : "N/A"}</span>
                              {resource.dueDate && (
                                <span className={getDaysRemaining(resource.dueDate)?.color}>
                                  Due: {format(resource.dueDate, "PPP")}
                                </span>
                              )}
                            </div>
                            {resource.fine && resource.fine > 0 && (
                              <div className="mt-2 p-2 bg-red-50 rounded inline-block">
                                <p className="text-sm text-red-600 font-medium">
                                  Fine: ₹{resource.fine}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button size="sm">
                            Return
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <div className="space-y-4">
              {readingHistory.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium">No reading history</p>
                    <p className="text-gray-500">Your reading history will appear here</p>
                  </CardContent>
                </Card>
              ) : (
                readingHistory.map((history) => (
                  <Card key={history.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="w-16 h-20 bg-gray-200 rounded flex items-center justify-center">
                            {getTypeIcon(history.resource.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-medium text-lg">{history.resource.title}</h3>
                              {getTypeBadge(history.resource.type)}
                              {history.completed && (
                                <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{history.resource.author}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>Accessed: {format(history.accessedAt, "PPP")}</span>
                              <span>Duration: {history.duration} min</span>
                              <span>Progress: {history.progress}%</span>
                            </div>
                            <div className="mt-2">
                              <Progress value={history.progress} className="h-2 w-48" />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button size="sm">
                            <BookmarkPlus className="h-4 w-4 mr-2" />
                            Borrow Again
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="favorites" className="space-y-6">
            <div className="space-y-4">
              {getBookmarkedResources().length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium">No favorite resources</p>
                    <p className="text-gray-500">Bookmark resources to see them here</p>
                  </CardContent>
                </Card>
              ) : (
                getBookmarkedResources().map((resource) => (
                  <Card key={resource.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="w-16 h-20 bg-gray-200 rounded flex items-center justify-center">
                            {getTypeIcon(resource.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-medium text-lg">{resource.title}</h3>
                              {getTypeBadge(resource.type)}
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{resource.author}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>{resource.category}</span>
                              {renderStars(resource.rating)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => toggleBookmark(resource.id)}
                          >
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { category: "Computer Science", count: resources.filter(r => r.category === "Computer Science").length, icon: "💻" },
                { category: "Programming", count: resources.filter(r => r.category === "Programming").length, icon: "👨‍💻" },
                { category: "Database", count: resources.filter(r => r.category === "Database").length, icon: "🗄️" },
                { category: "Web Development", count: resources.filter(r => r.category === "Web Development").length, icon: "🌐" },
                { category: "Artificial Intelligence", count: resources.filter(r => r.category === "Artificial Intelligence").length, icon: "🤖" },
                { category: "Computer Networks", count: resources.filter(r => r.category === "Computer Networks").length, icon: "🌐" }
              ].map((category) => (
                <Card key={category.category} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-4">{category.icon}</div>
                    <h3 className="font-medium text-lg mb-2">{category.category}</h3>
                    <p className="text-sm text-gray-600">{category.count} resources</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Resource Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedResource?.title}</DialogTitle>
            <DialogDescription>
              {selectedResource?.author} • {selectedResource?.category}
            </DialogDescription>
          </DialogHeader>
          
          {selectedResource && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <img 
                    src={selectedResource.coverImage || "/placeholder-book.jpg"} 
                    alt={selectedResource.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium">Description</h4>
                    <p className="text-sm text-gray-600">{selectedResource.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Type:</span>
                      <span className="ml-2 font-medium">{selectedResource.type}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Category:</span>
                      <span className="ml-2 font-medium">{selectedResource.category}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Author:</span>
                      <span className="ml-2 font-medium">{selectedResource.author}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Language:</span>
                      <span className="ml-2 font-medium">{selectedResource.language}</span>
                    </div>
                    {selectedResource.pages && (
                      <div>
                        <span className="text-gray-500">Pages:</span>
                        <span className="ml-2 font-medium">{selectedResource.pages}</span>
                      </div>
                    )}
                    {selectedResource.duration && (
                      <div>
                        <span className="text-gray-500">Duration:</span>
                        <span className="ml-2 font-medium">{selectedResource.duration}</span>
                      </div>
                    )}
                    {selectedResource.fileSize && (
                      <div>
                        <span className="text-gray-500">File Size:</span>
                        <span className="ml-2 font-medium">{selectedResource.fileSize}</span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-medium">Rating</h4>
                    {renderStars(selectedResource.rating)}
                  </div>
                  
                  <div>
                    <h4 className="font-medium">Tags</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedResource.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => toggleBookmark(selectedResource.id)}>
                  <BookmarkPlus className={`h-4 w-4 mr-2 ${selectedResource.isBookmarked ? "text-yellow-500 fill-current" : ""}`} />
                  {selectedResource.isBookmarked ? "Remove from Favorites" : "Add to Favorites"}
                </Button>
                {selectedResource.isAvailable && (
                  <Button>
                    <BookmarkPlus className="h-4 w-4 mr-2" />
                    Borrow Resource
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}