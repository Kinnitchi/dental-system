# Copilot Instructions — system-dental

## Visão Geral

SaaS de gestão de clínicas odontológicas construído com **Next.js 15 App Router**, **Drizzle ORM** (PostgreSQL), **better-auth** e **next-safe-action**. UI usa componentes shadcn/ui com Tailwind CSS v4 e ícones lucide-react. Idioma da UI e mensagens: **Português Brasileiro**.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS v4 + shadcn/ui
- React Hook Form + Zod para formulários
- better-auth para autenticação (Google OAuth)
- PostgreSQL + Drizzle ORM
- next-safe-action para Server Actions
- dayjs para datas e horários
- react-number-format para máscaras de input
- sonner para toasts

## Arquitetura

### Rotas

- `src/app/(protected)/` — rotas autenticadas (layout com `AppSidebar`)
- `src/app/authentication/` — páginas públicas de login/cadastro
- `src/app/api/auth/[...all]/` — handler da better-auth

### Multi-tenancy

Cada usuário pertence a uma clínica via `usersToClinicsTable`. A clínica ativa está embutida na sessão via plugin `customSession` da better-auth (ver `src/lib/auth.ts`). Sempre verifique `session.user.clinic?.id` nas Server Actions antes de acessar dados da clínica.

### Server Actions

Todas as mutações usam **next-safe-action**. Padrão obrigatório:

```ts
// src/actions/<feature>/schema.ts  — schema Zod
// src/actions/<feature>/actions.ts — "use server" + actionClient
export const myAction = actionClient.schema(mySchema).action(async ({ parsedInput }) => { ... });
```

Nos componentes clientes, chame com `useAction(myAction, { onSuccess, onError })` de `next-safe-action/hooks` e exiba feedback com `sonner`.

## Arquivos-chave

| Arquivo                                                | Propósito                                                           |
| ------------------------------------------------------ | ------------------------------------------------------------------- |
| `src/db/schema.ts`                                     | Fonte única de verdade para todas as tabelas e relações             |
| `src/lib/auth.ts`                                      | Config da better-auth; sessão inclui `user.clinic`                  |
| `src/lib/next-safe-action.ts`                          | Exporta `actionClient` usado por todas as actions                   |
| `src/helpers/currency.ts`                              | `formatCurrencyInCents()` — preços armazenados em centavos inteiros |
| `src/components/ui/form.tsx`                           | Componente base para todos os formulários                           |
| `src/components/ui/page-container.tsx`                 | Wrapper de página com margin/padding/spacing padrão                 |
| `src/app/(protected)/doctors/_helpers/availibility.ts` | Converte horários UTC do DB → local com dayjs + locale `pt-br`      |

## Convenções

### Código

- Nomes de variáveis descritivos: `isLoading`, `hasError`
- kebab-case para nomes de pastas e arquivos
- Sempre TypeScript; nunca redefina tipos que podem ser inferidos do schema: use `typeof doctorsTable.$inferSelect`

### Componentes e Páginas

- Componentes específicos de uma página ficam em `_components/` dentro da pasta da rota
- Constantes em `_constants/`, helpers em `_helpers/` dentro da pasta da rota
- Ao criar páginas, use `<PageContainer>` de `src/components/ui/page-container.tsx`

### Banco de dados e Dados

- Horários de disponibilidade armazenados em UTC (`HH:mm:ss`), convertidos para local via `getAvailability()` com `dayjs` + plugin `utc`
- Preços armazenados como inteiros em centavos (`appointmentPriceInCents`); exibir com `formatCurrencyInCents()`
- Acesso ao DB sempre via `src/db/index.ts`

### Estilo

- Sempre Tailwind para estilização; use componentes shadcn/ui ao máximo
- Variáveis CSS do tema: `var(--color-primary)`, `var(--color-muted)` etc. — definidas em `src/app/globals.css` no bloco `@theme inline`
- Variantes de Badge disponíveis: `default`, `secondary`, `destructive`, `outline`, `ghost`, `link`, `info`, `text`

## Workflows

```bash
pnpm dev                    # servidor de desenvolvimento
pnpm build                  # build de produção
pnpm lint                   # ESLint

# Banco de dados (Drizzle Kit)
pnpm drizzle-kit generate   # gerar migration após mudanças no schema
pnpm drizzle-kit migrate    # aplicar migrations
pnpm drizzle-kit studio     # abrir Drizzle Studio
```

Variáveis de ambiente necessárias: `DATABASE_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.

## Adicionando uma Nova Feature

1. Adicionar tabela/colunas em `src/db/schema.ts` → `drizzle-kit generate` + `migrate`
2. Criar `src/actions/<feature>/schema.ts` (Zod) e `actions.ts` (next-safe-action)
3. Adicionar página em `src/app/(protected)/<feature>/page.tsx`
4. Construir componentes UI em `_components/`, chamando actions com `useAction`
5. Sempre user a biblioteca de componentes shadcn/ui para consistência visual
6. Sempre usar a biblioteca de "react-number-format" para inputs de telefone, CPF, etc. para máscaras
7. Testar manualmente e garantir que mensagens de erro/sucesso sejam claras para o usuário, usando `sonner` para toasts
8. Ao criar pagina de listagem, sempre incluir filtros de busca e paginação para melhor UX
9. Para campos de data/hora, sempre usar `dayjs` para formatação e conversão, garantindo que os horários sejam exibidos no fuso horário local do usuário
10. Para campos de preço, sempre usar `formatCurrencyInCents()` para exibir corretamente os valores armazenados em centavos inteiros, garantindo que o formato seja consistente em toda a aplicação
