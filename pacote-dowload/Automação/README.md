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

## Deploy contínuo no Render

O projeto já vem preparado para o Render com banco SQLite em disco persistente. Ao criar o serviço pelo `render.yaml`, o Render usa:

- Build: `npm install && npm run build`
- Migrações: `npm run db:deploy` antes do start
- Banco: `file:/var/data/dev.db` em um disco persistente

Depois do deploy, configure as variáveis secretas no painel do Render e aponte a Meta para `https://SEU-SERVICO.onrender.com/webhook`.

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

## Caminho gratuito para começar

Você consegue evoluir e demonstrar o projeto sem custo nesta fase:

1. Ambiente local com Node + SQLite (gratuito).
2. Exposição com ngrok free para validar webhooks.
3. Painel admin local em `http://localhost:3333/admin`.
4. Meta Developers em modo de teste.

Quando for operar com clientes reais, você pode continuar com plano gratuito no início, mas o ideal é migrar para uma hospedagem estável com URL fixa.

## Playbook por cliente (passo a passo curto)

Use este fluxo para configurar cada novo cliente sem retrabalho:

1. Rode `npm run setup:cliente` para criar serviços e horários padrão.
2. Ajuste serviços e horários no painel admin (`/admin`).
3. Configure token e webhook da Meta no `.env`.
4. Teste fluxo de conversa via script `npm run simular:agendamento`.
5. Valide agenda do dia em `GET /api/appointments?date=YYYY-MM-DD`.

Com esse playbook, você consegue sair de zero para demonstração funcional em poucos minutos.
