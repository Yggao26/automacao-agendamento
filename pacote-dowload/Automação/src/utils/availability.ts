import { prisma } from "../prisma";
import { formatLocalDateTime } from "./datetime";

function timeStringToMinutes(t: string) {
  const [hh, mm] = t.split(":").map(Number);
  return hh * 60 + mm;
}

export interface WorkingHourWindow {
  start: string;
  end: string;
}

export interface AppointmentRange {
  start: Date;
  end: Date;
}

export function buildAvailableSlots({
  dateISO,
  durationMins,
  workingHours,
  appointments,
  stepMins = 15,
}: {
  dateISO: string;
  durationMins: number;
  workingHours: WorkingHourWindow[];
  appointments: AppointmentRange[];
  stepMins?: number;
}) {
  const date = new Date(`${dateISO}T00:00:00`);
  const slots: string[] = [];

  for (const workingHour of workingHours) {
    const startMin = timeStringToMinutes(workingHour.start);
    const endMin = timeStringToMinutes(workingHour.end);

    for (let currentMin = startMin; currentMin + durationMins <= endMin; currentMin += stepMins) {
      const slotStart = new Date(date);
      slotStart.setHours(Math.floor(currentMin / 60), currentMin % 60, 0, 0);
      const slotEnd = new Date(slotStart.getTime() + durationMins * 60000);

      const collision = appointments.some((appointment) => {
        return !(appointment.end <= slotStart || appointment.start >= slotEnd);
      });

      if (!collision) {
        slots.push(formatLocalDateTime(slotStart));
      }
    }
  }

  return slots;
}

// Retorna slots disponíveis para uma data (YYYY-MM-DD) considerando duration em minutos
export async function getAvailableSlots(dateISO: string, durationMins: number) {
  const date = new Date(dateISO + "T00:00:00");
  const weekday = date.getDay(); // 0 = Sunday ... 6 = Saturday
  // Prisma stores weekday as 1=Segunda ... 7=Domingo per schema comment
  const weekdayPrisma = weekday === 0 ? 7 : weekday;

  const working = await prisma.workingHours.findMany({
    where: { weekday: weekdayPrisma },
    orderBy: { start: "asc" },
  });

  if (!working || working.length === 0) return [];

  // Buscar todos os agendamentos nesse dia
  const dayStart = new Date(date);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const appointments = await prisma.appointment.findMany({
    where: {
      AND: [{ start: { lt: dayEnd } }, { end: { gt: dayStart } }],
    },
  });

  return buildAvailableSlots({
    dateISO,
    durationMins,
    workingHours: working,
    appointments,
  });
}
