// app/auth/signup/page.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Check, Building2, User } from 'lucide-react'

export default function SignUpPage() {
  const [step, setStep] = useState<'account' | 'school'>('account')
  const [accountType, setAccountType] = useState<'school_owner' | 'teacher'>('school_owner')
  
  const [formData, setFormData] = useState({
    // Account Info
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'school_owner', // Default to admin/school owner
    
    // School Info (for school owners only)
    schoolName: '',
    schoolAddress: '',
    schoolPhone: '',
    inviteCode: '', // For teachers joining existing school
    
    terms: false,
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleAccountTypeChange = (type: 'school_owner' | 'teacher') => {
    setAccountType(type)
    setFormData(prev => ({
      ...prev,
      role: type
    }))
  }

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation for step 1
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match")
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (!formData.terms) {
      setError('You must accept the terms and conditions')
      return
    }

    // If teacher with invite code, skip school setup
    if (accountType === 'teacher') {
      if (!formData.inviteCode.trim()) {
        setError('Please enter your school invite code')
        return
      }
      handleSubmit(e)
      return
    }

    // School owner continues to school setup
    setStep('school')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Additional validation for school owners
    if (accountType === 'school_owner' && step === 'school') {
      if (!formData.schoolName.trim()) {
        setError('School name is required')
        setIsLoading(false)
        return
      }
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          // School info for school owners
          ...(accountType === 'school_owner' && {
            schoolName: formData.schoolName,
            schoolAddress: formData.schoolAddress,
            schoolPhone: formData.schoolPhone,
          }),
          // Invite code for teachers
          ...(accountType === 'teacher' && {
            inviteCode: formData.inviteCode,
          }),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Registration failed')
        return
      }

      setSuccess(true)
      
      // Redirect based on role
      setTimeout(() => {
        if (accountType === 'school_owner') {
          router.push('/auth/signin?message=School created successfully. Please sign in to access your admin dashboard.')
        } else {
          router.push('/auth/signin?message=Account created successfully. Please sign in to access your teacher dashboard.')
        }
      }, 2000)

    } catch (error) {
      setError('An unexpected error occurred')
      console.error('Registration error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5DC] p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {accountType === 'school_owner' ? 'School Created!' : 'Registration Successful!'}
          </h2>
          <p className="text-gray-600 mb-6">
            {accountType === 'school_owner' 
              ? 'Your school has been set up. Redirecting to login...'
              : 'Your account has been created. Redirecting to login...'}
          </p>
          <Loader2 className="w-6 h-6 animate-spin text-green-600 mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5DC] p-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex border-0">
        {/* Left Section - Green Background */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#1a5f3f] to-[#2d7a52] relative p-12 flex-col justify-center items-center">
          {/* Logo */}
          <div className="relative z-10 text-center">
            <div className="mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="relative w-16 h-16">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle cx="50" cy="50" r="45" fill="#22c55e" opacity="0.3"/>
                    <circle cx="50" cy="50" r="35" fill="#22c55e" opacity="0.5"/>
                    <path
                      d="M 30 60 Q 50 30, 70 40 L 65 45 L 75 50 L 65 55 L 70 60 Q 50 70, 30 60"
                      fill="#fbbf24"
                      stroke="#fbbf24"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              </div>
              
              <h1 className="text-5xl font-bold mb-3">
                <span className="text-[#22c55e]">KLASS</span>
                <span className="text-[#fbbf24]">MATA</span>
              </h1>
            </div>
            
            <p className="text-[#fbbf24] text-lg font-medium">
              Powered by KlassMata
            </p>
          </div>
        </div>

        {/* Right Section - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center max-h-screen overflow-y-auto">
          {/* Mobile Logo */}
          <div className="md:hidden text-center mb-6">
            <h1 className="text-3xl font-bold">
              <span className="text-[#1a5f3f]">KLASS</span>
              <span className="text-[#fbbf24]">MATA</span>
            </h1>
          </div>

          {/* Progress Indicator for School Owners */}
          {accountType === 'school_owner' && (
            <div className="mb-6">
              <div className="flex items-center justify-center space-x-2">
                <div className={`flex items-center ${step === 'account' ? 'text-[#1a5f3f]' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'account' ? 'bg-[#1a5f3f] text-white' : 'bg-gray-200'}`}>
                    1
                  </div>
                  <span className="ml-2 text-sm font-medium">Account</span>
                </div>
                <div className="w-12 h-0.5 bg-gray-300"></div>
                <div className={`flex items-center ${step === 'school' ? 'text-[#1a5f3f]' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'school' ? 'bg-[#1a5f3f] text-white' : 'bg-gray-200'}`}>
                    2
                  </div>
                  <span className="ml-2 text-sm font-medium">School</span>
                </div>
              </div>
            </div>
          )}

          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {step === 'account' ? 'Create Account' : 'School Setup'}
          </h2>
          <p className="text-gray-600 mb-6 text-sm">
            {step === 'account' 
              ? 'Choose your account type to get started' 
              : 'Tell us about your school'}
          </p>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Step 1: Account Creation */}
          {step === 'account' && (
            <form onSubmit={handleNextStep} className="space-y-4">
              {/* Account Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  I am a:
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleAccountTypeChange('school_owner')}
                    className={`p-4 border-2 rounded-xl transition-all ${
                      accountType === 'school_owner'
                        ? 'border-[#1a5f3f] bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Building2 className={`w-8 h-8 mx-auto mb-2 ${
                      accountType === 'school_owner' ? 'text-[#1a5f3f]' : 'text-gray-400'
                    }`} />
                    <p className={`text-sm font-semibold ${
                      accountType === 'school_owner' ? 'text-[#1a5f3f]' : 'text-gray-600'
                    }`}>
                      School Owner
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Create new school
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAccountTypeChange('teacher')}
                    className={`p-4 border-2 rounded-xl transition-all ${
                      accountType === 'teacher'
                        ? 'border-[#1a5f3f] bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <User className={`w-8 h-8 mx-auto mb-2 ${
                      accountType === 'teacher' ? 'text-[#1a5f3f]' : 'text-gray-400'
                    }`} />
                    <p className={`text-sm font-semibold ${
                      accountType === 'teacher' ? 'text-[#1a5f3f]' : 'text-gray-600'
                    }`}>
                      Teacher
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Join existing school
                    </p>
                  </button>
                </div>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First Name"
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a5f3f] focus:border-transparent transition-all text-sm shadow-sm"
                />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last Name"
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a5f3f] focus:border-transparent transition-all text-sm shadow-sm"
                />
              </div>

              {/* Email Input */}
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                required
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a5f3f] focus:border-transparent transition-all text-sm shadow-sm"
              />

              {/* Password Input */}
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password (min. 6 characters)"
                required
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a5f3f] focus:border-transparent transition-all text-sm shadow-sm"
              />

              {/* Confirm Password Input */}
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                required
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a5f3f] focus:border-transparent transition-all text-sm shadow-sm"
              />

              {/* Invite Code for Teachers */}
              {accountType === 'teacher' && (
                <div>
                  <input
                    type="text"
                    name="inviteCode"
                    value={formData.inviteCode}
                    onChange={handleChange}
                    placeholder="School Invite Code"
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a5f3f] focus:border-transparent transition-all text-sm shadow-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the invite code provided by your school administrator
                  </p>
                </div>
              )}

              {/* Terms Checkbox */}
              <div className="flex items-start">
                <input
                  type="checkbox"
                  name="terms"
                  id="terms"
                  checked={formData.terms}
                  onChange={handleChange}
                  required
                  className="mt-1 h-4 w-4 text-[#1a5f3f] focus:ring-[#1a5f3f] border-gray-300 rounded"
                />
                <label htmlFor="terms" className="ml-2 text-xs text-gray-700">
                  I agree to the{' '}
                  <Link href="/terms" className="text-[#1a5f3f] hover:text-[#2d7a52] font-semibold">
                    Terms and Conditions
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-[#1a5f3f] hover:text-[#2d7a52] font-semibold">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              {/* Continue/Sign Up Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-[#c9a961] hover:bg-[#b8973d] text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    {accountType === 'teacher' ? 'Creating account...' : 'Processing...'}
                  </span>
                ) : (
                  accountType === 'teacher' ? 'Create Account' : 'Continue to School Setup'
                )}
              </button>
            </form>
          )}

          {/* Step 2: School Setup (School Owners Only) */}
          {step === 'school' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* School Name */}
              <input
                type="text"
                name="schoolName"
                value={formData.schoolName}
                onChange={handleChange}
                placeholder="School Name *"
                required
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a5f3f] focus:border-transparent transition-all text-sm shadow-sm"
              />

              {/* School Phone */}
              <input
                type="tel"
                name="schoolPhone"
                value={formData.schoolPhone}
                onChange={handleChange}
                placeholder="School Phone Number"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a5f3f] focus:border-transparent transition-all text-sm shadow-sm"
              />

              {/* School Address */}
              <textarea
                name="schoolAddress"
                value={formData.schoolAddress}
                onChange={handleChange}
                placeholder="School Address"
                rows={3}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a5f3f] focus:border-transparent transition-all text-sm shadow-sm resize-none"
              />

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('account')}
                  className="flex-1 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-all duration-200"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-4 bg-[#c9a961] hover:bg-[#b8973d] text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                      Creating school...
                    </span>
                  ) : (
                    'Create School'
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Sign In Link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              href="/auth/signin"
              className="text-[#1a5f3f] hover:text-[#2d7a52] font-semibold transition-colors"
            >
              Sign in here
            </Link>
          </p>

          {/* Info Box */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs font-semibold text-blue-900 mb-1">
              {accountType === 'school_owner' ? 'School Owner Benefits:' : 'Teacher Account:'}
            </p>
            <div className="text-xs text-blue-700 space-y-1">
              {accountType === 'school_owner' ? (
                <>
                  <p>• Full admin dashboard access</p>
                  <p>• Manage teachers, students & classes</p>
                  <p>• 30-day free trial included</p>
                </>
              ) : (
                <>
                  <p>• Access teacher dashboard</p>
                  <p>• Manage classes & attendance</p>
                  <p>• Submit grades & assignments</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}