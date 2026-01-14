import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createMissingEnvProxy(message: string) {
  const handler: ProxyHandler<any> = {
    get() {
      throw new Error(message)
    },
    apply() {
      throw new Error(message)
    },
  }
  return new Proxy(() => undefined, handler)
}

const missingMsg = 'Environment variable DATABASE_URL is not set. Set DATABASE_URL in your environment or Vercel project settings.'

export const prisma = ((): any => {
  if (!process.env.DATABASE_URL) {
    // Return a proxy that throws a clear error when used instead of initializing Prisma
    return createMissingEnvProxy(missingMsg)
  }

  const client = globalForPrisma.prisma ?? new PrismaClient()
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = client
  return client
})()