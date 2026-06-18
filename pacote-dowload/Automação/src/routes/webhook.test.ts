import { beforeEach, describe, expect, it, vi } from "vitest";

// Stub do Prisma e do axios antes de importar o webhook
vi.mock("../prisma", () => {
  const store: Record<string, any> = {};
  const conversations: Record<string, any> = {};
  const appointments: any[] = [];

  return {
    prisma: {
      service: {
        findFirst: async () =>
          store.service ?? null,
        findMany: async () =>
          store.service ? [store.service] : [],
        create: async (args: any) => {
          store.service = { id: 1, ...args.data };
          return store.service;
        },
        findUnique: async () => store.service ?? null,
      },
      client: {
        upsert: async (args: any) => {
          store.client = { id: 1, ...args.create };
          return store.client;
        },
      },
      conversation: {
        findUnique: async (args: any) =>
          conversations[args.where.phone] ?? null,
        upsert: async (args: any) => {
          conversations[args.where.phone] = {
            phone: args.where.phone,
            ...args.update,
          };
          return conversations[args.where.phone];
        },
        deleteMany: async (args: any) => {
          delete conversations[args.where.phone];
        },
      },
      appointment: {
        findFirst: async () => null,
        findMany: async () => appointments,
        create: async (args: any) => {
          const appt = { id: appointments.length + 1, ...args.data };
          appointments.push(appt);
          return appt;
        },
      },
      workingHours: {
        findMany: async () => [{ id: 1, weekday: 4, start: "09:00", end: "18:00" }],
      },
      $transaction: async (fn: any) => {
        return fn({
          appointment: {
            findFirst: async () => null,
            create: async (args: any) => {
              const appt = { id: appointments.length + 1, ...args.data };
              appointments.push(appt);
              return appt;
            },
          },
        });
      },
      $connect: async () => {},
    },
  };
});

vi.mock("axios", () => ({
  default: { post: async () => ({ data: {} }) },
}));

import express from "express";
import bodyParser from "body-parser";
import webhookRouter from "./webhook";

function buildApp() {
  const app = express();
  app.use(bodyParser.json());
  app.use("/webhook", webhookRouter);
  return app;
}

function buildPayload(phone: string, text: string) {
  return {
    entry: [
      {
        changes: [
          {
            value: {
              messages: [{ from: phone, type: "text", text: { body: text } }],
            },
          },
        ],
      },
    ],
  };
}

import supertest from "supertest";

async function post(app: any, text: string, phone = "5511900000001") {
  return supertest(app)
    .post("/webhook")
    .send(buildPayload(phone, text))
    .set("Content-Type", "application/json");
}

describe("webhook fluxo de agendamento", () => {
  let app: ReturnType<typeof buildApp>;

  beforeEach(() => {
    app = buildApp();
  });

  it("responde 200 para mensagem oi", async () => {
    const res = await post(app, "Oi");
    expect(res.status).toBe(200);
  });

  it("fluxo completo: oi -> nome -> data -> horario cria agendamento", async () => {
    const phone = "5511900000099";
    const resOi = await post(app, "Oi", phone);
    expect(resOi.status).toBe(200);

    const resNome = await post(app, "Maria Silva", phone);
    expect(resNome.status).toBe(200);

    const resData = await post(app, "2026-06-19", phone);
    expect(resData.status).toBe(200);

    const resHorario = await post(app, "2026-06-19 09:00", phone);
    expect(resHorario.status).toBe(200);
  });

  it("ignora data em formato invalido e pede novamente", async () => {
    const phone = "5511900000088";
    await post(app, "Oi", phone);
    await post(app, "Carlos", phone);
    const res = await post(app, "19/06/2026", phone);
    expect(res.status).toBe(200);
  });
});
