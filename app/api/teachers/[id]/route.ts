import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{ id: string }>;
}

// PUT update teacher
export async function PUT(req: Request, { params }: Params) {
  const { id } = await params;
  const data = await req.json();
  const { name, email, subject } = data;
  const [firstName, ...rest] = name.split(" ");
  const lastName = rest.join(" ") || "";

  const teacher = await prisma.user.update({
    where: { id },
    data: { firstName, lastName, email },
  });

  return NextResponse.json({
    id: teacher.id,
    name,
    email,
    subject,
  });
}

// DELETE teacher
export async function DELETE(_: Request, { params }: Params) {
  const { id } = await params;

  await prisma.user.delete({
    where: { id },
  });

  return NextResponse.json({ message: "Teacher deleted successfully" });
}
