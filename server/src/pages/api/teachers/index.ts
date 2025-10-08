import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      // List teachers
      const teachers = await prisma.user.findMany({
        where: { role: "teacher" },
        include: { classesTeaching: true },
      });
      return res.json(teachers);
    }

    if (req.method === "POST") {
      // Add teacher
      const { email, password, firstName, lastName, schoolId } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      const teacher = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          role: "teacher",
          schoolId,
        },
      });

      return res.status(201).json(teacher);
    }

    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
