'use client';

import { useEffect, useState } from 'react';
import { initializePaddle, Paddle } from '@paddle/paddle-js';

export function usePaddle() {
  const [paddle, setPaddle] = useState<Paddle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
    const env =
      (process.env.NEXT_PUBLIC_PADDLE_ENV as 'sandbox' | 'production') ||
      'sandbox';

    if (!token) {
      console.warn('NEXT_PUBLIC_PADDLE_CLIENT_TOKEN is not set');
      setLoading(false);
      return;
    }

    initializePaddle({
      environment: env,
      token,
      checkout: {
        settings: {
          displayMode: 'overlay',
          theme: 'light',
          successUrl:
            typeof window !== 'undefined'
              ? `${window.location.origin}/dashboard?checkout_success=true`
              : undefined,
        },
      },
    })
      .then((instance) => {
        if (instance) {
          setPaddle(instance);
        }
      })
      .catch((err) => {
        console.error('Paddle initialization failed:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const openCheckout = async ({
    priceId,
    customerEmail,
  }: {
    priceId: string;
    customerEmail?: string;
  }) => {
    if (!paddle) {
      // Fallback: If Paddle.js client isn't loaded yet, request transaction via backend API
      try {
        const res = await fetch('/api/checkout/paddle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ priceId }),
        });
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        } else {
          throw new Error(data.error || 'Unable to open checkout');
        }
      } catch (err: any) {
        console.error('Fallback checkout redirect error:', err);
        throw err;
      }
      return;
    }

    paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      customer: customerEmail ? { email: customerEmail } : undefined,
    });
  };

  return { paddle, loading, openCheckout };
}
