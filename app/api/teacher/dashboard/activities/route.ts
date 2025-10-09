// app/api/teacher/dashboard/activities/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Add this interface
interface Activity {
  id: string;
  action: string;
  time: string;
  type: string;
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teacherId = session.user.id;

    // Add type annotation here
    const activities: Activity[] = [];

    // Recent attendance records
    const recentAttendance = await prisma.attendanceRecord.findMany({
      where: { recordedBy: teacherId },
      include: {
        student: true,
        class: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    recentAttendance.forEach((record) => {
      activities.push({
        id: record.id,
        action: `Marked attendance for ${record.student.firstName} ${record.student.lastName} in ${record.class.name}`,
        time: getRelativeTime(record.createdAt),
        type: "attendance",
      });
    });

    // Recent assignments
    const recentAssignments = await prisma.assignment.findMany({
      where: { createdBy: teacherId },
      include: { class: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    recentAssignments.forEach((assignment) => {
      activities.push({
        id: assignment.id,
        action: `Created assignment "${assignment.title}" for ${assignment.class.name}`,
        time: getRelativeTime(assignment.createdAt),
        type: "assignment",
      });
    });

    // Sort by date and take top 10
    activities.sort((a, b) => {
      const timeA = parseRelativeTime(a.time);
      const timeB = parseRelativeTime(b.time);
      return timeA - timeB;
    });

    return NextResponse.json(activities.slice(0, 10));
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 },
    );
  }
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

function parseRelativeTime(time: string): number {
  if (time === "Just now") return 0;
  if (time.endsWith("m ago")) return parseInt(time) * 60000;
  if (time.endsWith("h ago")) return parseInt(time) * 3600000;
  if (time.endsWith("d ago")) return parseInt(time) * 86400000;
  return Date.now();
}
