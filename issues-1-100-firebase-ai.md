# Vision Platform — 100 Actionable Issues (Firebase AI / GCP / MongoDB / Google OCR & TTS)

## Architecture constraints

- AI models, embeddings, and hosted prompts use Firebase AI/Vertex AI (preferred).
- OCR uses Google Cloud Vision.
- TTS uses Google Cloud Text-to-Speech.
- DB: MongoDB (Atlas on GCP or self-hosted on GCE).
- Queue/cache: Redis (GCP Memorystore).
- Object storage: Google Cloud Storage.
- Billing: Stripe.
- Email: SMTP.
- Worker compute: Cloud Run / GKE (GCP).
- No multi-cloud; everything stays on GCP + MongoDB.
- Use Firebase AI / Vertex AI for LLMs, embeddings, model hosting, experiments, and model registry.

## How to use these issues

Save this file as `issues-1-100-firebase-ai.md`.

For any issue you want to implement, copy the Firebase AI / CLI prompt and paste it into your repo automation or dev prompt flow. The prompt is phrased to let a code-generation assistant (Gemini CLI, git, or your internal tools) scaffold changes; the model calls described should be implemented using Firebase AI / Vertex AI APIs.

Use the provided shell commands (adapt env vars) to run, test and validate locally or on GCP.

---

## 1 — MongoDB Connection & Local Dev Setup

- Problem / Context: Local dev fails due to DB misconfig.
- Plan: Add docker-compose.dev.yml with mongo and redis, create lib/db-mongo.js with retry/backoff, and scripts/migrate_mongo.js to create collections (users, documents, translations, analytics) and indexes.

Firebase AI / CLI prompt:

Scan the repo for DB connection logic; generate lib/db-mongo.js (MongoClient with exponential backoff), docker-compose.dev.yml (mongodb, redis), and scripts/migrate_mongo.js that creates collections and indexes. Document MONGODB_URI example (.env.example).

Shell test:

```bash
docker-compose -f docker-compose.dev.yml up -d
node scripts/migrate_mongo.js --uri "mongodb://localhost:27017/vision_dev"
```

Labels: backend, mongodb

---

## 2 — CI/CD (GitHub Actions → Cloud Run / Firebase Hosting)

- Problem: Broken/missing CI and deploys.
- Plan: Add ci.yml for lint/test/build and deploy-gcp.yml to build container, push to Artifact Registry and deploy to Cloud Run or Firebase Hosting. Store GCP service account in GitHub Secrets.

Firebase AI / CLI prompt:

Create .github/workflows/ci.yml (node build/test) and deploy-gcp.yml (build image, push to Artifact Registry, deploy to Cloud Run). Add step to run migration script against MongoDB Atlas if needed and a smoke test endpoint check.

Shell test:

```bash
docker build -t vision-platform:ci .
gcloud run deploy vision-platform --image=PROJECT/vision-platform:ci --region=us-central1
```

Labels: ci, gcp

---

## 3 — Translation Pipeline (Firebase AI + Model Adapter)

- Problem: Translations returning identical input.
- Plan: Replace prior adapter with a Firebase AI (Vertex AI) translation/few-shot model adapter or call an appropriate Vertex text model. Add fallback and language detection (Vertex model or on-device fasttext). Log jobs in MongoDB.

Firebase AI / CLI prompt:

Refactor translation route to an adapter that supports providers; implement a FirebaseAI adapter that calls Vertex AI text model for translations and a language-detect function. Store translation_job records in MongoDB with status, error, and usage.

Shell test:

```bash
curl -X POST http://localhost:3000/api/translate -H "Content-Type: application/json" -d '{"text":"Hello","target":"hi"}'
```

Labels: ai, backend, firebase-ai

---

## 4 — OCR Integration (Google Cloud Vision)

- Problem: No server-side OCR for PDFs/images.
- Plan: Implement Document/Text detection with Google Cloud Vision asyncBatchAnnotateFiles for PDFs and batchAnnotateImages for images. Enqueue jobs and store page/block JSON in ocr_pages.

CLI prompt:

Add /api/ocr that uploads file to GCS, creates an asyncBatchAnnotateFiles request to Cloud Vision, polls operation, and stores structured per-page block JSON in MongoDB.

Shell test:

```bash
curl -F "file=@/tmp/doc.pdf" http://localhost:3000/api/ocr
mongosh "$MONGODB_URI" --eval 'db.ocr_jobs.find().pretty()'
```

Labels: ocr, gcp

---

## 5 — Notification System Overhaul (Accessible)

- Problem: Duplicated toasts; inaccessible alerts.
- Plan: Central notifications collection, dedupe logic, aria-live in frontend, SSE/WS push via Cloud Run with Redis pub/sub.

CLI prompt:

Create notifications collection schema, backend endpoints to create/list notifications, SSE/WS relay using Redis pub/sub, and a React NotificationBell using aria-live.

Shell test:

```bash
curl -X POST http://localhost:3000/api/notifications -d '{"userId":"u","type":"info","message":"test"}'
```

Labels: frontend, accessibility, realtime

---

## 6 — Unified Workspace UI (Single Page)

- Problem: Scattered feature tabs harming blind users’ linear workflows.
- Plan: Implement /workspace route with steps (Upload → Processing → Translate → Playback → Assistant), keyboard navigation, voice hooks (Web Speech API) and screen-reader optimizations.

CLI prompt:

