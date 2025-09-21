import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

// GET /api/admin/users/[id] - Get single user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: params.id },
      include: {
        profile: {
          include: {
            department: true
          }
        },
        studentProfile: true,
        facultyProfile: true,
        parentProfile: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      department: user.profile?.department,
      phone: user.profile?.phone,
      lastLogin: user.lastLogin,
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
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, role, status, phone, departmentId } = body

    const existingUser = await db.user.findUnique({
      where: { id: params.id }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if email is being changed and already exists
    if (email !== existingUser.email) {
      const emailExists = await db.user.findUnique({
        where: { email }
      })

      if (emailExists) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
      }
    }

    const updateData: any = {
      name,
      email,
      role,
      status
    }

    // Update profile if it exists
    if (existingUser.profile) {
      updateData.profile = {
        update: {
          phone,
          departmentId: departmentId || null
        }
      }
    } else if (phone || departmentId) {
      // Create profile if it doesn't exist
      updateData.profile = {
        create: {
          phone,
          departmentId: departmentId || null
        }
      }
    }

    const updatedUser = await db.user.update({
      where: { id: params.id },
      data: updateData,
      include: {
        profile: {
          include: {
            department: true
          }
        }
      }
    })

    return NextResponse.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      status: updatedUser.status,
      department: updatedUser.profile?.department,
      phone: updatedUser.profile?.phone,
      lastLogin: updatedUser.lastLogin,
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
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: params.id }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prevent deletion of the current admin user
    if (user.id === session.user.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    await db.user.delete({
      where: { id: params.id }
    })

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
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: params.id }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prevent deactivation of the current admin user
    if (user.id === session.user.id && user.status === 'active') {
      return NextResponse.json({ error: 'Cannot deactivate your own account' }, { status: 400 })
    }

    const updatedUser = await db.user.update({
      where: { id: params.id },
      data: {
        status: user.status === 'active' ? 'inactive' : 'active'
      }
    })

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