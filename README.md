# AI Content Pipeline

A multi-agent system that generates blog posts using four specialized AI agents: Researcher, Writer, Fact-Checker, and Polisher.

## Why I Built This

I wanted to understand how to coordinate multiple AI agents in a pipeline where each one has a specific job. The interesting problem isn't "get an LLM to write a blog post" — it's building the orchestration layer that handles handoffs between agents, implements retry logic when the fact-checker catches errors, and maintains an audit trail of every decision.

## How It Works

```
                         ┌─────────────────┐
                         │   User Input    │
                         │  (PRD / Topic)  │
                         └────────┬────────┘
                                  │
                    ┌─────────────▼────────────────┐
                    │    Pipeline Orchestrator     │
                    │  (Coordinates all agents)    │
                    └─────────────┬────────────────┘
                                  │
        ┌─────────────────────────┼──────────────────────────┐
        │                         │                          │
┌───────▼────────┐      ┌────────▼────────┐      ┌─────────▼────────┐
│ RESEARCHER     │      │ WRITER          │      │ FACT-CHECKER     │
│                │──────►                 │──────►                  │
│ Extract topics │      │ Generate draft  │      │ Validate claims  │
│ via LLM, then  │      │ using research  │      │ against research │
│ search Tavily  │      │ as context      │      │ (triggers retry  │
│                │      │                 │      │  if issues found)│
└────────────────┘      └─────────────────┘      └──────────┬───────┘
                                                            │
                                                  ┌─────────▼────────┐
                                                  │ POLISHER         │
                                                  │                  │
                                                  │ Grammar, tone,   │
                                                  │ clarity fixes    │
                                                  │ (no fact changes)│
                                                  └─────────┬────────┘
                                                            │
                                                  ┌─────────▼────────┐
                                                  │  Final Output    │
                                                  └──────────────────┘
```

The fact-checker is the key piece. It compares the draft against the research findings and identifies unsupported claims. If it finds issues, the orchestrator sends feedback back to the writer agent for revision (max 2 retries). This catches hallucinations before they make it to the final output.

## Tech Stack

- **Next.js 14** — App Router, API routes for orchestration
- **TypeScript** — Agent coordination and state management
- **Google Gemini 2.0 Flash** — Powers all four agents
- **Tavily API** — Web search (returns LLM-friendly summaries, unlike raw Google results)
- **Supabase** — PostgreSQL for logging every agent action with timestamps

## Getting Started

**Prerequisites:** Node.js 18+, API keys for Gemini, Tavily, and Supabase (all have free tiers)

```bash
git clone https://github.com/tacitusblindsbig/ai-content-pipeline
cd ai-content-pipeline
npm install

cp .env.local.example .env.local
# Add your keys:
#   GOOGLE_API_KEY
#   TAVILY_API_KEY
#   NEXT_PUBLIC_SUPABASE_URL
#   NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Set up the database in Supabase SQL Editor:

```sql
CREATE TABLE agent_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_id UUID NOT NULL,
  agent_name TEXT NOT NULL,
  input_data TEXT,
  output_data TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_agent_logs_run_id ON agent_logs(run_id);
```

Then `npm run dev` and open `http://localhost:3000`.

## What I Learned

The hardest part was deciding what to do when fact-checking fails repeatedly. My first instinct was to block publication entirely, but that's not practical — sometimes the LLM just disagrees with itself about whether a claim is "supported." I settled on logging a warning and proceeding after 2 retries. It's a tradeoff between quality guarantees and actually producing output. If I rebuilt this, I'd add a human review queue for posts that fail fact-checking instead of auto-publishing them with a warning.

---

**Nishad Dhakephalkar** · [GitHub](https://github.com/tacitusblindsbig) · ndhakeph@gmail.com
