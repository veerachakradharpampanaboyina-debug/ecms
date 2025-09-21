import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/firebase-auth'
import { firestoreDb } from '@/lib/db'
import { withErrorHandling } from '@/lib/error-handler'
import { ErrorHandler } from '@/lib/error-handler'
import { z } from 'zod'
import { collection, query, where, orderBy, limit, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore'

// Email validation schema
const emailSchema = z.object({
  to: z.string().email(),
  cc: z.string().email().optional(),
  bcc: z.string().email().optional(),
  subject: z.string().min(1),
  body: z.string().min(1),
  htmlBody: z.string().optional(),
  attachments: z.array(z.string()).optional(),
})

// Email account schema
const emailAccountSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

// Get user's emails
async function getEmails(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw ErrorHandler.UnauthorizedError()
  }

  const { searchParams } = new URL(req.url)
  const folder = searchParams.get('folder') || 'inbox'
  const page = parseInt(searchParams.get('page') || '1')
  const limitCount = parseInt(searchParams.get('limit') || '20')

  

  // Get user's email account
  const emailAccountRef = doc(firestoreDb.collection('email_accounts'), session.user.id)
  const emailAccountDoc = await getDoc(emailAccountRef)

  if (!emailAccountDoc.exists()) {
    throw ErrorHandler.NotFoundError('Email account not found')
  }

  const emailAccount = emailAccountDoc.data()

  // Get emails with pagination
  const emailsRef = collection(firestoreDb.collection('email_accounts'), session.user.id, 'emails')
  const q = query(
    emailsRef,
    where('folder', '==', folder),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  )
  
  const querySnapshot = await getDocs(q)
  const emails = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
  }))

  // Get total count (simplified - in production you'd need a separate count query)
  const totalCount = emails.length

  const response = {
    emails,
    pagination: {
      page,
      limit: limitCount,
      total: totalCount,
      pages: Math.ceil(totalCount / limitCount),
    },
  }

  

  return NextResponse.json(response)
}

