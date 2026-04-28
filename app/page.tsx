import Link from "next/link";

const steps = [
  {
    number: "01",
    title: "Describe or upload",
    description: "Paste text from a letter, upload a document, or describe your situation in plain English.",
  },
  {
    number: "02",
    title: "AI analyses it",
    description: "Our AI reads the legal content and identifies your key rights, obligations, and deadlines under UK law.",
  },
  {
    number: "03",
    title: "Get clear guidance",
    description: "Receive a plain-English breakdown of exactly what the document means for you — no jargon.",
  },
  {
    number: "04",
    title: "Take action",
    description: "Know what steps to take next, with links to official UK government resources and guidance.",
  },
];

const legalAreas = [
  { name: "Housing", icon: "🏠", description: "Eviction, deposits & repairs" },
  { name: "Employment", icon: "💼", description: "Dismissal, contracts & rights" },
  { name: "Debt & Bailiffs", icon: "💷", description: "CCJs, enforcement & debt" },
  { name: "Consumer Rights", icon: "🛍️", description: "Refunds, contracts & scams" },
  { name: "Fines", icon: "📄", description: "Parking, council & penalties" },
  { name: "Neighbour Disputes", icon: "🏘️", description: "Boundaries, noise & access" },
  { name: "Benefits & Council Tax", icon: "🏛️", description: "Appeals, reductions & claims" },
  { name: "Small Claims", icon: "⚖️", description: "Court process & evidence" },
  { name: "Family Law", icon: "👪", description: "Divorce, custody & support" },
  { name: "Immigration", icon: "🌍", description: "Visas, rights & status" },
  { name: "Business & Contracts", icon: "📋", description: "Disputes, terms & liability" },
  { name: "Criminal Rights", icon: "🛡️", description: "Police, arrest & defence" },
];

const trustBadges = ["Free to use", "Based on UK law", "No registration required", "No data stored"];

// ─── WRAPPER — consistent padding across all sections ─────────────────────────
function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`max-w-6xl mx-auto px-5 sm:px-10 lg:px-16 ${className}`}>
      {children}
    </div>
  );
}

