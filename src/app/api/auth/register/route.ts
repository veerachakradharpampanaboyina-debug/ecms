import { NextRequest, NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebase-server"
import { UserRole, Gender } from "@/lib/types"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      email,
      password,
      name,
      phone,
      role,
      // Student specific fields
      rollNumber,
      admissionNo,
      courseId,
      semester,
      batch,
      dateOfBirth,
      gender,
      address,
      city,
      state,
      country,
      pincode,
      parentName,
      parentPhone,
      parentEmail,
      admissionDate,
      // Faculty specific fields
      employeeId,
      departmentId,
      designation,
      qualification,
      experience,
      joiningDate,
    } = body

    // Check if user already exists in Firebase Auth
    try {
      await adminAuth.getUserByEmail(email)
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    } catch (error) {
      // User doesn't exist, continue with registration
    }

    // Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
    })

    // Create user document in Firestore
    const userRef = doc(adminDb, 'users', userRecord.uid)
    await setDoc(userRef, {
      email,
      name,
      phone: phone || null,
      role: role as UserRole,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    // Create role-specific profile
    switch (role) {
      case "STUDENT":
        if (!rollNumber || !admissionNo || !courseId || !semester || !batch || !dateOfBirth || !gender) {
          // Clean up: delete user from Firebase Auth
          await adminAuth.deleteUser(userRecord.uid)
          return NextResponse.json(
            { error: "Missing required student fields" },
            { status: 400 }
          )
        }

        const studentRef = doc(adminDb, 'students', userRecord.uid)
        await setDoc(studentRef, {
          userId: userRecord.uid,
          rollNumber,
          admissionNo,
          courseId,
          semester,
          batch,
          dateOfBirth: new Date(dateOfBirth),
          gender: gender as Gender,
          address: address || null,
          city: city || null,
          state: state || null,
          country: country || null,
          pincode: pincode || null,
          parentName: parentName || null,
          parentPhone: parentPhone || null,
          parentEmail: parentEmail || null,
          admissionDate: admissionDate ? new Date(admissionDate) : new Date(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
        break

      case "FACULTY":
        if (!employeeId || !departmentId || !designation || !joiningDate) {
          // Clean up: delete user from Firebase Auth
          await adminAuth.deleteUser(userRecord.uid)
          return NextResponse.json(
            { error: "Missing required faculty fields" },
            { status: 400 }
          )
        }

        const facultyRef = doc(adminDb, 'faculty', userRecord.uid)
        await setDoc(facultyRef, {
          userId: userRecord.uid,
          employeeId,
          departmentId,
          designation,
          qualification: qualification || null,
          experience: experience || null,
          joiningDate: new Date(joiningDate),
          isHOD: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
        break

      case "ADMIN":
        const adminRef = doc(adminDb, 'admins', userRecord.uid)
        await setDoc(adminRef, {
          userId: userRecord.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
        break

      case "PARENT":
        const parentRef = doc(adminDb, 'parents', userRecord.uid)
        await setDoc(parentRef, {
          userId: userRecord.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
        break
    }

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: userRecord.uid,
          email: userRecord.email,
          name: userRecord.displayName,
          role: role,
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    
    // Clean up: if user was created in Firebase Auth but something went wrong,
    // try to delete the user to maintain consistency
    if (error instanceof Error && error.message.includes('uid')) {
      try {
        const uidMatch = error.message.match(/([a-zA-Z0-9_-]{20,})/)
        if (uidMatch) {
          await adminAuth.deleteUser(uidMatch[1])
        }
      } catch (cleanupError) {
        console.error("Failed to cleanup user:", cleanupError)
      }
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}