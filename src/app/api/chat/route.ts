import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/firebase-auth'
import { firestoreDb } from '@/lib/db'
import { withErrorHandling } from '@/lib/error-handler'
import { ErrorHandler } from '@/lib/error-handler'
import { z } from 'zod'
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, serverTimestamp } from 'firebase/firestore'

// Chat room validation schema
const chatRoomSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(['group', 'direct', 'course', 'department']).default('group'),
  isPrivate: z.boolean().default(false),
  maxMembers: z.number().min(2).max(1000).default(100),
})

// Chat message validation schema
const chatMessageSchema = z.object({
  roomId: z.string(),
  content: z.string().min(1),
  messageType: z.enum(['text', 'image', 'file', 'system']).default('text'),
  fileUrl: z.string().optional(),
  fileName: z.string().optional(),
  fileSize: z.number().optional(),
  replyToId: z.string().optional(),
})

// Get user's chat rooms
async function getChatRooms(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw ErrorHandler.UnauthorizedError()
  }

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')

  

  // Get user's chat rooms
  const membersRef = collection(firestoreDb.collection('chat_rooms'), 'members')
  const q = query(
    membersRef,
    where('userId', '==', session.user.id),
    where('isActive', '==', true)
  )
  
  const memberDocs = await getDocs(q)
  const roomIds = memberDocs.docs.map(doc => doc.data().roomId)

  if (roomIds.length === 0) {
    return NextResponse.json([])
  }

  // Get chat rooms
  const roomsRef = firestoreDb.collection('chat_rooms')
  const roomsQuery = query(
    roomsRef,
    where('id', 'in', roomIds.slice(0, 10)) // Firestore 'in' query limit
  )
  
  const roomDocs = await getDocs(roomsQuery)
  const chatRooms = await Promise.all(
    roomDocs.docs.map(async (roomDoc) => {
      const roomData = roomDoc.data()
      const roomId = roomDoc.id
      
      // Get members
      const roomMembersRef = collection(firestoreDb.collection('chat_rooms'), roomId, 'members')
      const membersQuery = query(roomMembersRef, where('isActive', '==', true))
      const memberDocs = await getDocs(membersQuery)
      const members = await Promise.all(
        memberDocs.docs.map(async (memberDoc) => {
          const memberData = memberDoc.data()
          const userRef = doc(firestoreDb.collection('users'), memberData.userId)
          const userDoc = await getDoc(userRef)
          const userData = userDoc.data()
          return {
            id: memberDoc.id,
            ...memberData,
            user: {
              id: userData?.id || memberData.userId,
              name: userData?.name || 'Unknown',
              email: userData?.email || '',
              profileImage: userData?.profileImage
            }
          }
        })
      )

      // Get creator info
      const creatorRef = doc(firestoreDb.collection('users'), roomData.createdBy)
      const creatorDoc = await getDoc(creatorRef)
      const creatorData = creatorDoc.data()

      // Get message count
      const messagesRef = collection(firestoreDb.collection('chat_rooms'), roomId, 'messages')
      const messagesQuery = query(messagesRef, where('isDeleted', '==', false))
      const messageDocs = await getDocs(messagesQuery)
      const messageCount = messageDocs.size

      return {
        id: roomId,
        ...roomData,
        createdAt: roomData.createdAt?.toDate(),
        updatedAt: roomData.updatedAt?.toDate(),
        creator: {
          id: creatorData?.id || roomData.createdBy,
          name: creatorData?.name || 'Unknown',
          email: creatorData?.email || '',
          profileImage: creatorData?.profileImage
        },
        members,
        _count: {
          members: members.length,
          messages: messageCount
        }
      }
    })
  )

  // Get unread message counts for each room
  const roomsWithUnread = await Promise.all(
    chatRooms.map(async (room) => {
      const member = room.members.find(m => m.userId === session.user.id)
      
      // Get unread count
      const messagesRef = collection(firestoreDb.collection('chat_rooms'), room.id, 'messages')
      let unreadQuery = query(
        messagesRef,
        where('senderId', '!=', session.user.id),
        where('isDeleted', '==', false)
      )
      
      if (member?.lastReadAt) {
        unreadQuery = query(
          messagesRef,
          where('senderId', '!=', session.user.id),
          where('isDeleted', '==', false),
          where('createdAt', '>', member.lastReadAt)
        )
      }
      
      const unreadDocs = await getDocs(unreadQuery)
      const unreadCount = unreadDocs.size

      return {
        ...room,
        unreadCount,
      }
    })
  )

  

  return NextResponse.json(roomsWithUnread)
}