export default function Home() {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#f8f7f3", fontFamily: "var(--font-dm-sans), sans-serif" }}
    >

      {/* ── NAVBAR ────────────────────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 border-b"
        style={{ backgroundColor: "rgba(248,247,243,0.96)", backdropFilter: "blur(10px)", borderColor: "#e5e2db" }}
      >
        <div style={{ maxWidth: "1152px", margin: "0 auto", padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#0f6e56" }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
            <span className="text-lg font-semibold" style={{ fontFamily: "var(--font-playfair), serif", color: "#0f6e56" }}>
              LegalClear UK
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {[{ label: "Legal Areas", href: "#legal-areas" }, { label: "Find a Solicitor", href: "/solicitors" }, { label: "How it works", href: "#how-it-works" }].map(l => (
              <a key={l.label} href={l.href} className="text-sm font-medium transition-colors hover:text-green-700" style={{ color: "#4a4a4a" }}>
                {l.label}
              </a>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:inline-flex text-sm font-medium transition-colors hover:text-green-700" style={{ color: "#4a4a4a" }}>
              Sign in
            </Link>
            <Link
              href="/analyse"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#0f6e56" }}
            >
              Get Help
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ──────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 70% at 70% 50%, rgba(15,110,86,0.07) 0%, transparent 70%)" }}
        />

        <div className="py-14 sm:py-20 lg:py-28" style={{ textAlign: "center" }}>

          {/* Badge */}
          <div
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", borderRadius: "999px", fontSize: "13px", fontWeight: 500, backgroundColor: "rgba(15,110,86,0.1)", color: "#0f6e56", marginBottom: "24px" }}
          >
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#0f6e56", display: "inline-block" }} />
            Free AI-Powered Legal Guidance — UK
          </div>

          {/* Headline */}
          <h1
            style={{ fontFamily: "var(--font-playfair), serif", color: "#1c1c1c", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: "20px", fontSize: "clamp(2.4rem, 5vw, 4rem)" }}
          >
            Understand any legal notice in{" "}
            <span style={{ color: "#0f6e56" }}>plain English</span>
          </h1>

          <p style={{ fontSize: "clamp(1rem, 1.5vw, 1.2rem)", color: "#4a4a4a", lineHeight: 1.7, marginBottom: "36px", maxWidth: "560px", marginLeft: "auto", marginRight: "auto" }}>
            Received a confusing letter from a landlord, employer, or bailiff?
            Our AI breaks it down clearly — no jargon, no lawyers required.
          </p>

          {/* PRIMARY CTA */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
            <Link
              href="/analyse"
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "12px",
                padding: "16px 32px", borderRadius: "16px", fontSize: "18px", fontWeight: 700,
                color: "#fff", backgroundColor: "#0f6e56", textDecoration: "none",
                boxShadow: "0 6px 28px rgba(15,110,86,0.38)", transition: "opacity 0.2s, transform 0.2s",
              }}
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
              </svg>
              Analyse a Document — It&apos;s Free
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>

          {/* Perks */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "6px 20px", fontSize: "14px", color: "#6b6b6b" }}>
            {["No account needed", "Instant results", "Based on UK law"].map(perk => (
              <span key={perk} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#0f6e56" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {perk}
              </span>
            ))}
          </div>

        </div>
      </section>

      {/* ── LEGAL AREAS ───────────────────────────────────────────────────────── */}
      <section id="legal-areas" style={{ backgroundColor: "#ffffff", padding: "80px 0" }}>
        <div style={{ maxWidth: "1152px", margin: "0 auto", padding: "0 40px" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2 style={{ fontFamily: "var(--font-playfair), serif", fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 700, color: "#1c1c1c", marginBottom: "12px" }}>
              Legal areas we cover
            </h2>
            <p style={{ fontSize: "1.05rem", color: "#4a4a4a", maxWidth: "480px", margin: "0 auto", lineHeight: 1.6 }}>
              Pick your situation — we&apos;ll show relevant examples instantly.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {legalAreas.map(area => (
              <Link
                key={area.name}
                href={`/analyse?area=${encodeURIComponent(area.name)}`}
                className="rounded-xl border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 block"
                style={{ borderColor: "#e5e2db", backgroundColor: "#f8f7f3", padding: "20px" }}
              >
                <div style={{ fontSize: "2rem", marginBottom: "10px" }}>{area.icon}</div>
                <h3 style={{ fontWeight: 600, fontSize: "0.95rem", color: "#1c1c1c", marginBottom: "4px" }}>{area.name}</h3>
                <p style={{ fontSize: "0.75rem", color: "#6b6b6b", lineHeight: 1.5 }}>{area.description}</p>
              </Link>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "40px" }}>
            <Link
              href="/analyse"
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "16px 32px", borderRadius: "16px", fontSize: "17px", fontWeight: 700, color: "#fff", backgroundColor: "#0f6e56", textDecoration: "none", boxShadow: "0 6px 24px rgba(15,110,86,0.3)" }}
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
              </svg>
              Analyse a Document — It&apos;s Free →
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ backgroundColor: "#f8f7f3", padding: "80px 0" }}>
        <div style={{ maxWidth: "1152px", margin: "0 auto", padding: "0 40px" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <h2 style={{ fontFamily: "var(--font-playfair), serif", fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 700, color: "#1c1c1c", marginBottom: "12px" }}>
              How it works
            </h2>
            <p style={{ fontSize: "1.05rem", color: "#4a4a4a", maxWidth: "480px", margin: "0 auto", lineHeight: 1.6 }}>
              From confusing document to clear action plan — in minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-6">
            {steps.map((step, index) => (
              <div key={step.number} style={{ position: "relative" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                  <div style={{ width: "56px", height: "56px", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: 700, backgroundColor: "rgba(15,110,86,0.1)", color: "#0f6e56", fontFamily: "var(--font-playfair), serif", marginBottom: "20px" }}>
                    {step.number}
                  </div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#1c1c1c", marginBottom: "8px" }}>{step.title}</h3>
                  <p style={{ fontSize: "0.875rem", color: "#4a4a4a", lineHeight: 1.65 }}>{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "56px" }}>
            <Link
              href="/analyse"
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "16px 32px", borderRadius: "16px", fontSize: "17px", fontWeight: 700, color: "#fff", backgroundColor: "#0f6e56", textDecoration: "none", boxShadow: "0 6px 24px rgba(15,110,86,0.3)" }}
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
              </svg>
              Analyse a Document — It&apos;s Free →
            </Link>
          </div>
        </div>
      </section>

      {/* ── SOLICITORS BANNER ─────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: "#ffffff", padding: "64px 0" }}>
        <div style={{ maxWidth: "1152px", margin: "0 auto", padding: "0 40px" }}>
          <div style={{ backgroundColor: "#0f6e56", borderRadius: "20px", padding: "48px 56px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "28px" }}>
            <div style={{ maxWidth: "560px" }}>
              <h2 style={{ fontFamily: "var(--font-playfair), serif", fontSize: "clamp(1.4rem, 2.5vw, 1.9rem)", fontWeight: 700, color: "#fff", marginBottom: "10px" }}>
                Need a professional solicitor?
              </h2>
              <p style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.82)", lineHeight: 1.65 }}>
                Browse verified UK solicitors by legal area and location. Send your case documents directly from your dashboard.
              </p>
            </div>
            <Link
              href="/solicitors"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "14px 28px", borderRadius: "12px", fontSize: "15px", fontWeight: 700, color: "#fff", border: "2px solid #fff", textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0 }}
            >
              Find a Solicitor →
            </Link>
          </div>
        </div>
      </section>

      {/* ── TRUST / DISCLAIMER ────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: "#0f6e56", padding: "64px 0" }}>
        <div style={{ maxWidth: "640px", margin: "0 auto", padding: "0 40px", textAlign: "center" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <h2 style={{ fontFamily: "var(--font-playfair), serif", fontSize: "clamp(1.4rem, 2.5vw, 1.9rem)", fontWeight: 700, color: "#fff", marginBottom: "16px" }}>
            Legal information, not legal advice
          </h2>
          <p style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.85)", lineHeight: 1.75, marginBottom: "28px" }}>
            LegalClear UK provides general legal information to help you understand your situation.
            We are not a law firm and do not provide regulated legal advice. For complex matters,
            always consult a qualified solicitor or contact Citizens Advice.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "6px 20px", fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>
            {trustBadges.map(badge => (
              <span key={badge} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────────── */}
      <footer style={{ backgroundColor: "#111111", padding: "40px 0 48px" }}>
        <div style={{ maxWidth: "1152px", margin: "0 auto", padding: "0 40px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: "40px", paddingBottom: "40px", borderBottom: "1px solid #1e1e1e" }}>
            <div style={{ maxWidth: "280px" }}>
              <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", textDecoration: "none" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#0f6e56" }}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>
                <span style={{ fontFamily: "var(--font-playfair), serif", fontSize: "14px", fontWeight: 600, color: "#e5e5e5" }}>LegalClear UK</span>
              </Link>
              <p style={{ fontSize: "12px", color: "#555", lineHeight: 1.7 }}>
                Free AI-powered legal guidance for UK residents. Understand your rights without the jargon.
              </p>
            </div>

            <div style={{ display: "flex", gap: "40px", flexWrap: "wrap" }}>
              {[
                { heading: "Product", links: [{ label: "Analyse a Document", href: "/analyse" }, { label: "Find a Solicitor", href: "/solicitors" }, { label: "How it works", href: "#how-it-works" }] },
                { heading: "Account", links: [{ label: "Sign In", href: "/login" }, { label: "Register", href: "/register" }, { label: "Dashboard", href: "/dashboard" }] },
                { heading: "Solicitors", links: [{ label: "Register Practice", href: "/solicitors/register" }, { label: "Directory", href: "/solicitors" }] },
              ].map(col => (
                <div key={col.heading}>
                  <p style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#555", marginBottom: "16px" }}>{col.heading}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {col.links.map(l => (
                      <a key={l.label} href={l.href} style={{ fontSize: "14px", color: "#888", textDecoration: "none" }}>{l.label}</a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px", paddingTop: "32px" }}>
            <p style={{ fontSize: "12px", color: "#444" }}>© {new Date().getFullYear()} LegalClear UK. For information purposes only.</p>
            <div style={{ display: "flex", alignItems: "center", gap: "20px", fontSize: "12px", color: "#444" }}>
              <a href="/privacy" style={{ color: "#444", textDecoration: "none" }}>Privacy Policy</a>
              <a href="/about" style={{ color: "#444", textDecoration: "none" }}>About</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
