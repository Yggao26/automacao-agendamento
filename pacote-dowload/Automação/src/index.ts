import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import webhookRouter from "./routes/webhook";
import apiRouter from "./routes/api";
import { prisma } from "./prisma";

dotenv.config();

const app = express();
app.use(bodyParser.json());

// Endpoints
app.use("/webhook", webhookRouter);
app.use("/api", apiRouter);

app.get("/", async (req, res) => {
  res.send("Barber-bot API: rodando");
});

const port = process.env.PORT || 3333;
app.listen(port, async () => {
  console.log(`Servidor rodando na porta ${port}`);
  // Checagem rápida: conectar Prisma
  try {
    await prisma.$connect();
    console.log("Conectado ao banco (Prisma)");
  } catch (err) {
    console.warn(
      "Não foi possível conectar ao DB ainda. Rode `npx prisma migrate dev` ou configure DATABASE_URL.",
    );
  }
});
