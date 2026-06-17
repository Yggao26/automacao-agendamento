import { Router, Request, Response } from "express";
import { prisma } from "../prisma";
import axios from "axios";
import { getAvailableSlots } from "../utils/availability";
import { formatLocalDateTime, parseLocalDateTime } from "../utils/datetime";

const router = Router();
const DEFAULT_SERVICE_DURATION = 40;

function normalizeText(text: string) {
  return text.trim().toLowerCase();
}

async function getDefaultService() {
  let service = await prisma.service.findFirst();
  if (!service) {
    service = await prisma.service.create({
      data: {
        name: "Corte",
        duration: DEFAULT_SERVICE_DURATION,
      },
    });
  }
  return service;
}

function parseConversationData(data: string | null | undefined) {
  if (!data) return {};
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error("Erro parsing conversation data:", error);
    return {};
  }
}

async function getConversation(phone: string) {
  return prisma.conversation.findUnique({ where: { phone } });
}

async function updateConversation(
  phone: string,
  state: string,
  data: object | null,
) {
  const serializedData = data ? JSON.stringify(data) : null;
  return prisma.conversation.upsert({
    where: { phone },
    update: { state, data: serializedData },
    create: { phone, state, data: serializedData },
  });
}

async function clearConversation(phone: string) {
  await prisma.conversation.deleteMany({ where: { phone } });
}

