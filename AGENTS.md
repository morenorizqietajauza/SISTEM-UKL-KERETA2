# Tiket Kereta — NestJS + Prisma + MySQL

## Quick start

```bash
npm install        # postinstall auto-runs prisma generate
cp .env.example .env  # then edit DATABASE_URL, JWT_SECRET
npx prisma migrate deploy
npm run start:dev
```

## Commands

| Command | What |
|---|---|
| `npm run start:dev` | Watch-mode dev server (port from `PORT` env, default 3000) |
| `npm run start:prod` | `node dist/src/main` (build first) |
| `npm run lint` | ESLint flat config — uses `--fix` |
| `npm run format` | Prettier (single quotes, trailing commas) |
| `npm test` | Jest, `rootDir: src`, matches `*.spec.ts` |
| `npm run test:e2e` | Jest with `test/jest-e2e.json`, matches `*.e2e-spec.ts` |
| `npm run test:cov` | Jest coverage |
| `npm run prisma:deploy` | Apply pending Prisma migrations |

Run order: `lint` → `npm test` → `npm run test:e2e`.

## Architecture

- **Framework**: NestJS v11 (TypeScript, decorators, `ts-jest`)
- **ORM**: Prisma 6 + MySQL/MariaDB (`@prisma/adapter-mariadb`)
- **Schema**: `prisma/schema.prisma` — models: `Users`, `Pelanggan`, `Petugas`, `Kereta`, `Gerbong`, `Kursi`, `Jadwal`, `PembelianTiket`, `DetailPembelian`
- **Auth**: JWT via Passport. `@Public()` skips auth; otherwise `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Role(UserRole.ADMIN|PENUMPANG)`.
- **Validation**: Global `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`)

## API surface

- All routes under `/api` (global prefix in `src/main.ts:10`)
- Swagger UI at **`/api/dq1ocs`** (not `/api/docs` as the README/console.log incorrectly state)
- Swagger uses bearer auth scheme named `access-token`
- **Roles**: `ADMIN` (full CRUD on all modules) and `PENUMPANG` (self-service via `/me` endpoints)

## Key env vars

| Var | Default | Notes |
|---|---|---|
| `DATABASE_URL` | `mysql://root@localhost:3306/tiket_kereta` | Prisma datasource |
| `JWT_SECRET` | hardcoded fallback in `auth.module.ts:21` | Must be set in production |
| `JWT_EXPIRES_IN` | `1d` | |
| `PORT` | `3000` | |

## Gotchas

- `postinstall` runs `prisma generate` — if you add a new `@prisma/client` import without regenerating, it breaks
- The Prisma config file is `prisma.config.ts` (next-gen Prisma config format)
- `@prisma/adapter-mariadb` is used (not the default Postgres adapter)
- `noImplicitAny` is `false` in tsconfig — allow implicit `any`
- `@typescript-eslint/no-explicit-any` is `off`
- E2E tests live in `test/`, not alongside source
- `.env` is gitignored — only exists locally
- Postman collections in `postman/`
- `dist/` is checked in (probably shouldn't be)
