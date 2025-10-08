// app/api/payments/initiate/route.ts
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { nanoid } from 'nanoid'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.schoolId || !session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.json()
    const { studentId, amount, description } = data

    const reference = `PAY-${nanoid(10)}`

    const payment = await prisma.payment.create({
      data: {
        amount: parseFloat(amount),
        currency: 'NGN',
        status: 'pending',
        paymentMethod: 'flutterwave',
        reference,
        description,
        schoolId: session.user.schoolId,
        studentId,
        initiatedBy: session.user.id
      }
    })

    // TODO: Integrate with Flutterwave/Paga
    // const paymentUrl = await initiateFlutterwavePayment(payment)

    return NextResponse.json({ 
      success: true, 
      payment,
      paymentUrl: null // Replace with actual payment URL
    })
  } catch (error) {
    console.error('Error initiating payment:', error)
    return NextResponse.json({ error: 'Failed to initiate payment' }, { status: 500 })
  }
}