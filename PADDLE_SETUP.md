# Paddle Billing Setup Guide for StratX

This project is integrated with **Paddle Billing** (Merchant of Record), enabling global subscription billing, automatic VAT/sales tax handling, and payouts directly to Indian bank accounts.

---

## 1. Create a Free Paddle Developer Account
1. **Sandbox (Testing):** [https://sandbox-vendors.paddle.com/](https://sandbox-vendors.paddle.com/)
2. **Production (Live):** [https://vendors.paddle.com/](https://vendors.paddle.com/)

---

## 2. Generate API Keys & Client Token

### In the Paddle Dashboard:
1. Navigate to **Developer Tools > Authentication**:
   - Under **API Keys**, click **Generate API Key** (give read & write permissions).
   - Under **Client-side Tokens**, click **Generate Client-side Token**.
2. Navigate to **Developer Tools > Notifications (Webhooks)**:
   - Click **Add destination**.
   - URL: `https://your-domain.com/api/webhooks/paddle` (or your ngrok / localtunnel URL during local development).
   - Select events to listen to:
     - `subscription.activated`
     - `subscription.created`
     - `subscription.updated`
     - `subscription.canceled`
     - `subscription.past_due`
     - `transaction.completed`
   - Copy the **Webhook Secret Key** (starts with `padd_wsec_`).

---

## 3. Update `.env`

Add your keys to `StratX/.env`:

```env
# Paddle Billing
PADDLE_ENV=sandbox
PADDLE_API_KEY=padd_sec_your_api_key_here
PADDLE_WEBHOOK_SECRET_KEY=padd_wsec_your_webhook_secret_here
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=test_your_client_token_here
NEXT_PUBLIC_PADDLE_ENV=sandbox
```

---

## 4. Create Your Products & Prices in Paddle

1. Go to **Catalog > Products** and click **New product** (e.g. `StratX Pro`).
2. Add a price:
   - Type: **Standard recurring**
   - Billing cycle: Monthly or Annual
   - Price: e.g. `$19 USD`
3. Copy the **Price ID** (looks like `pri_01h...`).

---

## 5. Using Checkout in Your Code

### Option A: Using the React Component (`PaddleCheckoutButton`)
```tsx
import { PaddleCheckoutButton } from "@/components/custom/PaddleCheckoutButton";

export function UpgradeCard() {
  return (
    <PaddleCheckoutButton
      priceId="pri_01h..." // Your Paddle Price ID
      className="bg-blue-600 text-white rounded-xl px-4 py-2"
    >
      Upgrade to Pro
    </PaddleCheckoutButton>
  );
}
```

### Option B: Using the `usePaddle` React Hook
```tsx
"use client";

import { usePaddle } from "@/hooks/usePaddle";

export function CustomButton() {
  const { openCheckout } = usePaddle();

  const handleCheckout = () => {
    openCheckout({
      priceId: "pri_01h...",
    });
  };

  return <button onClick={handleCheckout}>Subscribe</button>;
}
```

### Option C: Server-Side API (`/api/checkout/paddle`)
Send a `POST` request to `/api/checkout/paddle` with:
```json
{
  "priceId": "pri_01h..."
}
```
Returns:
```json
{
  "transactionId": "txn_...",
  "url": "https://sandbox-checkout.paddle.com/..."
}
```

---

## 6. Testing Webhooks Locally

Paddle provides a built-in webhook simulator under **Developer Tools > Webhook simulator** where you can trigger test events directly to your local or deployed endpoint.
