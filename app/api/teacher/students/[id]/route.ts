import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teacherId = session.user.id;
    const { id: studentId } = await params;

    // Get student with all related data
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            teacherId: true,
          },
        },
        parent: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        attendanceRecords: {
          orderBy: { date: "desc" },
          take: 10,
          include: {
            subject: {
              select: { name: true },
            },
          },
        },
        assignmentSubmissions: {
          where: {
            points: { not: null },
          },
          orderBy: { gradedAt: "desc" },
          take: 10,
          include: {
            assignment: {
              select: {
                title: true,
                maxPoints: true,
              },
            },
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Verify teacher has access to this student
    if (student.class.teacherId !== teacherId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Calculate stats
    const totalAttendance = student.attendanceRecords.length;
    const presentDays = student.attendanceRecords.filter(
      (r) => r.status === "present" || r.status === "late",
    ).length;
    const absentDays = student.attendanceRecords.filter(
      (r) => r.status === "absent",
    ).length;
    const attendanceRate =
      totalAttendance > 0
        ? Math.round((presentDays / totalAttendance) * 100)
        : 0;

    const submissions = student.assignmentSubmissions;
    const averageGrade =
      submissions.length > 0
        ? Math.round(
            submissions.reduce((sum, sub) => {
              const percentage =
                ((sub.points || 0) / sub.assignment.maxPoints) * 100;
              return sum + percentage;
            }, 0) / submissions.length,
          )
        : 0;

    // Get total assignments for this student's class
    const totalAssignments = await prisma.assignment.count({
      where: {
        classId: student.classId,
        isActive: true,
      },
    });

    const studentDetail = {
      id: student.id,
      studentId: student.studentId,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email || "",
      phone: student.phone || "",
      dateOfBirth: student.dateOfBirth.toISOString(),
      gender: student.gender,
      address: student.address || "",
      className: student.class.name,
      admissionDate: student.admissionDate.toISOString(),
      parentName: student.parent
        ? `${student.parent.firstName} ${student.parent.lastName}`
        : "",
      parentEmail: student.parent?.email || "",
      parentPhone: student.parent?.phone || "",
      stats: {
        attendanceRate,
        averageGrade,
        totalAssignments,
        submittedAssignments: submissions.length,
        presentDays,
        absentDays,
      },
      recentGrades: submissions.map((sub) => ({
        assignmentTitle: sub.assignment.title,
        subjectName: "General",
        points: sub.points || 0,
        maxPoints: sub.assignment.maxPoints,
        date: sub.gradedAt?.toISOString() || sub.submittedAt.toISOString(),
      })),
      recentAttendance: student.attendanceRecords.map((record) => ({
        date: record.date.toISOString(),
        status: record.status,
        subjectName: record.subject.name,
      })),
    };

    return NextResponse.json({ student: studentDetail });
  } catch (error) {
    console.error("Error fetching student detail:", error);
    return NextResponse.json(
      { error: "Failed to fetch student details" },
      { status: 500 },
    );
  }
}
