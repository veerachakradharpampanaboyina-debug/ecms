import { NextRequest, NextResponse } from 'next/server'
import { collection, query, where, orderBy, limit as firestoreLimit, startAfter, getDocs, addDoc, writeBatch, doc } from "firebase/firestore"
import { db } from '@/lib/firebase' // Using Firestore db
import { adminAuth } from '@/lib/firebase-admin' // Using Firebase Admin SDK

// GET /api/admin/settings/logs - Get system logs
export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get('Authorization')
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const idToken = authorization.split('Bearer ')[1]

    try {
      const decodedToken = await adminAuth.verifyIdToken(idToken)
      // Assuming role is stored in custom claims
      if (decodedToken.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      // You can also get the user's ID here: decodedToken.uid
      // And fetch user details from Firestore if needed
    } catch (error) {
      console.error('Error verifying Firebase ID token:', error)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const category = searchParams.get('category')
    const action = searchParams.get('action')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const logsRef = collection(db, "systemLogs")
    let q = query(logsRef)

    if (category && category !== 'all') {
      q = query(q, where("category", "==", category))
    }

    if (action && action !== 'all') {
      q = query(q, where("action", "==", action))
    }

    if (startDate) {
      q = query(q, where("createdAt", ">=", new Date(startDate)))
    }

    if (endDate) {
      q = query(q, where("createdAt", "<=", new Date(endDate)))
    }

    q = query(q, orderBy("createdAt", "desc"))

    // For pagination, we need to fetch all documents first to get total count
    // and then apply limit and offset manually or use startAfter for cursor-based pagination.
    // For simplicity, fetching all and then slicing for now. This might be inefficient for very large datasets.
    const allLogsSnapshot = await getDocs(q)
    const allLogs = allLogsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    const total = allLogs.length

    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedLogs = allLogs.slice(startIndex, endIndex)

    return NextResponse.json({
      logs: paginatedLogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching system logs:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// DELETE /api/admin/settings/logs - Clear system logs
export async function DELETE(request: NextRequest) {
  try {
    const authorization = request.headers.get('Authorization')
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const idToken = authorization.split('Bearer ')[1]

    try {
      const decodedToken = await adminAuth.verifyIdToken(idToken)
      // Assuming role is stored in custom claims
      if (decodedToken.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      // You can also get the user's ID here: decodedToken.uid
      // And fetch user details from Firestore if needed
    } catch (error) {
      console.error('Error verifying Firebase ID token:', error)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const olderThanDays = parseInt(searchParams.get('olderThanDays') || '30')

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

    const logsRef = collection(db, "systemLogs")
    const q = query(logsRef, where("createdAt", "<", cutoffDate))
    const snapshot = await getDocs(q)

    const batch = writeBatch(db)
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref)
    })
    await batch.commit()

    // Log the cleanup action
    await addDoc(collection(db, "systemLogs"), {
      action: 'LOGS_CLEANED',
      category: 'SYSTEM',
      description: `Cleaned up ${snapshot.size} system logs older than ${olderThanDays} days`,
      userId: "admin_user_id", // TODO: Replace with actual admin user ID from authenticated session
      createdAt: new Date()
    })

    return NextResponse.json({ 
      message: `Successfully deleted ${snapshot.size} logs`,
      deletedCount: snapshot.size
    })
  } catch (error) {
    console.error('Error clearing system logs:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}