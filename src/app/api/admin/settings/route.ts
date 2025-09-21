import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/admin/settings - Get all system settings
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get settings from database
    const settings = await db.systemSetting.findMany({
      orderBy: {
        category: 'asc'
      }
    })

    // Group settings by category
    const groupedSettings = settings.reduce((acc, setting) => {
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
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { category, settings } = body

    if (!category || !settings) {
      return NextResponse.json({ error: 'Category and settings are required' }, { status: 400 })
    }

    // Update or create settings in database
    const updatePromises = Object.entries(settings).map(([key, value]) => {
      return db.systemSetting.upsert({
        where: {
          category_key: {
            category,
            key
          }
        },
        update: {
          value: value as string,
          updatedBy: session.user.id
        },
        create: {
          category,
          key,
          value: value as string,
          updatedBy: session.user.id
        }
      })
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
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Simulate backup process
    // In a real application, this would trigger an actual backup process
    const backupId = `backup_${Date.now()}`
    
    // Log the backup action
    await db.systemLog.create({
      data: {
        action: 'BACKUP_STARTED',
        category: 'SYSTEM',
        description: `Manual backup triggered by ${session.user.name}`,
        userId: session.user.id,
        metadata: { backupId }
      }
    })

    // Simulate backup process (in real app, this would be async)
    setTimeout(async () => {
      await db.systemLog.create({
        data: {
          action: 'BACKUP_COMPLETED',
          category: 'SYSTEM',
          description: `Backup completed successfully`,
          userId: session.user.id,
          metadata: { backupId, status: 'success' }
        }
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
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Log the restart action
    await db.systemLog.create({
      data: {
        action: 'SYSTEM_RESTART',
        category: 'SYSTEM',
        description: `System restart triggered by ${session.user.name}`,
        userId: session.user.id
      }
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