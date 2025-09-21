"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CalendarIcon, Plus, Clock, CheckCircle, XCircle, AlertTriangle, FileText, Users, Calendar as CalendarIcon2, Info } from "lucide-react"
import { format, addDays, isBefore, isAfter, isSameDay, differenceInDays } from "date-fns"
import { cn } from "@/lib/utils"

interface LeaveRequest {
  id: string
  facultyId: string
  facultyName: string
  leaveType: "CASUAL" | "MEDICAL" | "EMERGENCY" | "MATERNITY" | "PATERNITY" | "STUDY"
  startDate: Date
  endDate: Date
  totalDays: number
  reason: string
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED"
  appliedOn: Date
  approvedBy?: string
  approvedOn?: Date
  rejectionReason?: string
  alternativeArrangement: string
  documents?: string[]
}

interface LeaveBalance {
  type: string
  total: number
  used: number
  remaining: number
  description: string
}

interface LeavePolicy {
  type: string
  maxDays: number
  requiresApproval: boolean
  requiresDocuments: boolean
  advanceNoticeDays: number
  description: string
}

export default function FacultyLeavePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([])
  const [leavePolicies, setLeavePolicies] = useState<LeavePolicy[]>([])
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("requests")
  const [filterStatus, setFilterStatus] = useState<string>("ALL")
  const [filterType, setFilterType] = useState<string>("ALL")

  // Form states
  const [newLeaveRequest, setNewLeaveRequest] = useState({
    leaveType: "CASUAL" as const,
    startDate: new Date(),
    endDate: new Date(),
    reason: "",
    alternativeArrangement: "",
    documents: [] as string[]
  })

  const [submitStatus, setSubmitStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user.role !== "FACULTY") {
      router.push("/auth/signin")
    }
  }, [session, status, router])

  useEffect(() => {
    // Mock data for leave requests
    const mockLeaveRequests: LeaveRequest[] = [
      {
        id: "1",
        facultyId: "FAC001",
        facultyName: "Dr. John Smith",
        leaveType: "CASUAL",
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        totalDays: 2,
        reason: "Personal work",
        status: "PENDING",
        appliedOn: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        alternativeArrangement: "Classes to be handled by Prof. Johnson"
      },
      {
        id: "2",
        facultyId: "FAC001",
        facultyName: "Dr. John Smith",
        leaveType: "MEDICAL",
        startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        totalDays: 3,
        reason: "Medical treatment",
        status: "APPROVED",
        appliedOn: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        approvedBy: "Dr. Sarah Johnson",
        approvedOn: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        alternativeArrangement: "Classes rescheduled for next week",
        documents: ["medical_certificate.pdf"]
      }
    ]
    setLeaveRequests(mockLeaveRequests)

    // Mock data for leave balances
    const mockLeaveBalances: LeaveBalance[] = [
      {
        type: "CASUAL",
        total: 12,
        used: 5,
        remaining: 7,
        description: "Casual leave for personal reasons"
      },
      {
        type: "MEDICAL",
        total: 10,
        used: 3,
        remaining: 7,
        description: "Medical leave for health reasons"
      },
      {
        type: "EMERGENCY",
        total: 5,
        used: 0,
        remaining: 5,
        description: "Emergency leave for urgent situations"
      },
      {
        type: "STUDY",
        total: 15,
        used: 0,
        remaining: 15,
        description: "Study leave for professional development"
      }
    ]
    setLeaveBalances(mockLeaveBalances)

    // Mock data for leave policies
    const mockLeavePolicies: LeavePolicy[] = [
      {
        type: "CASUAL",
        maxDays: 12,
        requiresApproval: true,
        requiresDocuments: false,
        advanceNoticeDays: 2,
        description: "Casual leave requires 2 days advance notice"
      },
      {
        type: "MEDICAL",
        maxDays: 10,
        requiresApproval: true,
        requiresDocuments: true,
        advanceNoticeDays: 1,
        description: "Medical leave requires medical certificate"
      },
      {
        type: "EMERGENCY",
        maxDays: 5,
        requiresApproval: true,
        requiresDocuments: false,
        advanceNoticeDays: 0,
        description: "Emergency leave for urgent situations"
      },
      {
        type: "STUDY",
        maxDays: 15,
        requiresApproval: true,
        requiresDocuments: true,
        advanceNoticeDays: 7,
        description: "Study leave requires approval and documentation"
      }
    ]
    setLeavePolicies(mockLeavePolicies)
  }, [])

  const filteredLeaveRequests = leaveRequests.filter(request => {
    const matchesStatus = filterStatus === "ALL" || request.status === filterStatus
    const matchesType = filterType === "ALL" || request.leaveType === filterType
    return matchesStatus && matchesType
  })

  const handleLeaveRequest = async () => {
    setSubmitStatus("submitting")
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const totalDays = differenceInDays(newLeaveRequest.endDate, newLeaveRequest.startDate) + 1
      
      const leaveRequest: LeaveRequest = {
        id: String(leaveRequests.length + 1),
        facultyId: "FAC001",
        facultyName: session?.user?.name || "Faculty",
        ...newLeaveRequest,
        totalDays,
        status: "PENDING",
        appliedOn: new Date()
      }
      
      setLeaveRequests([...leaveRequests, leaveRequest])
      setNewLeaveRequest({
        leaveType: "CASUAL",
        startDate: new Date(),
        endDate: new Date(),
        reason: "",
        alternativeArrangement: "",
        documents: []
      })
      setIsRequestDialogOpen(false)
      setSubmitStatus("success")
      
      setTimeout(() => setSubmitStatus("idle"), 3000)
    } catch (error) {
      setSubmitStatus("error")
      setTimeout(() => setSubmitStatus("idle"), 3000)
    }
  }

  const getLeaveTypeBadge = (type: string) => {
    switch (type) {
      case "CASUAL":
        return <Badge variant="default">Casual</Badge>
      case "MEDICAL":
        return <Badge variant="secondary">Medical</Badge>
      case "EMERGENCY":
        return <Badge variant="destructive">Emergency</Badge>
      case "MATERNITY":
        return <Badge variant="outline">Maternity</Badge>
      case "PATERNITY":
        return <Badge variant="outline">Paternity</Badge>
      case "STUDY":
        return <Badge variant="secondary">Study</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="secondary">Pending</Badge>
      case "APPROVED":
        return <Badge variant="default">Approved</Badge>
      case "REJECTED":
        return <Badge variant="destructive">Rejected</Badge>
      case "CANCELLED":
        return <Badge variant="outline">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "APPROVED":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "REJECTED":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "CANCELLED":
        return <AlertTriangle className="h-4 w-4 text-gray-600" />
      default:
        return <Info className="h-4 w-4 text-gray-600" />
    }
  }

  const getBalanceForType = (type: string) => {
    return leaveBalances.find(balance => balance.type === type)
  }

  const getPolicyForType = (type: string) => {
    return leavePolicies.find(policy => policy.type === type)
  }

  const canApplyForLeave = (type: string, startDate: Date, endDate: Date) => {
    const balance = getBalanceForType(type)
    const policy = getPolicyForType(type)
    
    if (!balance || !policy) return false
    
    const totalDays = differenceInDays(endDate, startDate) + 1
    const daysInAdvance = differenceInDays(startDate, new Date())
    
    return balance.remaining >= totalDays && daysInAdvance >= policy.advanceNoticeDays
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session || session.user.role !== "FACULTY") {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {session.user.name}
              </span>
              <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Apply for Leave
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Apply for Leave</DialogTitle>
                    <DialogDescription>
                      Submit a leave request for approval
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {submitStatus === "success" && (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>Leave request submitted successfully!</AlertDescription>
                      </Alert>
                    )}
                    {submitStatus === "error" && (
                      <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertDescription>Error submitting leave request. Please try again.</AlertDescription>
                      </Alert>
                    )}
                    
                    <div>
                      <Label htmlFor="leaveType">Leave Type</Label>
                      <Select value={newLeaveRequest.leaveType} onValueChange={(value: any) => setNewLeaveRequest({...newLeaveRequest, leaveType: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CASUAL">Casual Leave</SelectItem>
                          <SelectItem value="MEDICAL">Medical Leave</SelectItem>
                          <SelectItem value="EMERGENCY">Emergency Leave</SelectItem>
                          <SelectItem value="STUDY">Study Leave</SelectItem>
                        </SelectContent>
                      </Select>
                      {getPolicyForType(newLeaveRequest.leaveType) && (
                        <p className="text-sm text-gray-600 mt-1">
                          {getPolicyForType(newLeaveRequest.leaveType)?.description}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startDate">Start Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !newLeaveRequest.startDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {newLeaveRequest.startDate ? format(newLeaveRequest.startDate, "PPP") : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={newLeaveRequest.startDate}
                              onSelect={(date) => date && setNewLeaveRequest({...newLeaveRequest, startDate: date})}
                              initialFocus
                              disabled={(date) => isBefore(date, new Date())}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div>
                        <Label htmlFor="endDate">End Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !newLeaveRequest.endDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {newLeaveRequest.endDate ? format(newLeaveRequest.endDate, "PPP") : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={newLeaveRequest.endDate}
                              onSelect={(date) => date && setNewLeaveRequest({...newLeaveRequest, endDate: date})}
                              initialFocus
                              disabled={(date) => isBefore(date, newLeaveRequest.startDate)}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    {newLeaveRequest.startDate && newLeaveRequest.endDate && (
                      <div className="text-sm text-gray-600">
                        Total days: {differenceInDays(newLeaveRequest.endDate, newLeaveRequest.startDate) + 1}
                      </div>
                    )}

                    <div>
                      <Label htmlFor="reason">Reason</Label>
                      <Textarea
                        id="reason"
                        value={newLeaveRequest.reason}
                        onChange={(e) => setNewLeaveRequest({...newLeaveRequest, reason: e.target.value})}
                        placeholder="Enter reason for leave"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="alternativeArrangement">Alternative Arrangement</Label>
                      <Textarea
                        id="alternativeArrangement"
                        value={newLeaveRequest.alternativeArrangement}
                        onChange={(e) => setNewLeaveRequest({...newLeaveRequest, alternativeArrangement: e.target.value})}
                        placeholder="Describe alternative arrangements for your classes and duties"
                        rows={3}
                      />
                    </div>

                    {getPolicyForType(newLeaveRequest.leaveType)?.requiresDocuments && (
                      <div>
                        <Label htmlFor="documents">Supporting Documents</Label>
                        <Input
                          id="documents"
                          type="file"
                          multiple
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []).map(file => file.name)
                            setNewLeaveRequest({...newLeaveRequest, documents: files})
                          }}
                        />
                        <p className="text-sm text-gray-600 mt-1">
                          Upload supporting documents (medical certificate, etc.)
                        </p>
                      </div>
                    )}

                    {newLeaveRequest.startDate && newLeaveRequest.endDate && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium mb-2">Leave Balance Check</h4>
                        {getBalanceForType(newLeaveRequest.leaveType) && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Available Balance:</span>
                              <span>{getBalanceForType(newLeaveRequest.leaveType)?.remaining} days</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Requested Days:</span>
                              <span>{differenceInDays(newLeaveRequest.endDate, newLeaveRequest.startDate) + 1} days</span>
                            </div>
                            <div className="flex justify-between text-sm font-medium">
                              <span>Status:</span>
                              <span className={canApplyForLeave(newLeaveRequest.leaveType, newLeaveRequest.startDate, newLeaveRequest.endDate) ? "text-green-600" : "text-red-600"}>
                                {canApplyForLeave(newLeaveRequest.leaveType, newLeaveRequest.startDate, newLeaveRequest.endDate) ? "Can Apply" : "Cannot Apply"}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsRequestDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleLeaveRequest}
                        disabled={submitStatus === "submitting" || !canApplyForLeave(newLeaveRequest.leaveType, newLeaveRequest.startDate, newLeaveRequest.endDate)}
                      >
                        {submitStatus === "submitting" ? "Submitting..." : "Submit Request"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="requests">Leave Requests</TabsTrigger>
            <TabsTrigger value="balance">Leave Balance</TabsTrigger>
            <TabsTrigger value="policy">Leave Policy</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-6">
            {/* Filters */}
            <div className="flex gap-4">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="CASUAL">Casual</SelectItem>
                  <SelectItem value="MEDICAL">Medical</SelectItem>
                  <SelectItem value="EMERGENCY">Emergency</SelectItem>
                  <SelectItem value="STUDY">Study</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Leave Requests Table */}
            <Card>
              <CardHeader>
                <CardTitle>Leave Requests</CardTitle>
                <CardDescription>Track your leave request status and history</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Total Days</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Applied On</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeaveRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>{getLeaveTypeBadge(request.leaveType)}</TableCell>
                        <TableCell>
                          <div>
                            <div>{format(request.startDate, 'PP')}</div>
                            <div className="text-sm text-gray-500">to {format(request.endDate, 'PP')}</div>
                          </div>
                        </TableCell>
                        <TableCell>{request.totalDays} days</TableCell>
                        <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(request.status)}
                            {getStatusBadge(request.status)}
                          </div>
                        </TableCell>
                        <TableCell>{format(request.appliedOn, 'PP')}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <FileText className="h-4 w-4" />
                            </Button>
                            {request.status === "PENDING" && (
                              <Button size="sm" variant="outline">
                                Cancel
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="balance" className="space-y-6">
            {/* Leave Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {leaveBalances.map((balance) => (
                <Card key={balance.type}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CalendarIcon2 className="h-5 w-5 mr-2" />
                      {balance.type} Leave
                    </CardTitle>
                    <CardDescription>{balance.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Total Available</span>
                        <span className="text-lg font-bold">{balance.total} days</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Used</span>
                        <span className="text-lg font-bold text-red-600">{balance.used} days</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Remaining</span>
                        <span className="text-lg font-bold text-green-600">{balance.remaining} days</span>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Usage</span>
                          <span>{((balance.used / balance.total) * 100).toFixed(1)}%</span>
                        </div>
                        <Progress value={(balance.used / balance.total) * 100} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="policy" className="space-y-6">
            {/* Leave Policy Information */}
            <div className="grid gap-6">
              {leavePolicies.map((policy) => (
                <Card key={policy.type}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      {policy.type} Leave Policy
                    </CardTitle>
                    <CardDescription>{policy.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Maximum Days</p>
                        <p className="text-lg font-semibold">{policy.maxDays} days</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Approval Required</p>
                        <p className="text-lg font-semibold">{policy.requiresApproval ? "Yes" : "No"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Documents Required</p>
                        <p className="text-lg font-semibold">{policy.requiresDocuments ? "Yes" : "No"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Advance Notice</p>
                        <p className="text-lg font-semibold">{policy.advanceNoticeDays} days</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}