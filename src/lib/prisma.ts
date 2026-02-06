import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pgPool?: Pool;
};

/**
 * Lazy Prisma getter:
 * - Ne inicijalizuje DB konekciju na importu (bitno za next build).
 * - Inicijalizuje tek kad se pozove unutar request handlera.
 */
export function getPrisma(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    // Ne rušimo build importom; ali ako se pozove u runtime-u bez env -> jasno pucanje
    throw new Error(
      "DATABASE_URL nije definisan. Postavi DATABASE_URL u environment varijable (Docker/Render)."
    );
  }

  if (!globalForPrisma.pgPool) {
    globalForPrisma.pgPool = new Pool({ connectionString });
  }

  if (!globalForPrisma.prisma) {
    const adapter = new PrismaPg(globalForPrisma.pgPool);
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }

  return globalForPrisma.prisma;
}
