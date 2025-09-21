import { UserRole } from "@/lib/types"
import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: UserRole
      profileImage?: string
      studentId?: string
      facultyId?: string
      adminId?: string
      parentId?: string
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: UserRole
    profileImage?: string
    studentId?: string
    facultyId?: string
    adminId?: string
    parentId?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole
    studentId?: string
    facultyId?: string
    adminId?: string
    parentId?: string
    profileImage?: string
  }
}