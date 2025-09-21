"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Database, 
  Bell, 
  Mail, 
  Shield, 
  Globe,
  Users,
  Calendar,
  FileText,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface SystemSettings {
  general: {
    institutionName: string
    institutionCode: string
    academicYear: string
    timezone: string
    language: string
    dateFormat: string
  }
  email: {
    smtpHost: string
    smtpPort: string
    smtpUsername: string
    smtpPassword: string
    fromEmail: string
    fromName: string
    enableSSL: boolean
  }
  security: {
    sessionTimeout: number
    passwordPolicy: {
      minLength: number
      requireUppercase: boolean
      requireLowercase: boolean
      requireNumbers: boolean
      requireSpecialChars: boolean
      expiryDays: number
    }
    twoFactorAuth: boolean
    loginAttempts: number
    accountLockoutDuration: number
  }
  notifications: {
    emailNotifications: boolean
    smsNotifications: boolean
    pushNotifications: boolean
    attendanceAlerts: boolean
    feeReminders: boolean
    examNotifications: boolean
    systemAlerts: boolean
  }
  backup: {
    autoBackup: boolean
    backupFrequency: string
    backupTime: string
    retentionPeriod: number
    backupLocation: string
    lastBackup: string
    nextBackup: string
  }
}

export default function SystemSettings() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      institutionName: "Engineering College Management System",
      institutionCode: "ECMS",
      academicYear: "2024-2025",
      timezone: "UTC",
      language: "en",
      dateFormat: "MM/DD/YYYY"
    },
    email: {
      smtpHost: "smtp.gmail.com",
      smtpPort: "587",
      smtpUsername: "noreply@ecms.edu",
      smtpPassword: "••••••••",
      fromEmail: "noreply@ecms.edu",
      fromName: "ECMS System",
      enableSSL: true
    },
    security: {
      sessionTimeout: 30,
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        expiryDays: 90
      },
      twoFactorAuth: false,
      loginAttempts: 5,
      accountLockoutDuration: 15
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      attendanceAlerts: true,
      feeReminders: true,
      examNotifications: true,
      systemAlerts: true
    },
    backup: {
      autoBackup: true,
      backupFrequency: "daily",
      backupTime: "02:00",
      retentionPeriod: 30,
      backupLocation: "/backups",
      lastBackup: "2024-01-15T02:00:00Z",
      nextBackup: "2024-01-16T02:00:00Z"
    }
  })

  const [isLoading, setIsLoading] = useState(false)
  const [showRestartDialog, setShowRestartDialog] = useState(false)
  const [showBackupDialog, setShowBackupDialog] = useState(false)

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user.role !== "ADMIN") {
      router.push("/auth/signin")
    }
  }, [session, status, router])

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" })
    router.push("/")
  }

  const handleSaveSettings = async (section: keyof SystemSettings) => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
    // Show success message
    alert(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully!`)
  }

  const handleBackupNow = async () => {
    setIsLoading(true)
    // Simulate backup process
    await new Promise(resolve => setTimeout(resolve, 3000))
    setIsLoading(false)
    setShowBackupDialog(false)
    alert("Backup completed successfully!")
  }

  const handleRestartSystem = async () => {
    setIsLoading(true)
    // Simulate system restart
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsLoading(false)
    setShowRestartDialog(false)
    alert("System restarted successfully!")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
              <Badge className="ml-3 bg-blue-100 text-blue-800">Administrator</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
                <p className="text-xs text-gray-500">Last login: Today, 9:30 AM</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="backup">Backup</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  General Settings
                </CardTitle>
                <CardDescription>
                  Configure basic system information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="institutionName">Institution Name</Label>
                    <Input
                      id="institutionName"
                      value={settings.general.institutionName}
                      onChange={(e) => setSettings({
                        ...settings,
                        general: { ...settings.general, institutionName: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="institutionCode">Institution Code</Label>
                    <Input
                      id="institutionCode"
                      value={settings.general.institutionCode}
                      onChange={(e) => setSettings({
                        ...settings,
                        general: { ...settings.general, institutionCode: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="academicYear">Academic Year</Label>
                    <Input
                      id="academicYear"
                      value={settings.general.academicYear}
                      onChange={(e) => setSettings({
                        ...settings,
                        general: { ...settings.general, academicYear: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={settings.general.timezone} onValueChange={(value) => setSettings({
                      ...settings,
                      general: { ...settings.general, timezone: value }
                    })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        <SelectItem value="Europe/London">London</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select value={settings.general.language} onValueChange={(value) => setSettings({
                      ...settings,
                      general: { ...settings.general, language: value }
                    })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateFormat">Date Format</Label>
                    <Select value={settings.general.dateFormat} onValueChange={(value) => setSettings({
                      ...settings,
                      general: { ...settings.general, dateFormat: value }
                    })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => handleSaveSettings('general')} disabled={isLoading}>
                    {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Settings */}
          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  Email Configuration
                </CardTitle>
                <CardDescription>
                  Configure SMTP settings for system emails
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="smtpHost">SMTP Host</Label>
                    <Input
                      id="smtpHost"
                      value={settings.email.smtpHost}
                      onChange={(e) => setSettings({
                        ...settings,
                        email: { ...settings.email, smtpHost: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input
                      id="smtpPort"
                      value={settings.email.smtpPort}
                      onChange={(e) => setSettings({
                        ...settings,
                        email: { ...settings.email, smtpPort: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpUsername">SMTP Username</Label>
                    <Input
                      id="smtpUsername"
                      value={settings.email.smtpUsername}
                      onChange={(e) => setSettings({
                        ...settings,
                        email: { ...settings.email, smtpUsername: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPassword">SMTP Password</Label>
                    <Input
                      id="smtpPassword"
                      type="password"
                      value={settings.email.smtpPassword}
                      onChange={(e) => setSettings({
                        ...settings,
                        email: { ...settings.email, smtpPassword: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fromEmail">From Email</Label>
                    <Input
                      id="fromEmail"
                      value={settings.email.fromEmail}
                      onChange={(e) => setSettings({
                        ...settings,
                        email: { ...settings.email, fromEmail: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fromName">From Name</Label>
                    <Input
                      id="fromName"
                      value={settings.email.fromName}
                      onChange={(e) => setSettings({
                        ...settings,
                        email: { ...settings.email, fromName: e.target.value }
                      })}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableSSL"
                    checked={settings.email.enableSSL}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      email: { ...settings.email, enableSSL: checked }
                    })}
                  />
                  <Label htmlFor="enableSSL">Enable SSL/TLS</Label>
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => handleSaveSettings('email')} disabled={isLoading}>
                    {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Configure security policies and authentication settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => setSettings({
                        ...settings,
                        security: { ...settings.security, sessionTimeout: parseInt(e.target.value) }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="loginAttempts">Max Login Attempts</Label>
                    <Input
                      id="loginAttempts"
                      type="number"
                      value={settings.security.loginAttempts}
                      onChange={(e) => setSettings({
                        ...settings,
                        security: { ...settings.security, loginAttempts: parseInt(e.target.value) }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountLockoutDuration">Account Lockout Duration (minutes)</Label>
                    <Input
                      id="accountLockoutDuration"
                      type="number"
                      value={settings.security.accountLockoutDuration}
                      onChange={(e) => setSettings({
                        ...settings,
                        security: { ...settings.security, accountLockoutDuration: parseInt(e.target.value) }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                    <Input
                      id="passwordExpiry"
                      type="number"
                      value={settings.security.passwordPolicy.expiryDays}
                      onChange={(e) => setSettings({
                        ...settings,
                        security: {
                          ...settings.security,
                          passwordPolicy: { ...settings.security.passwordPolicy, expiryDays: parseInt(e.target.value) }
                        }
                      })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Password Policy</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="requireUppercase"
                        checked={settings.security.passwordPolicy.requireUppercase}
                        onCheckedChange={(checked) => setSettings({
                          ...settings,
                          security: {
                            ...settings.security,
                            passwordPolicy: { ...settings.security.passwordPolicy, requireUppercase: checked }
                          }
                        })}
                      />
                      <Label htmlFor="requireUppercase">Require Uppercase Letters</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="requireLowercase"
                        checked={settings.security.passwordPolicy.requireLowercase}
                        onCheckedChange={(checked) => setSettings({
                          ...settings,
                          security: {
                            ...settings.security,
                            passwordPolicy: { ...settings.security.passwordPolicy, requireLowercase: checked }
                          }
                        })}
                      />
                      <Label htmlFor="requireLowercase">Require Lowercase Letters</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="requireNumbers"
                        checked={settings.security.passwordPolicy.requireNumbers}
                        onCheckedChange={(checked) => setSettings({
                          ...settings,
                          security: {
                            ...settings.security,
                            passwordPolicy: { ...settings.security.passwordPolicy, requireNumbers: checked }
                          }
                        })}
                      />
                      <Label htmlFor="requireNumbers">Require Numbers</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="requireSpecialChars"
                        checked={settings.security.passwordPolicy.requireSpecialChars}
                        onCheckedChange={(checked) => setSettings({
                          ...settings,
                          security: {
                            ...settings.security,
                            passwordPolicy: { ...settings.security.passwordPolicy, requireSpecialChars: checked }
                          }
                        })}
                      />
                      <Label htmlFor="requireSpecialChars">Require Special Characters</Label>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="twoFactorAuth"
                    checked={settings.security.twoFactorAuth}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      security: { ...settings.security, twoFactorAuth: checked }
                    })}
                  />
                  <Label htmlFor="twoFactorAuth">Enable Two-Factor Authentication</Label>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleSaveSettings('security')} disabled={isLoading}>
                    {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Notification Settings
                </CardTitle>
                <CardDescription>
                  Configure system notifications and alerts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Notification Types</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="emailNotifications"
                          checked={settings.notifications.emailNotifications}
                          onCheckedChange={(checked) => setSettings({
                            ...settings,
                            notifications: { ...settings.notifications, emailNotifications: checked }
                          })}
                        />
                        <Label htmlFor="emailNotifications">Email Notifications</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="smsNotifications"
                          checked={settings.notifications.smsNotifications}
                          onCheckedChange={(checked) => setSettings({
                            ...settings,
                            notifications: { ...settings.notifications, smsNotifications: checked }
                          })}
                        />
                        <Label htmlFor="smsNotifications">SMS Notifications</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="pushNotifications"
                          checked={settings.notifications.pushNotifications}
                          onCheckedChange={(checked) => setSettings({
                            ...settings,
                            notifications: { ...settings.notifications, pushNotifications: checked }
                          })}
                        />
                        <Label htmlFor="pushNotifications">Push Notifications</Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Alert Categories</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="attendanceAlerts"
                          checked={settings.notifications.attendanceAlerts}
                          onCheckedChange={(checked) => setSettings({
                            ...settings,
                            notifications: { ...settings.notifications, attendanceAlerts: checked }
                          })}
                        />
                        <Label htmlFor="attendanceAlerts">Attendance Alerts</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="feeReminders"
                          checked={settings.notifications.feeReminders}
                          onCheckedChange={(checked) => setSettings({
                            ...settings,
                            notifications: { ...settings.notifications, feeReminders: checked }
                          })}
                        />
                        <Label htmlFor="feeReminders">Fee Reminders</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="examNotifications"
                          checked={settings.notifications.examNotifications}
                          onCheckedChange={(checked) => setSettings({
                            ...settings,
                            notifications: { ...settings.notifications, examNotifications: checked }
                          })}
                        />
                        <Label htmlFor="examNotifications">Exam Notifications</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="systemAlerts"
                          checked={settings.notifications.systemAlerts}
                          onCheckedChange={(checked) => setSettings({
                            ...settings,
                            notifications: { ...settings.notifications, systemAlerts: checked }
                          })}
                        />
                        <Label htmlFor="systemAlerts">System Alerts</Label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleSaveSettings('notifications')} disabled={isLoading}>
                    {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Backup Settings */}
          <TabsContent value="backup">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Backup & Recovery
                </CardTitle>
                <CardDescription>
                  Configure system backup settings and manage data recovery
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="backupFrequency">Backup Frequency</Label>
                    <Select value={settings.backup.backupFrequency} onValueChange={(value) => setSettings({
                      ...settings,
                      backup: { ...settings.backup, backupFrequency: value }
                    })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="backupTime">Backup Time</Label>
                    <Input
                      id="backupTime"
                      type="time"
                      value={settings.backup.backupTime}
                      onChange={(e) => setSettings({
                        ...settings,
                        backup: { ...settings.backup, backupTime: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="retentionPeriod">Retention Period (days)</Label>
                    <Input
                      id="retentionPeriod"
                      type="number"
                      value={settings.backup.retentionPeriod}
                      onChange={(e) => setSettings({
                        ...settings,
                        backup: { ...settings.backup, retentionPeriod: parseInt(e.target.value) }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="backupLocation">Backup Location</Label>
                    <Input
                      id="backupLocation"
                      value={settings.backup.backupLocation}
                      onChange={(e) => setSettings({
                        ...settings,
                        backup: { ...settings.backup, backupLocation: e.target.value }
                      })}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="autoBackup"
                    checked={settings.backup.autoBackup}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      backup: { ...settings.backup, autoBackup: checked }
                    })}
                  />
                  <Label htmlFor="autoBackup">Enable Automatic Backup</Label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium">Last Backup</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {new Date(settings.backup.lastBackup).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium">Next Backup</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {new Date(settings.backup.nextBackup).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4">
                  <div className="flex space-x-2">
                    <Button onClick={() => setShowBackupDialog(true)} disabled={isLoading}>
                      <Database className="h-4 w-4 mr-2" />
                      Backup Now
                    </Button>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download Backup
                    </Button>
                    <Button variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Restore Backup
                    </Button>
                  </div>
                  <Button onClick={() => handleSaveSettings('backup')} disabled={isLoading}>
                    {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* System Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              System Actions
            </CardTitle>
            <CardDescription>
              Critical system operations - use with caution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Button 
                variant="destructive" 
                onClick={() => setShowRestartDialog(true)}
                disabled={isLoading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Restart System
              </Button>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                View System Logs
              </Button>
              <Button variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Clear Cache
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Backup Dialog */}
      <Dialog open={showBackupDialog} onOpenChange={setShowBackupDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Backup</DialogTitle>
            <DialogDescription>
              Are you sure you want to start a system backup? This may take several minutes.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBackupDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBackupNow} disabled={isLoading}>
              {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Database className="h-4 w-4 mr-2" />}
              Start Backup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restart Dialog */}
      <Dialog open={showRestartDialog} onOpenChange={setShowRestartDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm System Restart</DialogTitle>
            <DialogDescription>
              Are you sure you want to restart the system? All active users will be logged out.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRestartDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRestartSystem} disabled={isLoading}>
              {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Restart System
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}