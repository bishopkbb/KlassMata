// app/api/students/route.ts
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

    const students = await prisma.student.findMany({
      where: {
        schoolId: session.user.schoolId,
        isActive: true
      },
      include: {
        class: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    const formatted = students.map(s => ({
      id: s.id,
      studentId: s.studentId,
      firstName: s.firstName,
      lastName: s.lastName,
      email: s.email,
      phone: s.phone,
      dateOfBirth: s.dateOfBirth,
      gender: s.gender,
      className: s.class.name,
      admissionDate: s.admissionDate,
      isActive: s.isActive
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.schoolId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.json()
    const { firstName, lastName, dateOfBirth, gender, email, phone, address, classId, parentName, parentEmail, parentPhone } = data

    // Generate unique student ID
    const studentCount = await prisma.student.count({ where: { schoolId: session.user.schoolId } })
    const studentId = `STU${new Date().getFullYear()}${String(studentCount + 1).padStart(4, '0')}`

    // Create or find parent
    let parent = await prisma.user.findUnique({ where: { email: parentEmail } })
    
    if (!parent) {
      const [parentFirstName, ...rest] = parentName.split(' ')
      const parentLastName = rest.join(' ') || ''
      
      parent = await prisma.user.create({
        data: {
          firstName: parentFirstName,
          lastName: parentLastName,
          email: parentEmail,
          phone: parentPhone,
          password: await require('bcryptjs').hash('changeme123', 10),
          role: 'parent',
          schoolId: session.user.schoolId,
          isActive: true
        }
      })
    }

    // Create student
    const student = await prisma.student.create({
      data: {
        studentId,
        firstName,
        lastName,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        email,
        phone,
        address,
        schoolId: session.user.schoolId,
        classId,
        parentId: parent.id,
        isActive: true
      },
      include: {
        class: { select: { name: true } }
      }
    })

    return NextResponse.json({
      success: true,
      student: {
        id: student.id,
        studentId: student.studentId,
        firstName: student.firstName,
        lastName: student.lastName,
        className: student.class.name
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating student:', error)
    return NextResponse.json({ error: 'Failed to create student' }, { status: 500 })
  }
}