// app/api/teacher/dashboard/stats/route.ts
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
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get teacher's classes
    const classes = await prisma.class.findMany({
      where: { teacherId },
      include: {
        students: true,
        subjects: true,
      },
    });

    // Get subjects taught
    const subjects = await prisma.subject.findMany({
      where: { teacherId },
      include: { class: true },
    });

    // Count total unique students across all classes
    const uniqueStudentIds = new Set(
      classes.flatMap(c => c.students.map(s => s.id))
    );

    // Get pending assignments
    const pendingAssignments = await prisma.assignment.findMany({
      where: {
        createdBy: teacherId,
        dueDate: { gte: today },
        isActive: true,
      },
    });

    // Get today's attendance records
    const todayAttendance = await prisma.attendanceRecord.findMany({
      where: {
        recordedBy: teacherId,
        date: { gte: today, lt: tomorrow },
      },
    });

    // Mock upcoming classes (you'll need to add a timetable system for real data)
    const upcomingClasses = classes.slice(0, 3).map(cls => ({
      id: cls.id,
      name: cls.name,
      time: "9:00 AM", // You'll need a timetable system for actual times
      room: cls.section || "Main Hall",
      students: cls.students.length,
    }));

    const stats = {
      totalClasses: classes.length,
      totalStudents: uniqueStudentIds.size,
      todayClasses: classes.length, // This would come from timetable
      pendingAssignments: pendingAssignments.length,
      attendanceMarked: todayAttendance.length,
    };

    return NextResponse.json({
      stats,
      upcomingClasses,
    });

  } catch (error) {
    console.error("Error fetching teacher stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}