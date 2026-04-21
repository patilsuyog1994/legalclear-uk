import Link from "next/link";

// ─── DATA ────────────────────────────────────────────────────────────────────

const steps = [
  {
    number: "01",
    title: "Describe or upload",
    description:
      "Paste text from a letter, upload a document, or describe your situation in plain English.",
  },
  {
    number: "02",
    title: "AI analyses it",
    description:
      "Our AI reads the legal content and identifies your key rights, obligations, and deadlines under UK law.",
  },
  {
    number: "03",
    title: "Get clear guidance",
    description:
      "Receive a plain-English breakdown of exactly what the document means for you — no jargon.",
  },
  {
    number: "04",
    title: "Take action",
    description:
      "Know what steps to take next, with links to official UK government resources and guidance.",
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

const trustBadges = [
  "Free to use",
  "Based on UK law",
  "No registration required",
  "No data stored",
];

const heroPerks = ["No account needed", "Instant results", "Based on UK law"];

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#f8f7f3", fontFamily: "var(--font-dm-sans), sans-serif" }}
    >
      {/* ── NAVBAR ──────────────────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 border-b"
        style={{
          backgroundColor: "rgba(248, 247, 243, 0.96)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          borderColor: "#e5e2db",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "#0f6e56" }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="white"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                  />
                </svg>
              </div>
              <span
                className="text-lg font-semibold"
                style={{ fontFamily: "var(--font-playfair), serif", color: "#0f6e56" }}
              >
                LegalClear UK
              </span>
            </Link>

            {/* CTA */}
            <Link
              href="/analyse"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#0f6e56" }}
            >
              Get Help
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Subtle radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 65% 40%, rgba(15,110,86,0.07) 0%, transparent 70%)",
          }}
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 lg:py-36">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-medium mb-8"
              style={{ backgroundColor: "rgba(15,110,86,0.1)", color: "#0f6e56" }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: "#0f6e56" }}
              />
              Free AI-Powered Legal Guidance for UK Residents
            </div>

            {/* Headline */}
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-6"
              style={{ fontFamily: "var(--font-playfair), serif", color: "#1c1c1c" }}
            >
              Understand any legal notice in plain English
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl leading-relaxed mb-10" style={{ color: "#4a4a4a" }}>
              Received a confusing letter from a landlord, employer, or bailiff?
              Our AI breaks it down clearly — no jargon, no lawyers required.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/analyse"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-medium text-white transition-all hover:opacity-90 active:scale-95"
                style={{
                  backgroundColor: "#0f6e56",
                  boxShadow: "0 4px 14px rgba(15,110,86,0.3)",
                }}
              >
                Analyse a Document
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <a
                href="#how-it-works"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-medium border transition-all hover:bg-white"
                style={{ color: "#0f6e56", borderColor: "#0f6e56" }}
              >
                See How It Works
              </a>
            </div>

            {/* Perks strip */}
            <div
              className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm"
              style={{ color: "#6b6b6b" }}
            >
              {heroPerks.map((perk) => (
                <span key={perk} className="flex items-center gap-1.5">
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="#0f6e56"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {perk}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 md:py-24" style={{ backgroundColor: "#ffffff" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2
              className="text-3xl sm:text-4xl font-bold mb-4"
              style={{ fontFamily: "var(--font-playfair), serif", color: "#1c1c1c" }}
            >
              How it works
            </h2>
            <p className="text-base sm:text-lg max-w-xl mx-auto" style={{ color: "#4a4a4a" }}>
              From confusing document to clear action plan — in minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                {/* Connecting line (desktop only) */}
                {index < steps.length - 1 && (
                  <div
                    className="hidden lg:block absolute top-7 z-0"
                    style={{
                      left: "3.75rem",
                      right: "-1.5rem",
                      height: "1px",
                      backgroundColor: "#e5e2db",
                    }}
                  />
                )}
                <div className="relative z-10">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold mb-5"
                    style={{
                      backgroundColor: "rgba(15,110,86,0.1)",
                      color: "#0f6e56",
                      fontFamily: "var(--font-playfair), serif",
                    }}
                  >
                    {step.number}
                  </div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: "#1c1c1c" }}>
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#4a4a4a" }}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LEGAL AREAS ─────────────────────────────────────────────────────── */}
      <section id="legal-areas" className="py-20 md:py-24" style={{ backgroundColor: "#f8f7f3" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2
              className="text-3xl sm:text-4xl font-bold mb-4"
              style={{ fontFamily: "var(--font-playfair), serif", color: "#1c1c1c" }}
            >
              Legal areas we cover
            </h2>
            <p className="text-base sm:text-lg max-w-xl mx-auto" style={{ color: "#4a4a4a" }}>
              From housing disputes to criminal rights — across 12 key areas of UK law.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {legalAreas.map((area) => (
              <Link
                key={area.name}
                href="/analyse"
                className="bg-white rounded-xl p-4 sm:p-5 border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 block"
                style={{ borderColor: "#e5e2db" }}
              >
                <div className="text-2xl sm:text-3xl mb-3">{area.icon}</div>
                <h3 className="font-semibold text-sm sm:text-base mb-1" style={{ color: "#1c1c1c" }}>
                  {area.name}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: "#6b6b6b" }}>
                  {area.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST / DISCLAIMER ──────────────────────────────────────────────── */}
      <section className="py-16 md:py-20" style={{ backgroundColor: "#0f6e56" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Shield icon */}
          <div
            className="w-14 h-14 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
          >
            <svg
              className="w-7 h-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="white"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
          </div>

          <h2
            className="text-2xl sm:text-3xl font-bold text-white mb-5"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Legal information, not legal advice
          </h2>
          <p
            className="text-base sm:text-lg leading-relaxed mb-8"
            style={{ color: "rgba(255,255,255,0.85)" }}
          >
            LegalClear UK provides general legal information to help you understand your situation.
            We are not a law firm and do not provide regulated legal advice. For complex matters,
            or where significant rights are at stake, we always recommend consulting a qualified
            solicitor or contacting Citizens Advice.
          </p>

          {/* Trust badges */}
          <div
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm"
            style={{ color: "rgba(255,255,255,0.75)" }}
          >
            {trustBadges.map((badge) => (
              <span key={badge} className="flex items-center gap-1.5">
                <svg
                  className="w-3.5 h-3.5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="py-10" style={{ backgroundColor: "#111111" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "#0f6e56" }}
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="white"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                  />
                </svg>
              </div>
              <span
                className="text-sm font-semibold"
                style={{ fontFamily: "var(--font-playfair), serif", color: "#e5e5e5" }}
              >
                LegalClear UK
              </span>
            </Link>

            {/* Footer links */}
            <div className="flex items-center gap-5 text-sm" style={{ color: "#6b6b6b" }}>
              <Link href="/analyse" className="hover:text-white transition-colors">
                Analyse
              </Link>
              <Link href="/about" className="hover:text-white transition-colors">
                About
              </Link>
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy
              </Link>
            </div>

            {/* Copyright */}
            <p className="text-xs text-center sm:text-right" style={{ color: "#4a4a4a" }}>
              © {new Date().getFullYear()} LegalClear UK.{" "}
              <br className="sm:hidden" />
              For information purposes only.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
