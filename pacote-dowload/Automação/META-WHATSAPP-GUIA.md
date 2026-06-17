# Guia de Configuração da Meta Developers e WhatsApp

Este guia foi escrito para quem está começando do zero. A ideia é você seguir passo a passo no navegador e no VS Code sem precisar entender tudo de API de uma vez.

## 1. O que você vai precisar

- Uma conta no Facebook.
- Acesso ao [Meta for Developers](https://developers.facebook.com/).
- Um número de WhatsApp que possa ser usado na API.
- O VS Code aberto neste projeto.
- Um terminal no VS Code.
- Opcional, mas recomendado: uma conta no [ngrok](https://ngrok.com/) para expor seu servidor local.

## 2. Entenda a ideia do fluxo

O que vai acontecer é isso:

1. O cliente manda mensagem para o WhatsApp da barbearia.
2. A Meta envia essa mensagem para o seu webhook.
3. O backend no VS Code processa a mensagem.
4. O bot pergunta nome, data e horário.
5. O agendamento é salvo no banco com Prisma.
6. O barbeiro consulta os dados em tempo real depois.

## 3. Criar o aplicativo na Meta

1. Abra o site da Meta for Developers.
2. Entre com sua conta.
3. Clique em **My Apps** ou **Meus aplicativos**.
4. Clique em **Create App** ou **Criar aplicativo**.
5. Escolha o tipo de aplicativo que a Meta oferecer para mensagens/WhatsApp.
6. Dê um nome simples para o app, por exemplo: `barber-bot`.
7. Finalize a criação.

Se a tela mudar um pouco, não tem problema. O importante é criar um aplicativo com acesso ao WhatsApp Business/API de mensagens.

## 4. Ativar o produto WhatsApp

Depois que o app estiver criado:

1. Vá até o painel do aplicativo.
2. Adicione o produto **WhatsApp**.
3. Siga o assistente da Meta.
4. Você verá dados como:
   - `Phone Number ID`
   - `WhatsApp Business Account ID`
   - Token de acesso temporário ou permanente

Guarde essas informações.

## 5. O que preencher no VS Code

No VS Code, abra este projeto e faça o seguinte:

1. Abra o arquivo [.env.example](.env.example).
2. Crie um arquivo novo chamado `.env` na mesma pasta do projeto.
3. Copie os valores do `.env.example` para o `.env`.
4. Preencha depois com os dados reais da Meta.

Os campos principais são:

- `META_ACCESS_TOKEN`: token da Meta.
- `META_PHONE_NUMBER_ID`: id do número do WhatsApp.
- `WEBHOOK_VERIFY_TOKEN`: uma senha simples que você escolhe para validar o webhook.
- `DATABASE_URL`: caminho do banco local.
- `PORT`: porta do servidor local, normalmente `3333`.

## 6. Como preparar o projeto no VS Code

No terminal do VS Code, dentro da pasta do projeto, execute:

```bash
npm install
npx prisma generate
npm run build
npm run test
```

O que cada comando faz:

- `npm install`: instala as dependências.
- `npx prisma generate`: prepara o Prisma Client.
- `npm run build`: verifica se o TypeScript compila.
- `npm run test`: roda os testes que já criamos.

Se o build e os testes passarem, a base do projeto está pronta.

## 7. Inicializar o banco local

Se ainda não existir o banco:

```bash
npx prisma migrate dev --name init
```

Isso cria as tabelas no SQLite de acordo com o schema.

## 8. Rodar o backend localmente

No terminal do VS Code:

```bash
npm run dev
```

Se tudo estiver certo, o backend vai subir na porta configurada no `.env`.

## 9. Expôr o servidor com ngrok

A Meta precisa chamar uma URL pública. Quando estiver testando localmente, use ngrok.

Passos:

1. Abra outro terminal.
2. Rode o ngrok apontando para a porta do seu backend.
3. Copie a URL pública gerada.
4. Essa URL será usada no webhook da Meta.

Exemplo:

```bash
ngrok http 3333
```

Se o ngrok te mostrar uma URL como `https://abc123.ngrok-free.app`, o webhook ficará algo como:

```text
https://abc123.ngrok-free.app/webhook
```

## 10. Configurar o webhook na Meta

No painel da Meta:

1. Vá até a área de configuração do WhatsApp.
2. Procure a seção de webhooks.
3. Informe a URL pública do webhook.
4. Informe o mesmo valor de `WEBHOOK_VERIFY_TOKEN` que você colocou no `.env`.
5. Salve.

O webhook do projeto responde a duas coisas:

- `GET /webhook`: validação inicial da Meta.
- `POST /webhook`: mensagens recebidas.

## 11. Testar se tudo funcionou

Depois de configurar:

1. Envie uma mensagem para o número da barbearia.
2. A primeira resposta deve iniciar o fluxo de agendamento.
3. O bot deve pedir o nome.
4. Depois deve pedir data e horário.
5. Quando confirmar, o agendamento deve ser salvo no banco.

## 12. O que conferir se der erro

- Se o webhook não validar, confira `WEBHOOK_VERIFY_TOKEN`.
- Se a Meta não chamar seu backend, confira a URL do ngrok.
- Se o backend não subir, confira o arquivo `.env`.
- Se o Prisma reclamar, rode novamente `npx prisma generate` e `npx prisma migrate dev --name init`.
- Se o WhatsApp não responder, confira o token e o `META_PHONE_NUMBER_ID`.

## 13. O que você faz no VS Code agora

Seu fluxo prático no VS Code deve ser este:

1. Abrir `.env.example` e criar o `.env`.
2. Preencher `DATABASE_URL` e depois os dados da Meta.
3. Rodar `npm install` se ainda não tiver instalado.
4. Rodar `npx prisma migrate dev --name init`.
5. Rodar `npm run dev`.
6. Rodar `ngrok http 3333` em outro terminal.
7. Copiar a URL do ngrok e cadastrar no painel da Meta.
8. Testar mandando mensagem para o WhatsApp.

## 14. Próximo passo depois da configuração

Quando o webhook estiver funcionando, o próximo passo será melhorar o fluxo do bot para:

- perguntar o nome do cliente de forma mais natural,
- mostrar horários disponíveis por data,
- confirmar agendamento com segurança,
- e depois criar um painel para o barbeiro acompanhar tudo em tempo real.