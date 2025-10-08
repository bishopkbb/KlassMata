// app/api/teachers/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET all teachers for a school
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

    // 2. Get school ID from session
    const schoolId = session.user.schoolId;

    if (!schoolId) {
      return NextResponse.json(
        { error: "No school associated with your account" },
        { status: 400 }
      );
    }

    // 3. Fetch teachers
    const teachers = await prisma.user.findMany({
      where: { 
        role: "teacher",
        schoolId: schoolId,
        isActive: true,
      },
      select: { 
        id: true, 
        firstName: true, 
        lastName: true, 
        email: true,
        phone: true,
        avatar: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 4. Format response
    const formatted = teachers.map((t) => ({
      id: t.id,
      name: `${t.firstName} ${t.lastName}`,
      email: t.email,
      phone: t.phone || "N/A",
      avatar: t.avatar,
      joinedAt: t.createdAt,
    }));

    return NextResponse.json({ teachers: formatted });

  } catch (error) {
    console.error("Error fetching teachers:", error);
    return NextResponse.json(
      { error: "Failed to fetch teachers" },
      { status: 500 }
    );
  }
}