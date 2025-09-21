import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdmin = token?.role === "ADMIN"
    const isHOD = token?.role === "HOD"
    const isFaculty = token?.role === "FACULTY"
    const isStudent = token?.role === "STUDENT"
    const isParent = token?.role === "PARENT"

    const { pathname } = req.nextUrl

    // Admin routes
    if (pathname.startsWith("/admin")) {
      if (!isAdmin) {
        return NextResponse.redirect(new URL("/auth/signin", req.url))
      }
    }

    // HOD routes
    if (pathname.startsWith("/hod")) {
      if (!isHOD && !isAdmin) {
        return NextResponse.redirect(new URL("/auth/signin", req.url))
      }
    }

    // Faculty routes
    if (pathname.startsWith("/faculty")) {
      if (!isFaculty && !isAdmin && !isHOD) {
        return NextResponse.redirect(new URL("/auth/signin", req.url))
      }
    }

    // Student routes
    if (pathname.startsWith("/student")) {
      if (!isStudent && !isAdmin && !isHOD && !isParent) {
        return NextResponse.redirect(new URL("/auth/signin", req.url))
      }
    }

    // Parent routes
    if (pathname.startsWith("/parent")) {
      if (!isParent && !isAdmin && !isStudent) {
        return NextResponse.redirect(new URL("/auth/signin", req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

export const config = {
  matcher: [
    "/admin/:path*",
    "/hod/:path*",
    "/faculty/:path*",
    "/student/:path*",
    "/parent/:path*",
  ],
}