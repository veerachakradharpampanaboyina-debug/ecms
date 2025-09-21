import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/firebase-auth'
import { firestoreDb } from '@/lib/db'
import { withErrorHandling } from '@/lib/error-handler'
import { ErrorHandler } from '@/lib/error-handler'
import { z } from 'zod'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, serverTimestamp } from 'firebase/firestore'

// File upload validation schema
const fileUploadSchema = z.object({
  category: z.enum(['general', 'academic', 'assignment', 'project', 'certificate']).default('general'),
  isPublic: z.boolean().default(false),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

// File share validation schema
const fileShareSchema = z.object({
  fileId: z.string(),
  sharedType: z.enum(['link', 'user', 'group']).default('link'),
  sharedWith: z.string().optional(),
  permission: z.enum(['view', 'download', 'edit']).default('view'),
  expiresAt: z.string().optional(),
})

// Get user's files
async function getFiles(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw ErrorHandler.UnauthorizedError()
  }

  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const page = parseInt(searchParams.get('page') || '1')
  const limitCount = parseInt(searchParams.get('limit') || '20')

  // Try to get from cache first
  const cacheKey = `files_${session.user.id}_${category || 'all'}_${page}_${limitCount}`
  const cachedFiles = await cache.get(cacheKey)
  
  if (cachedFiles) {
    return NextResponse.json(cachedFiles)
  }

  // Get user's storage quota
  const quotaRef = doc(firestoreDb.collection('user_storage_quotas'), session.user.id)
  const quotaDoc = await getDoc(quotaRef)

  let storageQuota
  if (!quotaDoc.exists()) {
    // Create default storage quota
    await updateDoc(quotaRef, {
      maxStorage: 5368709120, // 5GB
      usedStorage: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    storageQuota = {
      maxStorage: 5368709120,
      usedStorage: 0,
    }
  } else {
    storageQuota = quotaDoc.data()
  }

  // Build query
  const filesRef = collection(firestoreDb.collection('user_files'), session.user.id, 'files')
  let filesQuery = query(
    filesRef,
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  )

  if (category && category !== 'all') {
    filesQuery = query(
      filesRef,
      where('category', '==', category),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    )
  }

  const fileDocs = await getDocs(filesQuery)
  const files = await Promise.all(
    fileDocs.docs.map(async (fileDoc) => {
      const fileData = fileDoc.data()
      const fileId = fileDoc.id
      
      // Get user info
      const userRef = doc(firestoreDb.collection('users'), fileData.userId)
      const userDoc = await getDoc(userRef)
      const userData = userDoc.data()

      // Get shares
      const sharesRef = collection(firestoreDb.collection('user_files'), session.user.id, 'files', fileId, 'shares')
      const sharesDocs = await getDocs(sharesRef)
      const shares = await Promise.all(
        sharesDocs.docs.map(async (shareDoc) => {
          const shareData = shareDoc.data()
          const sharedWithRef = doc(firestoreDb.collection('users'), shareData.sharedWith)
          const sharedWithDoc = await getDoc(sharedWithRef)
          const sharedWithData = sharedWithDoc.data()
          return {
            id: shareDoc.id,
            ...shareData,
            user: sharedWithData ? {
              id: sharedWithData.id || shareData.sharedWith,
              name: sharedWithData.name || 'Unknown',
              email: sharedWithData.email || '',
              profileImage: sharedWithData.profileImage
            } : null
          }
        })
      )

      return {
        id: fileId,
        ...fileData,
        createdAt: fileData.createdAt?.toDate(),
        updatedAt: fileData.updatedAt?.toDate(),
        user: {
          id: userData?.id || fileData.userId,
          name: userData?.name || 'Unknown',
          email: userData?.email || '',
          profileImage: userData?.profileImage
        },
        shares
      }
    })
  )

  const totalCount = files.length

  const response = {
    files,
    storageQuota: {
      maxStorage: storageQuota.maxStorage,
      usedStorage: storageQuota.usedStorage,
      availableStorage: storageQuota.maxStorage - storageQuota.usedStorage,
      usagePercentage: Math.round((storageQuota.usedStorage / storageQuota.maxStorage) * 100),
    },
    pagination: {
      page,
      limit: limitCount,
      total: totalCount,
      pages: Math.ceil(totalCount / limitCount),
    },
  }

  // Cache the result
  await cache.set(cacheKey, response, { ttl: 300 }) // 5 minutes

  return NextResponse.json(response)
}

// Upload file
async function uploadFile(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw ErrorHandler.UnauthorizedError()
  }

  const formData = await req.formData()
  const file = formData.get('file') as File
  const metadata = JSON.parse(formData.get('metadata') as string)

  if (!file) {
    throw ErrorHandler.ValidationError('No file provided')
  }

  const validatedData = fileUploadSchema.parse(metadata)

  // Get user's storage quota
  const quotaRef = doc(firestoreDb.collection('user_storage_quotas'), session.user.id)
  const quotaDoc = await getDoc(quotaRef)

  let storageQuota
  if (!quotaDoc.exists()) {
    await updateDoc(quotaRef, {
      maxStorage: 5368709120, // 5GB
      usedStorage: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    storageQuota = { maxStorage: 5368709120, usedStorage: 0 }
  } else {
    storageQuota = quotaDoc.data()
  }

  // Check if enough storage is available
  if (storageQuota.usedStorage + file.size > storageQuota.maxStorage) {
    throw ErrorHandler.createError('INSUFFICIENT_STORAGE', 'Not enough storage space')
  }

  // Generate unique filename
  const fileExtension = file.name.split('.').pop()
  const uniqueFileName = `${uuidv4()}.${fileExtension}`
  const uploadDir = join(process.cwd(), 'uploads', session.user.id)
  const filePath = join(uploadDir, uniqueFileName)

  // Create upload directory if it doesn't exist
  await mkdir(uploadDir, { recursive: true })

  // Save file
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  await writeFile(filePath, buffer)

  // Create file record
  const filesRef = collection(firestoreDb.collection('user_files'), session.user.id, 'files')
  const fileDoc = await addDoc(filesRef, {
    userId: session.user.id,
    fileName: uniqueFileName,
    originalName: file.name,
    filePath: `/uploads/${session.user.id}/${uniqueFileName}`,
    fileSize: file.size,
    mimeType: file.type,
    category: validatedData.category,
    isPublic: validatedData.isPublic,
    description: validatedData.description,
    tags: validatedData.tags,
    downloadCount: 0,
    isShared: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  // Update storage quota
  await updateDoc(quotaRef, {
    usedStorage: storageQuota.usedStorage + file.size,
    updatedAt: serverTimestamp(),
  })

  // Get user info for response
  const userRef = doc(firestoreDb.collection('users'), session.user.id)
  const userDoc = await getDoc(userRef)
  const userData = userDoc.data()

  const fileRecord = {
    id: fileDoc.id,
    userId: session.user.id,
    fileName: uniqueFileName,
    originalName: file.name,
    filePath: `/uploads/${session.user.id}/${uniqueFileName}`,
    fileSize: file.size,
    mimeType: file.type,
    category: validatedData.category,
    isPublic: validatedData.isPublic,
    description: validatedData.description,
    tags: validatedData.tags,
    downloadCount: 0,
    isShared: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: userData?.id || session.user.id,
      name: userData?.name || 'Unknown',
      email: userData?.email || '',
      profileImage: userData?.profileImage
    },
    shares: []
  }

  // Clear cache
  await cache.clearPattern(`files_${session.user.id}_*`)

  return NextResponse.json({ success: true, file: fileRecord })
}

// Share file
async function shareFile(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw ErrorHandler.UnauthorizedError()
  }

  const body = await req.json()
  const validatedData = fileShareSchema.parse(body)

  // Check if file exists and user owns it
  const fileRef = doc(firestoreDb.collection('user_files'), session.user.id, 'files', validatedData.fileId)
  const fileDoc = await getDoc(fileRef)

  if (!fileDoc.exists()) {
    throw ErrorHandler.NotFoundError('File not found')
  }

  const fileData = fileDoc.data()
  if (fileData.userId !== session.user.id) {
    throw ErrorHandler.ForbiddenError('You do not own this file')
  }

  // Create share record
  const sharesRef = collection(firestoreDb.collection('user_files'), session.user.id, 'files', validatedData.fileId, 'shares')
  const shareDoc = await addDoc(sharesRef, {
    ...validatedData,
    userId: session.user.id,
    expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  // Update file share status
  await updateDoc(fileRef, {
    isShared: true,
    updatedAt: serverTimestamp(),
  })

  // Get user info for response
  const userRef = doc(firestoreDb.collection('users'), session.user.id)
  const userDoc = await getDoc(userRef)
  const userData = userDoc.data()

  const share = {
    id: shareDoc.id,
    ...validatedData,
    userId: session.user.id,
    expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : null,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: userData?.id || session.user.id,
      name: userData?.name || 'Unknown',
      email: userData?.email || '',
      profileImage: userData?.profileImage
    },
    file: fileData
  }

  // Clear cache
  await cache.clearPattern(`files_${session.user.id}_*`)

  return NextResponse.json({ success: true, share })
}

// Delete file
async function deleteFile(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw ErrorHandler.UnauthorizedError()
  }

  const { searchParams } = new URL(req.url)
  const fileId = searchParams.get('id')

  if (!fileId) {
    throw ErrorHandler.ValidationError('File ID is required')
  }

  // Get file details
  const fileRef = doc(firestoreDb.collection('user_files'), session.user.id, 'files', fileId)
  const fileDoc = await getDoc(fileRef)

  if (!fileDoc.exists()) {
    throw ErrorHandler.NotFoundError('File not found')
  }

  const fileData = fileDoc.data()
  if (fileData.userId !== session.user.id) {
    throw ErrorHandler.ForbiddenError('You do not own this file')
  }

  // Delete physical file
  try {
    const filePath = join(process.cwd(), 'uploads', session.user.id, fileData.fileName)
    await unlink(filePath)
  } catch (error) {
    console.error('Failed to delete physical file:', error)
  }

  // Delete file record
  await deleteDoc(fileRef)

  // Update storage quota
  const quotaRef = doc(firestoreDb.collection('user_storage_quotas'), session.user.id)
  const quotaDoc = await getDoc(quotaRef)
  if (quotaDoc.exists()) {
    const quotaData = quotaDoc.data()
    await updateDoc(quotaRef, {
      usedStorage: Math.max(0, quotaData.usedStorage - fileData.fileSize),
      updatedAt: serverTimestamp(),
    })
  }

  // Clear cache
  await cache.clearPattern(`files_${session.user.id}_*`)

  return NextResponse.json({ success: true })
}

// Download file
async function downloadFile(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw ErrorHandler.UnauthorizedError()
  }

  const { searchParams } = new URL(req.url)
  const fileId = searchParams.get('id')

  if (!fileId) {
    throw ErrorHandler.ValidationError('File ID is required')
  }

  // Get file details - need to search across all user files
  // This is a simplified approach - in production, you'd want a more efficient way
  const usersRef = firestoreDb.collection('users')
  const userDocs = await getDocs(usersRef)
  
  let file = null
  let fileOwner = null

  for (const userDoc of userDocs.docs) {
    const userId = userDoc.id
    const fileRef = doc(firestoreDb.collection('user_files'), userId, 'files', fileId)
    const fileDoc = await getDoc(fileRef)
    
    if (fileDoc.exists()) {
      file = { id: fileDoc.id, ...fileDoc.data() }
      fileOwner = userId
      break
    }
  }

  if (!file) {
    throw ErrorHandler.NotFoundError('File not found')
  }

  // Check if user has permission to download
  if (fileOwner !== session.user.id && !file.isPublic) {
    // Check if file is shared with user
    const sharesRef = collection(firestoreDb.collection('user_files'), fileOwner, 'files', fileId, 'shares')
    const sharesQuery = query(
      sharesRef,
      where('sharedType', '==', 'link'),
      where('sharedWith', '==', session.user.id)
    )
    const shareDocs = await getDocs(sharesQuery)

    if (shareDocs.empty) {
      throw ErrorHandler.ForbiddenError('You do not have permission to download this file')
    }
  }

  // Increment download count
  const fileRef = doc(firestoreDb.collection('user_files'), fileOwner, 'files', fileId)
  await updateDoc(fileRef, {
    downloadCount: (file.downloadCount || 0) + 1,
    updatedAt: serverTimestamp(),
  })

  // Return file URL for download
  return NextResponse.json({
    success: true,
    fileUrl: file.filePath,
    fileName: file.originalName,
    mimeType: file.mimeType,
  })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action')

  switch (action) {
    case 'download':
      return withErrorHandling(req, downloadFile)
    default:
      return withErrorHandling(req, getFiles)
  }
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action')

  switch (action) {
    case 'upload':
      return withErrorHandling(req, uploadFile)
    case 'share':
      return withErrorHandling(req, shareFile)
    default:
      return withErrorHandling(req, uploadFile)
  }
}

export async function DELETE(req: NextRequest) {
  return withErrorHandling(req, deleteFile)
}