import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  try {
    if (req.method === "GET") {
      const school = await prisma.school.findUnique({ where: { id: String(id) } });
      return res.json(school);
    }

    if (req.method === "PUT") {
      const { name, address, phone, email, logo, website, description } = req.body;
      const updated = await prisma.school.update({
        where: { id: String(id) },
        data: { name, address, phone, email, logo, website, description },
      });
      return res.json(updated);
    }

    res.setHeader("Allow", ["GET", "PUT"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
