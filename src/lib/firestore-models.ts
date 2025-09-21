import { adminDb } from './firebase-server'
import { UserRole, Gender, PaymentStatus, AttendanceStatus, Grade } from './types'
import { 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  Timestamp,
  setDoc,
  serverTimestamp 
} from 'firebase-admin/firestore'

// Base User Model
export interface User {
  id?: string
  email: string
  name: string
  phone?: string
  profileImage?: string
  role: UserRole
  isActive: boolean
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
}

// User Model Service
export class UserService {
  private collectionRef = adminDb.collection('users')

  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(this.collectionRef, {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return docRef.id
  }

  async getById(id: string): Promise<User | null> {
    const docRef = this.collectionRef.doc(id)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) {
      return null
    }

    const data = docSnap.data()
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      lastLoginAt: data.lastLoginAt?.toDate()
    } as User
  }

  async getByEmail(email: string): Promise<User | null> {
    const q = query(this.collectionRef, where('email', '==', email))
    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      return null
    }

    const doc = querySnapshot.docs[0]
    const data = doc.data()
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      lastLoginAt: data.lastLoginAt?.toDate()
    } as User
  }

  async update(id: string, userData: Partial<User>): Promise<void> {
    const docRef = this.collectionRef.doc(id)
    await updateDoc(docRef, {
      ...userData,
      updatedAt: serverTimestamp()
    })
  }

  async delete(id: string): Promise<void> {
    const docRef = this.collectionRef.doc(id)
    await deleteDoc(docRef)
  }

  async getAll(limitCount = 50): Promise<User[]> {
    const q = query(this.collectionRef, orderBy('createdAt', 'desc'), limit(limitCount))
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        lastLoginAt: data.lastLoginAt?.toDate()
      } as User
    })
  }

  async getByRole(role: UserRole): Promise<User[]> {
    const q = query(this.collectionRef, where('role', '==', role))
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        lastLoginAt: data.lastLoginAt?.toDate()
      } as User
    })
  }
}

// Department Model
export interface Department {
  id?: string
  name: string
  code: string
  description?: string
  hodId?: string
  createdAt: Date
  updatedAt: Date
}

export class DepartmentService {
  private collectionRef = adminDb.collection('departments')

  async create(deptData: Omit<Department, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(this.collectionRef, {
      ...deptData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return docRef.id
  }

  async getById(id: string): Promise<Department | null> {
    const docRef = this.collectionRef.doc(id)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) {
      return null
    }

    const data = docSnap.data()
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    } as Department
  }

  async getAll(): Promise<Department[]> {
    const q = query(this.collectionRef, orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as Department
    })
  }
}

// Student Model
export interface Student {
  id?: string
  userId: string
  rollNumber: string
  admissionNo: string
  courseId: string
  semester: number
  batch: string
  dateOfBirth: Date
  gender: Gender
  bloodGroup?: string
  address?: string
  city?: string
  state?: string
  country?: string
  pincode?: string
  parentName?: string
  parentPhone?: string
  parentEmail?: string
  admissionDate: Date
  createdAt: Date
  updatedAt: Date
}

export class StudentService {
  private collectionRef = adminDb.collection('students')

  async create(studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(this.collectionRef, {
      ...studentData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return docRef.id
  }

  async getById(id: string): Promise<Student | null> {
    const docRef = this.collectionRef.doc(id)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) {
      return null
    }

    const data = docSnap.data()
    return {
      id: docSnap.id,
      ...data,
      dateOfBirth: data.dateOfBirth?.toDate() || new Date(),
      admissionDate: data.admissionDate?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    } as Student
  }

  async getByUserId(userId: string): Promise<Student | null> {
    const q = query(this.collectionRef, where('userId', '==', userId))
    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      return null
    }

    const doc = querySnapshot.docs[0]
    const data = doc.data()
    return {
      id: doc.id,
      ...data,
      dateOfBirth: data.dateOfBirth?.toDate() || new Date(),
      admissionDate: data.admissionDate?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    } as Student
  }

  async getByRollNumber(rollNumber: string): Promise<Student | null> {
    const q = query(this.collectionRef, where('rollNumber', '==', rollNumber))
    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      return null
    }

    const doc = querySnapshot.docs[0]
    const data = doc.data()
    return {
      id: doc.id,
      ...data,
      dateOfBirth: data.dateOfBirth?.toDate() || new Date(),
      admissionDate: data.admissionDate?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    } as Student
  }
}

// Faculty Model
export interface Faculty {
  id?: string
  userId: string
  employeeId: string
  departmentId: string
  designation: string
  qualification?: string
  experience?: number
  joiningDate: Date
  isHOD: boolean
  createdAt: Date
  updatedAt: Date
}

export class FacultyService {
  private collectionRef = adminDb.collection('faculty')

  async create(facultyData: Omit<Faculty, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(this.collectionRef, {
      ...facultyData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return docRef.id
  }

  async getById(id: string): Promise<Faculty | null> {
    const docRef = this.collectionRef.doc(id)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) {
      return null
    }

    const data = docSnap.data()
    return {
      id: docSnap.id,
      ...data,
      joiningDate: data.joiningDate?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    } as Faculty
  }

  async getByUserId(userId: string): Promise<Faculty | null> {
    const q = query(this.collectionRef, where('userId', '==', userId))
    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      return null
    }

    const doc = querySnapshot.docs[0]
    const data = doc.data()
    return {
      id: doc.id,
      ...data,
      joiningDate: data.joiningDate?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    } as Faculty
  }

  async getByDepartment(departmentId: string): Promise<Faculty[]> {
    const q = query(this.collectionRef, where('departmentId', '==', departmentId))
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        joiningDate: data.joiningDate?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as Faculty
    })
  }
}

// Course Model
export interface Course {
  id?: string
  name: string
  code: string
  duration: number
  description?: string
  departmentId: string
  createdAt: Date
  updatedAt: Date
}

export class CourseService {
  private collectionRef = adminDb.collection('courses')

  async create(courseData: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(this.collectionRef, {
      ...courseData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return docRef.id
  }

  async getById(id: string): Promise<Course | null> {
    const docRef = this.collectionRef.doc(id)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) {
      return null
    }

    const data = docSnap.data()
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    } as Course
  }

  async getAll(): Promise<Course[]> {
    const q = query(this.collectionRef, orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as Course
    })
  }
}

// Export services
export const userService = new UserService()
export const departmentService = new DepartmentService()
export const studentService = new StudentService()
export const facultyService = new FacultyService()
export const courseService = new CourseService()