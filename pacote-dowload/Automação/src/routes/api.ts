import { Router, Request, Response } from "express";
import { prisma } from "../prisma";
import { getAvailableSlots } from "../utils/availability";
import { formatLocalDateTime } from "../utils/datetime";

const router = Router();

function timeStringToMinutes(t: string) {
  const [hh, mm] = t.split(":").map(Number);
  return hh * 60 + mm;
}

function getDateISOFromQuery(dateRaw: unknown) {
  if (typeof dateRaw !== "string") return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateRaw.trim())) return null;
  return dateRaw.trim();
}

function getTodayISO() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function buildDailySummary(dateISO: string) {
  const dayStart = new Date(`${dateISO}T00:00:00`);
  const dayEnd = new Date(`${dateISO}T23:59:59.999`);
  const weekday = dayStart.getDay();
  const weekdayPrisma = weekday === 0 ? 7 : weekday;

  const [appointments, workingHours] = await Promise.all([
    prisma.appointment.findMany({
      where: { start: { gte: dayStart, lte: dayEnd } },
      include: { client: true, service: true },
      orderBy: { start: "asc" },
    }),
    prisma.workingHours.findMany({
      where: { weekday: weekdayPrisma },
      orderBy: { start: "asc" },
    }),
  ]);

  const totalWorkingMinutes = workingHours.reduce((acc, wh) => {
    const diff = timeStringToMinutes(wh.end) - timeStringToMinutes(wh.start);
    return acc + Math.max(diff, 0);
  }, 0);

  const bookedMinutes = appointments.reduce((acc, appt) => {
    return acc + Math.max((appt.end.getTime() - appt.start.getTime()) / 60000, 0);
  }, 0);

  const occupancyPercent =
    totalWorkingMinutes > 0
      ? Math.round((bookedMinutes / totalWorkingMinutes) * 1000) / 10
      : 0;

  const appointmentItems = appointments.map((a) => ({
    id: a.id,
    status: a.status,
    start: formatLocalDateTime(a.start),
    end: formatLocalDateTime(a.end),
    clientName: a.client?.name ?? "Sem cliente",
    clientPhone: a.client?.phone ?? "",
    serviceName: a.service?.name ?? "Sem servico",
    serviceDuration: a.service?.duration ?? 0,
  }));

  return {
    date: dateISO,
    totals: {
      appointments: appointmentItems.length,
      workingHoursWindows: workingHours.length,
      totalWorkingMinutes,
      bookedMinutes,
      freeMinutes: Math.max(totalWorkingMinutes - bookedMinutes, 0),
      occupancyPercent,
    },
    appointments: appointmentItems,
  };
}

// Services CRUD (ex.: corte 45min)
router.get("/services", async (req: Request, res: Response) => {
  const services = await prisma.service.findMany();
  res.json(services);
});

router.post("/services", async (req: Request, res: Response) => {
  const { name, duration } = req.body;
  if (!name || !duration || Number(duration) <= 0) {
    return res.status(400).json({ error: "name and duration (>0) required" });
  }

  const svc = await prisma.service.create({ data: { name, duration } });
  res.json(svc);
});

router.put("/services/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { name, duration } = req.body;

  if (!id || !name || !duration || Number(duration) <= 0) {
    return res.status(400).json({ error: "id, name and duration (>0) required" });
  }

  const svc = await prisma.service.update({
    where: { id },
    data: { name, duration: Number(duration) },
  });

  res.json(svc);
});

router.delete("/services/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: "valid id required" });

  try {
    const svc = await prisma.service.delete({ where: { id } });
    res.json({ deleted: true, service: svc });
  } catch (error) {
    res.status(409).json({
      error:
        "Nao foi possivel remover esse servico. Verifique se ele esta vinculado a algum agendamento.",
    });
  }
});

// Working hours CRUD
router.get("/working-hours", async (req: Request, res: Response) => {
  const hours = await prisma.workingHours.findMany({
    orderBy: { weekday: "asc" },
  });
  res.json(hours);
});

router.post("/working-hours", async (req: Request, res: Response) => {
  const { weekday, start, end } = req.body;
  const wh = await prisma.workingHours.create({
    data: { weekday, start, end },
  });
  res.json(wh);
});

router.put("/working-hours/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { start, end } = req.body;
  const wh = await prisma.workingHours.update({
    where: { id },
    data: { start, end },
  });
  res.json(wh);
});

router.delete("/working-hours/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: "valid id required" });

  const wh = await prisma.workingHours.delete({ where: { id } });
  res.json({ deleted: true, workingHour: wh });
});

router.get("/admin/summary", async (req: Request, res: Response) => {
  const dateISO = getDateISOFromQuery(req.query.date) ?? getTodayISO();
  const summary = await buildDailySummary(dateISO);
  res.json(summary);
});

router.get("/admin/stream", async (req: Request, res: Response) => {
  const dateISO = getDateISOFromQuery(req.query.date) ?? getTodayISO();

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  if (typeof res.flushHeaders === "function") {
    res.flushHeaders();
  }

  const sendSummary = async () => {
    const summary = await buildDailySummary(dateISO);
    res.write(`data: ${JSON.stringify(summary)}\n\n`);
  };

  await sendSummary();
  const timer = setInterval(sendSummary, 4000);

  req.on("close", () => {
    clearInterval(timer);
    res.end();
  });
});

// Agenda do dia: retorna todos os agendamentos de uma data com cliente e serviço
router.get("/appointments", async (req: Request, res: Response) => {
  const date = getDateISOFromQuery(req.query.date);
  if (!date) return res.status(400).json({ error: "date required (YYYY-MM-DD)" });

  const dayStart = new Date(`${date}T00:00:00`);
  const dayEnd = new Date(`${date}T23:59:59.999`);

  const appointments = await prisma.appointment.findMany({
    where: { start: { gte: dayStart, lte: dayEnd } },
    include: { client: true, service: true },
    orderBy: { start: "asc" },
  });

  const result = appointments.map((a) => ({
    id: a.id,
    status: a.status,
    start: formatLocalDateTime(a.start),
    end: formatLocalDateTime(a.end),
    client: a.client ? { name: a.client.name, phone: a.client.phone } : null,
    service: a.service ? { name: a.service.name, duration: a.service.duration } : null,
  }));

  res.json({ date, total: result.length, appointments: result });
});

// Disponibilidade: retorna slots disponíveis para uma data e um serviceId
router.get("/availability", async (req: Request, res: Response) => {
  const { date, serviceId } = req.query as any;
  if (!date || !serviceId)
    return res.status(400).json({ error: "date and serviceId required" });

  const svc = await prisma.service.findUnique({
    where: { id: Number(serviceId) },
  });
  if (!svc) return res.status(404).json({ error: "service not found" });

  const slots = await getAvailableSlots(date, svc.duration);
  res.json({ slots });
});

export default router;
