import { NextRequest, NextResponse } from 'next/server'
import { getServerSession, Session } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { adminDb, adminAuth } from '@/lib/firebase-admin'

async function getAdminSession(req: NextRequest) {
  const session: Session | null = await getServerSession(authOptions as any);
  if (!session || session.user?.role !== 'ADMIN') {
    return null;
  }
  return session;
}

// GET /api/admin/users/[id] - Get a single user with details
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await getAdminSession(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const userDoc = await adminDb.collection('users').doc(params.id).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const user = { id: userDoc.id, ...userDoc.data() };

    const role = user.role as string | undefined;
    if (role && ['STUDENT', 'FACULTY', 'ADMIN'].includes(role)) {
        const detailsCollection = `${role.toLowerCase()}s`;
        const detailsDoc = await adminDb.collection(detailsCollection).doc(params.id).get();
        if (detailsDoc.exists) {
            (user as any).details = detailsDoc.data();
        }
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error(`Error fetching user ${params.id}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/admin/users/[id] - Update a user
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { name, email, role, details } = body;

    // Update Firebase Auth user
    await adminAuth.updateUser(params.id, {
        email: email,
        displayName: name,
    });

    const batch = adminDb.batch();

    // Update 'users' collection
    const userRef = adminDb.collection('users').doc(params.id);
    batch.update(userRef, { name, email, role, updatedAt: new Date().toISOString() });

    // Update role-specific collection
    if (role && details) {
        const detailsCollection = `${role.toLowerCase()}s`;
        const detailsRef = adminDb.collection(detailsCollection).doc(params.id);
        batch.set(detailsRef, details, { merge: true });
    }

    await batch.commit();

    return NextResponse.json({ message: 'User updated successfully' });
  } catch (error: any) {
    console.error(`Error updating user ${params.id}:`, error);
    if (error.code === 'auth/email-already-exists') {
        return NextResponse.json({ error: 'The email address is already in use by another account.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id] - Delete a user
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Prevent admin from deleting themselves
  if (params.id === (session.user as any)?.id) {
      return NextResponse.json({ error: 'You cannot delete your own account.' }, { status: 403 });
  }

  try {
    const userDoc = await adminDb.collection('users').doc(params.id).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const userData = userDoc.data();

    const batch = adminDb.batch();

    // 1. Delete from 'users' collection
    batch.delete(adminDb.collection('users').doc(params.id));

    // 2. Delete from role-specific collection
    if (userData?.role && ['STUDENT', 'FACULTY', 'ADMIN'].includes(userData.role)) {
        const roleCollection = `${userData.role.toLowerCase()}s`;
        batch.delete(adminDb.collection(roleCollection).doc(params.id));
    }
    
    // 3. Commit Firestore deletions
    await batch.commit();

    // 4. Delete from Firebase Authentication
    await adminAuth.deleteUser(params.id);

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(`Error deleting user ${params.id}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
