import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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
    } = body;

    // Create user in Firebase Authentication using Admin SDK
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
    });

    const uid = userRecord.uid;

    // Store common user data in Firestore
    await adminDb.collection("users").doc(uid).set({
      email,
      name,
      phone: phone || null,
      role,
      createdAt: new Date().toISOString(),
    });

    // Create role-specific profile
    switch (role) {
      case "STUDENT":
        if (!rollNumber || !admissionNo || !courseId || !semester || !batch || !dateOfBirth || !gender) {
          return NextResponse.json(
            { error: "Missing required student fields" },
            { status: 400 }
          );
        }

        await adminDb.collection("students").doc(uid).set({
          userId: uid,
          rollNumber,
          admissionNo,
          courseId,
          semester,
          batch,
          dateOfBirth: new Date(dateOfBirth).toISOString(),
          gender,
          address: address || null,
          city: city || null,
          state: state || null,
          country: country || null,
          pincode: pincode || null,
          parentName: parentName || null,
          parentPhone: parentPhone || null,
          parentEmail: parentEmail || null,
          admissionDate: admissionDate ? new Date(admissionDate).toISOString() : new Date().toISOString(),
        });
        break;

      case "FACULTY":
        if (!employeeId || !departmentId || !designation || !joiningDate) {
          return NextResponse.json(
            { error: "Missing required faculty fields" },
            { status: 400 }
          );
        }

        await adminDb.collection("faculty").doc(uid).set({
          userId: uid,
          employeeId,
          departmentId,
          designation,
          qualification: qualification || null,
          experience: experience || null,
          joiningDate: new Date(joiningDate).toISOString(),
        });
        break;

      case "ADMIN":
        await adminDb.collection("admins").doc(uid).set({
          userId: uid,
        });
        break;
    }

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: uid,
          email: email,
          name: name,
          role: role,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    // Provide a more specific error message if available
    const errorMessage = error.code === 'auth/email-already-exists' 
      ? "The email address is already in use by another account."
      : error.message || "Internal server error";
    const status = error.code === 'auth/email-already-exists' ? 409 : 500;

    return NextResponse.json(
      { error: errorMessage },
      { status: status }
    );
  }
}
