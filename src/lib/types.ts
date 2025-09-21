// Common types that can be used by both client and server components

// User Roles Enum
export enum UserRole {
  ADMIN = 'ADMIN',
  HOD = 'HOD',
  FACULTY = 'FACULTY',
  STUDENT = 'STUDENT',
  PARENT = 'PARENT'
}

// Gender Enum
export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

// Payment Status Enum
export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PARTIAL = 'PARTIAL',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED'
}

// Attendance Status Enum
export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  LEAVE = 'LEAVE'
}

// Grade Enum
export enum Grade {
  O = 'O',
  A_PLUS = 'A_PLUS',
  A = 'A',
  B_PLUS = 'B_PLUS',
  B = 'B',
  C = 'C',
  D = 'D',
  F = 'F'
}