// Create chat room
async function createChatRoom(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw ErrorHandler.UnauthorizedError()
  }

  const body = await req.json()
  const validatedData = chatRoomSchema.parse(body)

  // Create chat room
  const roomsRef = firestoreDb.collection('chat_rooms')
  const roomDoc = await addDoc(roomsRef, {
    ...validatedData,
    createdBy: session.user.id,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  const roomId = roomDoc.id

  // Add creator as member
  const membersRef = collection(firestoreDb.collection('chat_rooms'), roomId, 'members')
  await addDoc(membersRef, {
    userId: session.user.id,
    role: 'admin',
    isActive: true,
    joinedAt: serverTimestamp(),
    lastReadAt: serverTimestamp(),
  })

  // Get creator info
  const creatorRef = doc(firestoreDb.collection('users'), session.user.id)
  const creatorDoc = await getDoc(creatorRef)
  const creatorData = creatorDoc.data()

  // Get members
  const memberDocs = await getDocs(membersRef)
  const members = await Promise.all(
    memberDocs.docs.map(async (memberDoc) => {
      const memberData = memberDoc.data()
      const userRef = doc(firestoreDb.collection('users'), memberData.userId)
      const userDoc = await getDoc(userRef)
      const userData = userDoc.data()
      return {
        id: memberDoc.id,
        ...memberData,
        user: {
          id: userData?.id || memberData.userId,
          name: userData?.name || 'Unknown',
          email: userData?.email || '',
          profileImage: userData?.profileImage
        }
      }
    })
  )

  const chatRoom = {
    id: roomId,
    ...validatedData,
    createdBy: session.user.id,
    createdAt: new Date(),
    updatedAt: new Date(),
    creator: {
      id: creatorData?.id || session.user.id,
      name: creatorData?.name || 'Unknown',
      email: creatorData?.email || '',
      profileImage: creatorData?.profileImage
    },
    members,
    _count: {
      members: members.length,
      messages: 0
    }
  }



  return NextResponse.json(chatRoom)
}

// Get chat messages
async function getChatMessages(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw ErrorHandler.UnauthorizedError()
  }

  const { searchParams } = new URL(req.url)
  const roomId = searchParams.get('roomId')
  const page = parseInt(searchParams.get('page') || '1')
  const limitCount = parseInt(searchParams.get('limit') || '50')

  if (!roomId) {
    throw ErrorHandler.ValidationError('Room ID is required')
  }

  // Check if user is member of the room
  const membersRef = collection(firestoreDb.collection('chat_rooms'), roomId, 'members')
  const memberQuery = query(
    membersRef,
    where('userId', '==', session.user.id),
    where('isActive', '==', true)
  )
  const memberDocs = await getDocs(memberQuery)

  if (memberDocs.empty) {
    throw ErrorHandler.ForbiddenError('You are not a member of this chat room')
  }

  

  // Get messages with pagination
  const messagesRef = collection(firestoreDb.collection('chat_rooms'), roomId, 'messages')
  const messagesQuery = query(
    messagesRef,
    where('isDeleted', '==', false),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  )
  
  const messageDocs = await getDocs(messagesQuery)
  const messages = await Promise.all(
    messageDocs.docs.map(async (messageDoc) => {
      const messageData = messageDoc.data()
      const messageId = messageDoc.id
      
      // Get sender info
      const senderRef = doc(firestoreDb.collection('users'), messageData.senderId)
      const senderDoc = await getDoc(senderRef)
      const senderData = senderDoc.data()

      // Get reply to info if exists
      let replyTo = null
      if (messageData.replyToId) {
        const replyToRef = doc(messagesRef, messageData.replyToId)
        const replyToDoc = await getDoc(replyToRef)
        if (replyToDoc.exists()) {
          const replyToData = replyToDoc.data()
          const replyToSenderRef = doc(firestoreDb.collection('users'), replyToData.senderId)
          const replyToSenderDoc = await getDoc(replyToSenderRef)
          const replyToSenderData = replyToSenderDoc.data()
          replyTo = {
            id: replyToDoc.id,
            ...replyToData,
            sender: {
              id: replyToSenderData?.id || replyToData.senderId,
              name: replyToSenderData?.name || 'Unknown',
              email: replyToSenderData?.email || '',
              profileImage: replyToSenderData?.profileImage
            }
          }
        }
      }

      return {
        id: messageId,
        ...messageData,
        createdAt: messageData.createdAt?.toDate(),
        sender: {
          id: senderData?.id || messageData.senderId,
          name: senderData?.name || 'Unknown',
          email: senderData?.email || '',
          profileImage: senderData?.profileImage
        },
        replyTo,
        reactions: [] // Simplified for now
      }
    })
  )

  const totalCount = messages.length

  const response = {
    messages: messages.reverse(), // Reverse to show oldest first
    pagination: {
      page,
      limit: limitCount,
      total: totalCount,
      pages: Math.ceil(totalCount / limitCount),
    },
  }

  

  // Update last read time
  const memberDoc = memberDocs.docs[0]
  await updateDoc(doc(membersRef, memberDoc.id), {
    lastReadAt: serverTimestamp(),
  })

  return NextResponse.json(response)
}

