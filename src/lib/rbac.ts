import { adminDb, adminAuth } from './firebase'
import { UserRole } from './firestore-models'
import { doc, getDoc } from 'firebase/firestore'

export interface UserPermissions {
  canManageUsers: boolean
  canManageDepartments: boolean
  canManageCourses: boolean
  canManageFaculty: boolean
  canManageStudents: boolean
  canViewAllData: boolean
  canEditAllData: boolean
  canDeleteData: boolean
  canManageSystem: boolean
  canViewReports: boolean
  canManageAttendance: boolean
  canManageGrades: boolean
  canManageFiles: boolean
  canManageEmails: boolean
  canManageChat: boolean
}

export interface RolePermissions {
  [key: string]: UserPermissions
}

// Default role permissions
export const defaultRolePermissions: RolePermissions = {
  [UserRole.ADMIN]: {
    canManageUsers: true,
    canManageDepartments: true,
    canManageCourses: true,
    canManageFaculty: true,
    canManageStudents: true,
    canViewAllData: true,
    canEditAllData: true,
    canDeleteData: true,
    canManageSystem: true,
    canViewReports: true,
    canManageAttendance: true,
    canManageGrades: true,
    canManageFiles: true,
    canManageEmails: true,
    canManageChat: true,
  },
  [UserRole.HOD]: {
    canManageUsers: false,
    canManageDepartments: false,
    canManageCourses: true,
    canManageFaculty: true,
    canManageStudents: true,
    canViewAllData: false,
    canEditAllData: false,
    canDeleteData: false,
    canManageSystem: false,
    canViewReports: true,
    canManageAttendance: true,
    canManageGrades: true,
    canManageFiles: true,
    canManageEmails: true,
    canManageChat: true,
  },
  [UserRole.FACULTY]: {
    canManageUsers: false,
    canManageDepartments: false,
    canManageCourses: false,
    canManageFaculty: false,
    canManageStudents: false,
    canViewAllData: false,
    canEditAllData: false,
    canDeleteData: false,
    canManageSystem: false,
    canViewReports: false,
    canManageAttendance: true,
    canManageGrades: true,
    canManageFiles: true,
    canManageEmails: true,
    canManageChat: true,
  },
  [UserRole.STUDENT]: {
    canManageUsers: false,
    canManageDepartments: false,
    canManageCourses: false,
    canManageFaculty: false,
    canManageStudents: false,
    canViewAllData: false,
    canEditAllData: false,
    canDeleteData: false,
    canManageSystem: false,
    canViewReports: false,
    canManageAttendance: false,
    canManageGrades: false,
    canManageFiles: true,
    canManageEmails: true,
    canManageChat: true,
  },
  [UserRole.PARENT]: {
    canManageUsers: false,
    canManageDepartments: false,
    canManageCourses: false,
    canManageFaculty: false,
    canManageStudents: false,
    canViewAllData: false,
    canEditAllData: false,
    canDeleteData: false,
    canManageSystem: false,
    canViewReports: false,
    canManageAttendance: false,
    canManageGrades: false,
    canManageFiles: false,
    canManageEmails: true,
    canManageChat: false,
  },
}

export class RBACService {
  /**
   * Get user role from Firestore
   */
  static async getUserRole(userId: string): Promise<UserRole | null> {
    try {
      const userRef = doc(adminDb.collection('users'), userId)
      const userDoc = await getDoc(userRef)
      
      if (!userDoc.exists()) {
        return null
      }

      const userData = userDoc.data()
      return userData.role || null
    } catch (error) {
      console.error('Error getting user role:', error)
      return null
    }
  }

  /**
   * Get user permissions based on role
   */
  static async getUserPermissions(userId: string): Promise<UserPermissions | null> {
    try {
      const role = await this.getUserRole(userId)
      if (!role) {
        return null
      }

      // Get custom permissions from Firestore if they exist
      const permissionsRef = doc(adminDb.collection('user_permissions'), userId)
      const permissionsDoc = await getDoc(permissionsRef)
      
      let permissions = defaultRolePermissions[role]
      
      if (permissionsDoc.exists()) {
        const customPermissions = permissionsDoc.data()
        // Merge custom permissions with default role permissions
        permissions = { ...permissions, ...customPermissions }
      }

      return permissions
    } catch (error) {
      console.error('Error getting user permissions:', error)
      return null
    }
  }

  /**
   * Check if user has specific permission
   */
  static async hasPermission(userId: string, permission: keyof UserPermissions): Promise<boolean> {
    try {
      const permissions = await this.getUserPermissions(userId)
      if (!permissions) {
        return false
      }

      return permissions[permission]
    } catch (error) {
      console.error('Error checking permission:', error)
      return false
    }
  }

