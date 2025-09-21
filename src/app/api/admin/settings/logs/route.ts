import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/admin/settings/logs - Get system logs
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const category = searchParams.get('category')
    const action = searchParams.get('action')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const skip = (page - 1) * limit

    const whereClause: any = {}

    if (category && category !== 'all') {
      whereClause.category = category
    }

    if (action && action !== 'all') {
      whereClause.action = action
    }

    if (startDate) {
      whereClause.createdAt = {
        gte: new Date(startDate)
      }
    }

    if (endDate) {
      whereClause.createdAt = {
        ...whereClause.createdAt,
        lte: new Date(endDate)
      }
    }

    const [logs, total] = await Promise.all([
      db.systemLog.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      db.systemLog.count({
        where: whereClause
      })
    ])

    return NextResponse.json({
      logs,
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
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const olderThanDays = parseInt(searchParams.get('olderThanDays') || '30')

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

    const deletedCount = await db.systemLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        }
      }
    })

    // Log the cleanup action
    await db.systemLog.create({
      data: {
        action: 'LOGS_CLEANED',
        category: 'SYSTEM',
        description: `Cleaned up ${deletedCount.count} system logs older than ${olderThanDays} days`,
        userId: session.user.id
      }
    })

    return NextResponse.json({ 
      message: `Successfully deleted ${deletedCount.count} logs`,
      deletedCount: deletedCount.count
    })
  } catch (error) {
    console.error('Error clearing system logs:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}