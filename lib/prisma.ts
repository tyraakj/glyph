import { PrismaClient } from "../generated/prisma";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = `${process.env.DATABASE_URL}`;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Check if we should use adapter-pg or accelerate
const useAdapter = !connectionString.startsWith("prisma+postgres://");

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient(useAdapter ? { adapter } : undefined);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
