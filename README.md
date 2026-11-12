# PHANTOM TRACE
Next.js 14 · TypeScript · Tailwind · Cytoscape · ECharts · Neon Postgres. All demo data is synthetic.

## Run locally
    npm install
    cp .env.example .env.local      # everything is optional locally
    npm run dev                     # http://localhost:3000
Without DATABASE_URL findings live in memory. Without SESSION_SECRET there is no login.

## Deploy to Vercel
1. Push this folder to a GitHub repo, then import it at vercel.com/new (framework: Next.js).
2. Project > Storage > create a Neon Postgres database and connect it. Vercel adds DATABASE_URL.
3. Project > Settings > Environment Variables, add:
   - SESSION_SECRET: a long random string (run `openssl rand -hex 32`)
   - ADMIN_PASSWORD and ANALYST_PASSWORD: passwords you choose. No default passwords exist.
   - XAI_API_KEY (optional), plus GROK_MODEL and GROK_BASE_URL if you use another provider.
4. Redeploy. Sign in as admin, press "Load NEXUS demo case", then walk each module.

## Demo flow
Dashboard > Afterimage (use the synthetic sample) > Trustless (issue ROGUE-CA, verify) > Phantom Data (run) > Deception Lab (login burst) > Investigation graph > Reports > Print / Save as PDF.

## What is simulated
Everything runs on synthetic records or files you upload yourself. Deception Lab is an isolated decoy. No external system is ever scanned.
Not built: Neo4j, FastAPI backend, ML anomaly model, blockchain audit, per-user workspaces, login rate limiting.

## Neo4j (optional)
Create a free Aura instance at console.neo4j.io, then set NEO4J_URI (neo4j+s://...), NEO4J_USER, NEO4J_PASSWORD (and NEO4J_DATABASE if not "neo4j") in Vercel. The Investigation graph page then syncs findings into Neo4j (nodes labelled PT, only those are ever deleted) and ranks the most connected entities with Cypher. The app talks to Neo4j's HTTPS Query API, so it needs an Aura 5.x instance. Without these variables it computes the same ranking locally.

## ML
lib/ml.ts is an Isolation Forest written from scratch and trained on a synthetic baseline of ordinary decoy sessions. It adds an anomaly score per source in Deception Lab and raises a finding only when no rule fired. It is a demo model and gets better only with real session data.
