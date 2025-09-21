// Firebase compatibility layer
// This file provides a unified interface for both client and server Firebase usage

// Client-side Firebase (safe for browser)
export { clientAuth, clientDb, clientApp } from './firebase-client'

// Server-side Firebase (Node.js only)
export { adminDb, adminAuth, adminApp } from './firebase-server'