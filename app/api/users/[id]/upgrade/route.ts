// app/api/users/[id]/upgrade/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const userId = params.id

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

    // Validate userId
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      )
    }

    // Find the user to be upgraded
    const userToUpgrade = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      }
    })

    if (!userToUpgrade) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user is active
    if (!userToUpgrade.isActive) {
      return NextResponse.json(
        { error: 'Cannot upgrade inactive user' },
        { status: 400 }
      )
    }

    // Check current role and determine upgrade path
    let newRole: UserRole
    let upgradeMessage: string

    switch (userToUpgrade.role) {
      case UserRole.teacher:
        newRole = UserRole.admin
        upgradeMessage = 'User promoted from Teacher to Admin'
        break
      
      case UserRole.student:
        newRole = UserRole.teacher
        upgradeMessage = 'User promoted from Student to Teacher'
        break
      
      case UserRole.parent:
        newRole = UserRole.teacher
        upgradeMessage = 'User promoted from Parent to Teacher'
        break
      
      case UserRole.admin:
        return NextResponse.json(
          { error: 'User is already an Admin. Cannot upgrade further.' },
          { status: 400 }
        )
      
      case UserRole.super_admin:
        return NextResponse.json(
          { error: 'User is already a Super Admin. Cannot upgrade further.' },
          { status: 400 }
        )
      
      default:
        return NextResponse.json(
          { error: 'Invalid user role for upgrade' },
          { status: 400 }
        )
    }

    // Prevent upgrading the special super admin email
    if (userToUpgrade.email === 'ajibade_tosin@yahoo.com') {
      return NextResponse.json(
        { error: 'Cannot modify the role of the system super administrator' },
        { status: 400 }
      )
    }

    // Perform the role upgrade
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        role: newRole,
        updatedAt: new Date()
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        updatedAt: true,
      }
    })

    // Log the upgrade action (optional - you can create an audit log table)
    console.log(`User role upgrade: ${userToUpgrade.email} upgraded from ${userToUpgrade.role} to ${newRole} by ${session.user.email}`)

    return NextResponse.json({
      success: true,
      message: upgradeMessage,
      user: {
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        previousRole: userToUpgrade.role,
        newRole: updatedUser.role,
        upgradedAt: updatedUser.updatedAt,
        upgradedBy: {
          id: session.user.id,
          name: `${session.user.firstName} ${session.user.lastName}`,
          email: session.user.email
        }
      }
    })

  } catch (error) {
    console.error('Error upgrading user role:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Optional: GET method to check upgrade eligibility
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const userId = params.id

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

    // Find the user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Determine upgrade eligibility
    let canUpgrade = false
    let nextRole = null
    let reason = ''

    if (!user.isActive) {
      reason = 'User is inactive'
    } else if (user.email === 'ajibade_tosin@yahoo.com') {
      reason = 'Cannot modify system super administrator'
    } else {
      switch (user.role) {
        case UserRole.teacher:
          canUpgrade = true
          nextRole = UserRole.admin
          reason = 'Can be promoted to Admin'
          break
        case UserRole.student:
        case UserRole.parent:
          canUpgrade = true
          nextRole = UserRole.teacher
          reason = 'Can be promoted to Teacher'
          break
        case UserRole.admin:
          reason = 'Already an Admin - cannot upgrade further'
          break
        case UserRole.super_admin:
          reason = 'Already a Super Admin - cannot upgrade further'
          break
        default:
          reason = 'Invalid role for upgrade'
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        currentRole: user.role,
        isActive: user.isActive
      },
      upgradeInfo: {
        canUpgrade,
        nextRole,
        reason
      }
    })

  } catch (error) {
    console.error('Error checking upgrade eligibility:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}