// Send email
async function sendEmail(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw ErrorHandler.UnauthorizedError()
  }

  const body = await req.json()
  const validatedData = emailSchema.parse(body)

  // Get user's email account
  const emailAccountRef = doc(firestoreDb.collection('email_accounts'), session.user.id)
  const emailAccountDoc = await getDoc(emailAccountRef)

  if (!emailAccountDoc.exists()) {
    throw ErrorHandler.NotFoundError('Email account not found')
  }

  const emailAccount = emailAccountDoc.data()

  // Calculate email size
  const emailSize = new Blob([validatedData.body + (validatedData.htmlBody || '')]).size

  // Check quota
  if (emailAccount.usedSpace + emailSize > emailAccount.quota) {
    throw ErrorHandler.createError('QUOTA_EXCEEDED', 'Email quota exceeded')
  }

  // Create email record
  const emailsRef = collection(firestoreDb.collection('email_accounts'), session.user.id, 'emails')
  const emailDoc = await addDoc(emailsRef, {
    from: emailAccount.email,
    to: validatedData.to,
    cc: validatedData.cc,
    bcc: validatedData.bcc,
    subject: validatedData.subject,
    body: validatedData.body,
    htmlBody: validatedData.htmlBody,
    attachments: validatedData.attachments,
    folder: 'sent',
    size: emailSize,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  // Update used space
  await updateDoc(emailAccountRef, {
    usedSpace: emailAccount.usedSpace + emailSize,
    updatedAt: serverTimestamp(),
  })

  

  // Send actual email (integration with email service)
  // This would integrate with services like SendGrid, AWS SES, or custom SMTP
  try {
    // Placeholder for actual email sending logic
    console.log('Sending email:', {
      from: emailAccount.email,
      to: validatedData.to,
      subject: validatedData.subject,
    })
  } catch (error) {
    console.error('Failed to send email:', error)
    // Mark email as failed
    await updateDoc(doc(emailsRef, emailDoc.id), {
      folder: 'drafts',
      updatedAt: serverTimestamp(),
    })
    throw ErrorHandler.createError('EMAIL_SEND_FAILED', 'Failed to send email')
  }

  return NextResponse.json({ success: true, emailId: emailDoc.id })
}

// Create email account
async function createEmailAccount(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw ErrorHandler.UnauthorizedError()
  }

  const body = await req.json()
  const validatedData = emailAccountSchema.parse(body)

  // Check if user already has an email account
  const emailAccountRef = doc(firestoreDb.collection('email_accounts'), session.user.id)
  const existingAccountDoc = await getDoc(emailAccountRef)

  if (existingAccountDoc.exists()) {
    throw ErrorHandler.createError('ACCOUNT_EXISTS', 'Email account already exists')
  }

  // Check domain availability
  const domain = validatedData.email.split('@')[1]
  const domainRef = doc(firestoreDb.collection('email_domains'), domain)
  const domainDoc = await getDoc(domainRef)

  if (!domainDoc.exists() || !domainDoc.data()?.isActive) {
    throw ErrorHandler.createError('INVALID_DOMAIN', 'Invalid email domain')
  }

  const domainData = domainDoc.data()
  if (domainData.usedAccounts >= domainData.maxAccounts) {
    throw ErrorHandler.createError('DOMAIN_FULL', 'Email domain is full')
  }

  // Create email account
  await setDoc(emailAccountRef, {
    userId: session.user.id,
    email: validatedData.email,
    password: validatedData.password, // In production, this should be hashed
    quota: 100 * 1024 * 1024, // 100MB default quota
    usedSpace: 0,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  // Update domain usage
  await updateDoc(domainRef, {
    usedAccounts: (domainData.usedAccounts || 0) + 1,
    updatedAt: serverTimestamp(),
  })

  return NextResponse.json({ 
    success: true, 
    emailAccount: { 
      id: session.user.id, 
      email: validatedData.email 
    } 
  })
}

// Update email status
async function updateEmailStatus(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw ErrorHandler.UnauthorizedError()
  }

  const { searchParams } = new URL(req.url)
  const emailId = searchParams.get('id')
  const body = await req.json()

  if (!emailId) {
    throw ErrorHandler.ValidationError('Email ID is required')
  }

  // Get user's email account
  const emailAccountRef = doc(firestoreDb.collection('email_accounts'), session.user.id)
  const emailAccountDoc = await getDoc(emailAccountRef)

  if (!emailAccountDoc.exists()) {
    throw ErrorHandler.NotFoundError('Email account not found')
  }

  // Update email
  const emailRef = doc(firestoreDb.collection('email_accounts'), session.user.id, 'emails', emailId)
  const emailDoc = await getDoc(emailRef)

  if (!emailDoc.exists()) {
    throw ErrorHandler.NotFoundError('Email not found')
  }

  await updateDoc(emailRef, {
    ...body,
    updatedAt: serverTimestamp(),
  })

  

  return NextResponse.json({ success: true })
}

// Delete email
async function deleteEmail(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw ErrorHandler.UnauthorizedError()
  }

  const { searchParams } = new URL(req.url)
  const emailId = searchParams.get('id')

  if (!emailId) {
    throw ErrorHandler.ValidationError('Email ID is required')
  }

  // Get user's email account
  const emailAccountRef = doc(firestoreDb.collection('email_accounts'), session.user.id)
  const emailAccountDoc = await getDoc(emailAccountRef)

  if (!emailAccountDoc.exists()) {
    throw ErrorHandler.NotFoundError('Email account not found')
  }

  const emailAccount = emailAccountDoc.data()

  // Get email to calculate size
  const emailRef = doc(firestoreDb.collection('email_accounts'), session.user.id, 'emails', emailId)
  const emailDoc = await getDoc(emailRef)

  if (!emailDoc.exists()) {
    throw ErrorHandler.NotFoundError('Email not found')
  }

  const email = emailDoc.data()

  // Delete email
  await deleteDoc(emailRef)

  // Update used space
  await updateDoc(emailAccountRef, {
    usedSpace: Math.max(0, emailAccount.usedSpace - email.size),
    updatedAt: serverTimestamp(),
  })

  

  return NextResponse.json({ success: true })
}

export async function GET(req: NextRequest) {
  return withErrorHandling(req, getEmails)
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action')

  switch (action) {
    case 'send':
      return withErrorHandling(req, sendEmail)
    case 'create':
      return withErrorHandling(req, createEmailAccount)
    default:
      return withErrorHandling(req, sendEmail)
  }
}

export async function PUT(req: NextRequest) {
  return withErrorHandling(req, updateEmailStatus)
}

export async function DELETE(req: NextRequest) {
  return withErrorHandling(req, deleteEmail)
}