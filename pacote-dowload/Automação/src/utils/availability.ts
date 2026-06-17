import { prisma } from "../prisma";

function timeStringToMinutes(t: string) {
  const [hh, mm] = t.split(":").map(Number);
  return hh * 60 + mm;
}

function minutesToTimeString(m: number) {
  const hh = Math.floor(m / 60)
    .toString()
    .padStart(2, "0");
  const mm = (m % 60).toString().padStart(2, "0");
  return `${hh}:${mm}`;
}

// Retorna slots disponíveis para uma data (YYYY-MM-DD) considerando duration em minutos
export async function getAvailableSlots(dateISO: string, durationMins: number) {
  const date = new Date(dateISO + "T00:00:00");
  const weekday = date.getDay(); // 0 = Sunday ... 6 = Saturday
  // Prisma stores weekday as 1=Segunda ... 7=Domingo per schema comment
  const weekdayPrisma = weekday === 0 ? 7 : weekday;

  const working = await prisma.workingHours.findMany({
    where: { weekday: weekdayPrisma },
  });

  if (!working || working.length === 0) return [];

  // Buscar todos os agendamentos nesse dia
  const dayStart = new Date(date);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const appointments = await prisma.appointment.findMany({
    where: {
      start: { gte: dayStart, lt: dayEnd },
    },
  });

  const slots: string[] = [];

  for (const w of working) {
    const startMin = timeStringToMinutes(w.start);
    const endMin = timeStringToMinutes(w.end);

    for (let t = startMin; t + durationMins <= endMin; t += 15) {
      // passos de 15 minutos
      const slotStart = new Date(date);
      slotStart.setHours(Math.floor(t / 60), t % 60, 0, 0);
      const slotEnd = new Date(slotStart.getTime() + durationMins * 60000);

      // checar colisões
      const collision = appointments.some((a) => {
        return !(a.end <= slotStart || a.start >= slotEnd);
      });

      if (!collision) {
        slots.push(`${slotStart.toISOString().slice(0, 16).replace("T", " ")}`);
      }
    }
  }

  return slots;
}