Scaffold Workspace component with stepper and accessible controls; migrate common state to React Context and add voice command bindings (Web Speech API) calling assistant endpoints.

Shell test:

```bash
npm run dev --prefix frontend
# open /workspace
```

Labels: ux, accessibility

---

## 7 — OAuth & Token Storage (if MS OAuth used)

- Problem: OAuth broken (redirect/state).
- Plan: Validate redirect URIs on provider consoles; store refresh tokens in user_tokens in MongoDB and implement refresh. Add admin test route.

CLI prompt:

Patch auth middleware to store tokens in MongoDB securely and implement token refresh flow; add /admin/oauth/test to validate provider config.

Shell test:

```bash
tail -f logs/server.log
```

Labels: auth

---

## 8 — Analytics Pipeline (MongoDB → BigQuery)

- Problem: Events missing metadata and not reaching dashboards.
- Plan: Standardize event schema in client; collect raw events into events MongoDB collection; ETL to BigQuery daily via Cloud Functions or Dataflow for dashboards.

CLI prompt:

Create client trackEvent wrapper with {event, userId, orgId, plan, meta, ts}, server ingestion to MongoDB, and a scheduled Cloud Function to export events to BigQuery.

Shell test:

```bash
curl -X POST http://localhost:3000/api/analytics -d '{"event":"upload","userId":"u1"}'
```

Labels: analytics, gcp

---

## 9 — Stripe Subscriptions & Webhooks

- Problem: Billing missing enforcement and webhook sync.
- Plan: Integrate Stripe Checkout + webhook handlers writing to subscriptions and invoices in MongoDB. Add middleware to guard premium endpoints.

CLI prompt:

Add Stripe Checkout session endpoint and webhook receiver that persists subscription invoice events to MongoDB and middleware requirePlan('premium') for premium-only APIs.

Shell test:

```bash
curl -X POST http://localhost:3000/api/checkout/session -d '{"plan":"premium"}'
mongosh "$MONGODB_URI" --eval 'db.subscriptions.find().pretty()'
```

Labels: billing, stripe

---

## 10 — Assistant Context & Retrieval (Firebase AI embeddings)

- Problem: Assistant gives generic or hallucinated answers; no retrieval.
- Plan: Build chunker, compute embeddings via Firebase AI embeddings (Vertex AI-compatible embeddings or hosted Vertex embeddings), store vectors in MongoDB or a small ANN service on GCP, implement retrieval + prompt composition with provenance. Use Vertex AI model endpoints for generation.

CLI prompt:

Add chunking script, call Vertex Embeddings via Firebase AI to produce vectors, store vectors in MongoDB (vectors field or separate collection), implement /api/assistant that retrieves top-k chunks and composes prompt for Vertex AI text generation with citations.

Shell test:

```bash
node scripts/chunk_and_embed_mongo.js --docId=123
curl -X POST http://localhost:3000/api/assistant -d '{"docId":123,"query":"Summarize"}'
```

Labels: ai, firebase-ai, backend

---

## 11 — Google TTS Integration & Caching

- Problem: Unreliable playback and no voice presets.
- Plan: Use Google Cloud Text-to-Speech to synthesize audio, store audio blobs in GCS, cache mapping (docId, voice, speed) to GCS object, user_voice_profiles collection for presets.

CLI prompt:

Implement TTS adapter using Google TTS synthesizeSpeech streaming to GCS, endpoints for preview and streaming playback, and MongoDB caching of audio references.

Shell test:

```bash
curl -X POST http://localhost:3000/api/tts -d '{"text":"Hello","voice":"en-US-Wavenet-D"}' --output out.mp3
```

Labels: tts, gcp

---

## 12 — Analytics Attribution (Plan & Org)

- Problem: Analytics missing plan/org context.
- Plan: Ensure client includes auth context; server enriches events with org/plan and stores to MongoDB and BigQuery.

CLI prompt:

Patch client trackEvent to include orgId & plan, server-side enrichment, and BigQuery ETL mapping for attribution.

Shell test:

```bash
mongosh "$MONGODB_URI" --eval 'db.events.find().limit(5).pretty()'
```

Labels: analytics

---

## 13 — Robust Background Jobs (Redis + BullMQ)

- Problem: Jobs stuck, no DLQ or retries.
- Plan: Use BullMQ (Redis) on Memorystore; implement retries, backoff, DLQ and record job metadata in MongoDB. Auto-scale Cloud Run workers on queue depth.

CLI prompt:

Add BullMQ worker scaffold, DLQ wiring, and job-record MongoDB schema; add backoff/retry policy and dead-letter logging.

Shell test:

```bash
redis-cli -h $REDIS_HOST LLEN bull:queue:wait
```

Labels: jobs, redis

---

## 14 — Email Templates (SMTP & Queue)

- Problem: Templates broken or emails failing.
- Plan: Implement templating with Handlebars, queue email sending via BullMQ with retries and store deliveries in emails collection. Provide Mailhog for dev. Use SMTP creds from Secret Manager.

CLI prompt:

Add Handlebars email templates, nodemailer with SMTP config, queue send via BullMQ, and store events in emails collection with retry metadata.

Shell test:

```bash
docker run -d -p 8025:8025 mailhog/mailhog
curl -X POST http://localhost:3000/admin/send-test-email -d '{"to":"test@example.com"}'
```

Labels: email, backend

---

## 15 — Resumable Large Uploads (GCS resumable sessions)

