import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teacherId = session.user.id;
    const { id: assignmentId } = await params;

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
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
          include: {
            student: {
              select: {
                id: true,
                studentId: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { submittedAt: 'desc' },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    if (assignment.createdBy !== teacherId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const formattedAssignment = {
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      className: assignment.class.name,
      subjectName: assignment.subject.name,
      dueDate: assignment.dueDate.toISOString(),
      maxPoints: assignment.maxPoints,
      isActive: assignment.isActive,
      createdAt: assignment.createdAt.toISOString(),
      totalStudents: assignment.class.students.length,
      submissions: assignment.submissions.map(sub => ({
        id: sub.id,
        studentId: sub.student.id,
        studentName: `${sub.student.firstName} ${sub.student.lastName}`,
        studentNumber: sub.student.studentId,
        content: sub.content,
        attachments: sub.attachments,
        submittedAt: sub.submittedAt.toISOString(),
        points: sub.points,
        feedback: sub.feedback || '',
        gradedAt: sub.gradedAt?.toISOString() || null,
        isLate: new Date(sub.submittedAt) > assignment.dueDate,
      })),
    };

    return NextResponse.json({ assignment: formattedAssignment });

  } catch (error) {
    console.error("Error fetching assignment:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignment" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teacherId = session.user.id;
    const { id: assignmentId } = await params;

    const assignment = await prisma.assignment.findFirst({
      where: {
        id: assignmentId,
        createdBy: teacherId,
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    await prisma.assignment.delete({
      where: { id: assignmentId },
    });

    return NextResponse.json({
      success: true,
      message: "Assignment deleted successfully",
    });

  } catch (error) {
    console.error("Error deleting assignment:", error);
    return NextResponse.json(
      { error: "Failed to delete assignment" },
      { status: 500 }
    );
  }
}