// app/admin/dashboard/subscription/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  CreditCard, 
  Calendar, 
  Check, 
  X, 
  Crown, 
  Zap,
  Building2,
  Users,
  BarChart3,
  Shield,
  Clock,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  RefreshCw
} from 'lucide-react'

interface Subscription {
  id: string
  planName: string
  planType: string
  amount: number
  currency: string
  status: string
  startDate: string
  endDate: string
  features: any
  payments: Payment[]
}

interface Payment {
  id: string
  amount: number
  currency: string
  status: string
  paymentMethod: string
  reference: string
  paidAt: string | null
  createdAt: string
}

const SUBSCRIPTION_PLANS = {
  basic: {
    name: 'Basic Plan',
    price: 25000,
    duration: '30 days',
    color: 'bg-blue-500',
    icon: Building2,
    features: [
      'Up to 500 students',
      'Basic reporting',
      'Email support',
      'Core school management',
      'Student profiles',
      'Class management'
    ],
    limits: { students: 500, teachers: 25, classes: 50 }
  },
  pro: {
    name: 'Pro Plan',
    price: 45000,
    duration: '30 days', 
    color: 'bg-purple-500',
    icon: Crown,
    features: [
      'Up to 2000 students',
      'Advanced analytics',
      'Priority support',
      'Custom branding',
      'Attendance tracking',
      'Grade management',
      'Parent portal',
      'Mobile app access'
    ],
    limits: { students: 2000, teachers: 100, classes: 200 }
  },
  enterprise: {
    name: 'Enterprise Plan',
    price: 75000,
    duration: '30 days',
    color: 'bg-gradient-to-r from-yellow-400 to-orange-500',
    icon: Zap,
    features: [
      'Unlimited students',
      'Advanced reports',
      '24/7 support',
      'API access',
      'White labeling',
      'Custom integrations',
      'Dedicated account manager',
      'Priority updates'
    ],
    limits: { students: -1, teachers: -1, classes: -1 }
  }
}

export default function AdminSubscriptionPage() {
  const { data: session } = useSession()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState('')
  const [selectedPlan, setSelectedPlan] = useState<string>('')

  // Fetch current subscription
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await fetch('/api/schools/subscription')
        if (response.ok) {
          const data = await response.json()
          setSubscription(data.subscription)
          setPayments(data.payments || [])
        }
      } catch (error) {
        console.error('Error fetching subscription:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSubscription()
  }, [])

  const handlePlanSelection = async (planType: string, provider: string) => {
    setProcessing(`${planType}-${provider}`)
    
    try {
      // Get school ID from session or API
      const schoolResponse = await fetch('/api/schools/current')
      const schoolData = await schoolResponse.json()
      
      if (!schoolData.school) {
        alert('School information not found')
        return
      }

      const response = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planType,
          paymentProvider: provider,
          schoolId: schoolData.school.id,
          billingInfo: {
            customerName: `${session?.user?.firstName} ${session?.user?.lastName}`,
            customerEmail: session?.user?.email,
            customerPhone: '+2348000000000', // You might want to collect this
          }
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Redirect to payment page
        window.open(data.paymentUrl, '_blank')
      } else {
        const error = await response.json()
        alert(error.error || 'Payment initiation failed')
      }
    } catch (error) {
      console.error('Payment initiation error:', error)
      alert('An error occurred while initiating payment')
    } finally {
      setProcessing('')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'text-green-600 bg-green-100'
      case 'expired':
        return 'text-red-600 bg-red-100'
      case 'cancelled':
        return 'text-gray-600 bg-gray-100'
      case 'trial':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-green-600'
      case 'pending':
        return 'text-yellow-600'
      case 'failed':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount)
  }

  const isExpiringSoon = (endDate: string) => {
    const daysUntilExpiry = Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0
  }

  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading subscription details...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-sm p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Subscription Management</h1>
        <p className="text-blue-100">
          Manage your school's subscription plan and billing
        </p>
      </div>

      {/* Current Subscription Status */}
      {subscription && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Current Subscription
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Plan Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{subscription.planName}</h3>
                  <p className="text-sm text-gray-500 uppercase">{subscription.planType} Plan</p>
                </div>
                <div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription.status)}`}>
                    {subscription.status.toUpperCase()}
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatAmount(subscription.amount)}<span className="text-sm text-gray-500 font-normal">/month</span>
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center text-sm text-gray-600 mb-1">
                    <Calendar className="w-4 h-4 mr-2" />
                    Start Date
                  </div>
                  <div className="text-gray-900 font-medium">
                    {new Date(subscription.startDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
                <div>
                  <div className="flex items-center text-sm text-gray-600 mb-1">
                    <Clock className="w-4 h-4 mr-2" />
                    Expiry Date
                  </div>
                  <div className={`font-medium ${
                    isExpired(subscription.endDate) ? 'text-red-600' : 
                    isExpiringSoon(subscription.endDate) ? 'text-yellow-600' : 
                    'text-gray-900'
                  }`}>
                    {new Date(subscription.endDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                    {isExpiringSoon(subscription.endDate) && (
                      <span className="ml-2 text-xs text-yellow-600">
                        (Expires in {Math.ceil((new Date(subscription.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col justify-center space-y-3">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  <RefreshCw className="w-4 h-4 inline mr-2" />
                  Renew Subscription
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  Upgrade Plan
                </button>
              </div>
            </div>

            {/* Expiry Warning */}
            {isExpiringSoon(subscription.endDate) && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">Subscription Expiring Soon</h4>
                    <p className="text-sm text-yellow-700">
                      Your subscription will expire soon. Renew now to avoid service interruption.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isExpired(subscription.endDate) && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <X className="w-5 h-5 text-red-600 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800">Subscription Expired</h4>
                    <p className="text-sm text-red-700">
                      Your subscription has expired. Please renew to continue using KlassMata services.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Available Plans */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Available Plans</h2>
          <p className="text-sm text-gray-600 mt-1">Choose a plan that fits your school's needs</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => {
              const Icon = plan.icon
              const isCurrentPlan = subscription?.planType === key

              return (
                <div 
                  key={key}
                  className={`relative border-2 rounded-xl p-6 transition-all ${
                    isCurrentPlan 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  {isCurrentPlan && (
                    <div className="absolute -top-3 -right-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-600 text-white">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Current Plan
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${plan.color} mb-4`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <div className="text-3xl font-bold text-gray-900">
                      {formatAmount(plan.price)}
                    </div>
                    <p className="text-sm text-gray-500">{plan.duration}</p>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start text-sm">
                        <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {!isCurrentPlan && (
                    <div className="space-y-2">
                      <button
                        onClick={() => handlePlanSelection(key, 'flutterwave')}
                        disabled={processing === `${key}-flutterwave`}
                        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processing === `${key}-flutterwave` ? (
                          <>
                            <Loader2 className="w-4 h-4 inline animate-spin mr-2" />
                            Processing...
                          </>
                        ) : (
                          <>
                            Pay with Flutterwave
                            <ChevronRight className="w-4 h-4 inline ml-2" />
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handlePlanSelection(key, 'paga')}
                        disabled={processing === `${key}-paga`}
                        className="w-full px-4 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processing === `${key}-paga` ? (
                          <>
                            <Loader2 className="w-4 h-4 inline animate-spin mr-2" />
                            Processing...
                          </>
                        ) : (
                          <>
                            Pay with Paga
                            <ChevronRight className="w-4 h-4 inline ml-2" />
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Payment History */}
      {payments.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(payment.paidAt || payment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                      {payment.reference}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {formatAmount(payment.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                      {payment.paymentMethod}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium capitalize ${getPaymentStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}