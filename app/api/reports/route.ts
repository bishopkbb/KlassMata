// app/api/reports/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.schoolId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Mock data - replace with real calculations
    const reportData = {
      attendance: {
        overall: 87,
        trend: "up" as const,
        byClass: [
          { className: "Class 10A", percentage: 92 },
          { className: "Class 10B", percentage: 85 },
          { className: "Class 9A", percentage: 88 },
        ],
      },
      academic: {
        averageGrade: 75,
        trend: "up" as const,
        topPerformers: [
          { name: "John Doe", average: 95 },
          { name: "Jane Smith", average: 92 },
          { name: "Bob Johnson", average: 90 },
        ],
      },
      financial: {
        totalRevenue: 2450000,
        outstandingFees: 350000,
        collectionRate: 87,
      },
      enrollment: {
        total: 486,
        newThisMonth: 12,
        byGrade: [
          { grade: "9", count: 120 },
          { grade: "10", count: 150 },
          { grade: "11", count: 116 },
          { grade: "12", count: 100 },
        ],
      },
    };

    return NextResponse.json(reportData);
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 },
    );
  }
}