- Problem: Large uploads fail.
- Plan: Use GCS resumable upload sessions; frontend uploads in chunks; server verifies MD5/CRC32C and enqueues processing job.

CLI prompt:

Add endpoint to create GCS resumable session URL for uploads, update frontend chunking logic, and create webhook or check endpoint to mark upload complete and enqueue processing.

Shell test:

```bash
curl -X POST http://localhost:3000/api/upload/resumable -d '{"filename":"big.pdf","size":12345678}'
```

Labels: storage, gcp

---

## 16 — Frontend Build & Static Hosting (GCS + Cloud CDN)

- Problem: Prod build fails or missing assets.
- Plan: Fix build pipelines; host static assets in GCS with Cloud CDN; CI job to build & upload.

CLI prompt:

Run frontend build, fix Vite/Webpack issues, and add CI step to upload dist to GCS and enable Cloud CDN with cache-control headers.

Shell test:

```bash
npm run build --prefix frontend
gsutil rsync -r frontend/dist gs://vision-static
```

Labels: frontend, gcp

---

## 17 — Full-Text + Semantic Search (MongoDB text index + Vertex embeddings)

- Problem: Search relevance poor.
- Plan: Add MongoDB text indexes; compute Vertex embeddings for documents and query embeddings for semantic search; hybrid ranking that mixes text score + embedding similarity + recency/popularity. Cache with Redis.

CLI prompt:

Create text index migration on documents, add pipeline to compute Vertex embeddings and store in MongoDB vectors field, and implement /api/search hybrid route combining textScore + vector similarity.

Shell test:

```bash
mongosh "$MONGODB_URI" --eval 'db.documents.createIndex({content:"text",title:"text"})'
curl "http://localhost:3000/api/search?q=accessibility"
```

Labels: search, firebase-ai

---

## 18 — Issue / PR Templates, CONTRIBUTING

- Problem: Missing contributor docs and templates.
- Plan: Add .github/ISSUE_TEMPLATE/bug_report.md, PULL_REQUEST_TEMPLATE.md, CONTRIBUTING.md, CODE_OF_CONDUCT.md. Add PR checklist GitHub Action.

CLI prompt:

Create ISSUE_TEMPLATE/bug_report.md and PULL_REQUEST_TEMPLATE.md, CONTRIBUTING.md, and add an action gating PRs to include checkboxes for migrations, tests, and accessibility.

Shell test:

```bash
git add .github && git commit -m "chore: add issue/pr templates"
```

Labels: docs, community

---

## 19 — Health Checks & Readiness

- Problem: Orchestrator can't detect unhealthy instances.
- Plan: Add /healthz and /readyz endpoints verifying MongoDB, Redis, and GCS access. Configure Cloud Run readiness checks or Kubernetes probes.

CLI prompt:

Add /healthz and /readyz endpoints performing DB and Redis checks and provide Cloud Run readiness config snippet and smoke-test script.

Shell test:

```bash
curl http://localhost:3000/readyz
```

Labels: infra

---

## 20 — OpenAPI Spec & Developer SDKs

- Problem: No machine-readable API spec.
- Plan: Add openapi.yaml for core endpoints and serve Swagger UI at /docs. Use it to generate TypeScript/Python SDKs.

CLI prompt:

Generate openapi.yaml covering /api/upload,/api/ocr,/api/translate,/api/assistant,/api/tts,/auth and wire swagger-ui-express to /docs. Provide generation scripts for SDKs.

Shell test:

```bash
npx @openapitools/openapi-generator-cli generate -i openapi.yaml -g typescript-axios -o sdk/js
```

Labels: docs, api

---

## 21 — Embeddings & Vector Storage (Vertex Embeddings)

- Problem: No embedding store for semantic retrieval.
- Plan: Use Vertex Embeddings (via Firebase AI) to compute vectors; store vectors as arrays in MongoDB (or a dedicated ANN service on GCP) with chunk metadata. Provide ingestion script and periodic re-ingest.

CLI prompt:

Build ingest script to chunk docs, call Vertex Embeddings via Firebase AI, store vectors in MongoDB chunk docs, and create /api/search/semantic to do brute-force or ANN-based nearest neighbor retrieval.

Shell test:

```bash
node scripts/ingest_vertex_embeddings.js --docId=123
```

Labels: firebase-ai, ai

---

## 22 — Deterministic Chunker (token-based)

- Problem: Non-deterministic chunks reducing retrieval quality.
- Plan: Implement a token- or sentence-aware deterministic chunker with overlap and stable chunk IDs stored in MongoDB. Provide re-chunk CLI.

CLI prompt:

Create chunker util (token-based with overlap), script to re-chunk documents, and migration to update chunk collection with stable chunkId.

Shell test:

```bash
node scripts/chunk_doc.js --docId=123
```

Labels: data, ai

---

## 23 — Search Ranking Signals (CTR + recency)

- Problem: Search ranking ignores usage signals.
- Plan: Collect impressions/clicks to search_signals and incorporate CTR/recency/popularity into final ranking. Provide admin weight controls and A/B experiments via Vertex model versions.

CLI prompt:

Add search_signals collection, modify search pipeline to apply weighted composite scoring and build admin UI to change weights and launch A/B experiments using Vertex model endpoints.

Shell test:

```bash
mongosh "$MONGODB_URI" --eval 'db.search_signals.find().limit(5).pretty()'
```

Labels: search, analytics

---

