"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Loader2, User, Lock, GraduationCap, Users, BookOpen, Building, Shield } from "lucide-react"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [selectedRole, setSelectedRole] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const roleOptions = [
    { value: "ADMIN", label: "Administrator", icon: Shield, color: "bg-red-100 text-red-800", description: "System administration and configuration" },
    { value: "HOD", label: "Head of Department", icon: Building, color: "bg-blue-100 text-blue-800", description: "Department management and oversight" },
    { value: "FACULTY", label: "Faculty", icon: BookOpen, color: "bg-green-100 text-green-800", description: "Teaching and academic management" },
    { value: "STUDENT", label: "Student", icon: GraduationCap, color: "bg-purple-100 text-purple-800", description: "Academic progress and resources" },
    { value: "PARENT", label: "Parent", icon: Users, color: "bg-yellow-100 text-yellow-800", description: "Student progress monitoring" }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (res?.error) {
        setError("Invalid email or password. Please try again.")
      } else if (res?.ok) {
        // On success, redirect to the homepage.
        // The homepage already has logic to redirect to the correct dashboard.
        router.push("/")
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Education Center Management System
          </h1>
          <p className="text-lg text-gray-600">
            Sign in to access your personalized dashboard
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sign In Form */}
          <Card className="w-full">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
                <Shield className="h-6 w-6 text-blue-600" />
                Sign In
              </CardTitle>
              <CardDescription className="text-center">
                Enter your credentials to access the portal
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Select Your Role</Label>
                  <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <option.icon className="h-4 w-4" />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col items-center space-y-4">
                <Button type="submit" className="w-full" disabled={isLoading || !selectedRole}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link href="/auth/register" className="font-medium text-blue-600 hover:underline">
                    Register
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>

          {/* Role Information */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-xl">User Roles</CardTitle>
              <CardDescription>
                Select your role to understand your access permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {roleOptions.map((option) => (
                <div
                  key={option.value}
                  className={`p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                    selectedRole === option.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white"
                  }`}
                  onClick={() => setSelectedRole(option.value)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${option.color}`}>
                      <option.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{option.label}</h3>
                        <Badge variant="outline" className="text-xs">
                          {option.value}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Demo Credentials */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Demo Credentials</CardTitle>
            <CardDescription>
              Use these credentials to test the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-sm">Administrator</div>
                <div className="text-xs text-gray-600">admin@college.edu</div>
                <div className="text-xs text-gray-600">password123</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-sm">HOD (CSE)</div>
                <div className="text-xs text-gray-600">hod.cse@college.edu</div>
                <div className="text-xs text-gray-600">password123</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-sm">Faculty</div>
                <div className="text-xs text-gray-600">faculty1@college.edu</div>
                <div className="text-xs text-gray-600">password123</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-sm">Student</div>
                <div className="text-xs text-gray-600">student1@college.edu</div>
                <div className="text-xs text-gray-600">password123</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-sm">Parent</div>
                <div className="text-xs text-gray-600">parent1@college.edu</div>
                <div className="text-xs text-gray-600">password123</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}