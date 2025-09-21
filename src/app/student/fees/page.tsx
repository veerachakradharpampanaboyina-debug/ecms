"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { 
  DollarSign, 
  CreditCard, 
  Banknote, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Download,
  Receipt,
  FileText,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Info,
  AlertTriangle
} from "lucide-react"
import { format, differenceInDays, addDays, addMonths, isAfter, isBefore } from "date-fns"

interface FeeStructure {
  id: string
  name: string
  amount: number
  dueDate: Date
  status: "PAID" | "PENDING" | "OVERDUE" | "PARTIAL"
  paidAmount?: number
  paymentDate?: Date
  transactionId?: string
  description: string
  category: "TUITION" | "EXAM" | "LIBRARY" | "LAB" | "HOSTEL" | "OTHER"
  isRecurring: boolean
  lateFee?: number
}

interface Payment {
  id: string
  feeId: string
  amount: number
  paymentDate: Date
  paymentMethod: "CREDIT_CARD" | "DEBIT_CARD" | "NET_BANKING" | "UPI" | "CASH" | "CHEQUE"
  transactionId: string
  status: "SUCCESS" | "PENDING" | "FAILED" | "REFUNDED"
  receiptUrl?: string
}

interface PaymentMethod {
  id: string
  name: string
  type: "CREDIT_CARD" | "DEBIT_CARD" | "NET_BANKING" | "UPI"
  lastFour?: string
  expiry?: string
  isDefault: boolean
}