## 24 — Document Versioning & Immutable Audit

- Problem: Edits overwrite prior content.
- Plan: Save full snapshots to document_versions and append-only audit_logs with cryptographic hash chain. Provide rollback UI.

CLI prompt:

Add document_versions & audit_logs collections; implement snapshotting on save, hash-chain for audit integrity, and admin export endpoint.

Shell test:

```bash
mongosh "$MONGODB_URI" --eval 'db.document_versions.count()'
```

Labels: compliance

---

## 25 — PDF Viewer & OCR Overlay

- Problem: OCR not mapped to pages/blocks.
- Plan: Store per-page ocr_pages with bounding boxes and overlay using PDF.js + SVG. Clicking block triggers Google TTS playback of that block. Ensure keyboard focusable blocks.

CLI prompt:

Ensure OCR pipeline stores page/block bbox coordinates; add PDF.js overlay component rendering bounding boxes and 'Read block' action that calls TTS streaming endpoint.

Shell test:

```bash
npm run dev --prefix frontend
```

Labels: frontend, ocr

---

## 26 — Handwriting Recognition (HWR pipeline)

- Problem: Handwriting poorly recognized.
- Plan: Route suspected handwriting pages to specialized HWR pipeline (Google Vision HWR if supported or a fallback service), store line-level confidences, surface corrections UI that writes to hwr_corrections.

CLI prompt:

Add handwriting detection and HWR adapter, store per-line confidences in MongoDB, and build UI to surface low-confidence lines for correction.

Shell test:

```bash
curl -F "file=@handwritten.jpg" http://localhost:3000/api/ocr/handwriting
```

Labels: ocr, ml

---

## 27 — Math OCR & LaTeX Export

- Problem: Equations lost or unreadable.
- Plan: Use MathPix or pipeline combining Vision + Math OCR to generate LaTeX; store in equations collection; render via KaTeX and provide MathSpeak TTS mapping.

CLI prompt:

Add math OCR adapter to extract LaTeX and store in MongoDB; add frontend LaTeX editor and export to .tex; create MathSpeak generator to synthesize audio via Google TTS.

Shell test:

```bash
curl -F "file=@equation.png" http://localhost:3000/api/ocr/math
```

Labels: ocr, accessibility

---

## 28 — Table Extraction & CSV/XLSX Export

- Problem: Tables flatten into text.
- Plan: Use Vision table detection + Camelot fallback for complex layouts; store table JSON in document_tables, offer interactive editor and CSV/XLSX export.

CLI prompt:

Add table extraction worker (Vision + Camelot fallback), store table JSON, add /api/documents/:id/tables/:tid/export?format=csv and frontend editor to correct table extraction.

Shell test:

```bash
python scripts/extract_tables.py /tmp/doc.pdf --out /tmp/tables.json
```

Labels: ocr, data

---

## 29 — Batch Processing & Progress

- Problem: Bulk uploads block UI or fail.
- Plan: Add batches and batch_items; process items via BullMQ worker; SSE or WS for progress and retry/resume support.

CLI prompt:

Implement batch API storing batch & items in MongoDB, worker to process each item from BullMQ and send SSE updates; add retry/resume endpoints.

Shell test:

```bash
curl -X POST http://localhost:3000/api/batches -d '{"files":["gs://.../a.pdf"]}'
```

Labels: jobs

---

## 30 — Worker Separation & Autoscaling (Cloud Run)

- Problem: Heavy tasks block web processes.
- Plan: Split web and worker into separate Cloud Run services; autoscale workers based on Redis queue depth (Cloud Monitoring metrics) and set priority queues for premium users.

CLI prompt:

Create worker Dockerfile and Cloud Run deploy manifests; add Cloud Monitoring-based autoscale policy reading Redis queue depth and scaling worker service.

Shell test:

```bash
gcloud run deploy vision-worker --image=IMAGE --region=us-central1
```

Labels: infra, gcp

---

## 31 — Search Ranking Improvements (signal-driven)

- Problem: Search relevance poor.
- Plan: Add impression/click logging, compute CTR and adjust ranking with admin-tunable weights; run experiments by enabling alternate scoring via Vertex model.

CLI prompt:

Add search_signals collection, hooks in search UI to emit impressions & clicks, modify server ranking to apply weights from config, and add admin UI to tune weights and run experiments.

Shell test:

```bash
mongosh "$MONGODB_URI" --eval 'db.search_signals.find().limit(5).pretty()'
```

Labels: search, analytics

---

## 32 — Tamper-evident Audit Logging

- Problem: Audit trail mutable or incomplete.
- Plan: Append-only audit_logs with chained hashes, admin export/verification tool to verify integrity.

CLI prompt:

Add audit_logs with hash chaining on write and provide script verify_audit_chain.js to validate chain integrity; expose admin export endpoint for audits.

Shell test:

```bash
node scripts/verify_audit_chain.js
```

Labels: compliance, security

---

## 33 — Accessible PDF Viewer + OCR Mapping

- Problem: Viewer not accessible.
- Plan: Make overlays keyboard-focusable with ARIA, provide "read block" that triggers Google TTS streaming and add skip-links and landmarks.

CLI prompt:

Update PDF viewer overlay to include ARIA attributes on OCR blocks, add keyboard focus navigation, and wire 'Read block' to TTS streaming endpoint.

Shell test:

```bash
npm run dev --prefix frontend
```

Labels: accessibility, frontend

