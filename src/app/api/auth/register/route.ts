import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { UserRole, Gender } from "@prisma/client"

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

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const userData = {
      email,
      password: hashedPassword,
      name,
      phone: phone || null,
      role: role as UserRole,
    }

    const user = await db.user.create({
      data: userData
    })

    // Create role-specific profile
    switch (role) {
      case "STUDENT":
        if (!rollNumber || !admissionNo || !courseId || !semester || !batch || !dateOfBirth || !gender) {
          await db.user.delete({ where: { id: user.id } })
          return NextResponse.json(
            { error: "Missing required student fields" },
            { status: 400 }
          )
        }

        await db.student.create({
          data: {
            userId: user.id,
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
          }
        })
        break

      case "FACULTY":
        if (!employeeId || !departmentId || !designation || !joiningDate) {
          await db.user.delete({ where: { id: user.id } })
          return NextResponse.json(
            { error: "Missing required faculty fields" },
            { status: 400 }
          )
        }

        await db.faculty.create({
          data: {
            userId: user.id,
            employeeId,
            departmentId,
            designation,
            qualification: qualification || null,
            experience: experience || null,
            joiningDate: new Date(joiningDate),
          }
        })
        break

      case "ADMIN":
        await db.admin.create({
          data: {
            userId: user.id,
          }
        })
        break
    }

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}