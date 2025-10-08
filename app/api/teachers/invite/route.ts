// app/api/teachers/invite/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sendTeacherInvite } from "@/lib/email";

// POST create teacher invite
export async function POST(req: Request) {
  try {
    // 1. Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized: Please log in" },
        { status: 401 }
      );
    }

    // 2. Check authorization (only admin and super_admin can invite)
    const userRole = session.user.role;
    if (userRole !== "admin" && userRole !== "super_admin") {
      return NextResponse.json(
        { error: "Forbidden: Only admins can invite teachers" },
        { status: 403 }
      );
    }

    // 3. Check if user has a school
    const adminSchoolId = session.user.schoolId;
    if (!adminSchoolId) {
      return NextResponse.json(
        { error: "No school associated with your account" },
        { status: 400 }
      );
    }

    // 4. Parse request body
    const data = await req.json();
    const { name, email, subject } = data;

    // 5. Validate input
    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // 6. Parse name into first and last
    const nameParts = name.trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    // 7. Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 400 }
      );
    }

    // 8. Check for existing pending invite
    const existingInvite = await prisma.teacherInvite.findFirst({
      where: { 
        email: email.toLowerCase(),
        status: "pending",
        schoolId: adminSchoolId,
      },
    });

    if (existingInvite) {
      return NextResponse.json(
        { error: "A pending invite already exists for this email" },
        { status: 400 }
      );
    }

    // 9. Generate unique invite code
    const inviteCode = nanoid(10);

    // 10. Create teacher invite
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    const invite = await prisma.teacherInvite.create({
      data: {
        code: inviteCode,
        email: email.toLowerCase(),
        firstName,
        lastName,
        subject: subject || null,
        schoolId: adminSchoolId,
        status: "pending",
        expiresAt,
      },
      include: {
        school: true,
      },
    });

    // 11. Send email invitation
    const emailResult = await sendTeacherInvite({
      email: invite.email,
      firstName: invite.firstName,
      lastName: invite.lastName,
      schoolName: invite.school.name,
      inviteCode,
      expiresAt,
    });

    if (!emailResult.success) {
      console.error('Failed to send email, but invite was created:', emailResult.error);
      // Don't fail the request, just log the error
    }

    return NextResponse.json({
      success: true,
      inviteCode,
      emailSent: emailResult.success,
      teacher: {
        id: invite.id,
        name,
        email,
        subject: subject || "Not assigned",
      },
      expiresAt: invite.expiresAt,
      message: emailResult.success 
        ? "Teacher invite sent via email successfully!" 
        : "Teacher invite created, but email failed to send. Share the invite code manually.",
    });

  } catch (error) {
    console.error("Error creating teacher invite:", error);
    return NextResponse.json(
      { error: "Failed to create teacher invite. Please try again." },
      { status: 500 }
    );
  }
}

// GET all pending invites for the school
export async function GET(req: Request) {
  try {
    // 1. Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized: Please log in" },
        { status: 401 }
      );
    }

    // 2. Check authorization
    const userRole = session.user.role;
    if (userRole !== "admin" && userRole !== "super_admin") {
      return NextResponse.json(
        { error: "Forbidden: Only admins can view invites" },
        { status: 403 }
      );
    }

    const schoolId = session.user.schoolId;
    if (!schoolId) {
      return NextResponse.json(
        { error: "No school associated with your account" },
        { status: 400 }
      );
    }

    // 3. Fetch pending invites
    const invites = await prisma.teacherInvite.findMany({
      where: {
        schoolId,
        status: "pending",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ invites });

  } catch (error) {
    console.error("Error fetching invites:", error);
    return NextResponse.json(
      { error: "Failed to fetch invites" },
      { status: 500 }
    );
  }
}