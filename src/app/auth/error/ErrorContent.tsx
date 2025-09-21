"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react"

export default function ErrorContent() {
  const searchParams = useSearchParams()
  const [errorDetails, setErrorDetails] = useState<string>("")
  const [isRetrying, setIsRetrying] = useState(false)

  useEffect(() => {
    const error = searchParams.get("error")
    if (error) {
      setErrorDetails(decodeURIComponent(error))
    }
  }, [searchParams])

  const getErrorMessage = (error: string): string => {
    switch (error) {
      case "Configuration":
        return "There is a problem with the server configuration."
      case "AccessDenied":
        return "You do not have permission to sign in."
      case "Verification":
        return "The verification link has expired or has already been used."
      case "Default":
        return "An unexpected error occurred during authentication."
      case "CredentialsSignin":
        return "Invalid email or password. Please try again."
      case "SessionRequired":
        return "Please sign in to access this page."
      case "OAuthSignin":
        return "Error in the OAuth sign-in process."
      case "OAuthCallback":
        return "Error in the OAuth callback process."
      case "OAuthCreateAccount":
        return "Could not create OAuth provider account."
      case "EmailCreateAccount":
        return "Could not create email provider account."
      case "Callback":
        return "Error in the authentication callback."
      case "OAuthAccountNotLinked":
        return "Email already exists with different provider."
      case "EmailSignin":
        return "Email sign-in failed."
      case "CredentialsSignin":
        return "Invalid credentials."
      case "SessionExpired":
        return "Your session has expired. Please sign in again."
      default:
        return "An unknown error occurred. Please try again."
    }
  }

  const handleRetry = () => {
    setIsRetrying(true)
    setTimeout(() => {
      window.location.href = "/auth/signin"
    }, 1000)
  }

  const error = searchParams.get("error") || "Default"
  const errorMessage = getErrorMessage(error)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Authentication Error
          </h1>
          <p className="text-gray-600">
            Something went wrong during sign in
          </p>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Sign In Failed
            </CardTitle>
            <CardDescription>
              We encountered an issue while trying to sign you in
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Error:</strong> {errorMessage}
              </AlertDescription>
            </Alert>

            {errorDetails && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Technical Details:</strong>
                </p>
                <p className="text-xs text-gray-500 mt-1 font-mono">
                  {errorDetails}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                You can try the following solutions:
              </p>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Check your email and password</li>
                <li>Ensure your account is active</li>
                <li>Clear your browser cache and cookies</li>
                <li>Try again in a few minutes</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2 pt-4">
              <Button 
                onClick={handleRetry} 
                disabled={isRetrying}
                className="w-full"
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                  </>
                )}
              </Button>

              <Link href="/" passHref>
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </div>

            <div className="text-center pt-4">
              <p className="text-sm text-gray-600">
                If the problem persists, please contact:
              </p>
              <p className="text-sm text-blue-600">
                support@college.edu
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}