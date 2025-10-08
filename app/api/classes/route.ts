// app/api/classes/route.ts
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

    const classes = await prisma.class.findMany({
      where: {
        schoolId: session.user.schoolId,
        isActive: true
      },
      include: {
        teacher: { select: { firstName: true, lastName: true } },
        students: { where: { isActive: true } },
        subjects: { where: { isActive: true } }
      }
    })

    const formatted = classes.map(c => ({
      id: c.id,
      name: c.name,
      grade: c.grade,
      section: c.section,
      capacity: c.capacity,
      teacherName: `${c.teacher.firstName} ${c.teacher.lastName}`,
      studentCount: c.students.length,
      subjects: c.subjects.length,
      isActive: c.isActive
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('Error fetching classes:', error)
    return NextResponse.json({ error: 'Failed to fetch classes' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.schoolId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.json()
    const { name, grade, section, capacity, teacherId } = data

    const classItem = await prisma.class.create({
      data: {
        name,
        grade,
        section,
        capacity: parseInt(capacity),
        schoolId: session.user.schoolId,
        teacherId,
        isActive: true
      },
      include: {
        teacher: { select: { firstName: true, lastName: true } }
      }
    })

    return NextResponse.json({
      success: true,
      class: {
        id: classItem.id,
        name: classItem.name,
        teacherName: `${classItem.teacher.firstName} ${classItem.teacher.lastName}`
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating class:', error)
    return NextResponse.json({ error: 'Failed to create class' }, { status: 500 })
  }
}