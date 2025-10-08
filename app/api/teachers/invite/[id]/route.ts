// app/api/teachers/invite/[id]/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// DELETE - Cancel an invite
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized: Please log in" },
        { status: 401 }
      );
    }

    const userRole = session.user.role;
    if (userRole !== "admin" && userRole !== "super_admin") {
      return NextResponse.json(
        { error: "Forbidden: Only admins can cancel invites" },
        { status: 403 }
      );
    }

    const schoolId = session.user.schoolId;
    if (!schoolId) {
      return NextResponse.json(
        { error: "No school associated with your account" },
        { status: 400 }
      );
    }

    // Check if invite exists and belongs to this school
    const invite = await prisma.teacherInvite.findUnique({
      where: { id: params.id },
    });

    if (!invite) {
      return NextResponse.json(
        { error: "Invite not found" },
        { status: 404 }
      );
    }

    if (invite.schoolId !== schoolId) {
      return NextResponse.json(
        { error: "Unauthorized to cancel this invite" },
        { status: 403 }
      );
    }

    // Update invite status to cancelled
    await prisma.teacherInvite.update({
      where: { id: params.id },
      data: { status: "cancelled" },
    });

    return NextResponse.json({
      success: true,
      message: "Invite cancelled successfully",
    });

  } catch (error) {
    console.error("Error cancelling invite:", error);
    return NextResponse.json(
      { error: "Failed to cancel invite" },
      { status: 500 }
    );
  }
}