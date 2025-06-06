'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, FileText, User, Building2, Globe, DollarSign, Calendar, AlertTriangle } from 'lucide-react'
import anime from 'animejs'

interface CreateOrderFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
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
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    customerId: '',
    vendorId: '',
    assignedToId: '',
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev: Record<string, string>) => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.type) newErrors.type = 'Order type is required'
    if (!formData.customerId) newErrors.customerId = 'Customer is required'
    if (!formData.vendorId) newErrors.vendorId = 'Vendor is required'
    if (!formData.country) newErrors.country = 'Country is required'
    if (!formData.priority) newErrors.priority = 'Priority is required'
    if (!formData.amount) newErrors.amount = 'Amount is required'
    else if (isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be a valid positive number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
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
      return
    }

    setIsLoading(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
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

      // Reset form
      setFormData({
        title: '',
        description: '',
        type: '',
        customerId: '',
        vendorId: '',
        assignedToId: '',
        country: '',
        priority: '',
        amount: '',
        dueDate: ''
      })

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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {errors.submit}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="inline h-4 w-4 mr-1" />
                Order Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
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
                value={formData.description}
                onChange={handleChange}
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
                value={formData.type}
                onChange={handleChange}
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

            {/* Customer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline h-4 w-4 mr-1" />
                Customer *
              </label>
              <select
                name="customerId"
                value={formData.customerId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                  errors.customerId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select customer</option>
                {customers.map((customer: Record<string, unknown>) => (
                  <option key={customer.id as string} value={customer.id as string}>
                    {customer.name as string} - {customer.company as string}
                  </option>
                ))}
              </select>
              {errors.customerId && <p className="text-red-500 text-sm mt-1">{errors.customerId}</p>}
            </div>

            {/* Vendor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building2 className="inline h-4 w-4 mr-1" />
                Vendor *
              </label>
              <select
                name="vendorId"
                value={formData.vendorId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                  errors.vendorId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select vendor</option>
                {vendors.map((vendor: Record<string, unknown>) => (
                  <option key={vendor.id as string} value={vendor.id as string}>
                    {vendor.name as string} - {vendor.specialization as string}
                  </option>
                ))}
              </select>
              {errors.vendorId && <p className="text-red-500 text-sm mt-1">{errors.vendorId}</p>}
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Globe className="inline h-4 w-4 mr-1" />
                Country *
              </label>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
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
                <AlertTriangle className="inline h-4 w-4 mr-1" />
                Priority *
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
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
                <DollarSign className="inline h-4 w-4 mr-1" />
                Amount (USD) *
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
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
                <Calendar className="inline h-4 w-4 mr-1" />
                Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-6 border-t border-gray-200">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
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
