"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  GraduationCap, 
  Users, 
  Award, 
  BookOpen, 
  Building, 
  Globe,
  Clock,
  Star,
  ChevronRight,
  Target,
  Lightbulb,
  Heart
} from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  const stats = [
    { icon: GraduationCap, label: "Students Enrolled", value: "5000+" },
    { icon: Users, label: "Faculty Members", value: "200+" },
    { icon: Award, label: "Courses Offered", value: "50+" },
    { icon: Building, label: "Departments", value: "15+" },
    { icon: Globe, label: "Alumni Network", value: "10,000+" },
    { icon: Star, label: "Years of Excellence", value: "25+" }
  ]

  const values = [
    {
      icon: Target,
      title: "Excellence in Education",
      description: "We strive for academic excellence through innovative teaching methods and comprehensive curriculum design."
    },
    {
      icon: Lightbulb,
      title: "Innovation & Research",
      description: "Fostering a culture of innovation and research to solve real-world problems and advance knowledge."
    },
    {
      icon: Heart,
      title: "Student-Centered Approach",
      description: "Putting students at the center of everything we do, ensuring their holistic development and success."
    }
  ]

  const leadership = [
    {
      name: "Dr. Sarah Johnson",
      position: "Principal",
      qualification: "PhD in Computer Science",
      experience: "20+ years",
      image: "/api/placeholder/150/150"
    },
    {
      name: "Dr. Michael Chen",
      position: "Vice Principal",
      qualification: "PhD in Mathematics",
      experience: "18+ years",
      image: "/api/placeholder/150/150"
    },
    {
      name: "Dr. Emily Rodriguez",
      position: "Dean of Academics",
      qualification: "PhD in Education",
      experience: "15+ years",
      image: "/api/placeholder/150/150"
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              About Our Institution
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-blue-100">
              A legacy of excellence in engineering education, shaping future leaders since 1998
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

      {/* Mission & Vision */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-6 w-6 text-blue-600" />
                  Our Mission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  To provide world-class engineering education that fosters innovation, research, and holistic development. 
                  We aim to create competent professionals who can contribute to technological advancement and societal development 
                  through ethical practices and sustainable solutions.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-6 w-6 text-purple-600" />
                  Our Vision
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  To be a globally recognized institution of excellence in engineering education and research. 
                  We envision creating a learning ecosystem that nurtures creativity, critical thinking, and leadership 
                  qualities among students to meet the challenges of the future.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide our institution and shape our community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-blue-100 rounded-full">
                      <value.icon className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  <CardTitle className="text-xl">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Leadership Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Meet the visionary leaders guiding our institution towards excellence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {leadership.map((leader, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="w-32 h-32 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                    <Users className="h-16 w-16 text-gray-400" />
                  </div>
                  <CardTitle className="text-xl">{leader.name}</CardTitle>
                  <CardDescription className="text-lg font-medium text-blue-600">
                    {leader.position}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <BookOpen className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{leader.qualification}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{leader.experience}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Achievements & Recognition
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Celebrating our milestones and accolades in engineering education
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "NAAC A+ Grade Accreditation",
              "Ranked among Top 50 Engineering Colleges",
              "100% Placement Record for 3 Consecutive Years",
              "Industry-Academia Collaboration Award",
              "Best Research Institution Award",
              "Excellence in Innovation Award",
              "Green Campus Certification",
              "ISO 9001:2015 Certified",
              "Best Student Chapter Award"
            ].map((achievement, index) => (
              <div key={index} className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                <Award className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <span className="text-gray-700 font-medium">{achievement}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Join Our Community of Excellence
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Become part of a legacy that shapes future engineers and leaders
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
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}