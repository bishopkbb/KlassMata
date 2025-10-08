// app/api/admin/dashboard/stats/route.ts
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.schoolId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const schoolId = session.user.schoolId

    // Fetch school info
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      select: { name: true }
    })

    // Get total teachers
    const totalTeachers = await prisma.user.count({
      where: {
        schoolId,
        role: 'teacher',
        isActive: true
      }
    })

    // Get total students
    const totalStudents = await prisma.student.count({
      where: {
        schoolId,
        isActive: true
      }
    })

    // Get total classes
    const totalClasses = await prisma.class.count({
      where: {
        schoolId,
        isActive: true
      }
    })

    // Get total subjects
    const totalSubjects = await prisma.subject.count({
      where: {
        schoolId,
        isActive: true
      }
    })

    // Get pending payments (example - adjust based on your payment logic)
    const pendingPayments = await prisma.payment.count({
      where: {
        schoolId,
        status: 'pending'
      }
    })

    // Calculate today's attendance percentage
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todayAttendanceRecords = await prisma.attendanceRecord.findMany({
      where: {
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    })

    const presentCount = todayAttendanceRecords.filter(
      record => record.status === 'present'
    ).length

    const todayAttendance = todayAttendanceRecords.length > 0
      ? Math.round((presentCount / todayAttendanceRecords.length) * 100)
      : 0

    return NextResponse.json({
      schoolName: school?.name || 'Your School',
      stats: {
        totalTeachers,
        totalStudents,
        totalClasses,
        totalSubjects,
        pendingPayments,
        todayAttendance
      }
    })

  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}



