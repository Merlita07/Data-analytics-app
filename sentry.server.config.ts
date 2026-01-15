import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [],
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});
