import { NextRequest, NextResponse } from 'next/server'
// import { getServerSession } from 'next-auth' // Removed
// import { authOptions } from '@/lib/auth' // Removed
import { db } from '@/lib/firebase' // Using Firestore db
import { collection, query, getDocs, setDoc, doc, updateDoc, addDoc } from "firebase/firestore"
import { adminAuth } from '@/lib/firebase-admin' // Using Firebase Admin SDK

// GET /api/admin/settings - Get all system settings
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

    // Get settings from database
    const settingsSnapshot = await getDocs(collection(db, "systemSettings"))
    const settings = settingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    // Group settings by category
    const groupedSettings = settings.reduce((acc, setting: any) => {
      if (!acc[setting.category]) {
        acc[setting.category] = {}
      }
      acc[setting.category][setting.key] = setting.value
      return acc
    }, {} as Record<string, Record<string, any>>)

    return NextResponse.json(groupedSettings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// PUT /api/admin/settings - Update system settings
export async function PUT(request: NextRequest) {
  try {
    // TODO: Implement proper Firebase Admin SDK authentication check
    const isAdmin = true; // Placeholder for now
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { category, settings } = body

    if (!category || !settings) {
      return NextResponse.json({ error: 'Category and settings are required' }, { status: 400 })
    }

    // Update or create settings in database
    const updatePromises = Object.entries(settings).map(async ([key, value]) => {
      const settingRef = doc(db, "systemSettings", `${category}_${key}`)
      const settingDoc = await getDocs(query(collection(db, "systemSettings"), where("category", "==", category), where("key", "==", key)))

      if (!settingDoc.empty) {
        // Update existing setting
        await updateDoc(settingDoc.docs[0].ref, {
          value: value as string,
          updatedBy: "admin_user_id", // TODO: Replace with actual admin user ID from authenticated session
          updatedAt: new Date()
        })
      } else {
        // Create new setting
        await setDoc(settingRef, {
          category,
          key,
          value: value as string,
          updatedBy: "admin_user_id", // TODO: Replace with actual admin user ID from authenticated session
          createdAt: new Date(),
          updatedAt: new Date()
        })
      }
    })

    await Promise.all(updatePromises)

    return NextResponse.json({ message: 'Settings updated successfully' })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// POST /api/admin/settings/backup - Trigger system backup
export async function POST(request: NextRequest) {
  try {
    // TODO: Implement proper Firebase Admin SDK authentication check
    const isAdmin = true; // Placeholder for now
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Simulate backup process
    // In a real application, this would trigger an actual backup process
    const backupId = `backup_${Date.now()}`
    
    // Log the backup action
    await addDoc(collection(db, "systemLogs"), {
      action: 'BACKUP_STARTED',
      category: 'SYSTEM',
      description: `Manual backup triggered by admin`,
      userId: "admin_user_id", // TODO: Replace with actual admin user ID from authenticated session
      metadata: { backupId },
      createdAt: new Date()
    })

    // Simulate backup process (in real app, this would be async)
    setTimeout(async () => {
      await addDoc(collection(db, "systemLogs"), {
        action: 'BACKUP_COMPLETED',
        category: 'SYSTEM',
        description: `Backup completed successfully`,
        userId: "admin_user_id", // TODO: Replace with actual admin user ID from authenticated session
        metadata: { backupId, status: 'success' },
        createdAt: new Date()
      })
    }, 3000)

    return NextResponse.json({ 
      message: 'Backup started successfully',
      backupId 
    })
  } catch (error) {
    console.error('Error starting backup:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// POST /api/admin/settings/restart - Restart system
export async function PATCH(request: NextRequest) {
  try {
    // TODO: Implement proper Firebase Admin SDK authentication check
    const isAdmin = true; // Placeholder for now
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Log the restart action
    await addDoc(collection(db, "systemLogs"), {
      action: 'SYSTEM_RESTART',
      category: 'SYSTEM',
      description: `System restart triggered by admin`,
      userId: "admin_user_id", // TODO: Replace with actual admin user ID from authenticated session
      createdAt: new Date()
    })

    // In a real application, this would trigger an actual system restart
    // For now, we'll just log it and return success
    return NextResponse.json({ 
      message: 'System restart initiated successfully',
      restartId: `restart_${Date.now()}`
    })
  } catch (error) {
    console.error('Error restarting system:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

    // Get settings from database
    const settingsSnapshot = await getDocs(collection(db, "systemSettings"))
    const settings = settingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    // Group settings by category
    const groupedSettings = settings.reduce((acc, setting: any) => {
      if (!acc[setting.category]) {
        acc[setting.category] = {}
      }
      acc[setting.category][setting.key] = setting.value
      return acc
    }, {} as Record<string, Record<string, any>>)

    return NextResponse.json(groupedSettings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// PUT /api/admin/settings - Update system settings
export async function PUT(request: NextRequest) {
  try {
    // TODO: Implement proper Firebase Admin SDK authentication check
    const isAdmin = true; // Placeholder for now
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { category, settings } = body

    if (!category || !settings) {
      return NextResponse.json({ error: 'Category and settings are required' }, { status: 400 })
    }

    // Update or create settings in database
    const updatePromises = Object.entries(settings).map(async ([key, value]) => {
      const settingRef = doc(db, "systemSettings", `${category}_${key}`)
      const settingDoc = await getDocs(query(collection(db, "systemSettings"), where("category", "==", category), where("key", "==", key)))

      if (!settingDoc.empty) {
        // Update existing setting
        await updateDoc(settingDoc.docs[0].ref, {
          value: value as string,
          updatedBy: "admin_user_id", // TODO: Replace with actual admin user ID from authenticated session
          updatedAt: new Date()
        })
      } else {
        // Create new setting
        await setDoc(settingRef, {
          category,
          key,
          value: value as string,
          updatedBy: "admin_user_id", // TODO: Replace with actual admin user ID from authenticated session
          createdAt: new Date(),
          updatedAt: new Date()
        })
      }
    })

    await Promise.all(updatePromises)

    return NextResponse.json({ message: 'Settings updated successfully' })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// POST /api/admin/settings/backup - Trigger system backup
export async function POST(request: NextRequest) {
  try {
    // TODO: Implement proper Firebase Admin SDK authentication check
    const isAdmin = true; // Placeholder for now
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Simulate backup process
    // In a real application, this would trigger an actual backup process
    const backupId = `backup_${Date.now()}`
    
    // Log the backup action
    await addDoc(collection(db, "systemLogs"), {
      action: 'BACKUP_STARTED',
      category: 'SYSTEM',
      description: `Manual backup triggered by admin`,
      userId: "admin_user_id", // TODO: Replace with actual admin user ID from authenticated session
      metadata: { backupId },
      createdAt: new Date()
    })

    // Simulate backup process (in real app, this would be async)
    setTimeout(async () => {
      await addDoc(collection(db, "systemLogs"), {
        action: 'BACKUP_COMPLETED',
        category: 'SYSTEM',
        description: `Backup completed successfully`,
        userId: "admin_user_id", // TODO: Replace with actual admin user ID from authenticated session
        metadata: { backupId, status: 'success' },
        createdAt: new Date()
      })
    }, 3000)

    return NextResponse.json({ 
      message: 'Backup started successfully',
      backupId 
    })
  } catch (error) {
    console.error('Error starting backup:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// POST /api/admin/settings/restart - Restart system
export async function PATCH(request: NextRequest) {
  try {
    // TODO: Implement proper Firebase Admin SDK authentication check
    const isAdmin = true; // Placeholder for now
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Log the restart action
    await addDoc(collection(db, "systemLogs"), {
      action: 'SYSTEM_RESTART',
      category: 'SYSTEM',
      description: `System restart triggered by admin`,
      userId: "admin_user_id", // TODO: Replace with actual admin user ID from authenticated session
      createdAt: new Date()
    })

    // In a real application, this would trigger an actual system restart
    // For now, we'll just log it and return success
    return NextResponse.json({ 
      message: 'System restart initiated successfully',
      restartId: `restart_${Date.now()}`
    })
  } catch (error) {
    console.error('Error restarting system:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}