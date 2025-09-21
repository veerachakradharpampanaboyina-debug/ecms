'use client'

import { Suspense } from 'react'
import ErrorContent from './ErrorContent'

export const dynamic = 'force-dynamic'

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorContent />
    </Suspense>
  )
}