// app/api/payments/webhook/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PaymentStatus, SubscriptionStatus } from '@prisma/client'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const signature = request.headers.get('verif-hash') || request.headers.get('x-paystack-signature')
    
    // Determine payment provider from webhook payload
    const provider = detectPaymentProvider(body, request.headers)
    
    if (provider === 'flutterwave') {
      return await handleFlutterwaveWebhook(body, signature)
    } else if (provider === 'paga') {
      return await handlePagaWebhook(body, signature)
    } else {
      console.error('Unknown payment provider in webhook')
      return NextResponse.json(
        { error: 'Unknown payment provider' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Handle Flutterwave webhook
async function handleFlutterwaveWebhook(body: any, signature: string | null) {
  try {
    // Verify webhook signature (in production)
    if (process.env.NODE_ENV !== 'development') {
      const hash = crypto
        .createHmac('sha256', process.env.FLUTTERWAVE_SECRET_HASH!)
        .update(JSON.stringify(body))
        .digest('hex')
      
      if (signature !== hash) {
        console.error('Invalid Flutterwave webhook signature')
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        )
      }
    }

    const { event, data } = body

    if (event === 'charge.completed' && data.status === 'successful') {
      const txRef = data.tx_ref
      const flwRef = data.flw_ref
      const amount = data.amount
      const currency = data.currency

      // Find the payment record
      const payment = await prisma.payment.findUnique({
        where: { reference: txRef },
        include: {
          school: true,
        }
      })

      if (!payment) {
        console.error(`Payment not found for reference: ${txRef}`)
        return NextResponse.json(
          { error: 'Payment not found' },
          { status: 404 }
        )
      }

      // Verify amount matches
      if (payment.amount !== amount) {
        console.error(`Amount mismatch. Expected: ${payment.amount}, Got: ${amount}`)
        return NextResponse.json(
          { error: 'Amount mismatch' },
          { status: 400 }
        )
      }

      // Update payment status
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.completed,
          transactionId: flwRef,
          paidAt: new Date(),
          metadata: {
            ...(payment.metadata as Record<string, any>),
            webhookData: data,
            completedAt: new Date().toISOString(),
          }
        }
      })

      // Create or update subscription
      await processSubscription(payment)

      console.log(`Flutterwave payment completed: ${txRef}`)
      return NextResponse.json({ status: 'success' })
    }

    return NextResponse.json({ status: 'ignored' })

  } catch (error) {
    console.error('Flutterwave webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Handle Paga webhook
async function handlePagaWebhook(body: any, signature: string | null) {
  try {
    // Verify webhook signature (in production)
    if (process.env.NODE_ENV !== 'development') {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.PAGA_WEBHOOK_SECRET!)
        .update(JSON.stringify(body))
        .digest('hex')
      
      if (signature !== expectedSignature) {
        console.error('Invalid Paga webhook signature')
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        )
      }
    }

    const { eventType, data } = body

    if (eventType === 'SUCCESSFUL_PAYMENT') {
      const reference = data.merchantReference
      const pagaRef = data.transactionId
      const amount = data.amount
      const currency = data.currency

      // Find the payment record
      const payment = await prisma.payment.findUnique({
        where: { reference },
        include: {
          school: true,
        }
      })

      if (!payment) {
        console.error(`Payment not found for reference: ${reference}`)
        return NextResponse.json(
          { error: 'Payment not found' },
          { status: 404 }
        )
      }

      // Verify amount matches
      if (payment.amount !== amount) {
        console.error(`Amount mismatch. Expected: ${payment.amount}, Got: ${amount}`)
        return NextResponse.json(
          { error: 'Amount mismatch' },
          { status: 400 }
        )
      }

      // Update payment status
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.completed,
          transactionId: pagaRef,
          paidAt: new Date(),
          metadata: {
            ...(payment.metadata as Record<string, any>),
            webhookData: data,
            completedAt: new Date().toISOString(),
          }
        }
      })

      // Create or update subscription
      await processSubscription(payment)

      console.log(`Paga payment completed: ${reference}`)
      return NextResponse.json({ status: 'success' })
    }

    return NextResponse.json({ status: 'ignored' })

  } catch (error) {
    console.error('Paga webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Process subscription after successful payment
async function processSubscription(payment: any) {
  const metadata = payment.metadata as any
  const planType = metadata.planType
  const duration = metadata.duration || 30 // days

  // Calculate subscription dates
  const startDate = new Date()
  const endDate = new Date()
  endDate.setDate(startDate.getDate() + duration)

  try {
    // Check if school has existing active subscription
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        schoolId: payment.schoolId,
        status: SubscriptionStatus.active,
        endDate: {
          gte: new Date()
        }
      }
    })

    if (existingSubscription) {
      // Extend existing subscription
      const newEndDate = new Date(existingSubscription.endDate)
      newEndDate.setDate(newEndDate.getDate() + duration)

      await prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          endDate: newEndDate,
          updatedAt: new Date(),
        }
      })

      console.log(`Extended subscription for school ${payment.schoolId} until ${newEndDate}`)
    } else {
      // Create new subscription
      await prisma.subscription.create({
        data: {
          planName: metadata.planName,
          planType: planType,
          amount: payment.amount,
          currency: payment.currency,
          status: SubscriptionStatus.active,
          startDate,
          endDate,
          features: metadata.features || {},
          schoolId: payment.schoolId,
          payments: {
            connect: { id: payment.id }
          }
        }
      })

      console.log(`Created new subscription for school ${payment.schoolId}`)
    }

    // Update payment with subscription reference
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        metadata: {
          ...payment.metadata,
          subscriptionProcessed: true,
          subscriptionStartDate: startDate.toISOString(),
          subscriptionEndDate: endDate.toISOString(),
        }
      }
    })

  } catch (error) {
    console.error('Subscription processing error:', error)
    throw error
  }
}

// Detect payment provider from webhook payload
function detectPaymentProvider(body: any, headers: Headers): string {
  // Flutterwave detection
  if (body.event && (body.event.includes('charge') || body.event.includes('transfer'))) {
    return 'flutterwave'
  }
  
  // Paga detection  
  if (body.eventType && body.data?.merchantReference) {
    return 'paga'
  }

  // Check headers for provider-specific signatures
  if (headers.get('verif-hash')) {
    return 'flutterwave'
  }
  
  if (headers.get('x-paga-signature')) {
    return 'paga'
  }

  return 'unknown'
}

// Handle webhook for failed payments
export async function handleFailedPayment(paymentRef: string, reason: string) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { reference: paymentRef }
    })

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.failed,
          metadata: {
            ...(payment.metadata as Record<string, any>),
            failureReason: reason,
            failedAt: new Date().toISOString(),
          }
        }
      })

      console.log(`Payment failed: ${paymentRef} - ${reason}`)
    }
  } catch (error) {
    console.error('Failed payment handling error:', error)
  }
}

// GET method for webhook verification (some providers require this)
export async function GET(request: NextRequest) {
  const challenge = request.nextUrl.searchParams.get('hub.challenge')
  const mode = request.nextUrl.searchParams.get('hub.mode')
  const token = request.nextUrl.searchParams.get('hub.verify_token')

  if (mode === 'subscribe' && token === process.env.WEBHOOK_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 })
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })}