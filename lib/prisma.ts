import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export async function testDatabaseConnection() {
  try {
    await prisma.$connect()
    console.log("✅ Database connected successfully")
    return true
  } catch (error) {
    console.error("❌ Database connection failed:", error)
    return false
  }
}

export async function checkDatabaseSchema() {
  try {
    // Try to query the bots table to see if schema is set up
    await prisma.bot.findFirst()
    return { exists: true, error: null }
  } catch (error) {
    console.error("Database schema check failed:", error)
    return {
      exists: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
