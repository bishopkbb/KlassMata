// app/api/users/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is super admin
    if (session.user.role !== UserRole.super_admin) {
      return NextResponse.json(
        { error: 'Forbidden - Super Admin access required' },
        { status: 403 }
      )
    }

    // Get query parameters for filtering and pagination
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const role = searchParams.get('role')
    const search = searchParams.get('search')
    const isActive = searchParams.get('active')

    // Calculate skip for pagination
    const skip = (page - 1) * limit

    // Build where clause for filtering
    const where: any = {}
    
    if (role && role !== 'all') {
      where.role = role as UserRole
    }
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true'
    }

    // Fetch users with filtering, pagination, and related data
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          isActive: true,
          emailVerified: true,
          phone: true,
          address: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
          school: {
            select: {
              id: true,
              name: true,
            }
          },
          // Include student profile if exists
          studentProfile: {
            select: {
              studentId: true,
              class: {
                select: {
                  name: true,
                  grade: true,
                }
              }
            }
          },
          // Count related records
          _count: {
            select: {
              classesTeaching: true,
              subjectsTeaching: true,
              children: true,
            }
          }
        }
      }),
      prisma.user.count({ where })
    ])

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      success: true,
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers: total,
        limit,
        hasNextPage,
        hasPrevPage,
      },
      summary: {
        totalUsers: total,
        activeUsers: users.filter(u => u.isActive).length,
        inactiveUsers: users.filter(u => !u.isActive).length,
        roleBreakdown: {
          super_admin: users.filter(u => u.role === 'super_admin').length,
          admin: users.filter(u => u.role === 'admin').length,
          teacher: users.filter(u => u.role === 'teacher').length,
          student: users.filter(u => u.role === 'student').length,
          parent: users.filter(u => u.role === 'parent').length,
        }
      }
    })

  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is super admin
    if (session.user.role !== UserRole.super_admin) {
      return NextResponse.json(
        { error: 'Forbidden - Super Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { action, userIds, updates } = body

    switch (action) {
      case 'bulk_activate':
        await prisma.user.updateMany({
          where: { id: { in: userIds } },
          data: { isActive: true }
        })
        break

      case 'bulk_deactivate':
        await prisma.user.updateMany({
          where: { id: { in: userIds } },
          data: { isActive: false }
        })
        break

      case 'bulk_update_role':
        if (updates.role && Object.values(UserRole).includes(updates.role)) {
          await prisma.user.updateMany({
            where: { id: { in: userIds } },
            data: { role: updates.role }
          })
        }
        break

      case 'bulk_delete':
        // Soft delete by deactivating users
        await prisma.user.updateMany({
          where: { id: { in: userIds } },
          data: { isActive: false }
        })
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      message: `Bulk action '${action}' completed successfully`,
      affectedUsers: userIds.length
    })

  } catch (error) {
    console.error('Error in bulk user operation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}