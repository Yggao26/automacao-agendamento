# Barber-bot (MVP)

Este repositório contém um esqueleto inicial para um chatbot de agendamento via WhatsApp usando a Meta Business API.

Visão geral rápida:

- Backend: Node.js + TypeScript + Express
- Banco (MVP): SQLite via Prisma
- Comunicação com WhatsApp: Meta Business API (webhooks + chamadas HTTP)

Passos para rodar localmente (Windows):

1. Instalar dependências

```bash
npm install
npx prisma generate
```

2. Inicializar o banco (prisma + sqlite)

```bash
npx prisma migrate dev --name init
```

3. Criar um arquivo `.env` a partir de `.env.example` e preencher:
   - `META_ACCESS_TOKEN`
   - `META_PHONE_NUMBER_ID`
   - `WEBHOOK_VERIFY_TOKEN`

4. Rodar em modo dev

```bash
npm run dev
```

5. Rodar testes

```bash
npm run test
```

6. Gerar cobertura de testes

```bash
npm run test:coverage
```

7. Expor o servidor para a internet (ngrok) e configurar o webhook na Meta para `https://<seu-ngrok>/webhook`

8. Seguir o guia detalhado de configuração da Meta e do WhatsApp em [META-WHATSAPP-GUIA.md](META-WHATSAPP-GUIA.md)

Arquivos importantes:

- [src/index.ts](src/index.ts) — servidor principal
- [src/routes/webhook.ts](src/routes/webhook.ts) — handler do webhook e fluxo básico do bot
- [prisma/schema.prisma](prisma/schema.prisma) — modelo do banco
- [src/routes/api.ts](src/routes/api.ts) — rotas para gerenciar serviços, horários e disponibilidade

Comentários e aprendizado

- O arquivo `webhook.ts` está comentado com explicações em cada passo para que você entenda o fluxo.
- Próximos passos recomendados: implementar verificação de disponibilidade (checagem de conflitos), criar endpoints REST para CRUD de horários/serviços, e construir um dashboard em React que consuma a API e receba atualizações em tempo real via Socket.IO.

Novas rotas API (exemplos):

- Listar serviços: GET `/api/services`
- Criar serviço: POST `/api/services` body `{ "name": "Corte", "duration": 45 }`
- Listar working hours: GET `/api/working-hours`
- Criar working hours: POST `/api/working-hours` body `{ "weekday": 1, "start": "09:00", "end": "20:00" }`
- Obter disponibilidade: GET `/api/availability?date=2026-06-20&serviceId=1`

O endpoint de disponibilidade retorna `slots` no formato `YYYY-MM-DD HH:MM`.

Observação sobre edição de horários: use os endpoints de `working-hours` para configurar dias e horários de funcionamento; para o barbeiro ter flexibilidade, a interface do dashboard deve chamar essas rotas para atualizar os períodos por dia da semana.

## Configuração da Meta e WhatsApp

Se você está começando do zero, siga o guia em [META-WHATSAPP-GUIA.md](META-WHATSAPP-GUIA.md). Ele explica o que fazer no painel da Meta, o que preencher no arquivo `.env` e quais comandos executar no VS Code.
