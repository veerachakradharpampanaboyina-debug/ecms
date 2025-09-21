"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Calendar, 
  CreditCard, 
  MessageSquare,
  TrendingUp,
  Award,
  Building,
  ChevronRight
} from "lucide-react"
import Link from "next/link"

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated") {
      const role = session.user.role
      switch (role) {
        case "ADMIN":
          router.push("/admin")
          break
        case "HOD":
          router.push("/hod")
          break
        case "FACULTY":
          router.push("/faculty")
          break
        case "STUDENT":
          router.push("/student")
          break
        case "PARENT":
          router.push("/parent")
          break
        default:
          break
      }
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (status === "authenticated") {
    return null // Will redirect automatically
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Engineering College
              <span className="block text-yellow-400">Management System</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-blue-100">
              Transforming education through comprehensive technology solutions, security, and innovation
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signin">
                <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
                  Get Started
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              College Technology Infrastructure
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive technology solutions for modern educational excellence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* College Domain Mail System */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>College Domain Mail</CardTitle>
                <CardDescription>
                  Professional email addresses for all students, faculty, and staff with college domain
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Secure Chatting Application */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle>Secure Messenger</CardTitle>
                <CardDescription>
                  End-to-end encrypted messaging app for academic communication within college ecosystem
                </CardDescription>
              </CardHeader>
            </Card>

            {/* File and Document Storage */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle>Cloud Storage</CardTitle>
                <CardDescription>
                  Secure cloud-based storage for academic materials and documents
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Student Results and Timetable */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-yellow-600" />
                </div>
                <CardTitle>Results & Timetable</CardTitle>
                <CardDescription>
                  Centralized access to academic results, class schedules, and timetables
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Competitive Exams Platform */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle>Exam Platform</CardTitle>
                <CardDescription>
                  Online exam platform with mock tests, practice exams, and skill assessments
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Technology Blogs with AI Q&A */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-indigo-600" />
                </div>
                <CardTitle>Tech Blogs & AI Q&A</CardTitle>
                <CardDescription>
                  Interactive platform for technical knowledge sharing with AI-driven Q&A
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Hackathons and Tech Events */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-orange-600" />
                </div>
                <CardTitle>Hackathons & Events</CardTitle>
                <CardDescription>
                  Regular coding competitions and tech events for skill development
                </CardDescription>
              </CardHeader>
            </Card>

            {/* College Events Portal */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-pink-600" />
                </div>
                <CardTitle>Events Portal</CardTitle>
                <CardDescription>
                  Digital hub for managing college events, registrations, and schedules
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Funds Management */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-8 w-8 text-teal-600" />
                </div>
                <CardTitle>Funds Management</CardTitle>
                <CardDescription>
                  Transparent financial tracking system for all college transactions
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Placement Tracking */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-cyan-600" />
                </div>
                <CardTitle>Placement Tracking</CardTitle>
                <CardDescription>
                  Comprehensive system for monitoring student placements and alumni data
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Accreditation Support */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-emerald-600" />
                </div>
                <CardTitle>Accreditation Tools</CardTitle>
                <CardDescription>
                  Support for NBA, NAAC, AICTE accreditation and ranking improvements
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Comprehensive Documentation */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-gray-600" />
                </div>
                <CardTitle>Documentation</CardTitle>
                <CardDescription>
                  Thorough documentation of all procedures, systems, and improvements
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">5000+</div>
              <div className="text-xl text-blue-100">Students</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">200+</div>
              <div className="text-xl text-blue-100">Faculty Members</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">15+</div>
              <div className="text-xl text-blue-100">Departments</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">98%</div>
              <div className="text-xl text-blue-100">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* User Roles Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Designed for Everyone
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tailored experiences for every role in the educational ecosystem
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle>Administrator</CardTitle>
                <CardDescription>
                  Complete system control, user management, fee structures, comprehensive reports, and system configuration
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Building className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>HOD</CardTitle>
                <CardDescription>
                  Department-level oversight, faculty management, student monitoring, approvals, and performance analytics
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Faculty</CardTitle>
                <CardDescription>
                  Attendance marking, assignment management, study materials, marks entry, and student interaction
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <GraduationCap className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Student</CardTitle>
                <CardDescription>
                  Personal dashboard, fee payments, attendance tracking, academic resources, and performance monitoring
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-yellow-600" />
                </div>
                <CardTitle>Parent</CardTitle>
                <CardDescription>
                  Student progress monitoring, attendance tracking, fee status, and direct communication channels
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your College Technology Infrastructure?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join leading educational institutions in embracing comprehensive technology solutions
          </p>
          <Link href="/auth/signin">
            <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
              Get Started Today
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}