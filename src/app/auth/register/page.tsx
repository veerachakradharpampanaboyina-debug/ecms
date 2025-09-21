'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    role: "",
    rollNumber: "",
    admissionNo: "",
    courseId: "",
    semester: "",
    batch: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    admissionDate: "",
    employeeId: "",
    departmentId: "",
    designation: "",
    qualification: "",
    experience: "",
    joiningDate: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleSelectChange = (id: string, value: string) => {
    setFormData({ ...formData, [id]: value })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong")
      }

      toast({
        title: "Registration Successful",
        description: "Your account has been created.",
      })
      router.push("/auth/signin")
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const renderRoleSpecificFields = () => {
    switch (formData.role) {
      case "STUDENT":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rollNumber">Roll Number</Label>
                <Input id="rollNumber" value={formData.rollNumber} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="admissionNo">Admission No.</Label>
                <Input id="admissionNo" value={formData.admissionNo} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="courseId">Course ID</Label>
                <Input id="courseId" value={formData.courseId} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="semester">Semester</Label>
                <Input id="semester" value={formData.semester} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="batch">Batch (e.g., 2023-2027)</Label>
                <Input id="batch" value={formData.batch} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input id="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select onValueChange={(value) => handleSelectChange("gender", value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="admissionDate">Admission Date</Label>
                <Input id="admissionDate" type="date" value={formData.admissionDate} onChange={handleChange} required />
              </div>
            </div>
            <h3 className="text-lg font-medium mt-6 mb-4">Address Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                <Label htmlFor="address">Address</Label>
                <Input id="address" value={formData.address} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" value={formData.city} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input id="state" value={formData.state} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input id="country" value={formData.country} onChange={handleChange} />
              </div>
               <div>
                <Label htmlFor="pincode">Pincode</Label>
                <Input id="pincode" value={formData.pincode} onChange={handleChange} />
              </div>
            </div>
            <h3 className="text-lg font-medium mt-6 mb-4">Parent Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="parentName">Parent Name</Label>
                <Input id="parentName" value={formData.parentName} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="parentPhone">Parent Phone</Label>
                <Input id="parentPhone" value={formData.parentPhone} onChange={handleChange} />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="parentEmail">Parent Email</Label>
                <Input id="parentEmail" type="email" value={formData.parentEmail} onChange={handleChange} />
              </div>
            </div>
          </>
        )
      case "FACULTY":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="employeeId">Employee ID</Label>
              <Input id="employeeId" value={formData.employeeId} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="departmentId">Department ID</Label>
              <Input id="departmentId" value={formData.departmentId} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="designation">Designation</Label>
              <Input id="designation" value={formData.designation} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="joiningDate">Joining Date</Label>
              <Input id="joiningDate" type="date" value={formData.joiningDate} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="qualification">Qualification</Label>
              <Input id="qualification" value={formData.qualification} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="experience">Experience (Years)</Label>
              <Input id="experience" type="number" value={formData.experience} onChange={handleChange} />
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-4xl mx-4 my-8">
        <CardHeader>
          <CardTitle>Register New User</CardTitle>
          <CardDescription>Create an account to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-lg font-medium">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={formData.password} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" value={formData.phone} onChange={handleChange} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select onValueChange={(value) => handleSelectChange("role", value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="FACULTY">Faculty</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.role && (
              <div className="pt-6 border-t">
                <h3 className="text-lg font-medium mb-4">{formData.role.charAt(0).toUpperCase() + formData.role.slice(1).toLowerCase()} Details</h3>
                {renderRoleSpecificFields()}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading || !formData.role}>
              {isLoading ? "Registering..." : "Register"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
