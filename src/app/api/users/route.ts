import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, hashPassword } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)
    
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check permissions - only admins can manage users
    if (!payload.permissions.includes('MANAGE_USERS')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const users = await prisma.user.findMany({
      where: {
        role: 'SUB_ADMIN'
      },
      include: {
        permissions: true
      },
      orderBy: { createdAt: 'desc' }
    })

    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      permissions: user.permissions.map(p => p.permission),
      createdAt: user.createdAt
    }))

    return NextResponse.json(formattedUsers)
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)
    
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check permissions - only admins can create users
    if (!payload.permissions.includes('MANAGE_USERS')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { name, email, password, permissions } = body

    // Validate required fields
    if (!name || !email || !password || !permissions || permissions.length === 0) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, email, password, permissions' 
      }, { status: 400 })
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ 
        error: 'User with this email already exists' 
      }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'SUB_ADMIN',
        isActive: true,
        createdById: payload.userId
      }
    })

    // Create user permissions
    const permissionPromises = permissions.map((permission: string) =>
      prisma.userPermission.create({
        data: {
          userId: user.id,
          permission: permission as 'MANAGE_CUSTOMERS' | 'MANAGE_VENDORS' | 'MANAGE_ORDERS' | 'VIEW_ANALYTICS' | 'MANAGE_PAYMENTS' | 'VIEW_REPORTS'
        }
      })
    )

    await Promise.all(permissionPromises)

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'USER_CREATED',
        description: `Created new sub-admin: ${name}`,
        entityType: 'User',
        entityId: user.id,
        userId: payload.userId
      }
    })

    // Return user without password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json({
      ...userWithoutPassword,
      permissions
    }, { status: 201 })

  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
