"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Calendar, 
  User, 
  Search, 
  Filter, 
  ArrowRight,
  Clock,
  MapPin,
  Share2,
  Heart,
  MessageCircle,
  TrendingUp,
  Star,
  Award,
  GraduationCap,
  Building,
  Users,
  BookOpen,
  Target,
  Lightbulb
} from "lucide-react"

export default function NewsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedYear, setSelectedYear] = useState("2024")

  const categories = [
    { id: "all", name: "All News", icon: Star },
    { id: "academic", name: "Academic", icon: BookOpen },
    { id: "events", name: "Events", icon: Calendar },
    { id: "achievements", name: "Achievements", icon: Award },
    { id: "research", name: "Research", icon: Target },
    { id: "infrastructure", name: "Infrastructure", icon: Building },
    { id: "admissions", name: "Admissions", icon: GraduationCap },
    { id: "sports", name: "Sports", icon: Users }
  ]

  const newsItems = [
    // Academic News
    {
      id: 1,
      title: "College Receives NAAC A+ Grade Accreditation",
      excerpt: "Our institution has been awarded the prestigious NAAC A+ grade for excellence in higher education",
      content: "In a remarkable achievement, our college has been awarded the prestigious NAAC A+ grade with a CGPA of 3.6 out of 4. This recognition comes after a rigorous evaluation process by the National Assessment and Accreditation Council. The achievement reflects our commitment to academic excellence, research innovation, and holistic student development.",
      category: "academic",
      date: "2024-04-15",
      author: "Admin",
      featured: true,
      trending: true,
      image: "/api/placeholder/800/400",
      readTime: "5 min read",
      tags: ["NAAC", "Accreditation", "Excellence"]
    },
    {
      id: 2,
      title: "New Academic Programs Launched for 2024-25",
      excerpt: "Introduction of B.Tech in Artificial Intelligence and Data Science programs",
      content: "Keeping pace with industry demands, we are launching two new undergraduate programs: B.Tech in Artificial Intelligence and B.Tech in Data Science. These programs have been designed in consultation with industry experts and will provide students with cutting-edge knowledge and skills.",
      category: "academic",
      date: "2024-04-10",
      author: "Academic Dean",
      featured: false,
      trending: false,
      image: "/api/placeholder/800/400",
      readTime: "4 min read",
      tags: ["New Programs", "AI", "Data Science"]
    },
    {
      id: 3,
      title: "Semester Examination Results Announced",
      excerpt: "Outstanding performance by students with 95% pass percentage",
      content: "The results for the even semester examinations have been announced, with students showing exceptional performance. The overall pass percentage stands at 95%, with several students securing distinction in their respective programs.",
      category: "academic",
      date: "2024-04-05",
      author: "Examination Cell",
      featured: false,
      trending: false,
      image: "/api/placeholder/800/400",
      readTime: "3 min read",
      tags: ["Results", "Examination", "Performance"]
    },

    // Events News
    {
      id: 4,
      title: "Tech Fest 2024: A Grand Success",
      excerpt: "Annual technical festival attracts participants from 50+ colleges",
      content: "Tech Fest 2024, our annual technical festival, concluded with resounding success. The event saw participation from over 50 colleges across the country, with more than 2000 students taking part in various technical competitions, workshops, and seminars.",
      category: "events",
      date: "2024-03-28",
      author: "Student Council",
      featured: true,
      trending: true,
      image: "/api/placeholder/800/400",
      readTime: "6 min read",
      tags: ["Tech Fest", "Competition", "Workshop"]
    },
    {
      id: 5,
      title: "Alumni Meet 2024: Reconnecting Generations",
      excerpt: "Grand reunion of alumni from across the globe",
      content: "The Alumni Meet 2024 brought together graduates from different batches, creating a platform for networking and knowledge sharing. The event featured panel discussions, cultural programs, and the launch of the alumni mentorship program.",
      category: "events",
      date: "2024-03-20",
      author: "Alumni Association",
      featured: false,
      trending: false,
      image: "/api/placeholder/800/400",
      readTime: "5 min read",
      tags: ["Alumni", "Reunion", "Networking"]
    },
    {
      id: 6,
      title: "International Conference on Emerging Technologies",
      excerpt: "Global experts gather to discuss future technological trends",
      content: "Our college hosted an International Conference on Emerging Technologies, bringing together researchers, academicians, and industry professionals from around the world. The conference featured keynote speeches, paper presentations, and technical sessions.",
      category: "events",
      date: "2024-03-15",
      author: "Conference Committee",
      featured: false,
      trending: false,
      image: "/api/placeholder/800/400",
      readTime: "7 min read",
      tags: ["Conference", "Technology", "Research"]
    },

    // Achievements News
    {
      id: 7,
      title: "Students Win National Level Hackathon",
      excerpt: "Our team secures first position in Smart India Hackathon",
      content: "In a proud moment for our institution, a team of our students won the first prize in the Smart India Hackathon 2024. The team developed an innovative solution for smart waste management using IoT and AI technologies.",
      category: "achievements",
      date: "2024-04-08",
      author: "Training & Placement",
      featured: true,
      trending: true,
      image: "/api/placeholder/800/400",
      readTime: "4 min read",
      tags: ["Hackathon", "Win", "Innovation"]
    },
    {
      id: 8,
      title: "Faculty Member Receives Best Researcher Award",
      excerpt: "Dr. Sarah Johnson honored for outstanding contributions to research",
      content: "Dr. Sarah Johnson from the Computer Science department has been awarded the 'Best Researcher Award' by the International Association of Computer Science. Her research in machine learning and artificial intelligence has been widely recognized.",
      category: "achievements",
      date: "2024-04-03",
      author: "Admin",
      featured: false,
      trending: false,
      image: "/api/placeholder/800/400",
      readTime: "4 min read",
      tags: ["Award", "Research", "Faculty"]
    },
    {
      id: 9,
      title: "Sports Team Wins State Championship",
      excerpt: "Our cricket team emerges victorious in state-level tournament",
      content: "The college cricket team has won the state-level inter-college tournament, bringing laurels to the institution. The team showed exceptional skill and teamwork throughout the tournament.",
      category: "achievements",
      date: "2024-03-25",
      author: "Sports Department",
      featured: false,
      trending: false,
      image: "/api/placeholder/800/400",
      readTime: "3 min read",
      tags: ["Sports", "Championship", "Victory"]
    },

    // Research News
    {
      id: 10,
      title: "Breakthrough in Renewable Energy Research",
      excerpt: "Research team develops innovative solar panel technology",
      content: "Our research team in the Electrical Engineering department has made a significant breakthrough in solar panel technology. The new design promises 40% higher efficiency at a lower cost, potentially revolutionizing the renewable energy sector.",
      category: "research",
      date: "2024-04-12",
      author: "Research Cell",
      featured: true,
      trending: true,
      image: "/api/placeholder/800/400",
      readTime: "6 min read",
      tags: ["Research", "Renewable Energy", "Innovation"]
    },
    {
      id: 11,
      title: "Collaboration with Industry Giants for Research",
      excerpt: "MoU signed with leading tech companies for joint research projects",
      content: "The college has signed Memorandums of Understanding with several leading technology companies for collaborative research projects. This partnership will provide students and faculty with opportunities to work on cutting-edge technologies.",
      category: "research",
      date: "2024-04-07",
      author: "Industry Relations",
      featured: false,
      trending: false,
      image: "/api/placeholder/800/400",
      readTime: "5 min read",
      tags: ["Collaboration", "Industry", "Research"]
    },

    // Infrastructure News
    {
      id: 12,
      title: "New Advanced Computing Lab Inaugurated",
      excerpt: "State-of-the-art computing facility with latest technology",
      content: "A new advanced computing laboratory has been inaugurated, equipped with the latest hardware and software. The lab will support high-performance computing, AI research, and advanced software development projects.",
      category: "infrastructure",
      date: "2024-04-02",
      author: "Admin",
      featured: false,
      trending: false,
      image: "/api/placeholder/800/400",
      readTime: "4 min read",
      tags: ["Infrastructure", "Lab", "Technology"]
    },

    // Admissions News
    {
      id: 13,
      title: "Admissions 2024-25: Record Applications Received",
      excerpt: "Over 10,000 applications received for various programs",
      content: "The admissions process for the academic year 2024-25 has seen overwhelming response, with over 10,000 applications received for various undergraduate and postgraduate programs. This reflects the growing reputation of our institution.",
      category: "admissions",
      date: "2024-03-30",
      author: "Admissions Office",
      featured: false,
      trending: false,
      image: "/api/placeholder/800/400",
      readTime: "4 min read",
      tags: ["Admissions", "Applications", "Record"]
    },

    // Sports News
    {
      id: 14,
      title: "Annual Sports Meet Concludes with Enthusiasm",
      excerpt: "Three-day sports event showcases athletic talent",
      content: "The annual sports meet concluded with great enthusiasm, with students participating in various athletic events. The meet featured track and field events, team sports, and cultural performances.",
      category: "sports",
      date: "2024-03-18",
      author: "Sports Department",
      featured: false,
      trending: false,
      image: "/api/placeholder/800/400",
      readTime: "4 min read",
      tags: ["Sports", "Athletics", "Competition"]
    }
  ]

  const filteredNews = newsItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const featuredNews = newsItems.filter(item => item.featured)
  const trendingNews = newsItems.filter(item => item.trending)

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    return category ? category.icon : Star
  }

  const getCategoryColor = (categoryId: string) => {
    const colors = {
      academic: "bg-blue-100 text-blue-800",
      events: "bg-green-100 text-green-800",
      achievements: "bg-yellow-100 text-yellow-800",
      research: "bg-purple-100 text-purple-800",
      infrastructure: "bg-red-100 text-red-800",
      admissions: "bg-indigo-100 text-indigo-800",
      sports: "bg-orange-100 text-orange-800"
    }
    return colors[categoryId as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              News & Updates
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-blue-100">
              Stay updated with the latest happenings, achievements, and events at our institution
            </p>
            <div className="flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>Latest Updates</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                <span>Trending News</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured News */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured News
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Highlighted stories from our campus
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {featuredNews.slice(0, 2).map((item) => {
              const CategoryIcon = getCategoryIcon(item.category)
              return (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gray-200 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Calendar className="h-16 w-16 text-gray-400" />
                    </div>
                    <div className="absolute top-4 left-4">
                      <Badge className={getCategoryColor(item.category)}>
                        <CategoryIcon className="h-3 w-3 mr-1" />
                        {item.category}
                      </Badge>
                    </div>
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-yellow-500 text-black">Featured</Badge>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-3 line-clamp-2">{item.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{item.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(item.date)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{item.author}</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Read More
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Trending News */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trending Now
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Most popular stories this week
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trendingNews.slice(0, 3).map((item) => {
              const CategoryIcon = getCategoryIcon(item.category)
              return (
                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={getCategoryColor(item.category)}>
                        <CategoryIcon className="h-3 w-3 mr-1" />
                        {item.category}
                      </Badge>
                      <Badge className="bg-red-100 text-red-800">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Trending
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.excerpt}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(item.date)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          <span>234</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          <span>45</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* News Filters */}
      <section className="py-8 bg-white sticky top-0 z-10 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search news..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-80"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* News List */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Latest News
            </h2>
            <p className="text-xl text-gray-600">
              {filteredNews.length} articles found
            </p>
          </div>

          <div className="space-y-6">
            {filteredNews.map((item) => {
              const CategoryIcon = getCategoryIcon(item.category)
              return (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="flex flex-col sm:flex-row">
                    <div className="sm:w-64 sm:h-48 bg-gray-200 relative flex-shrink-0">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Calendar className="h-16 w-16 text-gray-400" />
                      </div>
                    </div>
                    <CardContent className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge className={getCategoryColor(item.category)}>
                            <CategoryIcon className="h-3 w-3 mr-1" />
                            {item.category}
                          </Badge>
                          {item.featured && (
                            <Badge className="bg-yellow-500 text-black">Featured</Badge>
                          )}
                          {item.trending && (
                            <Badge className="bg-red-100 text-red-800">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Trending
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Heart className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold mb-3 line-clamp-2">{item.title}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-3">{item.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(item.date)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{item.author}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{item.readTime}</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Read More
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-4">
                        {item.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Stay Updated
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Subscribe to our newsletter and never miss important updates
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input placeholder="Enter your email" className="flex-1" />
            <Button className="bg-blue-600 hover:bg-blue-700">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}