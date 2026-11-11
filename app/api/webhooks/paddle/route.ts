import { NextResponse } from 'next/server';
import { paddle } from '@/lib/paddle';
import { db, users } from '@/db';
import { eq } from 'drizzle-orm';
import { EventName } from '@paddle/paddle-node-sdk';

export async function POST(req: Request) {
  const signature = req.headers.get('paddle-signature') || '';
  const body = await req.text();
  const secretKey = process.env.PADDLE_WEBHOOK_SECRET_KEY || '';

  if (!secretKey) {
    console.error('PADDLE_WEBHOOK_SECRET_KEY is missing in environment variables');
    return NextResponse.json(
      { error: 'Webhook secret is not configured' },
      { status: 500 }
    );
  }

  let event: any;
  try {
    event = await paddle.webhooks.unmarshal(body, secretKey, signature);
  } catch (err: any) {
    console.error('Paddle webhook verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  const { eventType, data } = event;
  console.log(`[Paddle Webhook] Received event: ${eventType}`);

  try {
    switch (eventType) {
      case EventName.SubscriptionActivated:
      case EventName.SubscriptionCreated: {
        const subscriptionId = data.id;
        const customerId = data.customerId;
        const status = data.status || 'active';
        const customData = (data.customData as Record<string, any>) || {};
        const userEmail = customData.userEmail;
        const planPriceId = data.items?.[0]?.price?.id || null;

        if (userEmail) {
          await db
            .update(users)
            .set({
              paddleCustomerId: customerId,
              paddleSubscriptionId: subscriptionId,
              subscriptionStatus: status,
              subscriptionPlan: planPriceId,
              updatedAt: new Date(),
            })
            .where(eq(users.email, userEmail));
          console.log(`[Paddle Webhook] Activated subscription for user: ${userEmail}`);
        } else if (customerId) {
          await db
            .update(users)
            .set({
              paddleSubscriptionId: subscriptionId,
              subscriptionStatus: status,
              subscriptionPlan: planPriceId,
              updatedAt: new Date(),
            })
            .where(eq(users.paddleCustomerId, customerId));
        }
        break;
      }

      case EventName.SubscriptionUpdated: {
        const subscriptionId = data.id;
        const status = data.status;
        const planPriceId = data.items?.[0]?.price?.id || null;

        if (subscriptionId) {
          await db
            .update(users)
            .set({
              subscriptionStatus: status,
              subscriptionPlan: planPriceId,
              updatedAt: new Date(),
            })
            .where(eq(users.paddleSubscriptionId, subscriptionId));
          console.log(`[Paddle Webhook] Updated subscription: ${subscriptionId} status: ${status}`);
        }
        break;
      }

      case EventName.SubscriptionCanceled:
      case EventName.SubscriptionPastDue: {
        const subscriptionId = data.id;
        const status = data.status || 'canceled';

        if (subscriptionId) {
          await db
            .update(users)
            .set({
              subscriptionStatus: status,
              updatedAt: new Date(),
            })
            .where(eq(users.paddleSubscriptionId, subscriptionId));
          console.log(`[Paddle Webhook] Subscription ${subscriptionId} set to ${status}`);
        }
        break;
      }

      case EventName.TransactionCompleted: {
        const transactionId = data.id;
        const customerId = data.customerId;
        const customData = (data.customData as Record<string, any>) || {};
        const userEmail = customData.userEmail;

        console.log(`[Paddle Webhook] Transaction completed: ${transactionId} for customer: ${customerId}`);
        if (userEmail && customerId) {
          await db
            .update(users)
            .set({
              paddleCustomerId: customerId,
              updatedAt: new Date(),
            })
            .where(eq(users.email, userEmail));
        }
        break;
      }

      default:
        console.log(`[Paddle Webhook] Unhandled event type: ${eventType}`);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (dbError: any) {
    console.error('[Paddle Webhook] Failed to process database update:', dbError);
    return NextResponse.json(
      { error: 'Failed to process webhook event' },
      { status: 500 }
    );
  }
}