---

## 34 — Handwriting HWR + Feedback Loop

- Problem: HWR accuracy needs human correction.
- Plan: Route low-confidence HWR outputs to hwr_feedback for human correction, provide annotation UI for quick fixes and opt-in for dataset collection.

CLI prompt:

Add hwr_feedback collection and annotator UI; enqueue low-confidence HWR outputs into review queue and persist corrections to a training dataset collection.

Shell test:

```bash
mongosh "$MONGODB_URI" --eval 'db.hwr_feedback.find().limit(5).pretty()'
```

Labels: mlops, ocr

---

## 35 — MathSpeak & Equation Accessibility

- Problem: Math not read accessibly.
- Plan: Convert LaTeX to MathSpeak rules to generate spoken forms and synthesize with Google TTS. Provide UI to listen per-equation.

CLI prompt:

Implement MathSpeak conversion for LaTeX snippets and synthesize via Google TTS; add UI 'Read equation' on equation blocks.

Shell test:

```bash
curl -X POST http://localhost:3000/api/math/read -d '{"latex":"E=mc^2"}' --output eq.mp3
```

Labels: accessibility, ocr

---

## 36 — Robust Table Extraction + Editor

- Problem: Complex table layouts fail.
- Plan: Use Vision + Camelot fallback, store multiple candidates, let users pick/correct in UI, then export.

CLI prompt:

Implement combined extractor storing candidates; add UI to choose and correct table candidate and endpoint to export corrected table to CSV/XLSX.

Shell test:

```bash
python scripts/extract_tables.py /tmp/doc.pdf
```

Labels: ocr, ux

---

## 37 — Batch Upload Resume & Monitoring

- Problem: Bulk jobs unreliable.
- Plan: Provide resume via GCS partial uploads, SSE progress, and retry/monitor UI for admin.

CLI prompt:

Add resume endpoints referencing partial GCS uploads, SSE progress for batch jobs, and admin UI listing batch statuses and retry actions.

Shell test:

```bash
curl -X POST http://localhost:3000/api/batches -d '{"files":["gs://..../a.pdf"]}'
```

Labels: jobs, operations

---

## 38 — Priority Queues & Worker Autoscale

- Problem: No premium priority on job queues.
- Plan: Partition BullMQ queues (premium/free), autoscale worker pools by queue depth, set throttling for free tier.

CLI prompt:

Add premium & free queues setup, autoscale config via Cloud Monitoring to scale worker pools, and middleware that routes tasks into appropriate queue based on user plan.

Shell test:

```bash
redis-cli -h $REDIS_HOST LLEN bull:queue:premium
```

Labels: infra, billing

---

## 39 — Streaming Assistant Tokens & Job Progress

- Problem: Synchronous assistant responses only.
- Plan: Use SSE/WebSocket to stream partial tokens from Vertex text generation and publish progress from workers via Redis Pub/Sub. Provide fallback polling.

CLI prompt:

Implement SSE/WS relay subscribing to Redis channels; modify assistant to call Vertex text endpoint streaming partial tokens into Redis channel which the relay streams to client.

Shell test:

```bash
websocat ws://localhost:3000/ws
```

Labels: realtime, firebase-ai

---

## 40 — Rate Limit Headers & Client Retry

- Problem: 429 responses lack retry guidance.
- Plan: Add Redis-backed rate-limiter that sets X-RateLimit-* and Retry-After; update SDKs to parse headers and back off gracefully. Per-plan quotas enforced via middleware.

CLI prompt:

Add rate-limiter-flexible Redis middleware to add X-RateLimit-Limit/Remaining/Reset and Retry-After headers; update client axios interceptor to respect headers and perform exponential backoff.

Shell test:

```bash
for i in {1..200}; do curl -I http://localhost:3000/api/translate; done
```

Labels: api, security

---

## 41 — Premium Voice Profiles & Consent (TTS)

- Problem: No voice profiles nor consent gating.
- Plan: user_voice_profiles collection; preview and save via Google TTS; explicit consents records required for voice cloning or sensitive TTS. Cache audio in GCS and enforce quotas.

CLI prompt:

Add user_voice_profiles and consents collections, preview & save endpoints for Google TTS, and require recorded consent before voice cloning endpoints.

Shell test:

```bash
curl -X POST http://localhost:3000/api/voices/preview -d '{"text":"Hello","voice":"en-US-Wavenet-D"}' --output preview.mp3
```

Labels: tts, privacy

---

## 42 — Summarization + Provenance (Vertex AI)

- Problem: Summaries hallucinate/no provenance.
- Plan: Retrieval-augmented summarization: retrieve top-k chunks, call Vertex text generation with an instruction to cite chunk ids. Return summary variants (short/medium/long) with provenance & confidence scoring (LLM-based QA).

CLI prompt:

Create summarization pipeline: retrieve top-k chunks, build prompt template to instruct Vertex text model to summarize and cite chunk ids, and return confidence; implement caching.

Shell test:

```bash
curl -X POST http://localhost:3000/api/summarize -d '{"docId":123, "length":"short"}'
```

Labels: ai, firebase-ai

---

## 43 — Semantic Diff & Redline Export (LLM-assisted using Vertex)

- Problem: Diffs are literal only.
- Plan: Compute literal diffs and call Vertex AI to classify semantic impact and produce human-readable explanations. Export redline DOCX/PDF with annotations.

CLI prompt:

