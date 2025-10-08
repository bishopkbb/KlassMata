// app/api/teacher/assignments/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET - Fetch all assignments for the teacher
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teacherId = session.user.id;

    const assignments = await prisma.assignment.findMany({
      where: { createdBy: teacherId },
      include: {
        class: {
          select: {
            name: true,
            students: {
              where: { isActive: true },
              select: { id: true },
            },
          },
        },
        subject: {
          select: { name: true },
        },
        submissions: {
          select: { id: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedAssignments = assignments.map(assignment => ({
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      className: assignment.class.name,
      subjectName: assignment.subject.name,
      dueDate: assignment.dueDate.toISOString(),
      maxPoints: assignment.maxPoints,
      submissions: assignment.submissions.length,
      totalStudents: assignment.class.students.length,
      isActive: assignment.isActive,
      createdAt: assignment.createdAt.toISOString(),
    }));

    return NextResponse.json({ assignments: formattedAssignments });

  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}

// POST - Create a new assignment
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teacherId = session.user.id;
    const { title, description, classId, subjectId, dueDate, maxPoints } = await req.json();

    // Validate required fields
    if (!title || !description || !classId || !subjectId || !dueDate) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Verify teacher has access to this class and subject
    const subject = await prisma.subject.findFirst({
      where: {
        id: subjectId,
        classId,
        teacherId,
      },
    });

    if (!subject) {
      return NextResponse.json(
        { error: "Subject not found or access denied" },
        { status: 404 }
      );
    }

    // Create assignment
    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        classId,
        subjectId,
        dueDate: new Date(dueDate),
        maxPoints: parseFloat(maxPoints),
        createdBy: teacherId,
        isActive: true,
      },
      include: {
        class: { select: { name: true } },
        subject: { select: { name: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Assignment created successfully",
      assignment: {
        id: assignment.id,
        title: assignment.title,
      },
    });

  } catch (error) {
    console.error("Error creating assignment:", error);
    return NextResponse.json(
      { error: "Failed to create assignment" },
      { status: 500 }
    );
  }
}