'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, User, Mail, Key, Shield } from 'lucide-react'
import anime from 'animejs'

interface CreateSubAdminFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const availablePermissions = [
  { key: 'MANAGE_CUSTOMERS', label: 'Manage Customers', description: 'Add, edit, and view customers' },
  { key: 'MANAGE_VENDORS', label: 'Manage Vendors', description: 'Add, edit, and view vendors' },
  { key: 'MANAGE_ORDERS', label: 'Manage Orders', description: 'Create and manage orders' },
  { key: 'VIEW_ANALYTICS', label: 'View Analytics', description: 'Access analytics and reports' },
  { key: 'MANAGE_PAYMENTS', label: 'Manage Payments', description: 'Handle payment processing' },
  { key: 'VIEW_REPORTS', label: 'View Reports', description: 'Generate and view reports' }
]

const CreateSubAdminForm = ({ isOpen, onClose, onSuccess }: CreateSubAdminFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    permissions: [] as string[]
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<any>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }))
    }
  }

  const togglePermission = (permission: string) => {
    const updatedPermissions = formData.permissions.includes(permission)
      ? formData.permissions.filter(p => p !== permission)
      : [...formData.permissions, permission]
    setFormData(prev => ({ ...prev, permissions: updatedPermissions }))
    
    // Clear permissions error
    if (errors.permissions) {
      setErrors((prev: any) => ({ ...prev, permissions: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: any = {}
    
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'
    if (!formData.password) newErrors.password = 'Password is required'
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm password'
    else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    if (formData.permissions.length === 0) newErrors.permissions = 'At least one permission is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      // Animate error fields
      const errorFields = Object.keys(errors)
      errorFields.forEach(field => {
        const element = document.querySelector(`[name="${field}"]`) || 
                      document.querySelector(`[data-field="${field}"]`)
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
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          permissions: formData.permissions
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create sub-admin')
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
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        permissions: []
      })

      onSuccess()
      onClose()

    } catch (error) {
      console.error('Error creating sub-admin:', error)
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to create sub-admin' })
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
        className="form-container bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Shield className="mr-3 h-6 w-6 text-blue-600" />
            Create Sub-Administrator
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
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline h-4 w-4 mr-1" />
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter full name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="inline h-4 w-4 mr-1" />
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter email address"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Key className="inline h-4 w-4 mr-1" />
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter password"
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Key className="inline h-4 w-4 mr-1" />
                Confirm Password *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Confirm password"
              />
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>

          {/* Permissions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Shield className="inline h-4 w-4 mr-1" />
              Permissions *
            </label>
            <div 
              data-field="permissions"
              className={`space-y-3 p-4 border rounded-lg ${
                errors.permissions ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
              }`}
            >
              {availablePermissions.map(permission => (
                <motion.label 
                  key={permission.key} 
                  className="flex items-start space-x-3 cursor-pointer hover:bg-white p-2 rounded-lg transition-colors"
                  whileHover={{ scale: 1.02 }}
                >
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes(permission.key)}
                    onChange={() => togglePermission(permission.key)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{permission.label}</div>
                    <div className="text-xs text-gray-500">{permission.description}</div>
                  </div>
                </motion.label>
              ))}
            </div>
            {errors.permissions && <p className="text-red-500 text-sm mt-1">{errors.permissions}</p>}
          </div>

          {/* Selected Permissions Summary */}
          {formData.permissions.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Selected Permissions:</h4>
              <div className="flex flex-wrap gap-2">
                {formData.permissions.map(permission => (
                  <span
                    key={permission}
                    className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800"
                  >
                    {availablePermissions.find(p => p.key === permission)?.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-6 border-t border-gray-200">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Sub-Admin...
                </div>
              ) : (
                'Create Sub-Admin'
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

export default CreateSubAdminForm
