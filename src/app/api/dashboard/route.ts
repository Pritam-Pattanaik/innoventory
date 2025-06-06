import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
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
    const timeframe = searchParams.get('timeframe') || 'all'

    // Get date range based on timeframe
    const getDateRange = () => {
      const now = new Date()
      switch (timeframe) {
        case 'month':
          return new Date(now.getFullYear(), now.getMonth(), 1)
        case 'quarter':
          const quarter = Math.floor(now.getMonth() / 3)
          return new Date(now.getFullYear(), quarter * 3, 1)
        case 'year':
          return new Date(now.getFullYear(), 0, 1)
        default:
          return new Date(0) // All time
      }
    }

    const startDate = getDateRange()

    if (payload.role === 'ADMIN') {
      // Admin dashboard data
      const [
        totalCustomers,
        totalVendors,
        totalIPsRegistered,
        totalIPsClosed,
        customersByCountry,
        vendorsByCountry,
        workDistribution,
        pendingWork,
        pendingPayments,
        yearlyTrends
      ] = await Promise.all([
        // Total customers
        prisma.customer.count({
          where: {
            createdAt: { gte: startDate },
            isActive: true
          }
        }),

        // Total vendors
        prisma.vendor.count({
          where: {
            createdAt: { gte: startDate },
            isActive: true
          }
        }),

        // Total IPs registered
        prisma.order.count({
          where: {
            createdAt: { gte: startDate },
            status: 'COMPLETED'
          }
        }),

        // Total IPs closed
        prisma.order.count({
          where: {
            createdAt: { gte: startDate },
            status: 'CLOSED'
          }
        }),

        // Customers by country
        prisma.customer.groupBy({
          by: ['country'],
          _count: { id: true },
          where: {
            createdAt: { gte: startDate },
            isActive: true
          },
          orderBy: { _count: { id: 'desc' } },
          take: 10
        }),

        // Vendors by country
        prisma.vendor.groupBy({
          by: ['country'],
          _count: { id: true },
          where: {
            createdAt: { gte: startDate },
            isActive: true
          },
          orderBy: { _count: { id: 'desc' } },
          take: 10
        }),

        // Work distribution by country
        prisma.order.groupBy({
          by: ['country'],
          _count: { id: true },
          where: {
            createdAt: { gte: startDate }
          },
          orderBy: { _count: { id: 'desc' } },
          take: 10
        }),

        // Pending work (top 10 with fewest days remaining)
        prisma.order.findMany({
          where: {
            status: {
              in: ['YET_TO_START', 'IN_PROGRESS', 'PENDING_WITH_CLIENT']
            },
            dueDate: { not: null }
          },
          include: {
            customer: { select: { name: true } }
          },
          orderBy: { dueDate: 'asc' },
          take: 10
        }),

        // Pending payments (top 10 with fewest days remaining)
        prisma.invoice.findMany({
          where: {
            status: 'PENDING',
            dueDate: { not: null as unknown as undefined }
          },
          include: {
            order: {
              include: {
                customer: { select: { name: true } }
              }
            }
          },
          orderBy: { dueDate: 'asc' },
          take: 10
        }),

        // Yearly trends
        prisma.$queryRaw`
          SELECT 
            EXTRACT(YEAR FROM created_at) as year,
            COUNT(CASE WHEN table_name = 'customers' THEN 1 END) as customers,
            COUNT(CASE WHEN table_name = 'vendors' THEN 1 END) as vendors,
            COUNT(CASE WHEN table_name = 'orders' AND status = 'COMPLETED' THEN 1 END) as ips
          FROM (
            SELECT created_at, 'customers' as table_name, null as status FROM customers
            UNION ALL
            SELECT created_at, 'vendors' as table_name, null as status FROM vendors
            UNION ALL
            SELECT created_at, 'orders' as table_name, status FROM orders
          ) combined
          GROUP BY EXTRACT(YEAR FROM created_at)
          ORDER BY year
        `
      ])

      // Transform data for frontend
      const dashboardData = {
        totalCustomers,
        totalVendors,
        totalIPsRegistered,
        totalIPsClosed,
        customersByCountry: customersByCountry.map(item => ({
          country: item.country,
          count: item._count.id,
          coordinates: getCountryCoordinates(item.country)
        })),
        vendorsByCountry: vendorsByCountry.map(item => ({
          country: item.country,
          count: item._count.id,
          coordinates: getCountryCoordinates(item.country)
        })),
        workDistribution: workDistribution.map(item => ({
          country: item.country,
          workCount: item._count.id,
          coordinates: getCountryCoordinates(item.country)
        })),
        pendingWork: pendingWork.map(order => ({
          id: order.id,
          referenceNumber: order.referenceNumber,
          title: order.title,
          daysLeft: order.dueDate ? Math.ceil((order.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0,
          status: order.status,
          priority: order.priority
        })),
        pendingPayments: pendingPayments.map(invoice => ({
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          orderReferenceNumber: invoice.order.referenceNumber,
          imageUrl: invoice.imageUrl,
          daysLeft: Math.ceil((invoice.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
          amount: invoice.amount,
          currency: invoice.currency,
          customerName: invoice.order.customer.name
        })),
        yearlyTrends
      }

      return NextResponse.json(dashboardData)

    } else {
      // Sub-admin dashboard data
      const userId = payload.userId

      const [
        assignedCustomers,
        assignedVendors,
        totalOrders,
        ordersYetToStart,
        ordersPendingWithClient,
        ordersCompleted,
        assignedPendingOrders,
        recentActivities,
        monthlyProgress
      ] = await Promise.all([
        // Assigned customers
        prisma.customer.count({
          where: {
            createdById: userId,
            isActive: true
          }
        }),

        // Assigned vendors
        prisma.vendor.count({
          where: {
            createdById: userId,
            isActive: true
          }
        }),

        // Total orders assigned
        prisma.order.count({
          where: {
            assignedToId: userId
          }
        }),

        // Orders yet to start
        prisma.order.count({
          where: {
            assignedToId: userId,
            status: 'YET_TO_START'
          }
        }),

        // Orders pending with client
        prisma.order.count({
          where: {
            assignedToId: userId,
            status: 'PENDING_WITH_CLIENT'
          }
        }),

        // Completed orders
        prisma.order.count({
          where: {
            assignedToId: userId,
            status: 'COMPLETED'
          }
        }),

        // Assigned pending orders
        prisma.order.findMany({
          where: {
            assignedToId: userId,
            status: {
              in: ['YET_TO_START', 'IN_PROGRESS', 'PENDING_WITH_CLIENT']
            },
            dueDate: { not: null as unknown as undefined }
          },
          orderBy: { dueDate: 'asc' },
          take: 10
        }),

        // Recent activities
        prisma.activityLog.findMany({
          where: {
            userId: userId
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        }),

        // Monthly progress (last 6 months)
        prisma.$queryRaw`
          SELECT 
            TO_CHAR(created_at, 'Mon') as month,
            COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed,
            COUNT(CASE WHEN status IN ('YET_TO_START', 'IN_PROGRESS', 'PENDING_WITH_CLIENT') THEN 1 END) as pending
          FROM orders 
          WHERE assigned_to_id = ${userId}
            AND created_at >= NOW() - INTERVAL '6 months'
          GROUP BY EXTRACT(MONTH FROM created_at), TO_CHAR(created_at, 'Mon')
          ORDER BY EXTRACT(MONTH FROM created_at)
        `
      ])

      const dashboardData = {
        assignedCustomers,
        assignedVendors,
        totalOrders,
        ordersYetToStart,
        ordersPendingWithClient,
        ordersCompleted,
        assignedPendingOrders: assignedPendingOrders.map(order => ({
          id: order.id,
          referenceNumber: order.referenceNumber,
          title: order.title,
          daysLeft: order.dueDate ? Math.ceil((order.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0,
          status: order.status,
          priority: order.priority
        })),
        recentActivities,
        monthlyProgress
      }

      return NextResponse.json(dashboardData)
    }

  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to get country coordinates (simplified)
function getCountryCoordinates(country: string): [number, number] {
  const coordinates: { [key: string]: [number, number] } = {
    'United States': [39.8283, -98.5795],
    'United Kingdom': [55.3781, -3.4360],
    'Germany': [51.1657, 10.4515],
    'Canada': [56.1304, -106.3468],
    'Australia': [-25.2744, 133.7751],
    'India': [20.5937, 78.9629],
    'Japan': [36.2048, 138.2529],
    'France': [46.6034, 1.8883],
    'Italy': [41.8719, 12.5674],
    'Spain': [40.4637, -3.7492]
  }
  
  return coordinates[country] || [0, 0]
}