Add semantic-diff service that runs diff-match-patch, then calls Vertex text model to classify change severity and generate explanations; add export to DOCX.

Shell test:

```bash
node scripts/semantic_diff.js --left v1.docx --right v2.docx
```

Labels: ai, docs

---

## 44 — Fine-Grained Quotas & Dashboard

- Problem: No per-feature quotas.
- Plan: Track per-feature usage in usage_counters and enforce via middleware; show dashboard for usage and thresholds; allow admins to set per-org limits.

CLI prompt:

Add usage_counters collection, quota middleware that atomically increments counters and rejects requests when over limit; create user/admin dashboard endpoints.

Shell test:

```bash
mongosh "$MONGODB_URI" --eval 'db.usage_counters.find({userId:"u1"}).pretty()'
```

Labels: billing

---

## 45 — Enterprise SSO (OIDC via IdP) & SCIM

- Problem: No enterprise SSO or provisioning.
- Plan: Support OIDC (and SAML if required) plus SCIM v2 for provisioning; store per-org SSO config, implement audit logging for provisioning actions.

CLI prompt:

Add OIDC adapter (openid-client), SCIM v2 endpoints for provisioning, and store org SSO configs in MongoDB; log provisioning events to audit_logs.

Shell test:

```bash
curl -v "http://localhost:3000/auth/oidc/login?org=acme"
```

Labels: enterprise, auth

---

## 46 — Admin Kill-Switch & Emergency Pause

- Problem: No emergency pause for expensive ops.
- Plan: Admin admin_settings flags like ai_enabled/tts_enabled. Middleware checks flags. Add auto-pause based on spend forecasts.

CLI prompt:

Add admin_settings collection and middleware checking flags; create admin UI toggle and cost monitoring job to auto-pause services when threshold exceeded.

Shell test:

```bash
mongosh "$MONGODB_URI" --eval 'db.admin_settings.find().pretty()'
```

Labels: ops, billing

---

## 47 — Developer SDKs & API Keys Portal

- Problem: No SDKs or API key management.
- Plan: Generate SDKs from openapi.yaml, implement api_keys with scopes and rate-limits. Provide portal for API key management and usage per key.

CLI prompt:

Generate TypeScript/Python SDKs from openapi.yaml, add api_keys collection with scopes/limits, and add portal endpoints to create/revoke keys and view usage.

Shell test:

```bash
npx @openapitools/openapi-generator-cli generate -i openapi.yaml -g typescript-axios -o sdk/js
```

Labels: developer, api

---

## 48 — Accessibility Certification Roadmap (WCAG 2.1 AA)

- Problem: Accessibility gaps exist.
- Plan: Run automated axe scans and manual expert audit; remediate top items; add CI accessibility checks; document accessibility practices.

CLI prompt:

Run axe CLI on workspace, produce top violations, and generate remediation patches for highest-impact issues; add axe check in CI.

Shell test:

```bash
npx axe-cli http://localhost:5173/workspace
```

Labels: accessibility, frontend

---

## 49 — Data Export & Deletion (GDPR) — DSAR

- Problem: No DSAR endpoint or deletion flow.
- Plan: Implement user-initiated export job to assemble user data into zip on GCS, deletion_requests with grace period and legal_holds enforcement. Admin UI to monitor.

CLI prompt:

Add /api/users/:id/export-data to enqueue export job that assembles data & packages into GCS zip; add deletion request flow honoring legal_holds and admin UI.

Shell test:

```bash
curl -X POST http://localhost:3000/api/users/u123/export-data
```

Labels: compliance, privacy

---

## 50 — End-to-End Tests (Playwright) in CI

- Problem: No E2E coverage in CI.
- Plan: Add Playwright tests covering signup, upload→OCR→translate→tts→assistant; CI job to spin up test services and run stable tests with seeded fixtures.

CLI prompt:

Create Playwright tests for core flows and a GitHub Action to spin test environment (docker-compose or ephemeral Cloud Run) and run tests headless.

Shell test:

```bash
npx playwright test
```

Labels: testing, ci

---

> Note: Items 51–100 will be appended in this file following the same structure (Problem/Plan, Firebase AI / CLI prompt, Shell test, Labels).

---

## 51 — Secret Manager & Config Hardening (GCP)

- Problem: Secrets in env files; config drift.
- Plan: Move sensitive configs to Google Secret Manager; load at boot with caching; add configuration schema validation (zod) and fallbacks for local dev.

CLI prompt:

Wire Google Secret Manager client; create config loader that fetches secrets (Stripe keys, SMTP, JWT secrets, service account JSON), caches in memory, validates with zod; update README to remove plaintext secrets.

Shell test:

```bash
node -e "require('./scripts/print_config').print(['STRIPE_SECRET','JWT_SECRET'])"
```

Labels: security, infra

---

## 52 — Least-Privilege IAM & Service Accounts

- Problem: Over-broad permissions on Cloud Run and buckets.
- Plan: Create scoped service accounts per service (web, worker); grant minimal roles for GCS, Pub/Sub (if used), Secret Manager, and Logging.

CLI prompt:

Add IaC or scripts to create service accounts and bind roles; update Cloud Run deploy to use those identities; document required roles.

Shell test:

```bash
gcloud run services describe vision-platform --region=us-central1 --format=json | jq '.spec.template.spec.serviceAccountName'
```

Labels: security, gcp

---

## 53 — Tracing & Logging (OpenTelemetry → Cloud Trace/Logging)

