# Biblioteca Web

Frontend do sistema de gerenciamento de biblioteca com controle de empréstimos, construído com Next.js e Tailwind CSS.

**Demo ao vivo:** https://biblioteca-web-theta.vercel.app/login

> Servidor gratuito (Render free tier) — primeira requisição pode levar ~50s para acordar.

## Tecnologias

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Deploy: Vercel

## Funcionalidades

- Autenticação (login e cadastro)
- Autores — cadastro e remoção
- Livros — cadastro com autor, ISBN e ano
- Exemplares — cadastro de cópias físicas de cada livro com código único
- Membros — cadastro com e-mail e telefone
- Empréstimos — criar selecionando exemplar disponível e membro, registrar devolução, destaque para atrasos
- Redirecionamento automático para login quando não autenticado

## Fluxo de uso

Autores → Livros → Exemplares → Membros → Empréstimos

## Como rodar localmente

```bash
npm install
```

Crie o arquivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://biblioteca-api-8dtt.onrender.com/api
```

```bash
npm run dev
```

Acesse: http://localhost:3001

## API

Consome a [Biblioteca API](https://github.com/joaomangini/biblioteca-api) — NestJS + Prisma + PostgreSQL (Neon).
