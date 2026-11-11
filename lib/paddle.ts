import { Environment, LogLevel, Paddle } from '@paddle/paddle-node-sdk';

const isProduction =
  process.env.PADDLE_ENV === 'production' ||
  process.env.NEXT_PUBLIC_PADDLE_ENV === 'production';

export const paddle = new Paddle(process.env.PADDLE_API_KEY || 'dummy_api_key_for_build', {
  environment: isProduction ? Environment.production : Environment.sandbox,
  logLevel: isProduction ? LogLevel.error : LogLevel.verbose,
});
