# Vision Platform API — Local Developer Quickstart

This file explains how to run the API service locally for development and how to validate the translation provider mock.

Prereqs
- Node.js >= 18
- npm >= 9
- Docker & Docker Compose (for the local DB/Redis stack)

Steps

1. Copy environment template

   - From the repository root copy `.env.example` to `.env` and set values for placeholders (especially `MONGODB_URI`, `REDIS_URL`, and any AI keys).

2. Start local infra (MongoDB, Redis)

   ```powershell
   docker-compose -f ..\..\docker-compose.dev.yml up -d --build
   ```

3. Install dependencies

   ```powershell
   cd services/api
   npm install
   ```



5. Start dev server

   ```powershell
   npm run dev
   ```

6. Verify health/readiness

   - GET http://localhost:3001/healthz
   - GET http://localhost:3001/readyz

7. Run the provider unit test

   ```powershell
   npm test -- services/api/__tests__/translationProvider.test.ts
   ```


Placeholders you must update
- `MONGODB_URI` — MongoDB connection string (app uses Mongoose models).
- `TRANSLATION_PROVIDER` — set to `mock` for local testing, or `openai/google/azure` once adapters are implemented.


Notes
- The project currently uses MongoDB/Mongoose for all persistence.
- If you see TypeScript "Cannot find module" or Node type errors in your editor, run `npm install` in `services/api` to install dependencies and `@types/*` packages.

---
Quick validation: the included unit test asserts the mock translation provider returns the expected mock output. If it passes, the provider wiring is working.
