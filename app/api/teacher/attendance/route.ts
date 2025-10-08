// app/api/teacher/attendance/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET - Fetch students with their attendance status
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId');
    const subjectId = searchParams.get('subjectId');
    const date = searchParams.get('date');

    if (!classId || !subjectId || !date) {
      return NextResponse.json(
        { error: "classId, subjectId, and date are required" },
        { status: 400 }
      );
    }

    const teacherId = session.user.id;

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

    // Get all students in the class
    const students = await prisma.student.findMany({
      where: {
        classId,
        isActive: true,
      },
      orderBy: { studentId: 'asc' },
    });

    // Get existing attendance records for this date
    const attendanceDate = new Date(date);
    const nextDay = new Date(attendanceDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const attendanceRecords = await prisma.attendanceRecord.findMany({
      where: {
        classId,
        subjectId,
        date: {
          gte: attendanceDate,
          lt: nextDay,
        },
      },
    });

    // Map attendance to students
    const attendanceMap = new Map(
      attendanceRecords.map(record => [record.studentId, record.status])
    );

    const studentsWithAttendance = students.map(student => ({
      id: student.id,
      name: `${student.firstName} ${student.lastName}`,
      studentId: student.studentId,
      status: attendanceMap.get(student.id) || null,
    }));

    return NextResponse.json({ students: studentsWithAttendance });

  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance" },
      { status: 500 }
    );
  }
}

// POST - Save attendance records
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { classId, subjectId, date, records } = await req.json();

    if (!classId || !subjectId || !date || !records) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const teacherId = session.user.id;

    // Verify teacher has access
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

    const attendanceDate = new Date(date);

    // Use transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      // Delete existing records for this date/class/subject
      await tx.attendanceRecord.deleteMany({
        where: {
          classId,
          subjectId,
          date: attendanceDate,
        },
      });

      // Create new records
      const attendanceRecords = records.map((record: any) => ({
        studentId: record.studentId,
        classId,
        subjectId,
        date: attendanceDate,
        status: record.status,
        recordedBy: teacherId,
      }));

      await tx.attendanceRecord.createMany({
        data: attendanceRecords,
      });
    });

    return NextResponse.json({
      success: true,
      message: "Attendance saved successfully",
    });

  } catch (error) {
    console.error("Error saving attendance:", error);
    return NextResponse.json(
      { error: "Failed to save attendance" },
      { status: 500 }
    );
  }
}