import { PrismaClient } from "@prisma/client";

// Exporta uma instância única do PrismaClient para ser usada na aplicação
export const prisma = new PrismaClient();
