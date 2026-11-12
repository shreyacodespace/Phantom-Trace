# Setup checklist (what only you can do)
Order matters. Each step adds one capability. The dashboard "Integrations" card shows which are connected.

1. GitHub + Vercel: push this folder to a GitHub repo, import it at vercel.com/new. The site works now with temporary in-memory storage and no login.
2. Database (Neon Postgres): Vercel project > Storage > create Neon Postgres > connect. Vercel adds DATABASE_URL by itself. The table is created on first use.
3. Login: Settings > Environment Variables. Add SESSION_SECRET (32+ random characters), ADMIN_PASSWORD, ANALYST_PASSWORD. Pick your own passwords. None are shipped.
4. Grok (optional): add XAI_API_KEY from console.x.ai, GROK_MODEL (a model name your account can use), and GROK_BASE_URL only if you use another OpenAI-compatible provider. Check xAI's current pricing: the API may need paid credits.
5. Neo4j (optional): create an Aura Free instance at console.neo4j.io. Add NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD, NEO4J_DATABASE.
6. Redeploy. Environment variables only apply to new deployments.
7. Sign in as admin, press "Load NEXUS demo case", then run each module. Confirm all four Integrations rows show a tick.

## What is real and what is synthetic
Real: Ed25519 signing and verification, SHA-256, salted selective disclosure; PDF/EXIF/text scanning of files you upload; the policy engine and masking in the test app; decoy rules and the Isolation Forest; the risk formula; correlation; Postgres/Neo4j storage; login, roles, audit log.
Synthetic on purpose: the NEXUS demo case (only loaded when you press the button); the three test users and six components in Phantom Data (it tracks only that built-in app); issuer keys, derived from fixed demo strings (never use for real credentials); Deception Lab visitor simulations; the ML training baseline; the Afterimage sample text.
Not built: per-user workspaces (everyone shares one), Redis Streams, blockchain audit, Python/FastAPI service, a geographic threat map (the demo data has no locations).
