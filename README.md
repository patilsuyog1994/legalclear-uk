# LegalClear UK

An AI-powered tool that helps people in the UK understand their legal rights in plain English. Paste a description of your situation or upload a legal notice — the app explains what it means, what your rights are, and what to do next.

---

## Features

- **Plain English Analysis** — Claude AI explains any legal notice or situation clearly
- **Multiple Law Areas** — Housing, Employment, Debt, Consumer Rights, Family Law, Immigration, and more
- **UK Jurisdictions** — England & Wales, Scotland, or Northern Ireland
- **Urgency Indicator** — High / Medium / Low urgency rating with reasoning
- **Action Steps** — Numbered steps telling you exactly what to do
- **Draft Response Letter** — A ready-to-personalise letter you can send
- **File Upload** — Upload PDF, JPG, PNG, or TXT documents directly
- **Saved Cases** — Create a free account to save and revisit analyses
- **Feedback** — Rate each analysis with thumbs up / thumbs down
- **Mobile Responsive** — Works on phones, tablets, and desktops

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| AI | Claude Opus via Anthropic API |
| Database & Auth | Supabase (PostgreSQL + Row Level Security) |
| Styling | Tailwind CSS v4 + inline React styles |
| Fonts | Playfair Display + DM Sans (Google Fonts) |

---

## Getting Started

### Prerequisites
- Node.js 18 or higher
- An [Anthropic API key](https://console.anthropic.com)
- A [Supabase](https://supabase.com) project

### 1. Clone the repository

```bash
git clone https://github.com/your-username/legalclear-uk.git
cd legalclear-uk
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Where to get these values:**
- **Anthropic API key** → [console.anthropic.com](https://console.anthropic.com) → API Keys
- **Supabase URL & Anon Key** → [supabase.com](https://supabase.com) → your project → Settings → API

### 4. Set up the Supabase database

Run the following SQL in your Supabase **SQL Editor**:

```sql
create table cases (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  created_at timestamptz default now(),
  law_type text not null,
  urgency_level text not null,
  summary_title text not null,
  input_text text,
  full_result jsonb not null
);

-- Enable Row Level Security
alter table cases enable row level security;

-- Users can only see and manage their own cases
create policy "Users manage their own cases"
  on cases for all
  using (auth.uid() = user_id);
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
legalclear-uk/
├── app/
│   ├── layout.tsx              # Root layout (fonts, metadata)
│   ├── page.tsx                # Landing page
│   ├── globals.css             # Global styles + mobile responsive CSS
│   ├── analyse/
│   │   └── page.tsx            # Main analysis tool (AI input + results)
│   ├── dashboard/
│   │   ├── page.tsx            # Dashboard server component (auth guard)
│   │   └── DashboardClient.tsx # Dashboard UI (saved cases)
│   ├── login/
│   │   └── page.tsx            # Login page
│   ├── register/
│   │   └── page.tsx            # Registration page
│   └── api/
│       ├── analyse/route.ts    # POST — calls Claude AI, returns JSON
│       ├── auth/
│       │   ├── login/route.ts
│       │   ├── register/route.ts
│       │   └── logout/route.ts
│       └── cases/
│           ├── route.ts        # GET list / POST create
│           └── [id]/route.ts   # GET detail / DELETE
├── lib/
│   └── supabase/
│       ├── client.ts           # Browser Supabase client
│       └── server.ts           # Server Supabase client
└── public/                     # Static assets
```

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server at http://localhost:3000 |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Legal Notice

LegalClear UK provides general legal **information** only. It is not a law firm and does not provide regulated legal advice. Always consult a qualified solicitor for advice specific to your situation.

Free UK legal resources:
- [Citizens Advice](https://www.citizensadvice.org.uk)
- [Shelter](https://www.shelter.org.uk) (housing)
- [ACAS](https://www.acas.org.uk) (employment)
- [MoneyHelper](https://www.moneyhelper.org.uk) (debt)
- [Law Society](https://www.lawsociety.org.uk) (find a solicitor)
