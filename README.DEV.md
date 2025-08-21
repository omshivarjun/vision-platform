# Vision Platform — Local Development Quickstart

This guide boots a local development stack (Postgres, Redis, Adminer, API) and runs initial migrations.

Placeholders you must update after cloning:
- `DATABASE_URL` in `.env` or system env
- Any 3rd-party API keys (OPENAI_API_KEY, GOOGLE_CLOUD_API_KEY, etc.) in `.env`
- SMTP credentials for Mailhog/real provider

Steps:

1. Copy `.env.example` to `.env` and update placeholders.

2. Start development stack:

```powershell
docker-compose -f docker-compose.dev.yml up -d --build
```

3. Set `DATABASE_URL` (example):

```powershell
$env:DATABASE_URL = "postgresql://vision_user:vision_pass@localhost:5432/vision_platform"
```

4. Run migrations:

```powershell
./scripts/run-migrations.sh
```

5. Start backend (in dev container or locally):

```powershell
cd services/api
npm install
npm run dev
```

6. Visit Adminer: http://localhost:8080
7. Health endpoints: http://localhost:3001/healthz and http://localhost:3001/readyz

If something fails, check logs:

```powershell
docker-compose logs -f api
```

---
End of quickstart.
