import { NextResponse } from 'next/server';
import { resend } from '@/lib/resend';
import { sendEmailRequestSchema } from '@/db';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const validation = sendEmailRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { to, subject, html } = validation.data;

    const data = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to,
      subject,
      html: html || '<p>Hello from your Next.js Boilerplate!</p>',
    });

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
