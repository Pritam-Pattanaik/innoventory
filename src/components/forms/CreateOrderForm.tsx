'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, FileText, User, Building2, Globe, DollarSign, Calendar, AlertTriangle, CheckCircle, Circle } from 'lucide-react'
import anime from 'animejs'

interface CreateOrderFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

type FormSection = 'customer' | 'vendor' | 'order'

interface CustomerFormData {
  customerId: string
  customerName: string
  customerEmail: string
  customerCompany: string
  customerPhone: string
  customerAddress: string
}

interface VendorFormData {
  vendorId: string
  vendorName: string
  vendorEmail: string
  vendorCompany: string
  vendorSpecialization: string
  vendorPhone: string
}

interface OrderFormData {
  title: string
  description: string
  type: string
  country: string
  priority: string
  amount: string
  dueDate: string
}

const orderTypes = [
  { value: 'PATENT', label: 'Patent' },
  { value: 'TRADEMARK', label: 'Trademark' },
  { value: 'COPYRIGHT', label: 'Copyright' },
  { value: 'DESIGN', label: 'Design' }
]

const priorities = [
  { value: 'LOW', label: 'Low', color: 'text-green-600' },
  { value: 'MEDIUM', label: 'Medium', color: 'text-yellow-600' },
  { value: 'HIGH', label: 'High', color: 'text-orange-600' },
  { value: 'URGENT', label: 'Urgent', color: 'text-red-600' }
]

const countries = [
  'United States', 'United Kingdom', 'Germany', 'Canada', 'Australia',
  'France', 'Italy', 'Spain', 'Netherlands', 'Japan', 'India', 'Brazil'
]

