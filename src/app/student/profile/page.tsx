"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  BookOpen, 
  Award,
  Edit,
  Save,
  Camera,
  Upload,
  Download,
  Shield,
  Bell,
  Key,
  Globe,
  Users,
  Target,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react"
import { format } from "date-fns"

interface StudentProfile {
  id: string
  name: string
  email: string
  phone: string
  rollNumber: string
  course: string
  semester: string
  batch: string
  department: string
  admissionDate: Date
  dateOfBirth: Date
  gender: string
  bloodGroup: string
  nationality: string
  religion: string
  category: string
  address: {
    permanent: string
    current: string
    city: string
    state: string
    pincode: string
    country: string
  }
  emergencyContact: {
    name: string
    relationship: string
    phone: string
    email: string
  }
  profileImage?: string
  bio?: string
  skills: string[]
  languages: string[]
  interests: string[]
  socialLinks: {
    linkedin?: string
    github?: string
    twitter?: string
    website?: string
  }
}

interface AcademicInfo {
  cgpa: number
  sgpa: number[]
  totalCredits: number
  earnedCredits: number
  backlogs: number
  achievements: string[]
  certifications: string[]
  projects: string[]
  internships: string[]
}

interface SecuritySettings {
  twoFactorEnabled: boolean
  emailNotifications: boolean
  smsNotifications: boolean
  profileVisibility: "PUBLIC" | "PRIVATE" | "FACULTY_ONLY"
  lastPasswordChange: Date
  loginHistory: {
    date: Date
    device: string
    location: string
    ip: string
  }[]
}

