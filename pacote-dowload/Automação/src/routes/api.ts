import { Router, Request, Response } from "express";
import { prisma } from "../prisma";
import { getAvailableSlots } from "../utils/availability";

const router = Router();

// Services CRUD (ex.: corte 45min)
router.get("/services", async (req: Request, res: Response) => {
  const services = await prisma.service.findMany();
  res.json(services);
});

router.post("/services", async (req: Request, res: Response) => {
  const { name, duration } = req.body;
  const svc = await prisma.service.create({ data: { name, duration } });
  res.json(svc);
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
