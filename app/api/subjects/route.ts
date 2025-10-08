// app/api/subjects/route.ts
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.schoolId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subjects = await prisma.subject.findMany({
      where: {
        schoolId: session.user.schoolId,
        isActive: true
      },
      include: {
        teacher: { select: { firstName: true, lastName: true } },
        class: { select: { name: true } }
      }
    })

    const formatted = subjects.map(s => ({
      id: s.id,
      name: s.name,
      code: s.code,
      className: s.class.name,
      teacherName: `${s.teacher.firstName} ${s.teacher.lastName}`,
      credits: s.credits
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('Error fetching subjects:', error)
    return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.schoolId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.json()
    const { name, code, classId, teacherId, credits, description } = data

    const subject = await prisma.subject.create({
      data: {
        name,
        code,
        schoolId: session.user.schoolId,
        classId,
        teacherId,
        credits: parseInt(credits) || 1,
        description,
        isActive: true
      }
    })

    return NextResponse.json({ success: true, subject }, { status: 201 })
  } catch (error) {
    console.error('Error creating subject:', error)
    return NextResponse.json({ error: 'Failed to create subject' }, { status: 500 })
  }
}