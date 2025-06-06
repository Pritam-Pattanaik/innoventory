'use client'

import { useState, useEffect, useRef } from 'react'

import anime from 'animejs'
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  FileText, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface DashboardLayoutProps {
  children: React.ReactNode
  userRole: 'ADMIN' | 'SUB_ADMIN'
  userPermissions: string[]
}

const DashboardLayout = ({ children, userRole, userPermissions }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const pathname = usePathname()
  const sidebarRef = useRef<HTMLDivElement>(null)
  const menuItemsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Animate sidebar on mount
    if (sidebarRef.current) {
      anime({
        targets: sidebarRef.current,
        translateX: [-300, 0],
        opacity: [0, 1],
        duration: 800,
        easing: 'easeOutCubic'
      })
    }

    // Animate menu items with stagger
    setTimeout(() => {
      const menuItems = menuItemsRef.current?.children
      if (menuItems) {
        anime({
          targets: menuItems,
          translateX: [-20, 0],
          opacity: [0, 1],
          duration: 500,
          easing: 'easeOutCubic',
          delay: anime.stagger(100, { start: 200 })
        })
      }
    }, 300)
  }, [])

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      permission: null
    },
    {
      name: 'Customers',
      href: '/dashboard/customers',
      icon: Users,
      permission: 'MANAGE_CUSTOMERS'
    },
    {
      name: 'Vendors',
      href: '/dashboard/vendors',
      icon: Building2,
      permission: 'MANAGE_VENDORS'
    },
    {
      name: 'Orders',
      href: '/dashboard/orders',
      icon: FileText,
      permission: 'MANAGE_ORDERS'
    },
    {
      name: 'Analytics',
      href: '/dashboard/analytics',
      icon: BarChart3,
      permission: 'VIEW_ANALYTICS'
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
      permission: userRole === 'ADMIN' ? null : 'MANAGE_USERS'
    }
  ]

  const filteredMenuItems = menuItems.filter(item => 
    !item.permission || 
    userRole === 'ADMIN' || 
    userPermissions.includes(item.permission)
  )

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform opacity-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <h1 className="text-xl font-bold text-gray-800">Innoventory</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav ref={menuItemsRef} className="mt-6">
          {filteredMenuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors opacity-0 transform hover:scale-105 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-6">
          <button className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-md">
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Role: <span className="font-medium text-gray-900">{userRole}</span>
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default DashboardLayout