export default function StudentFeesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("ALL")
  const [filterStatus, setFilterStatus] = useState<string>("ALL")
  const [selectedFee, setSelectedFee] = useState<FeeStructure | null>(null)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState(0)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user.role !== "STUDENT") {
      router.push("/auth/signin")
    }
  }, [session, status, router])

  useEffect(() => {
    // Mock data for fee structures
    const mockFeeStructures: FeeStructure[] = [
      {
        id: "1",
        name: "Tuition Fee - Semester 3",
        amount: 50000,
        dueDate: addDays(new Date(), 15),
        status: "PENDING",
        description: "Tuition fee for 3rd semester including all subjects",
        category: "TUITION",
        isRecurring: true,
        lateFee: 1000
      },
      {
        id: "2",
        name: "Examination Fee",
        amount: 5000,
        dueDate: addDays(new Date(), 30),
        status: "PENDING",
        description: "Mid-term and final examination fees",
        category: "EXAM",
        isRecurring: false
      },
      {
        id: "3",
        name: "Library Fee",
        amount: 2000,
        dueDate: addDays(new Date(), -10),
        status: "OVERDUE",
        description: "Annual library membership and resources fee",
        category: "LIBRARY",
        isRecurring: true,
        lateFee: 500
      },
      {
        id: "4",
        name: "Lab Fee",
        amount: 3000,
        dueDate: addDays(new Date(), -20),
        status: "PAID",
        paidAmount: 3000,
        paymentDate: addDays(new Date(), -25),
        transactionId: "TXN123456789",
        description: "Computer lab and equipment maintenance fee",
        category: "LAB",
        isRecurring: true
      },
      {
        id: "5",
        name: "Hostel Fee",
        amount: 15000,
        dueDate: addDays(new Date(), -5),
        status: "PARTIAL",
        paidAmount: 7500,
        paymentDate: addDays(new Date(), -10),
        transactionId: "TXN987654321",
        description: "Hostel accommodation and mess fees",
        category: "HOSTEL",
        isRecurring: true,
        lateFee: 2000
      }
    ]
    setFeeStructures(mockFeeStructures)

    // Mock data for payments
    const mockPayments: Payment[] = [
      {
        id: "1",
        feeId: "4",
        amount: 3000,
        paymentDate: addDays(new Date(), -25),
        paymentMethod: "CREDIT_CARD",
        transactionId: "TXN123456789",
        status: "SUCCESS",
        receiptUrl: "/receipts/TXN123456789.pdf"
      },
      {
        id: "2",
        feeId: "5",
        amount: 7500,
        paymentDate: addDays(new Date(), -10),
        paymentMethod: "NET_BANKING",
        transactionId: "TXN987654321",
        status: "SUCCESS",
        receiptUrl: "/receipts/TXN987654321.pdf"
      }
    ]
    setPayments(mockPayments)

    // Mock data for payment methods
    const mockPaymentMethods: PaymentMethod[] = [
      {
        id: "1",
        name: "Visa Card",
        type: "CREDIT_CARD",
        lastFour: "4242",
        expiry: "12/25",
        isDefault: true
      },
      {
        id: "2",
        name: "HDFC Bank",
        type: "NET_BANKING",
        isDefault: false
      },
      {
        id: "3",
        name: "UPI",
        type: "UPI",
        isDefault: false
      }
    ]
    setPaymentMethods(mockPaymentMethods)
  }, [])

  const filteredFeeStructures = feeStructures.filter(fee => {
    const matchesSearch = fee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fee.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "ALL" || fee.category === filterCategory
    const matchesStatus = filterStatus === "ALL" || fee.status === filterStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <Badge variant="default" className="bg-green-100 text-green-800">Paid</Badge>
      case "PENDING":
        return <Badge variant="outline">Pending</Badge>
      case "OVERDUE":
        return <Badge variant="destructive">Overdue</Badge>
      case "PARTIAL":
        return <Badge variant="secondary">Partial</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "TUITION":
        return <Badge variant="outline">Tuition</Badge>
      case "EXAM":
        return <Badge variant="secondary">Exam</Badge>
      case "LIBRARY":
        return <Badge variant="default">Library</Badge>
      case "LAB":
        return <Badge variant="outline">Lab</Badge>
      case "HOSTEL":
        return <Badge variant="secondary">Hostel</Badge>
      default:
        return <Badge variant="outline">{category}</Badge>
    }
  }

  const getPaymentMethodBadge = (method: string) => {
    switch (method) {
      case "CREDIT_CARD":
        return <Badge variant="outline">Credit Card</Badge>
      case "DEBIT_CARD":
        return <Badge variant="outline">Debit Card</Badge>
      case "NET_BANKING":
        return <Badge variant="secondary">Net Banking</Badge>
      case "UPI":
        return <Badge variant="default">UPI</Badge>
      case "CASH":
        return <Badge variant="outline">Cash</Badge>
      case "CHEQUE":
        return <Badge variant="secondary">Cheque</Badge>
      default:
        return <Badge variant="outline">{method}</Badge>
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return <Badge variant="default" className="bg-green-100 text-green-800">Success</Badge>
      case "PENDING":
        return <Badge variant="secondary">Pending</Badge>
      case "FAILED":
        return <Badge variant="destructive">Failed</Badge>
      case "REFUNDED":
        return <Badge variant="outline">Refunded</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getDaysRemaining = (dueDate: Date) => {
    const today = new Date()
    const days = differenceInDays(dueDate, today)
    
    if (days < 0) {
      return { text: `${Math.abs(days)} days overdue`, color: "text-red-600" }
    } else if (days === 0) {
      return { text: "Due today", color: "text-orange-600" }
    } else if (days === 1) {
      return { text: "1 day remaining", color: "text-yellow-600" }
    } else {
      return { text: `${days} days remaining`, color: "text-green-600" }
    }
  }

  const getTotalAmount = () => {
    return feeStructures.reduce((sum, fee) => sum + fee.amount, 0)
  }

  const getTotalPaid = () => {
    return feeStructures.reduce((sum, fee) => sum + (fee.paidAmount || 0), 0)
  }

  const getTotalPending = () => {
    return feeStructures.reduce((sum, fee) => {
      if (fee.status === "PAID") return sum
      return sum + (fee.amount - (fee.paidAmount || 0))
    }, 0)
  }

  const getOverdueCount = () => {
    return feeStructures.filter(fee => fee.status === "OVERDUE").length
  }

  const getPendingCount = () => {
    return feeStructures.filter(fee => fee.status === "PENDING").length
  }

  const handlePayNow = (fee: FeeStructure) => {
    setSelectedFee(fee)
    setPaymentAmount(fee.amount - (fee.paidAmount || 0))
    setIsPaymentDialogOpen(true)
  }

  const handlePayment = async () => {
    if (!selectedFee || !selectedPaymentMethod) return
    
    setIsProcessing(true)
    
    // Simulate payment processing
    setTimeout(() => {
      const newPayment: Payment = {
        id: Date.now().toString(),
        feeId: selectedFee.id,
        amount: paymentAmount,
        paymentDate: new Date(),
        paymentMethod: selectedPaymentMethod as any,
        transactionId: `TXN${Date.now()}`,
        status: "SUCCESS",
        receiptUrl: `/receipts/TXN${Date.now()}.pdf`
      }
      
      setPayments(prev => [...prev, newPayment])
      
      // Update fee status
      setFeeStructures(prev => prev.map(fee => {
        if (fee.id === selectedFee.id) {
          const newPaidAmount = (fee.paidAmount || 0) + paymentAmount
          const newStatus = newPaidAmount >= fee.amount ? "PAID" : "PARTIAL"
          return {
            ...fee,
            status: newStatus,
            paidAmount: newPaidAmount,
            paymentDate: new Date(),
            transactionId: newPayment.transactionId
          }
        }
        return fee
      }))
      
      setIsProcessing(false)
      setIsPaymentDialogOpen(false)
      setSelectedFee(null)
      setPaymentAmount(0)
      setSelectedPaymentMethod("")
    }, 2000)
  }

  const getFeeStats = () => {
    const total = getTotalAmount()
    const paid = getTotalPaid()
    const pending = getTotalPending()
    const overdue = feeStructures.filter(f => f.status === "OVERDUE").length
    
    return {
      total,
      paid,
      pending,
      overdue,
      paidPercentage: total > 0 ? (paid / total) * 100 : 0
    }
  }

  const feeStats = getFeeStats()

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
              <h1 className="text-2xl font-bold text-gray-900">Fee Payment</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {session.user.name}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="fees">Fee Structure</TabsTrigger>
            <TabsTrigger value="payments">Payment History</TabsTrigger>
            <TabsTrigger value="methods">Payment Methods</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Fee Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{feeStats.total.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    This semester
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Amount Paid</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">₹{feeStats.paid.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {feeStats.paidPercentage.toFixed(1)}% of total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">₹{feeStats.pending.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {getPendingCount()} pending fees
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{feeStats.overdue}</div>
                  <p className="text-xs text-muted-foreground">
                    Fees overdue
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Payment Progress */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Payment Progress</CardTitle>
                <CardDescription>
                  Track your fee payment progress for this semester
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="text-sm text-gray-600">{feeStats.paidPercentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={feeStats.paidPercentage} className="h-3" />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>₹{feeStats.paid.toLocaleString()} Paid</span>
                    <span>₹{feeStats.total.toLocaleString()} Total</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Payments */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Payments</CardTitle>
                <CardDescription>
                  Fees that need to be paid soon
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {feeStructures
                    .filter(fee => fee.status === "PENDING" || fee.status === "OVERDUE")
                    .slice(0, 3)
                    .map((fee) => {
                      const daysRemaining = getDaysRemaining(fee.dueDate)
                      const amountDue = fee.amount - (fee.paidAmount || 0)
                      
                      return (
                        <div key={fee.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-medium">{fee.name}</h3>
                              {getCategoryBadge(fee.category)}
                            </div>
                            <p className="text-sm text-gray-600">{fee.description}</p>
                            <p className={`text-sm font-medium ${daysRemaining.color}`}>
                              Due: {format(fee.dueDate, "PPP")} - {daysRemaining.text}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">₹{amountDue.toLocaleString()}</p>
                            <Button 
                              size="sm" 
                              onClick={() => handlePayNow(fee)}
                              className="mt-2"
                            >
                              Pay Now
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  
                  {feeStructures.filter(fee => fee.status === "PENDING" || fee.status === "OVERDUE").length === 0 && (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <p className="text-lg font-medium">All fees paid!</p>
                      <p className="text-gray-500">No pending payments at this time</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fees" className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search fees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Categories</SelectItem>
                    <SelectItem value="TUITION">Tuition</SelectItem>
                    <SelectItem value="EXAM">Exam</SelectItem>
                    <SelectItem value="LIBRARY">Library</SelectItem>
                    <SelectItem value="LAB">Lab</SelectItem>
                    <SelectItem value="HOSTEL">Hostel</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="OVERDUE">Overdue</SelectItem>
                    <SelectItem value="PARTIAL">Partial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Fee Structure List */}
            <div className="space-y-4">
              {filteredFeeStructures.map((fee) => {
                const daysRemaining = getDaysRemaining(fee.dueDate)
                const amountDue = fee.amount - (fee.paidAmount || 0)
                
                return (
                  <Card key={fee.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <CardTitle className="text-lg">{fee.name}</CardTitle>
                            {getStatusBadge(fee.status)}
                            {getCategoryBadge(fee.category)}
                          </div>
                          <CardDescription>{fee.description}</CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          {fee.status !== "PAID" && (
                            <Button 
                              size="sm" 
                              onClick={() => handlePayNow(fee)}
                            >
                              <CreditCard className="h-4 w-4 mr-2" />
                              Pay Now
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Total Amount</p>
                          <p className="text-lg font-bold">₹{fee.amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Paid Amount</p>
                          <p className="text-lg font-bold text-green-600">
                            ₹{(fee.paidAmount || 0).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Due Date</p>
                          <p className={`text-sm font-medium ${daysRemaining.color}`}>
                            {format(fee.dueDate, "PPP")} - {daysRemaining.text}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Amount Due</p>
                          <p className="text-lg font-bold text-orange-600">
                            ₹{amountDue.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      {fee.lateFee && fee.status === "OVERDUE" && (
                        <div className="mt-4 p-3 bg-red-50 rounded-lg">
                          <p className="text-sm font-medium text-red-800">
                            Late Fee: ₹{fee.lateFee} applicable
                          </p>
                        </div>
                      )}
                      
                      {fee.status === "PAID" && fee.paymentDate && (
                        <div className="mt-4 p-3 bg-green-50 rounded-lg">
                          <p className="text-sm font-medium text-green-800">
                            Paid on {format(fee.paymentDate, "PPP")}
                          </p>
                          <p className="text-sm text-green-600">
                            Transaction ID: {fee.transactionId}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            {/* Payment History */}
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>
                  View all your previous fee payments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payments.map((payment) => {
                    const fee = feeStructures.find(f => f.id === payment.feeId)
                    
                    return (
                      <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium">{fee?.name || "Unknown Fee"}</h3>
                            {getPaymentStatusBadge(payment.status)}
                          </div>
                          <p className="text-sm text-gray-600">
                            {format(payment.paymentDate, "PPP")} • {getPaymentMethodBadge(payment.paymentMethod)}
                          </p>
                          <p className="text-sm text-gray-500">
                            Transaction ID: {payment.transactionId}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">₹{payment.amount.toLocaleString()}</p>
                          {payment.receiptUrl && (
                            <Button variant="outline" size="sm" className="mt-2">
                              <Download className="h-4 w-4 mr-2" />
                              Receipt
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                  
                  {payments.length === 0 && (
                    <div className="text-center py-8">
                      <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-medium">No payment history</p>
                      <p className="text-gray-500">Your payment history will appear here</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="methods" className="space-y-6">
            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>
                  Manage your saved payment methods
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          {method.type === "CREDIT_CARD" || method.type === "DEBIT_CARD" ? (
                            <CreditCard className="h-5 w-5 text-gray-600" />
                          ) : (
                            <Banknote className="h-5 w-5 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium">{method.name}</h3>
                          {method.lastFour && (
                            <p className="text-sm text-gray-600">**** **** **** {method.lastFour}</p>
                          )}
                          {method.expiry && (
                            <p className="text-sm text-gray-500">Expires {method.expiry}</p>
                          )}
                          {method.isDefault && (
                            <Badge variant="default" className="text-xs">Default</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <Button className="w-full" variant="outline">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Add Payment Method
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Make Payment</DialogTitle>
            <DialogDescription>
              {selectedFee && `Pay for: ${selectedFee.name}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Amount to Pay</span>
                <span className="text-lg font-bold">₹{paymentAmount.toLocaleString()}</span>
              </div>
              {selectedFee && selectedFee.lateFee && selectedFee.status === "OVERDUE" && (
                <div className="text-sm text-red-600">
                  Includes late fee of ₹{selectedFee.lateFee}
                </div>
              )}
            </div>
            
            <div>
              <Label htmlFor="payment-method">Payment Method</Label>
              <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.id} value={method.id}>
                      {method.name}
                      {method.lastFour && ` (**** ${method.lastFour})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handlePayment} 
                disabled={!selectedPaymentMethod || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay ₹{paymentAmount.toLocaleString()}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}