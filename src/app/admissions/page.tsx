"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  GraduationCap, 
  Users, 
  Calendar, 
  FileText, 
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  Star,
  Award,
  BookOpen,
  Target,
  Phone,
  Mail,
  MapPin
} from "lucide-react"
import Link from "next/link"

export default function AdmissionsPage() {
  const programs = [
    {
      name: "B.Tech Computer Science Engineering",
      duration: "4 Years",
      seats: 120,
      eligibility: "10+2 with PCM, 60% aggregate",
      fee: "₹1,20,000/year",
      popular: true,
      description: "Comprehensive program covering software development, AI, ML, and emerging technologies"
    },
    {
      name: "B.Tech Electronics & Communication",
      duration: "4 Years",
      seats: 90,
      eligibility: "10+2 with PCM, 60% aggregate",
      fee: "₹1,10,000/year",
      popular: true,
      description: "Focus on VLSI design, signal processing, and communication systems"
    },
    {
      name: "B.Tech Mechanical Engineering",
      duration: "4 Years",
      seats: 120,
      eligibility: "10+2 with PCM, 60% aggregate",
      fee: "₹1,00,000/year",
      popular: false,
      description: "Comprehensive mechanical engineering with modern manufacturing focus"
    },
    {
      name: "B.Tech Civil Engineering",
      duration: "4 Years",
      seats: 60,
      eligibility: "10+2 with PCM, 60% aggregate",
      fee: "₹90,000/year",
      popular: false,
      description: "Sustainable construction and infrastructure development"
    },
    {
      name: "B.Tech Electrical Engineering",
      duration: "4 Years",
      seats: 60,
      eligibility: "10+2 with PCM, 60% aggregate",
      fee: "₹1,00,000/year",
      popular: false,
      description: "Power systems, control engineering, and renewable energy"
    },
    {
      name: "B.Tech Chemical Engineering",
      duration: "4 Years",
      seats: 45,
      eligibility: "10+2 with PCM, 60% aggregate",
      fee: "₹95,000/year",
      popular: false,
      description: "Chemical processes and industrial engineering solutions"
    }
  ]

  const importantDates = [
    { event: "Application Start", date: "March 1, 2024", status: "completed" },
    { event: "Application Deadline", date: "June 30, 2024", status: "upcoming" },
    { event: "Entrance Exam", date: "July 15, 2024", status: "upcoming" },
    { event: "Result Declaration", date: "July 25, 2024", status: "upcoming" },
    { event: "Counseling Start", date: "August 1, 2024", status: "upcoming" },
    { event: "Classes Commence", date: "August 15, 2024", status: "upcoming" }
  ]

  const eligibilityCriteria = [
    {
      category: "Academic Qualification",
      requirements: [
        "10+2 or equivalent examination from a recognized board",
        "Minimum 60% aggregate marks in Physics, Chemistry, and Mathematics",
        "Valid score in national/state level entrance examination (JEE Main, State CET, etc.)"
      ]
    },
    {
      category: "Age Limit",
      requirements: [
        "Minimum age: 17 years as on December 31, 2024",
        "No upper age limit"
      ]
    },
    {
      category: "Reservation Policy",
      requirements: [
        "As per Government of India norms",
        "SC/ST/OBC/EWS/PwD categories applicable",
        "Domicile-based reservation for state candidates"
      ]
    }
  ]

  const admissionProcess = [
    {
      step: 1,
      title: "Online Application",
      description: "Fill the application form with personal and academic details",
      icon: FileText,
      duration: "15-20 minutes"
    },
    {
      step: 2,
      title: "Document Upload",
      description: "Upload required documents in specified format",
      icon: FileText,
      duration: "10-15 minutes"
    },
    {
      step: 3,
      title: "Application Fee Payment",
      description: "Pay non-refundable application fee online",
      icon: CreditCard,
      duration: "5 minutes"
    },
    {
      step: 4,
      title: "Entrance Examination",
      description: "Appear for entrance exam (if applicable)",
      icon: GraduationCap,
      duration: "3 hours"
    },
    {
      step: 5,
      title: "Merit List & Counseling",
      description: "Check merit list and attend counseling session",
      icon: Users,
      duration: "1-2 days"
    },
    {
      step: 6,
      title: "Fee Payment & Admission",
      description: "Pay admission fee and complete admission formalities",
      icon: CheckCircle,
      duration: "1 day"
    }
  ]

  const requiredDocuments = [
    "10th Mark Sheet and Certificate",
    "12th Mark Sheet and Certificate",
    "Transfer Certificate",
    "Migration Certificate (if applicable)",
    "Character Certificate",
    "Birth Certificate",
    "Passport Size Photographs (4 copies)",
    "Entrance Exam Score Card",
    "Category Certificate (if applicable)",
    "Income Certificate (if applicable)",
    "Domicile Certificate (if applicable)",
    "Aadhaar Card",
    "Bank Passbook (for fee payment)"
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Admissions 2024
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-blue-100">
              Join our community of excellence and shape your future in engineering
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
                  Apply Now
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600">
                  Contact Admissions
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Important Dates */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Important Dates
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Stay updated with the admission timeline for 2024-25 academic session
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {importantDates.map((date, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      date.status === 'completed' ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      <Calendar className={`h-5 w-5 ${
                        date.status === 'completed' ? 'text-green-600' : 'text-blue-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{date.event}</CardTitle>
                      <CardDescription className="font-medium">{date.date}</CardDescription>
                    </div>
                    <Badge variant={date.status === 'completed' ? 'default' : 'secondary'}>
                      {date.status === 'completed' ? 'Completed' : 'Upcoming'}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Offered */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Programs Offered
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose from our industry-aligned undergraduate engineering programs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow relative">
                {program.popular && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-yellow-500 text-black">Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-blue-600" />
                    {program.name}
                  </CardTitle>
                  <CardDescription>{program.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Duration</span>
                      <span className="font-medium">{program.duration}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Seats Available</span>
                      <span className="font-medium">{program.seats}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Annual Fee</span>
                      <span className="font-medium">{program.fee}</span>
                    </div>
                    <div className="pt-3 border-t">
                      <p className="text-sm text-gray-600 mb-2">Eligibility:</p>
                      <p className="text-sm font-medium">{program.eligibility}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Admission Process */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Admission Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple and transparent 6-step admission process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {admissionProcess.map((step, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full text-blue-600 font-bold text-lg">
                      {step.step}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <step.icon className="h-5 w-5 text-blue-600" />
                        {step.title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-3">{step.description}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>{step.duration}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Eligibility Criteria */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Eligibility Criteria
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Check if you meet the requirements for admission
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {eligibilityCriteria.map((category, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {category.requirements.map((requirement, reqIndex) => (
                      <div key={reqIndex} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{requirement}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Required Documents */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Required Documents
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Keep these documents ready for the admission process
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Document Checklist
              </CardTitle>
              <CardDescription>
                All documents must be scanned and uploaded in PDF format (maximum 2MB per file)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {requiredDocuments.map((doc, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">{doc}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Contact Admissions Office
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get in touch with our admissions team for any queries
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-blue-600" />
                  Phone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">+91 1234567890</p>
                <p className="text-gray-600">+91 9876543210</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">admissions@college.edu</p>
                <p className="text-gray-600">info@college.edu</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Admissions Office</p>
                <p className="text-gray-600">Engineering College</p>
                <p className="text-gray-600">City - 123456</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Alert Section */}
      <section className="py-12 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> All admissions are strictly based on merit and eligibility criteria. 
              The college does not accept any donations or capitation fees. Beware of unauthorized agents.
            </AlertDescription>
          </Alert>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Engineering Journey?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Apply now and take the first step towards a successful engineering career
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
                Apply Now
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600">
                Download Brochure
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}