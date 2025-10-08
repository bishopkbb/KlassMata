// app/api/auth/register/route.ts

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import { z } from 'zod'

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['school_owner', 'teacher']).optional(),
  // School owner fields
  schoolName: z.string().optional(),
  schoolAddress: z.string().optional(),
  schoolPhone: z.string().optional(),
  // Teacher field
  inviteCode: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = registerSchema.parse(body)
    const { 
      firstName, 
      lastName, 
      email, 
      password,
      role,
      schoolName,
      schoolAddress,
      schoolPhone,
      inviteCode
    } = validatedData

    const normalizedEmail = email.toLowerCase()

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12')
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Determine user role
    let userRole: UserRole = UserRole.teacher // Default role

    // Special case: super admin email
    if (normalizedEmail === 'ajibade_tosin@yahoo.com') {
      userRole = UserRole.super_admin

      // Ensure only one super admin exists
      const superAdminExists = await prisma.user.findFirst({
        where: { role: UserRole.super_admin },
      })
      if (superAdminExists) {
        return NextResponse.json(
          { error: 'Super admin already exists' },
          { status: 400 }
        )
      }

      // Create super admin user
      const user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email: normalizedEmail,
          password: hashedPassword,
          role: userRole,
          isActive: true,
          emailVerified: true,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          createdAt: true,
        },
      })

      return NextResponse.json(
        {
          success: true,
          message: 'Super admin registered successfully',
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
          },
        },
        { status: 201 }
      )
    }

    // Handle School Owner Registration
    if (role === 'school_owner') {
      if (!schoolName) {
        return NextResponse.json(
          { error: 'School name is required for school owner registration' },
          { status: 400 }
        )
      }

      // Create school
      const school = await prisma.school.create({
        data: {
          name: schoolName,
          address: schoolAddress || '',
          phone: schoolPhone || '',
          email: normalizedEmail,
          isActive: true,
        },
      })

      // Create subscription (30-day trial)
      await prisma.subscription.create({
        data: {
          schoolId: school.id,
          planName: 'Basic',
          planType: 'monthly',
          amount: 20000,
          currency: 'NGN',
          status: 'trial',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          features: {
            maxStudents: 100,
            adminDashboard: true,
            teacherDashboard: true,
            parentPortal: false,
            studentPortal: false,
          },
          isActive: true,
        },
      })

      // Create admin user
      const user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email: normalizedEmail,
          password: hashedPassword,
          role: UserRole.admin,
          schoolId: school.id,
          isActive: true,
          emailVerified: false,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          schoolId: true,
          createdAt: true,
        },
      })

      return NextResponse.json(
        {
          success: true,
          message: 'School created successfully',
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            schoolId: user.schoolId,
          },
        },
        { status: 201 }
      )
    }

    // Handle Teacher Registration with Invite Code
    if (role === 'teacher') {
      if (!inviteCode) {
        return NextResponse.json(
          { error: 'Invite code is required for teacher registration' },
          { status: 400 }
        )
      }

      // Validate invite code
      const invite = await prisma.teacherInvite.findUnique({
        where: { code: inviteCode },
        include: { school: true },
      })

      if (!invite) {
        return NextResponse.json(
          { error: 'Invalid invite code' },
          { status: 400 }
        )
      }

      if (invite.status !== 'pending') {
        return NextResponse.json(
          { error: 'This invite code has already been used' },
          { status: 400 }
        )
      }

      if (invite.expiresAt < new Date()) {
        // Mark as expired
        await prisma.teacherInvite.update({
          where: { code: inviteCode },
          data: { status: 'expired' },
        })

        return NextResponse.json(
          { error: 'This invite code has expired' },
          { status: 400 }
        )
      }

      if (invite.email.toLowerCase() !== normalizedEmail) {
        return NextResponse.json(
          { error: 'Email does not match the invite' },
          { status: 400 }
        )
      }

      // Create teacher user
      const user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email: normalizedEmail,
          password: hashedPassword,
          role: UserRole.teacher,
          schoolId: invite.schoolId,
          isActive: true,
          emailVerified: false,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          schoolId: true,
          createdAt: true,
        },
      })

      // Mark invite as used
      await prisma.teacherInvite.update({
        where: { code: inviteCode },
        data: {
          status: 'used',
          usedAt: new Date(),
          usedByUserId: user.id,
        },
      })

      return NextResponse.json(
        {
          success: true,
          message: 'Teacher account created successfully',
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            schoolId: user.schoolId,
          },
          schoolName: invite.school.name,
        },
        { status: 201 }
      )
    }

    // Default: Create regular teacher without school
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email: normalizedEmail,
        password: hashedPassword,
        role: UserRole.teacher,
        isActive: true,
        emailVerified: false,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'User registered successfully',
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Registration error:', error)

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    // Handle Prisma unique constraint errors
    if ((error as any).code === 'P2002') {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }

    // Fallback server error
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}