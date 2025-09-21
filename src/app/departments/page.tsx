"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Building, 
  Users, 
  BookOpen, 
  Award, 
  Target,
  Lightbulb,
  Cpu,
  Zap,
  Wrench,
  FlaskConical,
  Calculator,
  ChevronRight,
  Star,
  TrendingUp
} from "lucide-react"
import Link from "next/link"

export default function DepartmentsPage() {
  const departments = [
    {
      id: "cse",
      name: "Computer Science Engineering",
      code: "CSE",
      icon: Cpu,
      color: "bg-blue-100 text-blue-800",
      description: "Pioneering innovation in software, AI, and emerging technologies",
      hod: "Dr. John Smith",
      faculty: 45,
      students: 1200,
      established: 1998,
      labs: 8,
      researchAreas: ["Artificial Intelligence", "Machine Learning", "Data Science", "Cybersecurity", "Cloud Computing"],
      courses: ["B.Tech CSE", "M.Tech CSE", "PhD Computer Science"],
      achievements: [
        "100% Placement for last 5 years",
        "Industry collaboration with top tech companies",
        "State-of-the-art AI and ML labs",
        "Research publications in top conferences"
      ],
      facilities: [
        "Advanced Computing Lab",
        "AI & Machine Learning Lab",
        "Cybersecurity Lab",
        "Cloud Computing Lab",
        "IoT Research Center"
      ]
    },
    {
      id: "ece",
      name: "Electronics & Communication Engineering",
      code: "ECE",
      icon: Zap,
      color: "bg-green-100 text-green-800",
      description: "Excellence in electronics, communication systems, and VLSI design",
      hod: "Dr. Jane Doe",
      faculty: 38,
      students: 980,
      established: 1999,
      labs: 6,
      researchAreas: ["VLSI Design", "Signal Processing", "Communication Systems", "Embedded Systems", "IoT"],
      courses: ["B.Tech ECE", "M.Tech VLSI", "PhD Electronics"],
      achievements: [
        "Patented research in VLSI design",
        "MoU with leading electronics companies",
        "Excellent placement records",
        "Advanced research facilities"
      ],
      facilities: [
        "VLSI Design Lab",
        "Signal Processing Lab",
        "Communication Systems Lab",
        "Embedded Systems Lab",
        "Electronics Workshop"
      ]
    },
    {
      id: "me",
      name: "Mechanical Engineering",
      code: "ME",
      icon: Wrench,
      color: "bg-red-100 text-red-800",
      description: "Excellence in mechanical design, thermal sciences, and manufacturing",
      hod: "Dr. Robert Johnson",
      faculty: 42,
      students: 1100,
      established: 1998,
      labs: 10,
      researchAreas: ["Thermal Engineering", "Manufacturing", "Automobile Engineering", "CAD/CAM", "Robotics"],
      courses: ["B.Tech ME", "M.Tech Thermal", "PhD Mechanical"],
      achievements: [
        "Industry-ready curriculum",
        "Advanced manufacturing lab",
        "Research excellence in thermal engineering",
        "Strong industry partnerships"
      ],
      facilities: [
        "Thermal Engineering Lab",
        "Manufacturing Workshop",
        "CAD/CAM Lab",
        "Automobile Lab",
        "Robotics Lab"
      ]
    },
    {
      id: "ce",
      name: "Civil Engineering",
      code: "CE",
      icon: Building,
      color: "bg-yellow-100 text-yellow-800",
      description: "Building sustainable infrastructure for tomorrow's world",
      hod: "Dr. Emily Davis",
      faculty: 35,
      students: 850,
      established: 2000,
      labs: 7,
      researchAreas: ["Structural Engineering", "Transportation Engineering", "Environmental Engineering", "Geotechnical", "Construction Management"],
      courses: ["B.Tech CE", "M.Tech Structural", "PhD Civil"],
      achievements: [
        "Sustainable construction research",
        "Industry collaboration with top construction firms",
        "Excellent infrastructure facilities",
        "Research publications in top journals"
      ],
      facilities: [
        "Structural Engineering Lab",
        "Transportation Engineering Lab",
        "Environmental Engineering Lab",
        "Geotechnical Lab",
        "Surveying Lab"
      ]
    },
    {
      id: "ee",
      name: "Electrical Engineering",
      code: "EE",
      icon: Zap,
      color: "bg-purple-100 text-purple-800",
      description: "Power systems, control engineering, and renewable energy solutions",
      hod: "Dr. Michael Wilson",
      faculty: 32,
      students: 750,
      established: 2001,
      labs: 6,
      researchAreas: ["Power Systems", "Control Engineering", "Renewable Energy", "Electric Drives", "Power Electronics"],
      courses: ["B.Tech EE", "M.Tech Power Systems", "PhD Electrical"],
      achievements: [
        "Renewable energy research excellence",
        "Power systems simulation lab",
        "Industry collaboration with power sector",
        "Research publications in power systems"
      ],
      facilities: [
        "Power Systems Lab",
        "Control Engineering Lab",
        "Renewable Energy Lab",
        "Electric Drives Lab",
        "Power Electronics Lab"
      ]
    },
    {
      id: "che",
      name: "Chemical Engineering",
      code: "CHE",
      icon: FlaskConical,
      color: "bg-indigo-100 text-indigo-800",
      description: "Innovating chemical processes for sustainable industrial solutions",
      hod: "Dr. Sarah Brown",
      faculty: 28,
      students: 620,
      established: 2002,
      labs: 8,
      researchAreas: ["Process Engineering", "Environmental Technology", "Polymer Science", "Biochemical Engineering", "Industrial Chemistry"],
      courses: ["B.Tech CHE", "M.Tech Process", "PhD Chemical"],
      achievements: [
        "Process optimization research",
        "Environmental technology solutions",
        "Industry collaboration with chemical companies",
        "Research excellence in polymer science"
      ],
      facilities: [
        "Process Engineering Lab",
        "Environmental Technology Lab",
        "Polymer Science Lab",
        "Biochemical Engineering Lab",
        "Industrial Chemistry Lab"
      ]
    }
  ]

  const stats = [
    { icon: Building, label: "Departments", value: "6" },
    { icon: Users, label: "Faculty Members", value: "220+" },
    { icon: BookOpen, label: "Programs Offered", value: "18" },
    { icon: Target, label: "Research Areas", value: "30+" },
    { icon: Award, label: "Labs & Facilities", value: "45+" },
    { icon: Star, label: "Students Enrolled", value: "5500+" }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Academic Departments
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-blue-100">
              Explore our diverse departments offering world-class engineering education and research opportunities
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <stat.icon className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Departments Overview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Departments
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Six specialized departments offering comprehensive engineering programs
            </p>
          </div>

          <Tabs defaultValue="cse" className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
              {departments.map((dept) => (
                <TabsTrigger key={dept.id} value={dept.id} className="text-xs">
                  {dept.code}
                </TabsTrigger>
              ))}
            </TabsList>

            {departments.map((dept) => {
              const DeptIcon = dept.icon
              return (
                <TabsContent key={dept.id} value={dept.id} className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${dept.color}`}>
                          <DeptIcon className="h-8 w-8" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-2xl">{dept.name}</CardTitle>
                          <CardDescription className="text-lg">{dept.description}</CardDescription>
                          <div className="flex flex-wrap gap-2 mt-3">
                            <Badge variant="outline">Established: {dept.established}</Badge>
                            <Badge variant="outline">HOD: {dept.hod}</Badge>
                            <Badge variant="outline">{dept.faculty} Faculty</Badge>
                            <Badge variant="outline">{dept.students} Students</Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Programs */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5" />
                          Programs Offered
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {dept.courses.map((course, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <ChevronRight className="h-4 w-4 text-blue-600" />
                              <span>{course}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Research Areas */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Lightbulb className="h-5 w-5" />
                          Research Areas
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {dept.researchAreas.map((area, index) => (
                            <Badge key={index} variant="secondary">{area}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Achievements */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Award className="h-5 w-5" />
                          Key Achievements
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {dept.achievements.map((achievement, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{achievement}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Facilities */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Building className="h-5 w-5" />
                      Laboratories & Facilities
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {dept.facilities.map((facility, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-green-600" />
                              <span className="text-sm">{facility}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              )
            })}
          </Tabs>
        </div>
      </section>

      {/* Department Stats */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Department Excellence
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our departments maintain high standards in education, research, and industry collaboration
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {departments.map((dept) => {
              const DeptIcon = dept.icon
              return (
                <Card key={dept.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${dept.color}`}>
                        <DeptIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{dept.code}</CardTitle>
                        <CardDescription>{dept.name}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Faculty</span>
                        <span className="font-medium">{dept.faculty}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Students</span>
                        <span className="font-medium">{dept.students}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Labs</span>
                        <span className="font-medium">{dept.labs}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Research Areas</span>
                        <span className="font-medium">{dept.researchAreas.length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Join Our Academic Community?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Explore our programs and find the perfect department for your engineering journey
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/admissions">
              <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
                Apply Now
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600">
                Contact Departments
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}