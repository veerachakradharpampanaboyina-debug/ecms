import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { adminDb, adminAuth } from '@/lib/firebase-admin'

// Helper to check for admin role
async function isAdmin(req: NextRequest) {
  const session = await getServerSession(authOptions as any)
  // The type casting to any is a workaround for a possible type mismatch issue with NextAuth v4 and v5 in some setups.
  // It's important to ensure your authOptions are correctly defined.
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return false
  }
  return true
}

// GET /api/admin/users - Get all users
export async function GET(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')

    let usersQuery = adminDb.collection("users")

    if (role && role !== 'all') {
      usersQuery = usersQuery.where("role", "==", role) as FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;
    }

    const querySnapshot = await usersQuery.orderBy("createdAt", "desc").get()
    const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// POST /api/admin/users - Create new user
export async function POST(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, email, role, phone, password } = body

    if (!name || !email || !role || !password) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create user in Firebase Authentication
    const userRecord = await adminAuth.createUser({
        email,
        password,
        displayName: name,
    })

    // Store additional user data in Firestore
    await adminDb.collection("users").doc(userRecord.uid).set({
      email,
      name,
      phone: phone || null,
      role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    
    // TODO: Add logic to create role-specific documents (e.g., in 'students' or 'faculty' collections) if needed.

    const newUser = {
        id: userRecord.uid,
        name,
        email,
        role,
        phone
    }

    return NextResponse.json(newUser, { status: 201 })
  } catch (error: any) {
    console.error('Error creating user:', error)
    if (error.code === 'auth/email-already-exists') {
        return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
