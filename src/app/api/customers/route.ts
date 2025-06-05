import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

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

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const country = searchParams.get('country') || ''

    const whereClause: any = {
      isActive: true
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (country) {
      whereClause.country = country
    }

    const customers = await prisma.customer.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { orders: true }
        }
      }
    })

    return NextResponse.json(customers)
  } catch (error) {
    console.error('Get customers error:', error)
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

    // Check permissions
    if (!payload.permissions.includes('MANAGE_CUSTOMERS')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { name, email, phone, company, country, address } = body

    // Validate required fields
    if (!name || !email || !company || !country) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, email, company, country' 
      }, { status: 400 })
    }

    // Check if email already exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { email }
    })

    if (existingCustomer) {
      return NextResponse.json({ 
        error: 'Customer with this email already exists' 
      }, { status: 409 })
    }

    // Create customer
    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone: phone || null,
        company,
        country,
        address: address || null,
        createdById: payload.userId,
        isActive: true
      }
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'CUSTOMER_CREATED',
        description: `Created new customer: ${name}`,
        entityType: 'Customer',
        entityId: customer.id,
        userId: payload.userId
      }
    })

    return NextResponse.json(customer, { status: 201 })
  } catch (error) {
    console.error('Create customer error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
