import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teacherId = session.user.id;
    const { id: assignmentId } = await params;
    const { submissionId, points, feedback } = await req.json();

    const assignment = await prisma.assignment.findFirst({
      where: {
        id: assignmentId,
        createdBy: teacherId,
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found or access denied" },
        { status: 404 },
      );
    }

    if (points < 0 || points > assignment.maxPoints) {
      return NextResponse.json(
        { error: `Points must be between 0 and ${assignment.maxPoints}` },
        { status: 400 },
      );
    }

    const updatedSubmission = await prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        points,
        feedback,
        gradedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Grade saved successfully",
      submission: updatedSubmission,
    });
  } catch (error) {
    console.error("Error saving grade:", error);
    return NextResponse.json(
      { error: "Failed to save grade" },
      { status: 500 },
    );
  }
}
