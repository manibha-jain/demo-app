# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # start dev server at localhost:3000
npm run build    # production build
npm run lint     # run ESLint (eslint-config-next/core-web-vitals + typescript)
```

There is no test suite configured.

## Architecture

This is a hotel reviews app using **Next.js 16.2.4** (App Router), **React 19**, **Supabase** (database + auth), and **Tailwind CSS v4**.

### Supabase client pattern

There are two Supabase clients — use the right one for the rendering context:

- `lib/supabase.ts` — `createClient()` (sync, browser). Use in Client Components (`'use client'`).
- `lib/supabase-server.ts` — `createServerSupabaseClient()` (async, uses `cookies()`). Use in Server Components and Route Handlers.

### Next.js 16 breaking changes in use

- Dynamic route `params` is now a `Promise`: `{ params }: { params: Promise<{ id: string }> }` — must be `await`ed before use. See `app/hotels/[id]/page.tsx`.
- Tailwind v4 is configured via PostCSS (`@tailwindcss/postcss`). The CSS entry point is a single `@import "tailwindcss";` line — no `@tailwind base/components/utilities` directives.

### Data model

Two Supabase tables:

- **hotels**: `id, name, location, category, description, image_url`
- **reviews**: `id, hotel_id, user_id, rating, comment, created_at, user_email`

Auth uses Supabase email/password. The authenticated `user` object is fetched server-side in `app/hotels/[id]/page.tsx` and passed as a prop to `ReviewForm`.

### Path alias

`@/` maps to the project root (configured in `tsconfig.json`).

### Environment variables

`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are required (set in `.env.local`).