- Problem: Hard to debug latency; logs unstructured.
- Plan: Add OpenTelemetry SDK, pino structured logs, request IDs; export traces to Cloud Trace and logs to Cloud Logging with correlation.

CLI prompt:

Integrate OTel Node SDK with HTTP, MongoDB, and Redis instrumentations; emit pino logs with trace/span ids; add log fields for userId, orgId, plan.

Shell test:

```bash
curl -I http://localhost:3000/healthz
# Check Cloud Trace for recent spans
```

Labels: observability, gcp

---

## 54 — Error Monitoring & Source Maps (Sentry)

- Problem: Errors lack stack context in prod.
- Plan: Integrate Sentry for server and frontend, upload source maps in CI; keep DSN in Secret Manager.

CLI prompt:

Add Sentry init in server and frontend builds; configure CI to upload source maps; mask PII in breadcrumbs and events.

Shell test:

```bash
curl http://localhost:3000/admin/test-error
```

Labels: monitoring, frontend, backend

---

## 55 — Request Logging & Correlation IDs

- Problem: Inconsistent request tracing.
- Plan: Add middleware to inject/request X-Request-Id, propagate to downstream calls (Mongo, Redis, Vertex), and include in logs and responses.

CLI prompt:

Create express middleware for request id; update axios/fetch wrappers to forward header; add response header.

Shell test:

```bash
curl -I http://localhost:3000/readyz | grep -i x-request-id
```

Labels: observability

---

## 56 — Cloud Profiler & Debugger

- Problem: CPU/memory hot spots unknown in prod.
- Plan: Enable Cloud Profiler; guard with env flags and exclude local dev.

CLI prompt:

Initialize @google-cloud/profiler in server startup when enabled; document setup and expected overhead.

Shell test:

```bash
echo "Verify profiles appear in Cloud Profiler UI"
```

Labels: performance, gcp

---

## 57 — GCS Lifecycle, Versioning, and KMS (CMEK)

- Problem: Buckets lack lifecycle rules and CMEK.
- Plan: Enable object versioning for critical buckets; add lifecycle to expire temp/preview audio; encrypt with KMS key.

CLI prompt:

Add bucket config scripts for lifecycle JSON, enable versioning, bind KMS key to bucket; update upload code to set storage class.

Shell test:

```bash
gsutil lifecycle get gs://vision-storage
```

Labels: storage, security

---

## 58 — Field-Level Encryption for PII (MongoDB CSFLE)

- Problem: PII stored unencrypted.
- Plan: Use MongoDB Client-Side Field Level Encryption (CSFLE) with KMS; encrypt fields like emails, tokens, addresses.

CLI prompt:

Add CSFLE config with GCP KMS; define JSON schema for encrypted fields; migrate existing documents.

Shell test:

```bash
node scripts/verify_csfle.js --collection users --field email
```

Labels: security, mongodb

---

## 59 — PII Redaction in Logs & Prompts

- Problem: Logs and LLM prompts may include PII.
- Plan: Add redaction utilities; scrub PII before logging and before sending to Vertex models; add allowlist-based prompt filters.

CLI prompt:

Create redactPII util; hook into logger and AI adapter; add tests covering edge cases.

Shell test:

```bash
node -e "console.log(require('./lib/redact').redact('User email: a@b.com'))"
```

Labels: privacy, ai

---

## 60 — Prompt Templates & Registry (Firebase AI/Vertex)

- Problem: Prompts scattered and unversioned.
- Plan: Centralize prompt templates with versions and metadata; run via Vertex; expose admin UI to edit and A/B.

CLI prompt:

Create prompt_templates collection; add loader and renderer; support variables and guards; log usage and versions per call.

Shell test:

```bash
curl -X POST http://localhost:3000/api/prompts/preview -d '{"name":"translate","vars":{"lang":"es"}}'
```

Labels: ai, backend

---

## 61 — Experiment Tracking (LLM Prompt/Model)

- Problem: No experiment metadata.
- Plan: Track runs with inputs, outputs, model, temperature, cost, latency; compare in UI.

CLI prompt:

Add experiments collection; instrument AI adapter to write run records; add simple compare endpoint.

Shell test:

```bash
mongosh "$MONGODB_URI" --eval 'db.experiments.find().limit(1).pretty()'
```

Labels: ai, analytics

---

## 62 — Feature Flags & Safe Rollouts

- Problem: Risky deploys; no gating.
- Plan: Add feature_flags collection and middleware; SDK for frontend; support percentage rollouts and org/user targeting.

CLI prompt:

Build flag evaluation util; add admin endpoints; wire critical features behind flags.

Shell test:

```bash
curl http://localhost:3000/api/flags/evaluate?flag=tts_beta&user=u1
```

Labels: ops, frontend, backend

---

## 63 — Blue/Green & Canary (Cloud Run Revisions)

- Problem: All traffic to new versions instantly.
- Plan: Use Cloud Run traffic splitting; add staged rollouts with quick rollback.

CLI prompt:

Add deploy script to set 5/20/50/100% traffic to new revision; document rollback steps.

Shell test:

```bash
gcloud run services describe vision-platform --region=us-central1 --format=json | jq '.status.traffic'
```

Labels: deploy, gcp

---

## 64 — Autoscaling & Concurrency Tuning

- Problem: Under/over-provisioned Cloud Run instances.
- Plan: Tune concurrency per endpoint type; set min/max instances; set CPU always on for workers if needed.

