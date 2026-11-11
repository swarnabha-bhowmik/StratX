import { NextResponse } from 'next/server';
import { paddle } from '@/lib/paddle';
import { checkoutRequestSchema } from '@/db';
import { currentUser } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const validation = checkoutRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { priceId } = validation.data;

    let userEmail: string | undefined;
    let userId: string | undefined;

    try {
      const user = await currentUser();
      if (user) {
        userId = user.id;
        userEmail =
          user.primaryEmailAddress?.emailAddress ||
          user.emailAddresses?.[0]?.emailAddress;
      }
    } catch (authError) {
      console.warn('Unable to retrieve Clerk user for checkout session:', authError);
    }

    const transaction = await paddle.transactions.create({
      items: [
        {
          priceId: priceId,
          quantity: 1,
        },
      ],
      customData: {
        ...(userId ? { userId } : {}),
        ...(userEmail ? { userEmail } : {}),
      },
    });

    return NextResponse.json({
      transactionId: transaction.id,
      url: transaction.checkout?.url,
    });
  } catch (err: any) {
    console.error('Paddle Checkout API Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to initialize Paddle checkout transaction' },
      { status: 500 }
    );
  }
}