async function sendWhatsAppMessage(to: string, message: string) {
  const token = process.env.META_ACCESS_TOKEN;
  const phoneId = process.env.META_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    console.log("(dev) Simulando envio para", to, message);
    return;
  }

  try {
    await axios.post(
      `https://graph.facebook.com/v17.0/${phoneId}/messages`,
      {
        messaging_product: "whatsapp",
        to,
        text: { body: message },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("Erro enviando mensagem Meta:", error);
  }
}

router.get("/", (req: Request, res: Response) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || "my_verify_token";

  if (mode && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const entries = body.entry || [];

    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        const messages = change.value?.messages || [];
        for (const msg of messages) {
          const from = msg.from;
          const type = msg.type;
          const text = type === "text" ? msg.text?.body || "" : "";
          const normalized = normalizeText(text);

          console.log("Mensagem recebida de", from, text);

          const conversation = await getConversation(from);
          const parsedData = parseConversationData(conversation?.data);

          if (/^(oi|olá|bom dia|boa tarde|agendar)/i.test(text)) {
            const service = await getDefaultService();
            await updateConversation(from, "AWAITING_NAME", {});
            await sendWhatsAppMessage(
              from,
              `Olá! Vamos agendar seu atendimento. Qual o seu nome?\n\nServiço padrão: ${service.name} (${service.duration} minutos).`,
            );
            continue;
          }

          if (!conversation) {
            await sendWhatsAppMessage(
              from,
              'Para começar o agendamento, digite "Agendar" ou "Oi".',
            );
            continue;
          }

          const state = conversation.state;
          const data = parsedData || {};

          if (state === "AWAITING_NAME") {
            const name = text.trim() || "Cliente";
            const client = await prisma.client.upsert({
              where: { phone: from },
              update: { name },
              create: { name, phone: from },
            });

            const services = await prisma.service.findMany();
            if (services.length <= 1) {
              const service = services[0] || (await getDefaultService());
              await updateConversation(from, "AWAITING_DATE", {
                clientId: client.id,
                serviceId: service.id,
                serviceName: service.name,
              });
              await sendWhatsAppMessage(
                from,
                `Obrigado ${client.name}! Por favor, envie a data desejada no formato YYYY-MM-DD. Exemplo: 2026-06-20`,
              );
            } else {
              await updateConversation(from, "AWAITING_SERVICE", {
                clientId: client.id,
              });
              const serviceList = services
                .map((svc) => `${svc.id}. ${svc.name} (${svc.duration} min)`)
                .join("\n");
              await sendWhatsAppMessage(
                from,
                `Obrigado ${client.name}! Escolha o serviço pelo número abaixo:\n${serviceList}`,
              );
            }
            continue;
          }

          if (state === "AWAITING_SERVICE") {
            const serviceId = Number(normalized);
            const service = isNaN(serviceId)
              ? (await prisma.service.findMany()).find(
                  (currentService) =>
                    normalizeText(currentService.name) === normalizeText(text),
                )
              : await prisma.service.findUnique({ where: { id: serviceId } });

            if (!service) {
              await sendWhatsAppMessage(
                from,
                "Serviço não encontrado. Responda com o número do serviço desejado.",
              );
              continue;
            }

            await updateConversation(from, "AWAITING_DATE", {
              ...data,
              serviceId: service.id,
              serviceName: service.name,
            });
            await sendWhatsAppMessage(
              from,
              `Ótimo! Agora envie a data desejada no formato YYYY-MM-DD para o serviço ${service.name}.`,
            );
            continue;
          }

          if (state === "AWAITING_DATE") {
            const datePattern = /^\d{4}-\d{2}-\d{2}$/;
            if (!datePattern.test(text.trim())) {
              await sendWhatsAppMessage(
                from,
                "Data inválida. Envie no formato YYYY-MM-DD, por exemplo 2026-06-20.",
              );
              continue;
            }

            const serviceId = data.serviceId || (await getDefaultService()).id;
            const service = await prisma.service.findUnique({
              where: { id: serviceId },
            });
            if (!service) {
              await sendWhatsAppMessage(
                from,
                "Serviço não encontrado. Reinicie a conversa com Agendar.",
              );
              continue;
            }

            const slots = await getAvailableSlots(
              text.trim(),
              service.duration,
            );
            if (slots.length === 0) {
              await sendWhatsAppMessage(
                from,
                `Não há horários disponíveis em ${text.trim()}. Tente outra data ou atualize o calendário do barbeiro.`,
              );
              continue;
            }

            await updateConversation(from, "AWAITING_TIME", {
              ...data,
              date: text.trim(),
            });
            const sample = slots.slice(0, 5).join("\n");
            await sendWhatsAppMessage(
              from,
              `Escolha um horário para ${text.trim()}:\n${sample}\n\nResponda com o horário exato no formato YYYY-MM-DD HH:MM.`,
            );
            continue;
          }

          if (state === "AWAITING_TIME") {
            const dateTimePattern = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;
            if (!dateTimePattern.test(text.trim())) {
              await sendWhatsAppMessage(
                from,
                "Formato inválido. Envie o horário como YYYY-MM-DD HH:MM.",
              );
              continue;
            }

            const { clientId, serviceId, date } = data;
            const service = await prisma.service.findUnique({
              where: { id: serviceId },
            });
            if (!service) {
              await sendWhatsAppMessage(
                from,
                "Serviço não encontrado. Reinicie a conversa com Agendar.",
              );
              continue;
            }

            const start = parseLocalDateTime(text.trim());
            if (!start) {
              await sendWhatsAppMessage(
                from,
                "Formato inválido. Envie o horário como YYYY-MM-DD HH:MM.",
              );
              continue;
            }

            const end = new Date(start.getTime() + service.duration * 60000);
            const slots = await getAvailableSlots(date, service.duration);
            const wanted = formatLocalDateTime(start);

            if (!slots.includes(wanted)) {
              await sendWhatsAppMessage(
                from,
                "Infelizmente esse horário não está mais disponível. Por favor escolha outro horário.",
              );
              continue;
            }

            try {
              await prisma.$transaction(async (pr) => {
                const conflict = await pr.appointment.findFirst({
                  where: {
                    AND: [{ start: { lt: end } }, { end: { gt: start } }],
                  },
                });
                if (conflict) throw new Error("conflict");

                await pr.appointment.create({
                  data: {
                    clientId,
                    serviceId: service.id,
                    start,
                    end,
                    status: "scheduled",
                  },
                });
              });
              await sendWhatsAppMessage(
                from,
                `Agendamento confirmado para ${formatLocalDateTime(start)}. Obrigado!`,
              );
              await clearConversation(from);
            } catch (error) {
              console.error("Erro ao criar agendamento:", error);
              await sendWhatsAppMessage(
                from,
                "Houve um problema ao confirmar seu horário. Por favor tente novamente.",
              );
            }
            continue;
          }

          await sendWhatsAppMessage(
            from,
            'Não entendi. Digite "Agendar" para iniciar um novo atendimento.',
          );
        }
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Erro no webhook:", err);
    res.sendStatus(500);
  }
});

export default router;
