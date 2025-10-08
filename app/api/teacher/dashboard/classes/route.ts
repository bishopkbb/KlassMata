// app/api/teacher/classes/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "teacher") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const teacherId = session.user.id;

    // Fetch all classes assigned to this teacher
    const classes = await prisma.class.findMany({
      where: { teacherId },
      include: {
        students: {
          where: { isActive: true },
        },
        subjects: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const formattedClasses = classes.map(cls => ({
      id: cls.id,
      name: cls.name,
      grade: cls.grade,
      section: cls.section || '',
      capacity: cls.capacity,
      studentCount: cls.students.length,
      subjects: cls.subjects,
    }));

    return NextResponse.json({ classes: formattedClasses });

  } catch (error) {
    console.error("Error fetching classes:", error);
    return NextResponse.json(
      { error: "Failed to fetch classes" },
      { status: 500 }
    );
  }
}