  /**
   * Check if user has any of the specified permissions
   */
  static async hasAnyPermission(userId: string, permissions: (keyof UserPermissions)[]): Promise<boolean> {
    try {
      const userPermissions = await this.getUserPermissions(userId)
      if (!userPermissions) {
        return false
      }

      return permissions.some(permission => userPermissions[permission])
    } catch (error) {
      console.error('Error checking permissions:', error)
      return false
    }
  }

  /**
   * Check if user has all of the specified permissions
   */
  static async hasAllPermissions(userId: string, permissions: (keyof UserPermissions)[]): Promise<boolean> {
    try {
      const userPermissions = await this.getUserPermissions(userId)
      if (!userPermissions) {
        return false
      }

      return permissions.every(permission => userPermissions[permission])
    } catch (error) {
      console.error('Error checking permissions:', error)
      return false
    }
  }

  /**
   * Check if user has specific role
   */
  static async hasRole(userId: string, role: UserRole): Promise<boolean> {
    try {
      const userRole = await this.getUserRole(userId)
      return userRole === role
    } catch (error) {
      console.error('Error checking role:', error)
      return false
    }
  }

  /**
   * Check if user has any of the specified roles
   */
  static async hasAnyRole(userId: string, roles: UserRole[]): Promise<boolean> {
    try {
      const userRole = await this.getUserRole(userId)
      return userRole ? roles.includes(userRole) : false
    } catch (error) {
      console.error('Error checking roles:', error)
      return false
    }
  }

  /**
   * Get user role hierarchy level (higher number = higher privilege)
   */
  static getRoleHierarchyLevel(role: UserRole): number {
    const hierarchy = {
      [UserRole.STUDENT]: 1,
      [UserRole.PARENT]: 2,
      [UserRole.FACULTY]: 3,
      [UserRole.HOD]: 4,
      [UserRole.ADMIN]: 5,
    }
    return hierarchy[role] || 0
  }

  /**
   * Check if user's role is higher than or equal to the specified role
   */
  static async hasRoleLevel(userId: string, minimumRole: UserRole): Promise<boolean> {
    try {
      const userRole = await this.getUserRole(userId)
      if (!userRole) {
        return false
      }

      const userLevel = this.getRoleHierarchyLevel(userRole)
      const requiredLevel = this.getRoleHierarchyLevel(minimumRole)

      return userLevel >= requiredLevel
    } catch (error) {
      console.error('Error checking role level:', error)
      return false
    }
  }

  /**
   * Update user permissions (admin only)
   */
  static async updateUserPermissions(userId: string, permissions: Partial<UserPermissions>): Promise<boolean> {
    try {
      const permissionsRef = doc(adminDb.collection('user_permissions'), userId)
      await permissionsRef.set({
        ...permissions,
        updatedAt: new Date(),
      }, { merge: true })

      return true
    } catch (error) {
      console.error('Error updating user permissions:', error)
      return false
    }
  }

  /**
   * Reset user permissions to default for their role
   */
  static async resetUserPermissions(userId: string): Promise<boolean> {
    try {
      const permissionsRef = doc(adminDb.collection('user_permissions'), userId)
      await permissionsRef.delete()

      return true
    } catch (error) {
      console.error('Error resetting user permissions:', error)
      return false
    }
  }

  /**
   * Middleware to check permissions for API routes
   */
  static requirePermission(permission: keyof UserPermissions) {
    return async (userId: string): Promise<boolean> => {
      return await this.hasPermission(userId, permission)
    }
  }

  /**
   * Middleware to check role for API routes
   */
  static requireRole(role: UserRole) {
    return async (userId: string): Promise<boolean> => {
      return await this.hasRole(userId, role)
    }
  }

  /**
   * Middleware to check minimum role level for API routes
   */
  static requireMinimumRole(minimumRole: UserRole) {
    return async (userId: string): Promise<boolean> => {
      return await this.hasRoleLevel(userId, minimumRole)
    }
  }
}

// Export commonly used permission checkers
export const requireAdmin = RBACService.requireRole(UserRole.ADMIN)
export const requireHOD = RBACService.requireRole(UserRole.HOD)
export const requireFaculty = RBACService.requireRole(UserRole.FACULTY)
export const requireStudent = RBACService.requireRole(UserRole.STUDENT)
export const requireParent = RBACService.requireRole(UserRole.PARENT)

export const requireManageUsers = RBACService.requirePermission('canManageUsers')
export const requireManageSystem = RBACService.requirePermission('canManageSystem')
export const requireViewReports = RBACService.requirePermission('canViewReports')
export const requireManageFiles = RBACService.requirePermission('canManageFiles')