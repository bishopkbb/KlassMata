// app/api/teachers/onboard/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// POST - Teacher accepts invite and creates account
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { inviteCode, password } = data;

    // 1. Validate input
    if (!inviteCode || !password) {
      return NextResponse.json(
        { error: "Invite code and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // 2. Find invite
    const invite = await prisma.teacherInvite.findUnique({
      where: { code: inviteCode },
      include: { school: true },
    });

    if (!invite) {
      return NextResponse.json(
        { error: "Invalid invite code" },
        { status: 404 }
      );
    }

    // 3. Check if invite is already used
    if (invite.status !== "pending") {
      return NextResponse.json(
        { error: "This invite has already been used" },
        { status: 400 }
      );
    }

    // 4. Check if invite has expired
    if (new Date() > invite.expiresAt) {
      return NextResponse.json(
        { error: "This invite has expired" },
        { status: 400 }
      );
    }

    // 5. Check if user with email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: invite.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 400 }
      );
    }

    // 6. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 7. Create teacher user account
    const newTeacher = await prisma.user.create({
      data: {
        email: invite.email,
        password: hashedPassword,
        firstName: invite.firstName,
        lastName: invite.lastName,
        role: "teacher",
        schoolId: invite.schoolId,
        isActive: true,
        emailVerified: true,
      },
    });

    // 8. Mark invite as used
    await prisma.teacherInvite.update({
      where: { id: invite.id },
      data: {
        status: "accepted",
        usedAt: new Date(),
        usedByUserId: newTeacher.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Account created successfully! You can now log in.",
      teacher: {
        id: newTeacher.id,
        email: newTeacher.email,
        name: `${newTeacher.firstName} ${newTeacher.lastName}`,
      },
    });

  } catch (error) {
    console.error("Error during teacher onboarding:", error);
    return NextResponse.json(
      { error: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}

// GET - Validate invite code
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const inviteCode = searchParams.get('code');

    if (!inviteCode) {
      return NextResponse.json(
        { error: "Invite code is required" },
        { status: 400 }
      );
    }

    const invite = await prisma.teacherInvite.findUnique({
      where: { code: inviteCode },
      include: { school: { select: { name: true } } },
    });

    if (!invite) {
      return NextResponse.json(
        { error: "Invalid invite code" },
        { status: 404 }
      );
    }

    if (invite.status !== "pending") {
      return NextResponse.json(
        { error: "This invite has already been used" },
        { status: 400 }
      );
    }

    if (new Date() > invite.expiresAt) {
      return NextResponse.json(
        { error: "This invite has expired" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      invite: {
        email: invite.email,
        firstName: invite.firstName,
        lastName: invite.lastName,
        schoolName: invite.school.name,
        expiresAt: invite.expiresAt,
      },
    });

  } catch (error) {
    console.error("Error validating invite:", error);
    return NextResponse.json(
      { error: "Failed to validate invite" },
      { status: 500 }
    );
  }
}