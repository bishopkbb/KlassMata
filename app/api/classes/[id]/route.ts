import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{ id: string }>;
}

// PUT update class
export async function PUT(req: Request, { params }: Params) {
  const { id } = await params;
  const data = await req.json();
  const { name, teacherId } = data;

  const updatedClass = await prisma.class.update({
    where: { id },
    data: { name, teacherId: teacherId || undefined },
    include: { teacher: true },
  });

  return NextResponse.json(updatedClass);
}

// DELETE class
export async function DELETE(_: Request, { params }: Params) {
  const { id } = await params;

  await prisma.class.delete({
    where: { id },
  });

  return NextResponse.json({ message: "Class deleted successfully" });
}