CLI prompt:

Update Cloud Run service YAML; document recommended settings for web vs worker.

Shell test:

```bash
gcloud run services describe vision-worker --region=us-central1 --format=json | jq '.spec.template.spec.containerConcurrency'
```

Labels: performance, gcp

---

## 65 — Cost Monitoring & Budgets

- Problem: Costs can spike unnoticed.
- Plan: Set GCP budgets and alerts; track per-feature usage and estimated cost; show dashboard.

CLI prompt:

Add cost_estimates collection; cron to aggregate usage→cost; surface admin widget.

Shell test:

```bash
mongosh "$MONGODB_URI" --eval 'db.cost_estimates.find().limit(1).pretty()'
```

Labels: ops, billing

---

## 66 — Schedulers & Crons (Cloud Scheduler → HTTPS)

- Problem: Ad-hoc cron scripts.
- Plan: Use Cloud Scheduler to invoke secure HTTPS endpoints for nightly jobs (ETL, cleanup, re-embeddings).

CLI prompt:

Create /admin/jobs/* endpoints with auth; add scheduler configs; verify idempotency.

Shell test:

```bash
curl -H "Authorization: Bearer <admin>" http://localhost:3000/admin/jobs/reindex
```

Labels: ops, gcp

---

## 67 — Web Security (CSP, CORS, CSRF, Helmet)

- Problem: Missing security headers and CSRF protection.
- Plan: Add helmet with strict CSP, rate CORS origins, CSRF tokens for mutating routes, and cookie hardening.

CLI prompt:

Integrate helmet; configure CSP (script-src nonce/hash); add CSRF middleware for HTML forms; secure cookies.

Shell test:

```bash
curl -I http://localhost:3000 | grep -Ei "content-security-policy|x-frame-options|x-content-type-options"
```

Labels: security, web

---

## 68 — Supply Chain & Vulnerability Scanning

- Problem: Outdated deps slip through.
- Plan: Enable Dependabot; add npm audit CI gate; add container scanning (gcloud or Trivy).

CLI prompt:

Add GitHub config for Dependabot; add CI jobs for npm audit and Trivy on Docker image.

Shell test:

```bash
trivy fs --exit-code 0 --severity HIGH,CRITICAL .
```

Labels: security, ci

---

## 69 — Secret Scanning (Pre-commit & CI)

- Problem: Secret leaks to git history.
- Plan: Add pre-commit hook and CI step using gitleaks; block pushes with detected secrets.

CLI prompt:

Add gitleaks.toml; configure Husky pre-commit; add CI job to run gitleaks.

Shell test:

```bash
gitleaks detect --no-git -v
```

Labels: security, ci

---

## 70 — Frontend Performance Budgets & Lighthouse CI

- Problem: Regressions in TTI/LCP unnoticed.
- Plan: Add Lighthouse CI with budgets; block PRs on regressions; optimize images and code-splitting.

CLI prompt:

Add lighthouserc.json; CI job to run lhci against preview; add budgets file.

Shell test:

```bash
npx lhci autorun
```

Labels: frontend, performance

---

## 71 — PWA: Offline & Installable

- Problem: Poor offline experience.
- Plan: Add service worker with Workbox, cache strategies for shell/content; add manifest and install prompts.

CLI prompt:

Integrate Workbox build; add manifest.json; handle update flow and cache busting.

Shell test:

```bash
# Open app in Chrome, check Application → Service Workers
```

Labels: frontend, ux

---

## 72 — Internationalization (i18n)

- Problem: UI not localized.
- Plan: Add i18n framework (react-intl or i18next); externalize strings; translation pipeline using Firebase AI for drafts + human review.

CLI prompt:

Scaffold i18n provider, extract strings, seed locales; add translation review UI.

Shell test:

```bash
npm run i18n:scan --prefix frontend
```

Labels: frontend, i18n

---

## 73 — Accessibility Tests (axe/jest-axe)

- Problem: A11y regressions slip in.
- Plan: Add jest-axe tests for key pages and CI gate; add storybook a11y addon if using Storybook.

CLI prompt:

Create basic axe tests for Workspace and PDF viewer; integrate into CI.

Shell test:

```bash
npx jest -t "accessibility"
```

Labels: accessibility, testing

---

## 74 — Orchestrated OCR Pipelines (Workflows)

- Problem: Multi-step OCR jobs hard to monitor.
- Plan: Use Google Workflows to orchestrate GCS upload → Vision async → store results → notify; keep Redis queue for app tasks.

CLI prompt:

Add workflow YAML; add callback endpoint; document state transitions.

Shell test:

```bash
gcloud workflows run ocr-pipeline --data='{"gcsUri":"gs://bucket/doc.pdf"}'
```

Labels: ocr, gcp

---

## 75 — Signed URLs & ACLs for Documents

- Problem: Direct GCS access not controlled.
- Plan: Generate V4 signed URLs for uploads/downloads; enforce org/user ACLs in Mongo; log access.

CLI prompt:

Add endpoints to mint signed URLs; check ACL before issuing; add audit log entry.

Shell test:

```bash
curl -X POST http://localhost:3000/api/storage/signed-url -d '{"docId":"d1","action":"read"}'
```

Labels: security, storage

---

> Note: Items 76–100 will be appended in this file following the same structure (Problem/Plan, Firebase AI / CLI prompt, Shell test, Labels).
