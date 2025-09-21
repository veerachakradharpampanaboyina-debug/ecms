"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { 
  GraduationCap, 
  Building, 
  Users, 
  BookOpen, 
  Award,
  Calendar,
  MapPin,
  Camera,
  Search,
  Filter,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  ZoomIn
} from "lucide-react"

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [viewMode, setViewMode] = useState("grid")

  const categories = [
    { id: "all", name: "All Photos", count: 48 },
    { id: "campus", name: "Campus", count: 12 },
    { id: "infrastructure", name: "Infrastructure", count: 10 },
    { id: "events", name: "Events", count: 15 },
    { id: "laboratories", name: "Laboratories", count: 8 },
    { id: "sports", name: "Sports", count: 3 }
  ]

  const galleryItems = [
    // Campus Photos
    {
      id: 1,
      category: "campus",
      title: "Main Campus View",
      description: "Beautiful view of our main campus building",
      date: "2024-01-15",
      location: "Main Campus",
      featured: true
    },
    {
      id: 2,
      category: "campus",
      title: "Central Library",
      description: "State-of-the-art central library with vast collection",
      date: "2024-01-20",
      location: "Library Block"
    },
    {
      id: 3,
      category: "campus",
      title: "Campus Garden",
      description: "Lush green garden perfect for relaxation",
      date: "2024-02-01",
      location: "Campus Grounds"
    },
    {
      id: 4,
      category: "campus",
      title: "Auditorium",
      description: "Modern auditorium for events and ceremonies",
      date: "2024-02-10",
      location: "Main Building"
    },
    {
      id: 5,
      category: "campus",
      title: "Cafeteria",
      description: "Spacious cafeteria with variety of food options",
      date: "2024-02-15",
      location: "Cafeteria Block"
    },
    {
      id: 6,
      category: "campus",
      title: "Hostel Complex",
      description: "Comfortable hostel accommodation for students",
      date: "2024-02-20",
      location: "Hostel Block"
    },
    {
      id: 7,
      category: "campus",
      title: "Sports Ground",
      description: "Large sports ground for various activities",
      date: "2024-03-01",
      location: "Sports Complex"
    },
    {
      id: 8,
      category: "campus",
      title: "Parking Area",
      description: "Well-organized parking facility",
      date: "2024-03-05",
      location: "Parking Area"
    },
    {
      id: 9,
      category: "campus",
      title: "Campus Entrance",
      description: "Grand entrance to the college campus",
      date: "2024-03-10",
      location: "Main Gate"
    },
    {
      id: 10,
      category: "campus",
      title: "Administrative Block",
      description: "Administrative offices and meeting rooms",
      date: "2024-03-15",
      location: "Admin Block"
    },
    {
      id: 11,
      category: "campus",
      title: "Campus Road",
      description: "Well-maintained internal roads",
      date: "2024-03-20",
      location: "Internal Roads"
    },
    {
      id: 12,
      category: "campus",
      title: "Night View",
      description: "Beautiful campus illumination at night",
      date: "2024-03-25",
      location: "Main Campus"
    },

    // Infrastructure Photos
    {
      id: 13,
      category: "infrastructure",
      title: "Smart Classrooms",
      description: "Technology-enabled smart classrooms",
      date: "2024-01-18",
      location: "Academic Block"
    },
    {
      id: 14,
      category: "infrastructure",
      title: "Computer Labs",
      description: "Advanced computer laboratories",
      date: "2024-01-25",
      location: "CSE Block"
    },
    {
      id: 15,
      category: "infrastructure",
      title: "Workshop",
      description: "Fully equipped mechanical workshop",
      date: "2024-02-05",
      location: "ME Block"
    },
    {
      id: 16,
      category: "infrastructure",
      title: "Seminar Hall",
      description: "Modern seminar hall with AV facilities",
      date: "2024-02-12",
      location: "Academic Block"
    },
    {
      id: 17,
      category: "infrastructure",
      title: "Conference Room",
      description: "Professional conference room",
      date: "2024-02-18",
      location: "Admin Block"
    },
    {
      id: 18,
      category: "infrastructure",
      title: "Exhibition Hall",
      description: "Space for exhibitions and displays",
      date: "2024-02-25",
      location: "Cultural Center"
    },
    {
      id: 19,
      category: "infrastructure",
      title: "Medical Center",
      description: "On-campus medical facilities",
      date: "2024-03-02",
      location: "Medical Block"
    },
    {
      id: 20,
      category: "infrastructure",
      title: "Security Office",
      description: "24/7 security surveillance",
      date: "2024-03-08",
      location: "Main Gate"
    },
    {
      id: 21,
      category: "infrastructure",
      title: "Water Treatment",
      description: "Water treatment and recycling plant",
      date: "2024-03-12",
      location: "Utility Block"
    },
    {
      id: 22,
      category: "infrastructure",
      title: "Power Backup",
      description: "Uninterrupted power supply systems",
      date: "2024-03-18",
      location: "Utility Block"
    },

    // Events Photos
    {
      id: 23,
      category: "events",
      title: "Annual Day Celebration",
      description: "Grand annual day celebration",
      date: "2024-01-12",
      location: "Auditorium"
    },
    {
      id: 24,
      category: "events",
      title: "Tech Fest 2024",
      description: "Annual technical festival",
      date: "2024-01-22",
      location: "Main Ground"
    },
    {
      id: 25,
      category: "events",
      title: "Cultural Fest",
      description: "Cultural performances and competitions",
      date: "2024-02-08",
      location: "Cultural Center"
    },
    {
      id: 26,
      category: "events",
      title: "Sports Meet",
      description: "Annual sports competition",
      date: "2024-02-16",
      location: "Sports Complex"
    },
    {
      id: 27,
      category: "events",
      title: "Guest Lecture",
      description: "Industry expert guest lecture",
      date: "2024-02-22",
      location: "Seminar Hall"
    },
    {
      id: 28,
      category: "events",
      title: "Workshop",
      description: "Technical workshop for students",
      date: "2024-03-06",
      location: "Workshop Hall"
    },
    {
      id: 29,
      category: "events",
      title: "Alumni Meet",
      description: "Alumni reunion and networking",
      date: "2024-03-14",
      location: "Conference Hall"
    },
    {
      id: 30,
      category: "events",
      title: "Freshers Party",
      description: "Welcome party for new students",
      date: "2024-03-21",
      location: "Cultural Center"
    },
    {
      id: 31,
      category: "events",
      title: "Graduation Ceremony",
      description: "Convocation ceremony for graduates",
      date: "2024-03-28",
      location: "Auditorium"
    },
    {
      id: 32,
      category: "events",
      title: "Industry Visit",
      description: "Student visit to industry partner",
      date: "2024-04-02",
      location: "Industry Partner"
    },
    {
      id: 33,
      category: "events",
      title: "Blood Donation Camp",
      description: "Social service initiative",
      date: "2024-04-08",
      location: "Medical Center"
    },
    {
      id: 34,
      category: "events",
      title: "Tree Plantation Drive",
      description: "Environmental awareness campaign",
      date: "2024-04-12",
      location: "Campus Grounds"
    },
    {
      id: 35,
      category: "events",
      title: "Career Fair",
      description: "Job fair and placement drive",
      date: "2024-04-18",
      location: "Exhibition Hall"
    },
    {
      id: 36,
      category: "events",
      title: "Research Symposium",
      description: "Student research presentations",
      date: "2024-04-22",
      location: "Conference Hall"
    },
    {
      id: 37,
      category: "events",
      title: "Faculty Development",
      description: "Faculty training program",
      date: "2024-04-26",
      location: "Seminar Hall"
    },

    // Laboratories Photos
    {
      id: 38,
      category: "laboratories",
      title: "Physics Lab",
      description: "Well-equipped physics laboratory",
      date: "2024-01-16",
      location: "Science Block"
    },
    {
      id: 39,
      category: "laboratories",
      title: "Chemistry Lab",
      description: "Modern chemistry laboratory",
      date: "2024-01-24",
      location: "Science Block"
    },
    {
      id: 40,
      category: "laboratories",
      title: "Electronics Lab",
      description: "Advanced electronics lab",
      date: "2024-02-06",
      location: "ECE Block"
    },
    {
      id: 41,
      category: "laboratories",
      title: "Mechanical Lab",
      description: "Mechanical engineering laboratory",
      date: "2024-02-14",
      location: "ME Block"
    },
    {
      id: 42,
      category: "laboratories",
      title: "Civil Lab",
      description: "Civil engineering laboratory",
      date: "2024-02-20",
      location: "CE Block"
    },
    {
      id: 43,
      category: "laboratories",
      title: "Electrical Lab",
      description: "Electrical engineering laboratory",
      date: "2024-02-28",
      location: "EE Block"
    },
    {
      id: 44,
      category: "laboratories",
      title: "Chemical Lab",
      description: "Chemical engineering laboratory",
      date: "2024-03-04",
      location: "CHE Block"
    },
    {
      id: 45,
      category: "laboratories",
      title: "Language Lab",
      description: "Digital language laboratory",
      date: "2024-03-16",
      location: "Language Center"
    },

    // Sports Photos
    {
      id: 46,
      category: "sports",
      title: "Cricket Ground",
      description: "Professional cricket ground",
      date: "2024-02-11",
      location: "Sports Complex"
    },
    {
      id: 47,
      category: "sports",
      title: "Basketball Court",
      description: "Indoor basketball court",
      date: "2024-02-19",
      location: "Sports Complex"
    },
    {
      id: 48,
      category: "sports",
      title: "Gymnasium",
      description: "Well-equipped gymnasium",
      date: "2024-03-11",
      location: "Sports Complex"
    }
  ]

  const filteredItems = selectedCategory === "all" 
    ? galleryItems 
    : galleryItems.filter(item => item.category === selectedCategory)

  const featuredItems = galleryItems.filter(item => item.featured)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Campus Gallery
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-blue-100">
              Explore our beautiful campus, state-of-the-art facilities, and vibrant student life
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                <span>{galleryItems.length} Photos</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>Updated Daily</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Photos */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Photos
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Handpicked showcase of our campus highlights
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredItems.slice(0, 6).map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gray-200 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Camera className="h-16 w-16 text-gray-400" />
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-yellow-500 text-black">Featured</Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{item.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{item.location}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Filters */}
      <section className="py-8 bg-gray-50 sticky top-0 z-10 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full sm:w-auto">
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
                {categories.map((category) => (
                  <TabsTrigger key={category.id} value={category.id} className="text-xs">
                    {category.name}
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {category.count}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {categories.find(c => c.id === selectedCategory)?.name || "All Photos"}
            </h2>
            <p className="text-xl text-gray-600">
              {filteredItems.length} photos found
            </p>
          </div>

          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                  <div className="aspect-square bg-gray-200 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Camera className="h-20 w-20 text-gray-400" />
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="secondary" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <ZoomIn className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <div className="aspect-video bg-gray-200 mb-4 flex items-center justify-center">
                            <Camera className="h-32 w-32 text-gray-400" />
                          </div>
                          <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                          <p className="text-gray-600 mb-4">{item.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{item.date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{item.location}</span>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-1">{item.title}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{item.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{item.location}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="flex flex-col sm:flex-row">
                    <div className="sm:w-48 sm:h-48 bg-gray-200 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Camera className="h-16 w-16 text-gray-400" />
                      </div>
                    </div>
                    <CardContent className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-xl mb-2">{item.title}</h3>
                          <p className="text-gray-600 mb-4">{item.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{item.date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{item.location}</span>
                            </div>
                          </div>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <ZoomIn className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <div className="aspect-video bg-gray-200 mb-4 flex items-center justify-center">
                              <Camera className="h-32 w-32 text-gray-400" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                            <p className="text-gray-600 mb-4">{item.description}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>{item.date}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>{item.location}</span>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{galleryItems.length}</div>
              <div className="text-gray-600">Total Photos</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">{categories.length - 1}</div>
              <div className="text-gray-600">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">{featuredItems.length}</div>
              <div className="text-gray-600">Featured</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-red-600 mb-2">Daily</div>
              <div className="text-gray-600">Updates</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Visit Our Campus
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Experience our world-class facilities and vibrant campus life in person
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
              Schedule a Visit
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600">
              Virtual Tour
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}