const CreateOrderForm = ({ isOpen, onClose, onSuccess }: CreateOrderFormProps) => {
  const [activeSection, setActiveSection] = useState<FormSection>('customer')
  const [completedSections, setCompletedSections] = useState<Set<FormSection>>(new Set())

  const [customerData, setCustomerData] = useState<CustomerFormData>({
    customerId: '',
    customerName: '',
    customerEmail: '',
    customerCompany: '',
    customerPhone: '',
    customerAddress: ''
  })

  const [vendorData, setVendorData] = useState<VendorFormData>({
    vendorId: '',
    vendorName: '',
    vendorEmail: '',
    vendorCompany: '',
    vendorSpecialization: '',
    vendorPhone: ''
  })

  const [orderData, setOrderData] = useState<OrderFormData>({
    title: '',
    description: '',
    type: '',
    country: '',
    priority: '',
    amount: '',
    dueDate: ''
  })

  const [customers, setCustomers] = useState([])
  const [vendors, setVendors] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen) {
      fetchData()
    }
  }, [isOpen])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers = {
        'Authorization': `Bearer ${token}`
      }

      // Fetch customers, vendors, and users in parallel
      const [customersRes, vendorsRes] = await Promise.all([
        fetch('/api/customers', { headers }),
        fetch('/api/vendors', { headers })
      ])

      if (customersRes.ok) {
        const customersData = await customersRes.json()
        setCustomers(customersData)
      }

      if (vendorsRes.ok) {
        const vendorsData = await vendorsRes.json()
        setVendors(vendorsData)
      }

    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setCustomerData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleVendorChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setVendorData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleOrderChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setOrderData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleCustomerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const customerId = e.target.value
    const selectedCustomer = customers.find((c: any) => c.id === customerId)

    if (selectedCustomer) {
      setCustomerData({
        customerId,
        customerName: selectedCustomer.name || '',
        customerEmail: selectedCustomer.email || '',
        customerCompany: selectedCustomer.company || '',
        customerPhone: selectedCustomer.phone || '',
        customerAddress: selectedCustomer.address || ''
      })
    } else {
      setCustomerData({
        customerId: '',
        customerName: '',
        customerEmail: '',
        customerCompany: '',
        customerPhone: '',
        customerAddress: ''
      })
    }
  }

  const handleVendorSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const vendorId = e.target.value
    const selectedVendor = vendors.find((v: any) => v.id === vendorId)

    if (selectedVendor) {
      setVendorData({
        vendorId,
        vendorName: selectedVendor.name || '',
        vendorEmail: selectedVendor.email || '',
        vendorCompany: selectedVendor.company || '',
        vendorSpecialization: selectedVendor.specialization || '',
        vendorPhone: selectedVendor.phone || ''
      })
    } else {
      setVendorData({
        vendorId: '',
        vendorName: '',
        vendorEmail: '',
        vendorCompany: '',
        vendorSpecialization: '',
        vendorPhone: ''
      })
    }
  }

  const validateCustomerForm = () => {
    const newErrors: Record<string, string> = {}

    if (!customerData.customerId) newErrors.customerId = 'Customer selection is required'
    if (!customerData.customerName.trim()) newErrors.customerName = 'Customer name is required'
    if (!customerData.customerEmail.trim()) newErrors.customerEmail = 'Customer email is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateVendorForm = () => {
    const newErrors: Record<string, string> = {}

    if (!vendorData.vendorId) newErrors.vendorId = 'Vendor selection is required'
    if (!vendorData.vendorName.trim()) newErrors.vendorName = 'Vendor name is required'
    if (!vendorData.vendorEmail.trim()) newErrors.vendorEmail = 'Vendor email is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateOrderForm = () => {
    const newErrors: Record<string, string> = {}

    if (!orderData.title.trim()) newErrors.title = 'Title is required'
    if (!orderData.type) newErrors.type = 'Order type is required'
    if (!orderData.country) newErrors.country = 'Country is required'
    if (!orderData.priority) newErrors.priority = 'Priority is required'
    if (!orderData.amount) newErrors.amount = 'Amount is required'
    else if (isNaN(parseFloat(orderData.amount)) || parseFloat(orderData.amount) <= 0) {
      newErrors.amount = 'Amount must be a valid positive number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSectionComplete = (section: FormSection) => {
    let isValid = false

    switch (section) {
      case 'customer':
        isValid = validateCustomerForm()
        break
      case 'vendor':
        isValid = validateVendorForm()
        break
      case 'order':
        isValid = validateOrderForm()
        break
    }

    if (isValid) {
      setCompletedSections(prev => new Set([...prev, section]))
      // Move to next section
      if (section === 'customer') setActiveSection('vendor')
      else if (section === 'vendor') setActiveSection('order')
    } else {
      // Animate error fields
      const errorFields = Object.keys(errors)
      errorFields.forEach(field => {
        const element = document.querySelector(`[name="${field}"]`)
        if (element) {
          anime({
            targets: element,
            translateX: [-10, 10, -10, 10, 0],
            duration: 400,
            easing: 'easeInOutSine'
          })
        }
      })
    }
  }

  const isCreateOrderEnabled = () => {
    return completedSections.has('customer') &&
           completedSections.has('vendor') &&
           completedSections.has('order')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isCreateOrderEnabled()) {
      return
    }

    setIsLoading(true)

    try {
      const token = localStorage.getItem('token')

      // Combine all form data
      const combinedFormData = {
        title: orderData.title,
        description: orderData.description,
        type: orderData.type,
        customerId: customerData.customerId,
        vendorId: vendorData.vendorId,
        country: orderData.country,
        priority: orderData.priority,
        amount: orderData.amount,
        dueDate: orderData.dueDate
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(combinedFormData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order')
      }

      // Success animation
      anime({
        targets: '.form-container',
        scale: [1, 1.05, 1],
        duration: 600,
        easing: 'easeInOutSine'
      })

      // Reset all forms
      setCustomerData({
        customerId: '',
        customerName: '',
        customerEmail: '',
        customerCompany: '',
        customerPhone: '',
        customerAddress: ''
      })

      setVendorData({
        vendorId: '',
        vendorName: '',
        vendorEmail: '',
        vendorCompany: '',
        vendorSpecialization: '',
        vendorPhone: ''
      })

      setOrderData({
        title: '',
        description: '',
        type: '',
        country: '',
        priority: '',
        amount: '',
        dueDate: ''
      })

      setCompletedSections(new Set())
      setActiveSection('customer')

      onSuccess()
      onClose()

    } catch (error) {
      console.error('Error creating order:', error)
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to create order' })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="form-container bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <FileText className="mr-3 h-6 w-6 text-purple-600" />
            Create New Order
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Section Navigation */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex space-x-4">
            {/* Customer Part Button */}
            <button
              type="button"
              onClick={() => setActiveSection('customer')}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeSection === 'customer'
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                  : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
              }`}
            >
              {completedSections.has('customer') ? (
                <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              ) : (
                <Circle className="w-5 h-5 mr-2" />
              )}
              Customer Part
            </button>

            {/* Vendor Part Button */}
            <button
              type="button"
              onClick={() => setActiveSection('vendor')}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeSection === 'vendor'
                  ? 'bg-green-100 text-green-700 border-2 border-green-300'
                  : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
              }`}
            >
              {completedSections.has('vendor') ? (
                <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              ) : (
                <Circle className="w-5 h-5 mr-2" />
              )}
              Vendor Part
            </button>

            {/* Order Part Button */}
            <button
              type="button"
              onClick={() => setActiveSection('order')}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeSection === 'order'
                  ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                  : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
              }`}
            >
              {completedSections.has('order') ? (
                <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              ) : (
                <Circle className="w-5 h-5 mr-2" />
              )}
              Order Part
            </button>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {errors.submit}
            </div>
          )}

          {/* Customer Form Section */}
          {activeSection === 'customer' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-blue-700 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Customer Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Selection */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Customer *
                  </label>
                  <select
                    name="customerId"
                    value={customerData.customerId}
                    onChange={handleCustomerSelect}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.customerId ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select customer</option>
                    {customers.map((customer: any) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} - {customer.company}
                      </option>
                    ))}
                  </select>
                  {errors.customerId && <p className="text-red-500 text-sm mt-1">{errors.customerId}</p>}
                </div>

                {/* Customer Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={customerData.customerName}
                    onChange={handleCustomerChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.customerName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Customer name"
                    readOnly
                  />
                  {errors.customerName && <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>}
                </div>

                {/* Customer Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Email *
                  </label>
                  <input
                    type="email"
                    name="customerEmail"
                    value={customerData.customerEmail}
                    onChange={handleCustomerChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.customerEmail ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Customer email"
                    readOnly
                  />
                  {errors.customerEmail && <p className="text-red-500 text-sm mt-1">{errors.customerEmail}</p>}
                </div>

                {/* Customer Company */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    name="customerCompany"
                    value={customerData.customerCompany}
                    onChange={handleCustomerChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Company name"
                    readOnly
                  />
                </div>

                {/* Customer Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="customerPhone"
                    value={customerData.customerPhone}
                    onChange={handleCustomerChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Phone number"
                    readOnly
                  />
                </div>

                {/* Customer Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    name="customerAddress"
                    value={customerData.customerAddress}
                    onChange={handleCustomerChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Customer address"
                    readOnly
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => handleSectionComplete('customer')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Complete Customer Part
                </button>
              </div>
            </motion.div>
          )}

          {/* Vendor Form Section */}
          {activeSection === 'vendor' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-green-700 flex items-center">
                <Building2 className="w-5 h-5 mr-2" />
                Vendor Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Vendor Selection */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Vendor *
                  </label>
                  <select
                    name="vendorId"
                    value={vendorData.vendorId}
                    onChange={handleVendorSelect}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                      errors.vendorId ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select vendor</option>
                    {vendors.map((vendor: any) => (
                      <option key={vendor.id} value={vendor.id}>
                        {vendor.name} - {vendor.specialization}
                      </option>
                    ))}
                  </select>
                  {errors.vendorId && <p className="text-red-500 text-sm mt-1">{errors.vendorId}</p>}
                </div>

                {/* Vendor Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vendor Name *
                  </label>
                  <input
                    type="text"
                    name="vendorName"
                    value={vendorData.vendorName}
                    onChange={handleVendorChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                      errors.vendorName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Vendor name"
                    readOnly
                  />
                  {errors.vendorName && <p className="text-red-500 text-sm mt-1">{errors.vendorName}</p>}
                </div>

                {/* Vendor Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vendor Email *
                  </label>
                  <input
                    type="email"
                    name="vendorEmail"
                    value={vendorData.vendorEmail}
                    onChange={handleVendorChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                      errors.vendorEmail ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Vendor email"
                    readOnly
                  />
                  {errors.vendorEmail && <p className="text-red-500 text-sm mt-1">{errors.vendorEmail}</p>}
                </div>

                {/* Vendor Company */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    name="vendorCompany"
                    value={vendorData.vendorCompany}
                    onChange={handleVendorChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    placeholder="Company name"
                    readOnly
                  />
                </div>

                {/* Vendor Specialization */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specialization
                  </label>
                  <input
                    type="text"
                    name="vendorSpecialization"
                    value={vendorData.vendorSpecialization}
                    onChange={handleVendorChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    placeholder="Specialization"
                    readOnly
                  />
                </div>

                {/* Vendor Phone */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="vendorPhone"
                    value={vendorData.vendorPhone}
                    onChange={handleVendorChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    placeholder="Phone number"
                    readOnly
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => handleSectionComplete('vendor')}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Complete Vendor Part
                </button>
              </div>
            </motion.div>
          )}

          {/* Order Form Section */}
          {activeSection === 'order' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-purple-700 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Order Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Order Title */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={orderData.title}
                    onChange={handleOrderChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                      errors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter order title"
                  />
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={orderData.description}
                    onChange={handleOrderChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    placeholder="Enter order description"
                  />
                </div>

                {/* Order Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Type *
                  </label>
                  <select
                    name="type"
                    value={orderData.type}
                    onChange={handleOrderChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                      errors.type ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select order type</option>
                    {orderTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                  {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country *
                  </label>
                  <select
                    name="country"
                    value={orderData.country}
                    onChange={handleOrderChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                      errors.country ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select country</option>
                    {countries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                  {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority *
                  </label>
                  <select
                    name="priority"
                    value={orderData.priority}
                    onChange={handleOrderChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                      errors.priority ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select priority</option>
                    {priorities.map(priority => (
                      <option key={priority.value} value={priority.value} className={priority.color}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                  {errors.priority && <p className="text-red-500 text-sm mt-1">{errors.priority}</p>}
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (USD) *
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={orderData.amount}
                    onChange={handleOrderChange}
                    min="0"
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                      errors.amount ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter amount"
                  />
                  {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={orderData.dueDate}
                    onChange={handleOrderChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => handleSectionComplete('order')}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  Complete Order Part
                </button>
              </div>
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-6 border-t border-gray-200">
            <motion.button
              whileHover={{ scale: isCreateOrderEnabled() ? 1.02 : 1 }}
              whileTap={{ scale: isCreateOrderEnabled() ? 0.98 : 1 }}
              type="submit"
              disabled={isLoading || !isCreateOrderEnabled()}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                isCreateOrderEnabled()
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Order...
                </div>
              ) : (
                'Create Order'
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium"
            >
              Cancel
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default CreateOrderForm
