import { NextRequest, NextResponse } from 'next/server'
// import { getServerSession } from 'next-auth' // Removed
// import { authOptions } from '@/lib/auth' // Removed
import { db } from '@/lib/firebase' // Using Firestore db
import { doc, getDoc, collection, query, where, updateDoc, deleteDoc, writeBatch } from "firebase/firestore"
// import bcrypt from 'bcryptjs' // Not needed for user update/delete

// GET /api/admin/users/[id] - Get single user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Implement proper Firebase Admin SDK authentication check
    const isAdmin = true; // Placeholder for now
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userDoc = await getDoc(doc(db, "users", params.id))

    if (!userDoc.exists()) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user = { id: userDoc.id, ...userDoc.data() } as any;

    let roleProfile: any = null;
    if (user.role === "STUDENT") {
      const studentDoc = await getDoc(doc(db, "students", user.id));
      if (studentDoc.exists()) roleProfile = studentDoc.data();
    } else if (user.role === "FACULTY") {
      const facultyDoc = await getDoc(doc(db, "faculty", user.id));
      if (facultyDoc.exists()) roleProfile = facultyDoc.data();
    } else if (user.role === "PARENT") {
      const parentDoc = await getDoc(doc(db, "parents", user.id));
      if (parentDoc.exists()) roleProfile = parentDoc.data();
    }

    let department: any = null;
    if (roleProfile?.departmentId) {
      const departmentDoc = await getDoc(doc(db, "departments", roleProfile.departmentId));
      if (departmentDoc.exists()) department = { id: departmentDoc.id, ...departmentDoc.data() };
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      department: department,
      phone: user.phone,
      lastLogin: user.lastLoginAt,
      createdAt: user.createdAt
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// PUT /api/admin/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Implement proper Firebase Admin SDK authentication check
    const isAdmin = true; // Placeholder for now
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, role, status, phone, departmentId } = body

    const userRef = doc(db, "users", params.id)
    const existingUserDoc = await getDoc(userRef)

    if (!existingUserDoc.exists()) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const existingUser = { id: existingUserDoc.id, ...existingUserDoc.data() } as any;

    // Check if email is being changed and already exists
    if (email !== existingUser.email) {
      const emailExistsQuery = query(collection(db, "users"), where("email", "==", email))
      const emailExistsSnapshot = await getDocs(emailExistsQuery)

      if (!emailExistsSnapshot.empty) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
      }
    }

    const updateData: any = {
      name,
      email,
      role,
      status,
      phone: phone || null,
      updatedAt: new Date()
    }

    await updateDoc(userRef, updateData)

    // Update role-specific profile if it exists
    if (role === "STUDENT") {
      const studentRef = doc(db, "students", params.id)
      await updateDoc(studentRef, { departmentId: departmentId || null })
    } else if (role === "FACULTY") {
      const facultyRef = doc(db, "faculty", params.id)
      await updateDoc(facultyRef, { departmentId: departmentId || null })
    } else if (role === "PARENT") {
      // Parents don't have departmentId in the original schema, so no update needed here
    }

    // Fetch updated user data for response
    const updatedUserDoc = await getDoc(userRef)
    const updatedUser = { id: updatedUserDoc.id, ...updatedUserDoc.data() } as any;

    let department: any = null;
    if (departmentId) {
      const departmentDoc = await getDoc(doc(db, "departments", departmentId));
      if (departmentDoc.exists()) department = { id: departmentDoc.id, ...departmentDoc.data() };
    }

    return NextResponse.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      status: updatedUser.status,
      department: department,
      phone: updatedUser.phone,
      lastLogin: updatedUser.lastLoginAt,
      createdAt: updatedUser.createdAt
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Implement proper Firebase Admin SDK authentication check
    const isAdmin = true; // Placeholder for now
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRef = doc(db, "users", params.id)
    const userDoc = await getDoc(userRef)

    if (!userDoc.exists()) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user = { id: userDoc.id, ...userDoc.data() } as any;

    // Prevent deletion of the current admin user
    // TODO: Replace "admin_user_id" with actual authenticated admin user ID
    if (user.id === "admin_user_id") {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    const batch = writeBatch(db)
    batch.delete(userRef)

    // Delete role-specific profile
    if (user.role === "STUDENT") {
      batch.delete(doc(db, "students", user.id))
    } else if (user.role === "FACULTY") {
      batch.delete(doc(db, "faculty", user.id))
    } else if (user.role === "PARENT") {
      batch.delete(doc(db, "parents", user.id))
    }

    await batch.commit()

    // TODO: Delete user from Firebase Authentication (requires Firebase Admin SDK)

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// PATCH /api/admin/users/[id]/toggle-status - Toggle user status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Implement proper Firebase Admin SDK authentication check
    const isAdmin = true; // Placeholder for now
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRef = doc(db, "users", params.id)
    const userDoc = await getDoc(userRef)

    if (!userDoc.exists()) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user = { id: userDoc.id, ...userDoc.data() } as any;

    // Prevent deactivation of the current admin user
    // TODO: Replace "admin_user_id" with actual authenticated admin user ID
    if (user.id === "admin_user_id" && user.status === 'active') {
      return NextResponse.json({ error: 'Cannot deactivate your own account' }, { status: 400 })
    }

    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    await updateDoc(userRef, {
      status: newStatus,
      updatedAt: new Date()
    })

    const updatedUserDoc = await getDoc(userRef)
    const updatedUser = { id: updatedUserDoc.id, ...updatedUserDoc.data() } as any;

    return NextResponse.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      status: updatedUser.status,
      message: `User ${updatedUser.status === 'active' ? 'activated' : 'deactivated'} successfully`
    })
  } catch (error) {
    console.error('Error toggling user status:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}