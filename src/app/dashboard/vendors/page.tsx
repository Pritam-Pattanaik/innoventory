'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Building2, Plus, Search, Edit, Trash2, Eye, Star } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PageTransition from '@/components/animations/PageTransition'
import FloatingParticles from '@/components/animations/FloatingParticles'
import AddVendorForm from '@/components/forms/AddVendorForm'

// Vendor interface
interface Vendor {
  id: string
  name: string
  email: string
  phone?: string
  company: string
  country: string
  address?: string
  specialization: string
  rating?: number
  isActive: boolean
  createdAt: string
  _count?: {
    orders: number
  }
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSpecialization, setFilterSpecialization] = useState('')
  const [userRole, setUserRole] = useState<'ADMIN' | 'SUB_ADMIN'>('ADMIN')
  const [showAddForm, setShowAddForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchVendors = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')

      const token = localStorage.getItem('token')
      if (!token) {
        setError('No authentication token found')
        return
      }

      const url = new URL('/api/vendors', window.location.origin)
      if (searchTerm) url.searchParams.set('search', searchTerm)
      if (filterSpecialization) url.searchParams.set('specialization', filterSpecialization)

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setVendors(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to fetch vendors')
      }
    } catch (error) {
      console.error('Error fetching vendors:', error)
      setError('Failed to fetch vendors')
    } finally {
      setIsLoading(false)
    }
  }, [searchTerm, filterSpecialization])

  useEffect(() => {
    // Get user role from localStorage
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('demoRole') as 'ADMIN' | 'SUB_ADMIN'
      if (storedRole) {
        setUserRole(storedRole)
      }
    }

    // Fetch vendors on page load
    fetchVendors()
  }, [fetchVendors])

  // Refetch when search or filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchVendors()
    }, 300) // Debounce search

    return () => clearTimeout(timeoutId)
  }, [searchTerm, filterSpecialization, fetchVendors])

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.company.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpecialization = !filterSpecialization || vendor.specialization === filterSpecialization
    return matchesSearch && matchesSpecialization
  })

  const specializations = [...new Set(vendors.map(v => v.specialization))]

  const userPermissions = userRole === 'ADMIN'
    ? ['MANAGE_USERS', 'MANAGE_CUSTOMERS', 'MANAGE_VENDORS', 'MANAGE_ORDERS', 'VIEW_ANALYTICS', 'MANAGE_PAYMENTS', 'VIEW_REPORTS']
    : ['MANAGE_CUSTOMERS', 'MANAGE_ORDERS', 'VIEW_ANALYTICS']

  const handleAddVendorSuccess = () => {
    // Refresh vendors list
    fetchVendors()
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  return (
    <DashboardLayout userRole={userRole} userPermissions={userPermissions}>
      <PageTransition className="space-y-6 relative">
        <FloatingParticles count={10} color="#10B981" size={2} />
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Building2 className="mr-3 h-8 w-8 text-green-600" />
              Vendor Management
            </h1>
            <p className="text-gray-600 mt-1">Manage your vendor network and partnerships</p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddForm(true)}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add Vendor</span>
          </motion.button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Building2 className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Vendors</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? '...' : vendors.length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Active Vendors</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? '...' : vendors.filter(v => v.isActive).length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Orders Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? '...' : vendors.reduce((sum, v) => sum + (v._count?.orders || 0), 0)}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? '...' : vendors.length > 0
                    ? (vendors.reduce((sum, v) => sum + (v.rating || 0), 0) / vendors.length).toFixed(1)
                    : '0.0'
                  }
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search vendors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="md:w-48">
              <select
                value={filterSpecialization}
                onChange={(e) => setFilterSpecialization(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All Specializations</option>
                {specializations.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Vendors Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 m-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                  <button
                    onClick={fetchVendors}
                    className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              <span className="ml-2 text-gray-600">Loading vendors...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Specialization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Orders
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredVendors.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        {searchTerm || filterSpecialization ? 'No vendors found matching your criteria.' : 'No vendors yet. Add your first vendor!'}
                      </td>
                    </tr>
                  ) : (
                    filteredVendors.map((vendor, index) => (
                      <motion.tr
                        key={vendor.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{vendor.name}</div>
                            <div className="text-sm text-gray-500">{vendor.company}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900">{vendor.email}</div>
                            <div className="text-sm text-gray-500">{vendor.phone || 'N/A'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {vendor.specialization}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex mr-2">
                              {renderStars(vendor.rating || 0)}
                            </div>
                            <span className="text-sm text-gray-900">{vendor.rating?.toFixed(1) || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{vendor._count?.orders || 0}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            vendor.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {vendor.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-900">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Vendor Form */}
        <AddVendorForm
          isOpen={showAddForm}
          onClose={() => setShowAddForm(false)}
          onSuccess={handleAddVendorSuccess}
        />
      </PageTransition>
    </DashboardLayout>
  )
}
