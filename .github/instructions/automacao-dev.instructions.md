---
description: "Use when editing TypeScript, Node.js, Express, Prisma, webhook, API, automation, or test files in this project."
applyTo: "pacote-dowload/Automação/**/*.{ts,prisma}"
---
# Projeto Automacao

- Prefer code that is simple, explicit, and easy to study later.
- Keep route handlers thin and move reusable logic into utilities or services.
- Preserve existing project conventions unless a change is clearly justified.
- For changes in behavior, check whether there is an existing test pattern and extend it.
- Use Prisma carefully: validate schema changes, migrations, and DB assumptions.
- Avoid unnecessary dependencies and avoid overengineering.
- When a fix touches multiple layers, verify the request flow end to end.