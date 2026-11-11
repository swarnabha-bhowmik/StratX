'use client';

import { useState } from 'react';
import { usePaddle } from '@/hooks/usePaddle';
import { Loader2 } from 'lucide-react';

interface PaddleCheckoutButtonProps {
  priceId: string;
  customerEmail?: string;
  className?: string;
  children: React.ReactNode;
}

export function PaddleCheckoutButton({
  priceId,
  customerEmail,
  className,
  children,
}: PaddleCheckoutButtonProps) {
  const { openCheckout, loading } = usePaddle();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleClick = async () => {
    try {
      setIsProcessing(true);
      await openCheckout({ priceId, customerEmail });
    } catch (err) {
      console.error('Checkout trigger error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading || isProcessing}
      className={className}
    >
      {isProcessing ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="size-4 animate-spin" />
          <span>Opening Checkout...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
