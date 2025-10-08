import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      const classes = await prisma.class.findMany({
        include: { teacher: true, students: true },
      });
      return res.json(classes);
    }

    if (req.method === "POST") {
      const { name, grade, section, capacity, schoolId, teacherId } = req.body;
      const newClass = await prisma.class.create({
        data: {
          name,
          grade,
          section,
          capacity,
          schoolId,
          teacherId,
        },
      });
      return res.status(201).json(newClass);
    }

    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
