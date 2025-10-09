// app/api/admin/dashboard/activities/route.ts
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

    const schoolId = session.user.schoolId;
    const activities: any[] = [];

    // Get recent teachers (last 7 days)
    const recentTeachers = await prisma.user.findMany({
      where: {
        schoolId,
        role: "teacher",
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 3,
    });

    recentTeachers.forEach((teacher) => {
      activities.push({
        id: `teacher-${teacher.id}`,
        action: `New teacher registered: ${teacher.firstName} ${teacher.lastName}`,
        user: "System",
        time: getTimeAgo(teacher.createdAt),
        type: "teacher",
      });
    });

    // Get recent students (last 7 days)
    const recentStudents = await prisma.student.findMany({
      where: {
        schoolId,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 3,
    });

    recentStudents.forEach((student) => {
      activities.push({
        id: `student-${student.id}`,
        action: `New student enrolled: ${student.firstName} ${student.lastName}`,
        user: "System",
        time: getTimeAgo(student.createdAt),
        type: "student",
      });
    });

    // Get recent payments (last 7 days)
    const recentPayments = await prisma.payment.findMany({
      where: {
        schoolId,
        status: "completed",
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
      select: {
        id: true,
        amount: true,
        createdAt: true,
        initiator: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 3,
    });

    recentPayments.forEach((payment) => {
      activities.push({
        id: `payment-${payment.id}`,
        action: `Payment received: ₦${payment.amount.toLocaleString()}`,
        user: `${payment.initiator.firstName} ${payment.initiator.lastName}`,
        time: getTimeAgo(payment.createdAt),
        type: "payment",
      });
    });

    // Get recent classes (last 7 days)
    const recentClasses = await prisma.class.findMany({
      where: {
        schoolId,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        teacher: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 2,
    });

    recentClasses.forEach((classItem) => {
      activities.push({
        id: `class-${classItem.id}`,
        action: `New class created: ${classItem.name}`,
        user: `${classItem.teacher.firstName} ${classItem.teacher.lastName}`,
        time: getTimeAgo(classItem.createdAt),
        type: "class",
      });
    });

    // Sort all activities by time and limit to 10
    activities.sort((a, b) => {
      const timeA = parseTimeAgo(a.time);
      const timeB = parseTimeAgo(b.time);
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

// Helper function to format time ago
function getTimeAgo(date: Date): string {
  const seconds = Math.floor(
    (new Date().getTime() - new Date(date).getTime()) / 1000,
  );

  if (seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;

  return new Date(date).toLocaleDateString();
}

// Helper function to parse time ago for sorting
function parseTimeAgo(timeStr: string): number {
  if (timeStr === "Just now") return 0;

  const match = timeStr.match(/(\d+)\s+(minute|hour|day)/);
  if (!match) return Infinity;

  const value = parseInt(match[1]);
  const unit = match[2];

  if (unit === "minute") return value;
  if (unit === "hour") return value * 60;
  if (unit === "day") return value * 60 * 24;

  return Infinity;
}
