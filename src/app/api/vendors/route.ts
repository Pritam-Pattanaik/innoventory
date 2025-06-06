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

    const whereClause: Record<string, string | boolean | Record<string, unknown>[]> = {
      isActive: true
    }

    if (search) {
      whereClause.OR = [
        { companyName: { contains: search, mode: 'insensitive' } },
        { individualName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (specialization) {
      whereClause.typeOfWork = {
        has: specialization
      }
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

    // Parse FormData
    const formData = await request.formData()

    // Extract form fields
    const companyType = formData.get('companyType') as string
    const companyName = formData.get('companyName') as string
    const individualName = formData.get('individualName') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const address = formData.get('address') as string
    const country = formData.get('country') as string
    const typeOfWorkStr = formData.get('typeOfWork') as string

    // Parse JSON fields
    let typeOfWork: string[] = []

    try {
      if (typeOfWorkStr) {
        typeOfWork = JSON.parse(typeOfWorkStr)
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      return NextResponse.json({ error: 'Invalid JSON data' }, { status: 400 })
    }

    // Validate required fields
    if (!email || !country) {
      return NextResponse.json({
        error: 'Missing required fields: email, country'
      }, { status: 400 })
    }

    // Validate company type specific fields
    if (companyType === 'Individual' && !individualName) {
      return NextResponse.json({
        error: 'Individual name is required for Individual company type'
      }, { status: 400 })
    }

    if (companyType !== 'Individual' && !companyName) {
      return NextResponse.json({
        error: 'Company name is required for non-Individual company types'
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

    // Create vendor - using current database schema
    const vendorName = companyType === 'Individual' ? individualName : companyName
    const specialization = typeOfWork.length > 0 ? typeOfWork.join(', ') : 'General'

    const vendor = await prisma.vendor.create({
      data: {
        name: vendorName || 'Unknown',
        email,
        phone: phone || null,
        company: companyName || individualName || 'Unknown',
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
        description: `Created new vendor: ${vendorName}`,
        entityType: 'Vendor',
        entityId: vendor.id,
        userId: payload.userId
      }
    })

    return NextResponse.json(vendor, { status: 201 })
  } catch (error) {
    console.error('Create vendor error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