export default function StudentProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [academicInfo, setAcademicInfo] = useState<AcademicInfo | null>(null)
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<Partial<StudentProfile>>({})
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user.role !== "STUDENT") {
      router.push("/auth/signin")
    }
  }, [session, status, router])

  useEffect(() => {
    // Mock data for student profile
    const mockProfile: StudentProfile = {
      id: "STU001",
      name: "Alex Johnson",
      email: "alex.johnson@student.edu",
      phone: "+91 9876543210",
      rollNumber: "CS2021001",
      course: "B.Tech Computer Science Engineering",
      semester: "3rd",
      batch: "2021-2025",
      department: "Computer Science",
      admissionDate: new Date("2021-08-01"),
      dateOfBirth: new Date("2003-05-15"),
      gender: "Male",
      bloodGroup: "O+",
      nationality: "Indian",
      religion: "Hindu",
      category: "General",
      address: {
        permanent: "123, Main Street, Bangalore, Karnataka - 560001",
        current: "Hostel Block A, Room 101, College Campus",
        city: "Bangalore",
        state: "Karnataka",
        pincode: "560001",
        country: "India"
      },
      emergencyContact: {
        name: "Robert Johnson",
        relationship: "Father",
        phone: "+91 9876543211",
        email: "robert.johnson@email.com"
      },
      profileImage: "/avatars/student1.jpg",
      bio: "Passionate about computer science and technology. Interested in software development, machine learning, and web technologies. Always eager to learn new skills and take on challenging projects.",
      skills: ["JavaScript", "Python", "React", "Node.js", "Machine Learning", "Data Structures", "Algorithms"],
      languages: ["English", "Hindi", "Kannada"],
      interests: ["Coding", "Reading", "Music", "Sports", "Photography"],
      socialLinks: {
        linkedin: "https://linkedin.com/in/alexjohnson",
        github: "https://github.com/alexjohnson",
        twitter: "https://twitter.com/alexjohnson",
        website: "https://alexjohnson.dev"
      }
    }
    setProfile(mockProfile)
    setEditedProfile(mockProfile)

    // Mock data for academic info
    const mockAcademicInfo: AcademicInfo = {
      cgpa: 8.5,
      sgpa: [8.2, 8.7, 8.6],
      totalCredits: 46,
      earnedCredits: 46,
      backlogs: 0,
      achievements: [
        "1st Prize in College Hackathon 2023",
        "Dean's List for Academic Excellence",
        "Best Project Award in Web Development"
      ],
      certifications: [
        "AWS Certified Developer Associate",
        "Google Cloud Professional Certificate",
        "MongoDB Certified Developer"
      ],
      projects: [
        "E-commerce Website using React and Node.js",
        "Machine Learning Model for Student Performance Prediction",
        "College Management System"
      ],
      internships: [
        "Software Development Intern at TechCorp (Summer 2023)",
        "Web Development Intern at StartupXYZ (Winter 2022)"
      ]
    }
    setAcademicInfo(mockAcademicInfo)

    // Mock data for security settings
    const mockSecuritySettings: SecuritySettings = {
      twoFactorEnabled: true,
      emailNotifications: true,
      smsNotifications: false,
      profileVisibility: "FACULTY_ONLY",
      lastPasswordChange: new Date("2024-01-15"),
      loginHistory: [
        {
          date: new Date(),
          device: "Chrome on Windows",
          location: "Bangalore, India",
          ip: "192.168.1.1"
        },
        {
          date: new Date(Date.now() - 24 * 60 * 60 * 1000),
          device: "Safari on iPhone",
          location: "Bangalore, India",
          ip: "192.168.1.2"
        },
        {
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          device: "Chrome on macOS",
          location: "Bangalore, India",
          ip: "192.168.1.3"
        }
      ]
    }
    setSecuritySettings(mockSecuritySettings)
  }, [])

  const handleSaveProfile = () => {
    if (editedProfile && profile) {
      setProfile({ ...profile, ...editedProfile } as StudentProfile)
      setIsEditing(false)
    }
  }

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match")
      return
    }
    
    if (securitySettings) {
      setSecuritySettings({
        ...securitySettings,
        lastPasswordChange: new Date()
      })
    }
    
    setNewPassword("")
    setConfirmPassword("")
    setIsPasswordDialogOpen(false)
  }

  const getProfileCompletion = () => {
    if (!profile) return 0
    
    const fields = [
      profile.name,
      profile.email,
      profile.phone,
      profile.dateOfBirth,
      profile.address.permanent,
      profile.emergencyContact.name,
      profile.bio,
      profile.skills.length > 0,
      profile.languages.length > 0
    ]
    
    const completedFields = fields.filter(field => field && field !== "").length
    return (completedFields / fields.length) * 100
  }

  const getAcademicLevel = (cgpa: number) => {
    if (cgpa >= 9.0) return { level: "Outstanding", color: "text-green-600", icon: "🏆" }
    if (cgpa >= 8.0) return { level: "Excellent", color: "text-blue-600", icon: "🌟" }
    if (cgpa >= 7.0) return { level: "Good", color: "text-blue-600", icon: "👍" }
    if (cgpa >= 6.0) return { level: "Average", color: "text-yellow-600", icon: "📊" }
    return { level: "Needs Improvement", color: "text-red-600", icon: "📈" }
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
              <h1 className="text-2xl font-bold text-gray-900">Student Profile</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {session.user.name}
              </span>
              <Button 
                variant={isEditing ? "default" : "outline"}
                onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
              >
                {isEditing ? <Save className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
                {isEditing ? "Save Changes" : "Edit Profile"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <CardHeader className="text-center">
              <div className="relative inline-block">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={profile?.profileImage} />
                  <AvatarFallback className="text-2xl">{profile?.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button size="sm" className="absolute bottom-0 right-0 rounded-full">
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <CardTitle>{profile?.name}</CardTitle>
              <CardDescription>{profile?.rollNumber}</CardDescription>
              <div className="flex justify-center space-x-2 mt-2">
                <Badge variant="outline">{profile?.course}</Badge>
                <Badge variant="secondary">{profile?.semester} Semester</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Profile Completion</p>
                  <div className="mt-2">
                    <Progress value={getProfileCompletion()} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">{getProfileCompletion().toFixed(0)}% Complete</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{profile?.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{profile?.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{profile?.address.city}, {profile?.address.state}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>Batch: {profile?.batch}</span>
                  </div>
                </div>
                
                {profile?.bio && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{profile.bio}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Academic Summary */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Academic Summary</CardTitle>
              <CardDescription>Your academic performance and achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{academicInfo?.cgpa.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">CGPA</p>
                  <p className="text-xs text-gray-500">{getAcademicLevel(academicInfo?.cgpa || 0).level}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{academicInfo?.earnedCredits}/{academicInfo?.totalCredits}</p>
                  <p className="text-sm text-gray-600">Credits</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{academicInfo?.achievements.length}</p>
                  <p className="text-sm text-gray-600">Achievements</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{academicInfo?.backlogs}</p>
                  <p className="text-sm text-gray-600">Backlogs</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Recent Achievements</h4>
                  <div className="space-y-2">
                    {academicInfo?.achievements.slice(0, 3).map((achievement, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-yellow-50 rounded">
                        <Award className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm">{achievement}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Skills & Expertise</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile?.skills.slice(0, 8).map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="academic">Academic Info</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Your basic personal details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      {isEditing ? (
                        <Input
                          id="name"
                          value={editedProfile.name || ""}
                          onChange={(e) => setEditedProfile(prev => ({ ...prev, name: e.target.value }))}
                          className="mt-2"
                        />
                      ) : (
                        <p className="mt-2 text-sm font-medium">{profile?.name}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      {isEditing ? (
                        <Input
                          id="email"
                          type="email"
                          value={editedProfile.email || ""}
                          onChange={(e) => setEditedProfile(prev => ({ ...prev, email: e.target.value }))}
                          className="mt-2"
                        />
                      ) : (
                        <p className="mt-2 text-sm font-medium">{profile?.email}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      {isEditing ? (
                        <Input
                          id="phone"
                          value={editedProfile.phone || ""}
                          onChange={(e) => setEditedProfile(prev => ({ ...prev, phone: e.target.value }))}
                          className="mt-2"
                        />
                      ) : (
                        <p className="mt-2 text-sm font-medium">{profile?.phone}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="dob">Date of Birth</Label>
                      {isEditing ? (
                        <Input
                          id="dob"
                          type="date"
                          value={editedProfile.dateOfBirth ? format(editedProfile.dateOfBirth, "yyyy-MM-dd") : ""}
                          onChange={(e) => setEditedProfile(prev => ({ ...prev, dateOfBirth: new Date(e.target.value) }))}
                          className="mt-2"
                        />
                      ) : (
                        <p className="mt-2 text-sm font-medium">{profile?.dateOfBirth ? format(profile.dateOfBirth, "PPP") : ""}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="gender">Gender</Label>
                      {isEditing ? (
                        <Select value={editedProfile.gender || ""} onValueChange={(value) => setEditedProfile(prev => ({ ...prev, gender: value }))}>
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="mt-2 text-sm font-medium">{profile?.gender}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="bloodGroup">Blood Group</Label>
                      {isEditing ? (
                        <Select value={editedProfile.bloodGroup || ""} onValueChange={(value) => setEditedProfile(prev => ({ ...prev, bloodGroup: value }))}>
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A+">A+</SelectItem>
                            <SelectItem value="A-">A-</SelectItem>
                            <SelectItem value="B+">B+</SelectItem>
                            <SelectItem value="B-">B-</SelectItem>
                            <SelectItem value="AB+">AB+</SelectItem>
                            <SelectItem value="AB-">AB-</SelectItem>
                            <SelectItem value="O+">O+</SelectItem>
                            <SelectItem value="O-">O-</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="mt-2 text-sm font-medium">{profile?.bloodGroup}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="nationality">Nationality</Label>
                      {isEditing ? (
                        <Input
                          id="nationality"
                          value={editedProfile.nationality || ""}
                          onChange={(e) => setEditedProfile(prev => ({ ...prev, nationality: e.target.value }))}
                          className="mt-2"
                        />
                      ) : (
                        <p className="mt-2 text-sm font-medium">{profile?.nationality}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="category">Category</Label>
                      {isEditing ? (
                        <Select value={editedProfile.category || ""} onValueChange={(value) => setEditedProfile(prev => ({ ...prev, category: value }))}>
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="General">General</SelectItem>
                            <SelectItem value="OBC">OBC</SelectItem>
                            <SelectItem value="SC">SC</SelectItem>
                            <SelectItem value="ST">ST</SelectItem>
                            <SelectItem value="EWS">EWS</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="mt-2 text-sm font-medium">{profile?.category}</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
              <CardHeader>
                <CardTitle>Address Information</CardTitle>
                <CardDescription>Your contact and address details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="permanentAddress">Permanent Address</Label>
                      {isEditing ? (
                        <Textarea
                          id="permanentAddress"
                          value={editedProfile.address?.permanent || ""}
                          onChange={(e) => setEditedProfile(prev => ({ 
                            ...prev, 
                            address: { ...prev.address!, permanent: e.target.value }
                          }))}
                          className="mt-2"
                          rows={3}
                        />
                      ) : (
                        <p className="mt-2 text-sm font-medium">{profile?.address.permanent}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="currentAddress">Current Address</Label>
                      {isEditing ? (
                        <Textarea
                          id="currentAddress"
                          value={editedProfile.address?.current || ""}
                          onChange={(e) => setEditedProfile(prev => ({ 
                            ...prev, 
                            address: { ...prev.address!, current: e.target.value }
                          }))}
                          className="mt-2"
                          rows={3}
                        />
                      ) : (
                        <p className="mt-2 text-sm font-medium">{profile?.address.current}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      {isEditing ? (
                        <Input
                          id="city"
                          value={editedProfile.address?.city || ""}
                          onChange={(e) => setEditedProfile(prev => ({ 
                            ...prev, 
                            address: { ...prev.address!, city: e.target.value }
                          }))}
                          className="mt-2"
                        />
                      ) : (
                        <p className="mt-2 text-sm font-medium">{profile?.address.city}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="state">State</Label>
                      {isEditing ? (
                        <Input
                          id="state"
                          value={editedProfile.address?.state || ""}
                          onChange={(e) => setEditedProfile(prev => ({ 
                            ...prev, 
                            address: { ...prev.address!, state: e.target.value }
                          }))}
                          className="mt-2"
                        />
                      ) : (
                        <p className="mt-2 text-sm font-medium">{profile?.address.state}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="pincode">Pincode</Label>
                      {isEditing ? (
                        <Input
                          id="pincode"
                          value={editedProfile.address?.pincode || ""}
                          onChange={(e) => setEditedProfile(prev => ({ 
                            ...prev, 
                            address: { ...prev.address!, pincode: e.target.value }
                          }))}
                          className="mt-2"
                        />
                      ) : (
                        <p className="mt-2 text-sm font-medium">{profile?.address.pincode}</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Emergency Contact</CardTitle>
                <CardDescription>Emergency contact person details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="emergencyName">Contact Person Name</Label>
                      {isEditing ? (
                        <Input
                          id="emergencyName"
                          value={editedProfile.emergencyContact?.name || ""}
                          onChange={(e) => setEditedProfile(prev => ({ 
                            ...prev, 
                            emergencyContact: { ...prev.emergencyContact!, name: e.target.value }
                          }))}
                          className="mt-2"
                        />
                      ) : (
                        <p className="mt-2 text-sm font-medium">{profile?.emergencyContact.name}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="relationship">Relationship</Label>
                      {isEditing ? (
                        <Input
                          id="relationship"
                          value={editedProfile.emergencyContact?.relationship || ""}
                          onChange={(e) => setEditedProfile(prev => ({ 
                            ...prev, 
                            emergencyContact: { ...prev.emergencyContact!, relationship: e.target.value }
                          }))}
                          className="mt-2"
                        />
                      ) : (
                        <p className="mt-2 text-sm font-medium">{profile?.emergencyContact.relationship}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="emergencyPhone">Phone Number</Label>
                      {isEditing ? (
                        <Input
                          id="emergencyPhone"
                          value={editedProfile.emergencyContact?.phone || ""}
                          onChange={(e) => setEditedProfile(prev => ({ 
                            ...prev, 
                            emergencyContact: { ...prev.emergencyContact!, phone: e.target.value }
                          }))}
                          className="mt-2"
                        />
                      ) : (
                        <p className="mt-2 text-sm font-medium">{profile?.emergencyContact.phone}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="emergencyEmail">Email Address</Label>
                      {isEditing ? (
                        <Input
                          id="emergencyEmail"
                          type="email"
                          value={editedProfile.emergencyContact?.email || ""}
                          onChange={(e) => setEditedProfile(prev => ({ 
                            ...prev, 
                            emergencyContact: { ...prev.emergencyContact!, email: e.target.value }
                          }))}
                          className="mt-2"
                        />
                      ) : (
                        <p className="mt-2 text-sm font-medium">{profile?.emergencyContact.email}</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="academic" className="space-y-6">
            {/* Academic Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Academic Performance</CardTitle>
                <CardDescription>Your academic records and performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-3xl font-bold text-blue-600">{academicInfo?.cgpa.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">CGPA</p>
                    <p className="text-xs text-gray-500">{getAcademicLevel(academicInfo?.cgpa || 0).level}</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-3xl font-bold text-green-600">{academicInfo?.earnedCredits}</p>
                    <p className="text-sm text-gray-600">Credits Earned</p>
                    <p className="text-xs text-gray-500">Out of {academicInfo?.totalCredits}</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-3xl font-bold text-purple-600">{academicInfo?.backlogs}</p>
                    <p className="text-sm text-gray-600">Active Backlogs</p>
                    <p className="text-xs text-gray-500">Academic Status</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Semester-wise SGPA</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {academicInfo?.sgpa.map((sgpa, index) => (
                      <div key={index} className="text-center p-3 border rounded-lg">
                        <p className="text-lg font-bold">{sgpa.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">{index + 1}{getOrdinalSuffix(index + 1)} Semester</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle>Achievements & Certifications</CardTitle>
                <CardDescription>Your academic and extracurricular achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Achievements</h4>
                    <div className="space-y-2">
                      {academicInfo?.achievements.map((achievement, index) => (
                        <div key={index} className="flex items-center space-x-2 p-2 bg-yellow-50 rounded">
                          <Award className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm">{achievement}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Certifications</h4>
                    <div className="space-y-2">
                      {academicInfo?.certifications.map((certification, index) => (
                        <div key={index} className="flex items-center space-x-2 p-2 bg-blue-50 rounded">
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                          <span className="text-sm">{certification}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Projects & Internships */}
            <Card>
              <CardHeader>
                <CardTitle>Projects & Internships</CardTitle>
                <CardDescription>Your project work and internship experiences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Projects</h4>
                    <div className="space-y-2">
                      {academicInfo?.projects.map((project, index) => (
                        <div key={index} className="flex items-center space-x-2 p-2 bg-green-50 rounded">
                          <Target className="h-4 w-4 text-green-600" />
                          <span className="text-sm">{project}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Internships</h4>
                    <div className="space-y-2">
                      {academicInfo?.internships.map((internship, index) => (
                        <div key={index} className="flex items-center space-x-2 p-2 bg-purple-50 rounded">
                          <TrendingUp className="h-4 w-4 text-purple-600" />
                          <span className="text-sm">{internship}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your account security and privacy</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Shield className="h-5 w-5 text-blue-600" />
                      <div>
                        <h4 className="font-medium">Two-Factor Authentication</h4>
                        <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={securitySettings?.twoFactorEnabled ? "default" : "secondary"}>
                        {securitySettings?.twoFactorEnabled ? "Enabled" : "Disabled"}
                      </Badge>
                      <Button variant="outline" size="sm">
                        {securitySettings?.twoFactorEnabled ? "Disable" : "Enable"}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Key className="h-5 w-5 text-green-600" />
                      <div>
                        <h4 className="font-medium">Password</h4>
                        <p className="text-sm text-gray-600">
                          Last changed: {securitySettings?.lastPasswordChange ? format(securitySettings.lastPasswordChange, "PPP") : "Never"}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setIsPasswordDialogOpen(true)}>
                      Change Password
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Bell className="h-5 w-5 text-orange-600" />
                      <div>
                        <h4 className="font-medium">Email Notifications</h4>
                        <p className="text-sm text-gray-600">Receive important updates via email</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={securitySettings?.emailNotifications ? "default" : "secondary"}>
                        {securitySettings?.emailNotifications ? "Enabled" : "Disabled"}
                      </Badge>
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-purple-600" />
                      <div>
                        <h4 className="font-medium">Profile Visibility</h4>
                        <p className="text-sm text-gray-600">Control who can see your profile</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{securitySettings?.profileVisibility}</Badge>
                      <Button variant="outline" size="sm">
                        Change
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Login History */}
            <Card>
              <CardHeader>
                <CardTitle>Login History</CardTitle>
                <CardDescription>Recent login activity on your account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {securitySettings?.loginHistory.map((login, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Globe className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{login.device}</p>
                          <p className="text-sm text-gray-600">{login.location}</p>
                          <p className="text-xs text-gray-500">IP: {login.ip}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{format(login.date, "PPP")}</p>
                        <p className="text-xs text-gray-500">{format(login.date, "p")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            {/* Additional Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Settings</CardTitle>
                <CardDescription>Configure additional preferences and options</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile?.skills.map((skill, index) => (
                        <Badge key={index} variant="outline">{skill}</Badge>
                      ))}
                      {isEditing && (
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Languages</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile?.languages.map((language, index) => (
                        <Badge key={index} variant="secondary">{language}</Badge>
                      ))}
                      {isEditing && (
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Interests</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile?.interests.map((interest, index) => (
                        <Badge key={index} variant="default">{interest}</Badge>
                      ))}
                      {isEditing && (
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Social Links</h4>
                    <div className="space-y-2">
                      {profile?.socialLinks.linkedin && (
                        <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                          <Globe className="h-4 w-4 text-gray-600" />
                          <span className="text-sm">LinkedIn: {profile.socialLinks.linkedin}</span>
                        </div>
                      )}
                      {profile?.socialLinks.github && (
                        <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                          <Globe className="h-4 w-4 text-gray-600" />
                          <span className="text-sm">GitHub: {profile.socialLinks.github}</span>
                        </div>
                      )}
                      {isEditing && (
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit Links
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Management */}
            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>Manage your data and account information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Download Profile Data</h4>
                      <p className="text-sm text-gray-600">Download a copy of your profile information</p>
                    </div>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Export Academic Records</h4>
                      <p className="text-sm text-gray-600">Download your academic transcripts and records</p>
                    </div>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-red-50">
                    <div>
                      <h4 className="font-medium text-red-800">Delete Account</h4>
                      <p className="text-sm text-red-600">Permanently delete your account and all data</p>
                    </div>
                    <Button variant="destructive" size="sm">
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your new password to update your account security
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-2"
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handlePasswordChange}>
                Update Password
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function getOrdinalSuffix(num: number) {
  const suffixes = ["th", "st", "nd", "rd"]
  const value = num % 100
  return suffixes[(value - 20) % 10] || suffixes[value % 10] || suffixes[0]
}