// Send chat message
async function sendChatMessage(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw ErrorHandler.UnauthorizedError()
  }

  const body = await req.json()
  const validatedData = chatMessageSchema.parse(body)

  // Check if user is member of the room
  const membersRef = collection(firestoreDb.collection('chat_rooms'), validatedData.roomId, 'members')
  const memberQuery = query(
    membersRef,
    where('userId', '==', session.user.id),
    where('isActive', '==', true)
  )
  const memberDocs = await getDocs(memberQuery)

  if (memberDocs.empty) {
    throw ErrorHandler.ForbiddenError('You are not a member of this chat room')
  }

  // Create message
  const messagesRef = collection(firestoreDb.collection('chat_rooms'), validatedData.roomId, 'messages')
  const messageDoc = await addDoc(messagesRef, {
    ...validatedData,
    senderId: session.user.id,
    isDeleted: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  // Get sender info
  const senderRef = doc(firestoreDb.collection('users'), session.user.id)
  const senderDoc = await getDoc(senderRef)
  const senderData = senderDoc.data()

  const message = {
    id: messageDoc.id,
    ...validatedData,
    senderId: session.user.id,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    sender: {
      id: senderData?.id || session.user.id,
      name: senderData?.name || 'Unknown',
      email: senderData?.email || '',
      profileImage: senderData?.profileImage
    },
    replyTo: null,
    reactions: []
  }

  // Update room's last activity
  const roomRef = doc(firestoreDb.collection('chat_rooms'), validatedData.roomId)
  await updateDoc(roomRef, {
    updatedAt: serverTimestamp(),
  })

  // Clear cache
  
  

  // Emit real-time message via WebSocket
  try {
    const { getIO } = await import('@/lib/socket')
    const io = getIO()
    io.to(validatedData.roomId).emit('new_message', message)
  } catch (error) {
    console.error('Failed to emit message via WebSocket:', error)
  }

  return NextResponse.json(message)
}

// Join chat room
async function joinChatRoom(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw ErrorHandler.UnauthorizedError()
  }

  const { searchParams } = new URL(req.url)
  const roomId = searchParams.get('roomId')

  if (!roomId) {
    throw ErrorHandler.ValidationError('Room ID is required')
  }

  // Check if room exists and is not full
  const roomRef = doc(firestoreDb.collection('chat_rooms'), roomId)
  const roomDoc = await getDoc(roomRef)

  if (!roomDoc.exists()) {
    throw ErrorHandler.NotFoundError('Chat room not found')
  }

  const roomData = roomDoc.data()

  // Check member count
  const membersRef = collection(firestoreDb.collection('chat_rooms'), roomId, 'members')
  const membersQuery = query(membersRef, where('isActive', '==', true))
  const memberDocs = await getDocs(membersQuery)

  if (memberDocs.size >= roomData.maxMembers) {
    throw ErrorHandler.createError('ROOM_FULL', 'Chat room is full')
  }

  // Check if user is already a member
  const existingMemberQuery = query(
    membersRef,
    where('userId', '==', session.user.id)
  )
  const existingMemberDocs = await getDocs(existingMemberQuery)

  if (!existingMemberDocs.empty) {
    const existingMember = existingMemberDocs.docs[0]
    const memberData = existingMember.data()
    
    if (memberData.isActive) {
      throw ErrorHandler.createError('ALREADY_MEMBER', 'You are already a member of this room')
    } else {
      // Reactivate member
      await updateDoc(doc(membersRef, existingMember.id), {
        isActive: true,
        joinedAt: serverTimestamp(),
      })
    }
  } else {
    // Add new member
    await addDoc(membersRef, {
      userId: session.user.id,
      role: 'member',
      isActive: true,
      joinedAt: serverTimestamp(),
      lastReadAt: serverTimestamp(),
    })
  }



  return NextResponse.json({ success: true })
}

// Leave chat room
async function leaveChatRoom(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw ErrorHandler.UnauthorizedError()
  }

  const { searchParams } = new URL(req.url)
  const roomId = searchParams.get('roomId')

  if (!roomId) {
    throw ErrorHandler.ValidationError('Room ID is required')
  }

  // Check if user is a member
  const membersRef = collection(firestoreDb.collection('chat_rooms'), roomId, 'members')
  const memberQuery = query(
    membersRef,
    where('userId', '==', session.user.id),
    where('isActive', '==', true)
  )
  const memberDocs = await getDocs(memberQuery)

  if (memberDocs.empty) {
    throw ErrorHandler.ForbiddenError('You are not a member of this chat room')
  }

  // Deactivate member
  const memberDoc = memberDocs.docs[0]
  await updateDoc(doc(membersRef, memberDoc.id), {
    isActive: false,
  })



  return NextResponse.json({ success: true })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action')

  switch (action) {
    case 'rooms':
      return withErrorHandling(req, getChatRooms)
    case 'messages':
      return withErrorHandling(req, getChatMessages)
    default:
      return withErrorHandling(req, getChatRooms)
  }
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action')

  switch (action) {
    case 'create':
      return withErrorHandling(req, createChatRoom)
    case 'send':
      return withErrorHandling(req, sendChatMessage)
    case 'join':
      return withErrorHandling(req, joinChatRoom)
    default:
      return withErrorHandling(req, sendChatMessage)
  }
}

export async function DELETE(req: NextRequest) {
  return withErrorHandling(req, leaveChatRoom)
}