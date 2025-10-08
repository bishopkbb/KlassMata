// app/api/attendance/route.ts
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.schoolId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const className = searchParams.get('class')
    const date = searchParams.get('date')

    if (!className || className === 'all') {
      return NextResponse.json([])
    }

    // Get class by name
    const classItem = await prisma.class.findFirst({
      where: {
        name: className,
        schoolId: session.user.schoolId
      }
    })

    if (!classItem) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })
    }

    // Get students in class
    const students = await prisma.student.findMany({
      where: {
        classId: classItem.id,
        isActive: true
      },
      include: {
        class: true
      }
    })

    // Get existing attendance for the date
    const attendanceRecords = date ? await prisma.attendanceRecord.findMany({
      where: {
        classId: classItem.id,
        date: new Date(date)
      }
    }) : []

    const attendanceMap = new Map(
      attendanceRecords.map(record => [record.studentId, record.status])
    )

    const formatted = students.map(s => ({
      id: s.id,
      studentId: s.studentId,
      name: `${s.firstName} ${s.lastName}`,
      className: s.class.name,
      status: attendanceMap.get(s.id) || null
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('Error fetching attendance:', error)
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.json()
    const { attendance } = data

    // Delete existing records for the date
    const firstRecord = attendance[0]
    await prisma.attendanceRecord.deleteMany({
      where: {
        classId: firstRecord.classId,
        date: new Date(firstRecord.date)
      }
    })

    // Create new records
    await prisma.attendanceRecord.createMany({
      data: attendance.map((record: any) => ({
        studentId: record.studentId,
        classId: record.classId,
        subjectId: record.subjectId,
        date: new Date(record.date),
        status: record.status,
        recordedBy: session.user.id
      }))
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving attendance:', error)
    return NextResponse.json({ error: 'Failed to save attendance' }, { status: 500 })
  }
}