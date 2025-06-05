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
    const specialization = searchParams.get('specialization') || ''

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

    if (specialization) {
      whereClause.specialization = specialization
    }

    const vendors = await prisma.vendor.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { orders: true }
        }
      }
    })

    return NextResponse.json(vendors)
  } catch (error) {
    console.error('Get vendors error:', error)
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
    if (!payload.permissions.includes('MANAGE_VENDORS')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { name, email, phone, company, country, address, specialization } = body

    // Validate required fields
    if (!name || !email || !company || !country || !specialization) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, email, company, country, specialization' 
      }, { status: 400 })
    }

    // Check if email already exists
    const existingVendor = await prisma.vendor.findUnique({
      where: { email }
    })

    if (existingVendor) {
      return NextResponse.json({ 
        error: 'Vendor with this email already exists' 
      }, { status: 409 })
    }

    // Create vendor
    const vendor = await prisma.vendor.create({
      data: {
        name,
        email,
        phone: phone || null,
        company,
        country,
        address: address || null,
        specialization,
        createdById: payload.userId,
        isActive: true
      }
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'VENDOR_CREATED',
        description: `Created new vendor: ${name}`,
        entityType: 'Vendor',
        entityId: vendor.id,
        userId: payload.userId
      }
    })

    return NextResponse.json(vendor, { status: 201 })
  } catch (error) {
    console.error('Create vendor error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
