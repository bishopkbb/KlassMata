// app/api/teacher/students/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teacherId = session.user.id;

    // Get all classes taught by this teacher
    const classes = await prisma.class.findMany({
      where: { teacherId },
      select: { id: true },
    });

    const classIds = classes.map((c) => c.id);

    // Get all students in these classes
    const students = await prisma.student.findMany({
      where: {
        classId: { in: classIds },
        isActive: true,
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
          },
        },
        attendanceRecords: {
          select: {
            status: true,
          },
        },
        assignmentSubmissions: {
          where: {
            points: { not: null },
          },
          include: {
            assignment: {
              select: { maxPoints: true },
            },
          },
        },
      },
      orderBy: { studentId: "asc" },
    });

    const formattedStudents = students.map((student) => {
      // Calculate attendance rate
      const totalAttendance = student.attendanceRecords.length;
      const presentCount = student.attendanceRecords.filter(
        (r) => r.status === "present" || r.status === "late",
      ).length;
      const attendanceRate =
        totalAttendance > 0
          ? Math.round((presentCount / totalAttendance) * 100)
          : 0;

      // Calculate average grade
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

      return {
        id: student.id,
        studentId: student.studentId,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email || "",
        phone: student.phone || "",
        dateOfBirth: student.dateOfBirth.toISOString(),
        gender: student.gender,
        className: student.class.name,
        classId: student.class.id,
        admissionDate: student.admissionDate.toISOString(),
        attendanceRate,
        averageGrade,
      };
    });

    return NextResponse.json({ students: formattedStudents });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 },
    );
  }
}
