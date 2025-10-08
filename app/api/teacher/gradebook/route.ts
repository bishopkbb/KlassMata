// app/api/teacher/gradebook/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET - Fetch gradebook data
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId');
    const subjectId = searchParams.get('subjectId');

    if (!classId || !subjectId) {
      return NextResponse.json(
        { error: "classId and subjectId are required" },
        { status: 400 }
      );
    }

    const teacherId = session.user.id;

    // Verify access
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

    // Get assignments for this class/subject
    const assignments = await prisma.assignment.findMany({
      where: {
        classId,
        subjectId,
        isActive: true,
      },
      select: {
        id: true,
        title: true,
        maxPoints: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Get students in the class
    const students = await prisma.student.findMany({
      where: {
        classId,
        isActive: true,
      },
      include: {
        assignmentSubmissions: {
          where: {
            assignment: {
              subjectId,
            },
          },
          select: {
            id: true,
            assignmentId: true,
            points: true,
            feedback: true,
          },
        },
      },
      orderBy: { studentId: 'asc' },
    });

    const studentsWithGrades = students.map(student => {
      const grades = assignments.map(assignment => {
        const submission = student.assignmentSubmissions.find(
          s => s.assignmentId === assignment.id
        )
        return {
          assignmentId: assignment.id,
          points: submission?.points ?? null,
          feedback: submission?.feedback ?? null,
          submissionId: submission?.id ?? null,
        }
      })

      return {
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        studentNumber: student.studentId,
        grades,
      }
    })

    return NextResponse.json({
      assignments,
      students: studentsWithGrades,
    });

  } catch (error) {
    console.error("Error fetching gradebook:", error);
    return NextResponse.json(
      { error: "Failed to fetch gradebook" },
      { status: 500 }
    );
  }
}

// POST - Save grades
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { grades } = await req.json();

    if (!grades || !Array.isArray(grades)) {
      return NextResponse.json(
        { error: "Invalid grades data" },
        { status: 400 }
      );
    }

    // Update grades in transaction
    await prisma.$transaction(
      grades.map(grade =>
        prisma.assignmentSubmission.update({
          where: { id: grade.submissionId },
          data: {
            points: grade.points,
            gradedAt: new Date(),
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: "Grades saved successfully",
    });

  } catch (error) {
    console.error("Error saving grades:", error);
    return NextResponse.json(
      { error: "Failed to save grades" },
      { status: 500 }
    );
  }
}