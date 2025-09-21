import { NextRequest, NextResponse } from "next/server"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

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

    // Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Store additional user data in Firestore
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      name,
      phone: phone || null,
      role,
      createdAt: new Date(),
    })

    // Create role-specific profile
    switch (role) {
      case "STUDENT":
        if (!rollNumber || !admissionNo || !courseId || !semester || !batch || !dateOfBirth || !gender) {
          return NextResponse.json(
            { error: "Missing required student fields" },
            { status: 400 }
          )
        }

        await setDoc(doc(db, "students", user.uid), {
          userId: user.uid,
          rollNumber,
          admissionNo,
          courseId,
          semester,
          batch,
          dateOfBirth: new Date(dateOfBirth),
          gender,
          address: address || null,
          city: city || null,
          state: state || null,
          country: country || null,
          pincode: pincode || null,
          parentName: parentName || null,
          parentPhone: parentPhone || null,
          parentEmail: parentEmail || null,
          admissionDate: admissionDate ? new Date(admissionDate) : new Date(),
        })
        break

      case "FACULTY":
        if (!employeeId || !departmentId || !designation || !joiningDate) {
          return NextResponse.json(
            { error: "Missing required faculty fields" },
            { status: 400 }
          )
        }

        await setDoc(doc(db, "faculty", user.uid), {
          userId: user.uid,
          employeeId,
          departmentId,
          designation,
          qualification: qualification || null,
          experience: experience || null,
          joiningDate: new Date(joiningDate),
        })
        break

      case "ADMIN":
        await setDoc(doc(db, "admins", user.uid), {
          userId: user.uid,
        })
        break
    }

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: user.uid,
          email: user.email,
          name: name, // Use name from request body
          role: role, // Use role from request body
        }
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}