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
import { 
  Shield, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  Key,
  Eye,
  Settings,
  FileText,
  Calendar,
  DollarSign,
  MessageSquare,
  BarChart3,
  Database,
  Bell,
  UserCheck,
  AlertTriangle
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

interface Role {
  id: string
  name: string
  description: string
  permissions: Permission[]
  userCount: number
  isActive: boolean
  createdAt: string
}

interface Permission {
  id: string
  name: string
  description: string
  category: string
  module: string
}

export default function RoleManagement() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  })

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user.role !== "ADMIN") {
      router.push("/auth/signin")
    }
  }, [session, status, router])

  useEffect(() => {
    // Mock data - in real app, this would come from API
    const mockPermissions: Permission[] = [
      // User Management
      { id: 'user_view', name: 'View Users', description: 'Can view user list and details', category: 'User Management', module: 'users' },
      { id: 'user_create', name: 'Create Users', description: 'Can create new user accounts', category: 'User Management', module: 'users' },
      { id: 'user_edit', name: 'Edit Users', description: 'Can modify user information', category: 'User Management', module: 'users' },
      { id: 'user_delete', name: 'Delete Users', description: 'Can delete user accounts', category: 'User Management', module: 'users' },
      { id: 'user_activate', name: 'Activate/Deactivate Users', description: 'Can activate or deactivate users', category: 'User Management', module: 'users' },
      
      // Academic Management
      { id: 'academic_view', name: 'View Academic Data', description: 'Can view courses, subjects, and classes', category: 'Academic Management', module: 'academic' },
      { id: 'academic_create', name: 'Create Academic Data', description: 'Can create courses and subjects', category: 'Academic Management', module: 'academic' },
      { id: 'academic_edit', name: 'Edit Academic Data', description: 'Can modify academic information', category: 'Academic Management', module: 'academic' },
      
      // Attendance Management
      { id: 'attendance_view', name: 'View Attendance', description: 'Can view attendance records', category: 'Attendance Management', module: 'attendance' },
      { id: 'attendance_mark', name: 'Mark Attendance', description: 'Can mark student attendance', category: 'Attendance Management', module: 'attendance' },
      { id: 'attendance_edit', name: 'Edit Attendance', description: 'Can modify attendance records', category: 'Attendance Management', module: 'attendance' },
      
      // Fee Management
      { id: 'fee_view', name: 'View Fee Data', description: 'Can view fee structures and payments', category: 'Fee Management', module: 'fees' },
      { id: 'fee_create', name: 'Create Fee Structures', description: 'Can create fee structures', category: 'Fee Management', module: 'fees' },
      { id: 'fee_edit', name: 'Edit Fee Data', description: 'Can modify fee information', category: 'Fee Management', module: 'fees' },
      
      // Exam Management
      { id: 'exam_view', name: 'View Exam Data', description: 'Can view exam schedules and results', category: 'Exam Management', module: 'exams' },
      { id: 'exam_create', name: 'Create Exams', description: 'Can create exam schedules', category: 'Exam Management', module: 'exams' },
      { id: 'exam_grade', name: 'Grade Exams', description: 'Can grade exam papers', category: 'Exam Management', module: 'exams' },
      
      // System Settings
      { id: 'settings_view', name: 'View Settings', description: 'Can view system settings', category: 'System Settings', module: 'settings' },
      { id: 'settings_edit', name: 'Edit Settings', description: 'Can modify system settings', category: 'System Settings', module: 'settings' },
      { id: 'settings_backup', name: 'Backup System', description: 'Can perform system backups', category: 'System Settings', module: 'settings' },
      
      // Reports
      { id: 'reports_view', name: 'View Reports', description: 'Can view system reports', category: 'Reports', module: 'reports' },
      { id: 'reports_generate', name: 'Generate Reports', description: 'Can generate new reports', category: 'Reports', module: 'reports' },
      { id: 'reports_export', name: 'Export Reports', description: 'Can export reports', category: 'Reports', module: 'reports' },
      
      // Notifications
      { id: 'notifications_view', name: 'View Notifications', description: 'Can view system notifications', category: 'Notifications', module: 'notifications' },
      { id: 'notifications_send', name: 'Send Notifications', description: 'Can send notifications', category: 'Notifications', module: 'notifications' },
      
      // Role Management
      { id: 'roles_view', name: 'View Roles', description: 'Can view roles and permissions', category: 'Role Management', module: 'roles' },
      { id: 'roles_create', name: 'Create Roles', description: 'Can create new roles', category: 'Role Management', module: 'roles' },
      { id: 'roles_edit', name: 'Edit Roles', description: 'Can modify roles and permissions', category: 'Role Management', module: 'roles' },
    ]

    const mockRoles: Role[] = [
      {
        id: '1',
        name: 'Administrator',
        description: 'Full system access with all permissions',
        permissions: mockPermissions,
        userCount: 3,
        isActive: true,
        createdAt: '2023-01-01T00:00:00Z'
      },
      {
        id: '2',
        name: 'Head of Department',
        description: 'Department-level management with academic oversight',
        permissions: mockPermissions.filter(p => 
          p.module === 'users' && ['user_view', 'user_edit'].includes(p.id) ||
          p.module === 'academic' ||
          p.module === 'attendance' ||
          p.module === 'exams' ||
          p.module === 'reports' ||
          p.module === 'notifications'
        ),
        userCount: 6,
        isActive: true,
        createdAt: '2023-01-15T00:00:00Z'
      },
      {
        id: '3',
        name: 'Faculty',
        description: 'Teaching staff with academic and attendance management',
        permissions: mockPermissions.filter(p => 
          p.module === 'users' && p.id === 'user_view' ||
          p.module === 'academic' && ['academic_view'].includes(p.id) ||
          p.module === 'attendance' ||
          p.module === 'exams' && ['exam_view', 'exam_grade'].includes(p.id) ||
          p.module === 'reports' && ['reports_view'].includes(p.id)
        ),
        userCount: 45,
        isActive: true,
        createdAt: '2023-02-01T00:00:00Z'
      },
      {
        id: '4',
        name: 'Student',
        description: 'Students with limited access to view their data',
        permissions: mockPermissions.filter(p => 
          p.module === 'users' && p.id === 'user_view' ||
          p.module === 'academic' && ['academic_view'].includes(p.id) ||
          p.module === 'attendance' && ['attendance_view'].includes(p.id) ||
          p.module === 'exams' && ['exam_view'].includes(p.id) ||
          p.module === 'fees' && ['fee_view'].includes(p.id)
        ),
        userCount: 4850,
        isActive: true,
        createdAt: '2023-02-15T00:00:00Z'
      },
      {
        id: '5',
        name: 'Parent',
        description: 'Parents with access to view their children\'s data',
        permissions: mockPermissions.filter(p => 
          p.module === 'users' && p.id === 'user_view' ||
          p.module === 'academic' && ['academic_view'].includes(p.id) ||
          p.module === 'attendance' && ['attendance_view'].includes(p.id) ||
          p.module === 'exams' && ['exam_view'].includes(p.id) ||
          p.module === 'fees' && ['fee_view'].includes(p.id)
        ),
        userCount: 1200,
        isActive: true,
        createdAt: '2023-03-01T00:00:00Z'
      }
    ]

    setPermissions(mockPermissions)
    setRoles(mockRoles)
  }, [])

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" })
    router.push("/")
  }

  const handleCreateRole = () => {
    if (!newRole.name || !newRole.description) {
      alert('Please fill in all required fields')
      return
    }

    const role: Role = {
      id: Date.now().toString(),
      name: newRole.name,
      description: newRole.description,
      permissions: permissions.filter(p => newRole.permissions.includes(p.id)),
      userCount: 0,
      isActive: true,
      createdAt: new Date().toISOString()
    }

    setRoles([...roles, role])
    setNewRole({ name: '', description: '', permissions: [] })
    setIsCreateDialogOpen(false)
  }

  const handleEditRole = (role: Role) => {
    setSelectedRole(role)
    setIsEditDialogOpen(true)
  }

  const handleUpdateRole = () => {
    if (!selectedRole) return

    const updatedRoles = roles.map(role => 
      role.id === selectedRole.id ? selectedRole : role
    )
    setRoles(updatedRoles)
    setIsEditDialogOpen(false)
    setSelectedRole(null)
  }

  const handleDeleteRole = (roleId: string) => {
    if (confirm('Are you sure you want to delete this role? This will affect all users with this role.')) {
      setRoles(roles.filter(role => role.id !== roleId))
    }
  }

  const handleToggleRoleStatus = (roleId: string) => {
    setRoles(roles.map(role => 
      role.id === roleId 
        ? { ...role, isActive: !role.isActive }
        : role
    ))
  }

  const getModuleIcon = (module: string) => {
    const icons: Record<string, any> = {
      users: Users,
      academic: FileText,
      attendance: Calendar,
      fees: DollarSign,
      exams: BarChart3,
      settings: Settings,
      reports: BarChart3,
      notifications: Bell,
      roles: Shield
    }
    return icons[module] || Key
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'User Management': 'bg-blue-100 text-blue-800',
      'Academic Management': 'bg-green-100 text-green-800',
      'Attendance Management': 'bg-yellow-100 text-yellow-800',
      'Fee Management': 'bg-purple-100 text-purple-800',
      'Exam Management': 'bg-red-100 text-red-800',
      'System Settings': 'bg-indigo-100 text-indigo-800',
      'Reports': 'bg-pink-100 text-pink-800',
      'Notifications': 'bg-orange-100 text-orange-800',
      'Role Management': 'bg-gray-100 text-gray-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Role & Permission Management</h1>
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roles.length}</div>
              <p className="text-xs text-muted-foreground">
                System roles defined
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Roles</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roles.filter(r => r.isActive).length}</div>
              <p className="text-xs text-muted-foreground">
                Currently in use
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Permissions</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{permissions.length}</div>
              <p className="text-xs text-muted-foreground">
                Available permissions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Users Managed</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roles.reduce((sum, role) => sum + role.userCount, 0)}</div>
              <p className="text-xs text-muted-foreground">
                Total users across roles
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="roles" className="space-y-6">
          <TabsList>
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
          </TabsList>

          {/* Roles Tab */}
          <TabsContent value="roles">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>System Roles</span>
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Role
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>Create New Role</DialogTitle>
                        <DialogDescription>
                          Define a new role with specific permissions
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="name" className="text-right">
                            Role Name *
                          </Label>
                          <Input
                            id="name"
                            value={newRole.name}
                            onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="description" className="text-right">
                            Description *
                          </Label>
                          <Textarea
                            id="description"
                            value={newRole.description}
                            onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                            className="col-span-3"
                          />
                        </div>
                        <div className="col-span-4">
                          <Label className="text-sm font-medium">Permissions</Label>
                          <div className="mt-2 max-h-60 overflow-y-auto border rounded-md p-3">
                            {Object.entries(
                              permissions.reduce((acc, perm) => {
                                if (!acc[perm.category]) acc[perm.category] = []
                                acc[perm.category].push(perm)
                                return acc
                              }, {} as Record<string, Permission[]>)
                            ).map(([category, categoryPermissions]) => (
                              <div key={category} className="mb-4">
                                <h4 className="font-medium text-sm mb-2">{category}</h4>
                                <div className="space-y-2">
                                  {categoryPermissions.map((permission) => (
                                    <div key={permission.id} className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        id={permission.id}
                                        checked={newRole.permissions.includes(permission.id)}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setNewRole({
                                              ...newRole,
                                              permissions: [...newRole.permissions, permission.id]
                                            })
                                          } else {
                                            setNewRole({
                                              ...newRole,
                                              permissions: newRole.permissions.filter(id => id !== permission.id)
                                            })
                                          }
                                        }}
                                        className="rounded"
                                      />
                                      <Label htmlFor={permission.id} className="text-sm">
                                        {permission.name}
                                      </Label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleCreateRole}>Create Role</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
                <CardDescription>
                  Manage system roles and their associated permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Role Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Permissions</TableHead>
                        <TableHead>Users</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {roles.map((role) => (
                        <TableRow key={role.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center space-x-2">
                              <Shield className="h-4 w-4 text-gray-400" />
                              <span>{role.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <p className="text-sm text-gray-600 truncate">{role.description}</p>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{role.permissions.length} permissions</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4 text-gray-400" />
                              <span>{role.userCount}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={role.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                              {role.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditRole(role)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleRoleStatus(role.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {role.userCount === 0 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteRole(role.id)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Permissions Tab */}
          <TabsContent value="permissions">
            <Card>
              <CardHeader>
                <CardTitle>System Permissions</CardTitle>
                <CardDescription>
                  View all available permissions in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(
                    permissions.reduce((acc, perm) => {
                      if (!acc[perm.category]) acc[perm.category] = []
                      acc[perm.category].push(perm)
                      return acc
                    }, {} as Record<string, Permission[]>)
                  ).map(([category, categoryPermissions]) => (
                    <div key={category} className="border rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-4">
                        <h3 className="text-lg font-semibold">{category}</h3>
                        <Badge className={getCategoryColor(category)}>
                          {categoryPermissions.length} permissions
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categoryPermissions.map((permission) => {
                          const Icon = getModuleIcon(permission.module)
                          return (
                            <div key={permission.id} className="border rounded-md p-3">
                              <div className="flex items-center space-x-2 mb-2">
                                <Icon className="h-4 w-4 text-gray-400" />
                                <span className="font-medium text-sm">{permission.name}</span>
                              </div>
                              <p className="text-xs text-gray-600 mb-2">{permission.description}</p>
                              <div className="flex items-center justify-between">
                                <Badge variant="outline" className="text-xs">
                                  {permission.module}
                                </Badge>
                                <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  {permission.id}
                                </code>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Modify role details and permissions
            </DialogDescription>
          </DialogHeader>
          {selectedRole && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Role Name
                </Label>
                <Input
                  id="edit-name"
                  value={selectedRole.name}
                  onChange={(e) => setSelectedRole({ ...selectedRole, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="edit-description"
                  value={selectedRole.description}
                  onChange={(e) => setSelectedRole({ ...selectedRole, description: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Status</Label>
                <div className="col-span-3">
                  <Switch
                    checked={selectedRole.isActive}
                    onCheckedChange={(checked) => setSelectedRole({ ...selectedRole, isActive: checked })}
                  />
                  <span className="ml-2 text-sm">
                    {selectedRole.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="col-span-4">
                <Label className="text-sm font-medium">Permissions</Label>
                <div className="mt-2 max-h-60 overflow-y-auto border rounded-md p-3">
                  {Object.entries(
                    permissions.reduce((acc, perm) => {
                      if (!acc[perm.category]) acc[perm.category] = []
                      acc[perm.category].push(perm)
                      return acc
                    }, {} as Record<string, Permission[]>)
                  ).map(([category, categoryPermissions]) => (
                    <div key={category} className="mb-4">
                      <h4 className="font-medium text-sm mb-2">{category}</h4>
                      <div className="space-y-2">
                        {categoryPermissions.map((permission) => (
                          <div key={permission.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`edit-${permission.id}`}
                              checked={selectedRole.permissions.some(p => p.id === permission.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedRole({
                                    ...selectedRole,
                                    permissions: [...selectedRole.permissions, permission]
                                  })
                                } else {
                                  setSelectedRole({
                                    ...selectedRole,
                                    permissions: selectedRole.permissions.filter(p => p.id !== permission.id)
                                  })
                                }
                              }}
                              className="rounded"
                            />
                            <Label htmlFor={`edit-${permission.id}`} className="text-sm">
                              {permission.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleUpdateRole}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}