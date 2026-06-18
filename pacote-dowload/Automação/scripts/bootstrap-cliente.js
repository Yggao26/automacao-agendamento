const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const defaultServices = [
  { name: "Corte", duration: 40 },
  { name: "Barba", duration: 30 },
  { name: "Corte e Barba", duration: 70 },
];

const defaultWorkingHours = [
  { weekday: 1, start: "09:00", end: "18:00" },
  { weekday: 2, start: "09:00", end: "18:00" },
  { weekday: 3, start: "09:00", end: "18:00" },
  { weekday: 4, start: "09:00", end: "18:00" },
  { weekday: 5, start: "09:00", end: "18:00" },
  { weekday: 6, start: "09:00", end: "14:00" },
];

async function ensureService(service) {
  const all = await prisma.service.findMany();
  const exists = all.some(
    (s) => s.name.trim().toLowerCase() === service.name.trim().toLowerCase(),
  );

  if (exists) return false;
  await prisma.service.create({ data: service });
  return true;
}

async function ensureWorkingHour(workingHour) {
  const exists = await prisma.workingHours.findFirst({
    where: {
      weekday: workingHour.weekday,
      start: workingHour.start,
      end: workingHour.end,
    },
  });

  if (exists) return false;
  await prisma.workingHours.create({ data: workingHour });
  return true;
}

async function run() {
  console.log("\n=== Setup inicial do cliente ===");

  let createdServices = 0;
  for (const service of defaultServices) {
    if (await ensureService(service)) createdServices += 1;
  }

  let createdWorkingHours = 0;
  for (const workingHour of defaultWorkingHours) {
    if (await ensureWorkingHour(workingHour)) createdWorkingHours += 1;
  }

  const totalServices = await prisma.service.count();
  const totalWorkingHours = await prisma.workingHours.count();

  console.log(`Servicos criados agora: ${createdServices}`);
  console.log(`Faixas de horario criadas agora: ${createdWorkingHours}`);
  console.log(`Total de servicos no banco: ${totalServices}`);
  console.log(`Total de faixas de horario no banco: ${totalWorkingHours}`);
  console.log("Setup concluido.\n");
}

run()
  .catch((error) => {
    console.error("Erro no setup inicial:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
