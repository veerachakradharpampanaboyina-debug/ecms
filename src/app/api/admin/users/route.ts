import { NextRequest, NextResponse } from 'next/server'
// import { getServerSession } from 'next-auth' // Removed
// import { authOptions } from '@/lib/auth' // Removed
import { db } from '@/lib/firebase' // Using Firestore db
import { collection, query, where, getDocs, orderBy, addDoc, doc, setDoc } from "firebase/firestore"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
// import bcrypt from 'bcryptjs' // Not needed for Firebase Auth

// GET /api/admin/users - Get all users
export async function GET(request: NextRequest) {
  try {
    // TODO: Implement proper Firebase Admin SDK authentication check
    const isAdmin = true; // Placeholder for now
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const role = searchParams.get('role')

    let usersQuery = query(collection(db, "users"))

    if (search) {
      // Firestore doesn't support 'contains' or 'insensitive' directly.
      // For simple search, we can filter by prefix or fetch all and filter client-side.
      // For now, fetching all and filtering client-side for simplicity.
      // TODO: Implement more efficient search (e.g., Algolia, dedicated search service, or more specific Firestore queries)
    }

    if (role && role !== 'all') {
      usersQuery = query(usersQuery, where("role", "==", role))
    }

    usersQuery = query(usersQuery, orderBy("createdAt", "desc"))

    const querySnapshot = await getDocs(usersQuery)
    let users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[]

    if (search) {
      const lowerCaseSearch = search.toLowerCase()
      users = users.filter(user => 
        user.name.toLowerCase().includes(lowerCaseSearch) ||
        user.email.toLowerCase().includes(lowerCaseSearch)
      )
    }

    const formattedUsers = await Promise.all(users.map(async user => {
      let departmentName: string | undefined;

      if (user.role === "FACULTY") {
        const facultyDoc = await getDocs(query(collection(db, "faculty"), where("userId", "==", user.id)))
        if (!facultyDoc.empty) {
          const facultyData = facultyDoc.docs[0].data()
          if (facultyData.departmentId) {
            const departmentDoc = await getDocs(query(collection(db, "departments"), where("id", "==", facultyData.departmentId)))
            if (!departmentDoc.empty) {
              departmentName = departmentDoc.docs[0].data().name
            }
          }
        }
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        profileImage: user.profileImage,
        department: departmentName
      }
    }))

    return NextResponse.json({ users: formattedUsers })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// POST /api/admin/users - Create new user
export async function POST(request: NextRequest) {
  try {
    // TODO: Implement proper Firebase Admin SDK authentication check
    const isAdmin = true; // Placeholder for now
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, role, phone, password } = body

    // Check if user already exists in Firestore
    const existingUserQuery = query(collection(db, "users"), where("email", "==", email))
    const existingUserSnapshot = await getDocs(existingUserQuery)

    if (!existingUserSnapshot.empty) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 })
    }

    // Create user in Firebase Authentication
    const defaultPassword = password || 'ChangeMe123!'
    const userCredential = await createUserWithEmailAndPassword(auth, email, defaultPassword)
    const firebaseUser = userCredential.user

    // Store additional user data in Firestore
    await setDoc(doc(db, "users", firebaseUser.uid), {
      email: firebaseUser.email,
      name,
      phone: phone || null,
      role,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    return NextResponse.json({
      id: firebaseUser.uid,
      name: name,
      email: firebaseUser.email,
      role: role,
      isActive: true,
      createdAt: new Date()
    })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}