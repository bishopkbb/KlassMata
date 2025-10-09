// app/api/assignments/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.schoolId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const assignments = await prisma.assignment.findMany({
      where: {
        class: {
          schoolId: session.user.schoolId,
        },
        isActive: true,
      },
      include: {
        class: { select: { name: true } },
        subject: { select: { name: true } },
        submissions: true,
        creator: { select: { firstName: true, lastName: true } },
      },
      orderBy: { dueDate: "desc" },
    });

    const formatted = assignments.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      className: a.class.name,
      subject: a.subject.name,
      dueDate: a.dueDate,
      maxPoints: a.maxPoints,
      submissions: a.submissions.length,
      totalStudents: 0, // Calculate this based on class
      isActive: a.isActive,
      createdAt: a.createdAt,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { title, description, classId, subjectId, dueDate, maxPoints } = data;

    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        classId,
        subjectId,
        dueDate: new Date(dueDate),
        maxPoints: parseFloat(maxPoints),
        createdBy: session.user.id,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, assignment }, { status: 201 });
  } catch (error) {
    console.error("Error creating assignment:", error);
    return NextResponse.json(
      { error: "Failed to create assignment" },
      { status: 500 },
    );
  }
}
