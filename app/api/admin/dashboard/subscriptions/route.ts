// app/api/admin/dashboard/subscription/route.ts
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

    // Get active subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        schoolId,
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!subscription) {
      return NextResponse.json({
        planName: "No Active Plan",
        status: "inactive",
        endDate: "N/A",
        features: {
          maxStudents: 0,
          currentStudents: 0,
        },
      });
    }

    // Get current student count
    const currentStudents = await prisma.student.count({
      where: {
        schoolId,
        isActive: true,
      },
    });

    // Calculate days remaining
    const now = new Date();
    const endDate = new Date(subscription.endDate);
    const daysRemaining = Math.ceil(
      (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Format end date
    const formattedEndDate = endDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return NextResponse.json({
      planName: subscription.planName,
      status: subscription.status,
      endDate: formattedEndDate,
      daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
      features: {
        maxStudents: (subscription.features as any)?.maxStudents || 100,
        currentStudents,
      },
    });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 },
    );
  }
}
