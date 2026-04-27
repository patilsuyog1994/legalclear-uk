"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  SOLICITORS, LEGAL_AREAS, JURISDICTIONS, distanceMiles,
  type Solicitor, type LegalArea, type Jurisdiction,
} from "@/lib/solicitorData";
import SendPackModal from "@/app/components/SendPackModal";

const PAGE_SIZE = 12;

/* Leaflet map loaded client-side only */
const SolicitorMap = dynamic(() => import("./SolicitorMap"), { ssr: false });

/* ── Star rating ── */
function Stars({ rating }: { rating: number }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}>
      {[1, 2, 3, 4, 5].map((n) => {
        const fill = rating >= n ? "#f59e0b" : rating >= n - 0.5 ? "url(#half)" : "#d1d5db";
        return (
          <svg key={n} width="14" height="14" viewBox="0 0 24 24" fill={fill}>
            <defs>
              <linearGradient id="half">
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="50%" stopColor="#d1d5db" />
              </linearGradient>
            </defs>
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        );
      })}
    </span>
  );
}

/* ── Legal area pill ── */
function AreaPill({ label }: { label: string }) {
  return (
    <span style={{
      display: "inline-block", padding: "2px 10px", borderRadius: "999px",
      backgroundColor: "#e8f4f0", color: "#0f6e56", fontSize: "11px", fontWeight: 600,
    }}>
      {label}
    </span>
  );
}

/* ── Solicitor card ── */
function SolicitorCard({
  solicitor, distance, isHighlighted, isLoggedIn, hasCases,
  onMouseEnter, onMouseLeave, onSendPack,
}: {
  solicitor:    Solicitor;
  distance:     number | null;
  isHighlighted: boolean;
  isLoggedIn:   boolean;
  hasCases:     boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onSendPack:   () => void;
}) {
  const s = solicitor;
  return (
    <div
      id={`card-${s.id}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        backgroundColor: "#fff",
        borderRadius:    "12px",
        border:          `2px solid ${isHighlighted ? "#0f6e56" : "#e5e0d8"}`,
        padding:         "20px",
        display:         "flex",
        flexDirection:   "column",
        gap:             "12px",
        transition:      "border-color 0.15s, box-shadow 0.15s",
        boxShadow:       isHighlighted ? "0 0 0 3px rgba(15,110,86,0.15)" : "0 1px 4px rgba(0,0,0,0.06)",
        scrollMarginTop: "80px",
      }}
    >
      {/* Header */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
          <p style={{ fontFamily: "var(--font-playfair,'Playfair Display',serif)", fontSize: "16px", fontWeight: 700, color: "#1c1c1c", margin: 0, lineHeight: 1.3 }}>
            {s.firmName}
          </p>
          <span style={{ fontSize: "11px", color: "#aaa", flexShrink: 0, marginTop: "2px" }}>SRA {s.sraNumber}</span>
        </div>
        <p style={{ fontSize: "13px", color: "#555", margin: "4px 0 0" }}>{s.solicitorName}</p>
      </div>

      {/* Location */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0f6e56" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
        </svg>
        <span style={{ fontSize: "13px", color: "#555" }}>
          {s.city}
          {distance !== null && (
            <span style={{ color: "#0f6e56", fontWeight: 600 }}> — {distance.toFixed(1)} miles</span>
          )}
        </span>
      </div>

      {/* Legal areas */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {s.legalAreas.map((a) => <AreaPill key={a} label={a} />)}
      </div>

      {/* Rating */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Stars rating={s.rating} />
        <span style={{ fontSize: "13px", color: "#555" }}>
          <strong style={{ color: "#1c1c1c" }}>{s.rating.toFixed(1)}</strong>
          <span style={{ color: "#aaa" }}> ({s.reviewCount} reviews)</span>
        </span>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "8px", marginTop: "auto", flexWrap: "wrap" }}>
        <button
          style={{
            flex: 1, minWidth: "120px", padding: "9px 14px", borderRadius: "8px",
            border: "1px solid #0f6e56", backgroundColor: "#fff", color: "#0f6e56",
            fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f0faf6"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#fff"}
          onClick={() => window.open(s.website, "_blank")}
        >
          View Profile
        </button>

        {isLoggedIn && (
          <button
            style={{
              flex: 1, minWidth: "140px", padding: "9px 14px", borderRadius: "8px",
              border: "none", backgroundColor: "#0f6e56", color: "#fff",
              fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#0a5242"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#0f6e56"}
            onClick={onSendPack}
          >
            Send Case Pack
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Pagination ── */
function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  const pages = Math.ceil(total / PAGE_SIZE);
  if (pages <= 1) return null;
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "32px", flexWrap: "wrap" }}>
      <button
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #e5e0d8", backgroundColor: page === 1 ? "#f8f7f3" : "#fff", color: page === 1 ? "#bbb" : "#333", cursor: page === 1 ? "not-allowed" : "pointer", fontSize: "13px", fontWeight: 600, fontFamily: "inherit" }}
      >← Prev</button>
      {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          style={{ width: "38px", height: "38px", borderRadius: "8px", border: `1px solid ${p === page ? "#0f6e56" : "#e5e0d8"}`, backgroundColor: p === page ? "#0f6e56" : "#fff", color: p === page ? "#fff" : "#333", cursor: "pointer", fontSize: "13px", fontWeight: 600, fontFamily: "inherit" }}
        >{p}</button>
      ))}
      <button
        disabled={page === pages}
        onClick={() => onChange(page + 1)}
        style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #e5e0d8", backgroundColor: page === pages ? "#f8f7f3" : "#fff", color: page === pages ? "#bbb" : "#333", cursor: page === pages ? "not-allowed" : "pointer", fontSize: "13px", fontWeight: 600, fontFamily: "inherit" }}
      >Next →</button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════ */

function matchLegalArea(raw: string): LegalArea | "" {
  if (!raw) return "";
  const lower = raw.toLowerCase();
  return (LEGAL_AREAS.find(a => lower.includes(a.toLowerCase())) ?? "") as LegalArea | "";
}

export default function SolicitorsClient({
  isLoggedIn, hasCases,
}: {
  isLoggedIn: boolean;
  hasCases:   boolean;
}) {
  const searchParams = useSearchParams();
  const urlPostcode = searchParams.get("postcode") ?? "";
  const urlArea     = matchLegalArea(searchParams.get("area") ?? "");

  /* ── Search form state ── */
  const [postcode,    setPostcode]    = useState(urlPostcode);
  const [legalArea,   setLegalArea]   = useState<LegalArea | "">(urlArea);
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction | "">("");
  const [searching,   setSearching]   = useState(false);

  /* ── Search result state ── */
  const [searchLat,   setSearchLat]   = useState<number | null>(null);
  const [searchLng,   setSearchLng]   = useState<number | null>(null);
  const [searched,    setSearched]    = useState(false);
  const [geoError,    setGeoError]    = useState<string | null>(null);

  /* ── UI state ── */
  const [hoveredId,    setHoveredId]    = useState<string | null>(null);
  const [highlightId,  setHighlightId]  = useState<string | null>(null);
  const [page,         setPage]         = useState(1);
  const [modalSolicitor, setModalSolicitor] = useState<Solicitor | null>(null);

  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  /* ── Supabase solicitors (fetched on mount, merged with mock) ── */
  const [allSolicitors, setAllSolicitors] = useState<Solicitor[]>(SOLICITORS);

  useEffect(() => {
    fetch("/api/solicitors/verified")
      .then(r => r.json())
      .then(json => {
        if (Array.isArray(json.solicitors) && json.solicitors.length > 0) {
          /* Prepend real Supabase records; keep mock data for demo purposes */
          setAllSolicitors([...json.solicitors, ...SOLICITORS]);
        }
      })
      .catch(() => { /* keep mock data on failure */ });
  }, []);

  /* Auto-geocode if postcode came from URL params */
  useEffect(() => {
    if (!urlPostcode) return;
    async function autoSearch() {
      setSearching(true);
      try {
        const clean = urlPostcode.trim().replace(/\s+/g, "").toUpperCase();
        const res  = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(clean)}`);
        const json = await res.json();
        if (json.status === 200) {
          setSearchLat(json.result.latitude);
          setSearchLng(json.result.longitude);
        } else {
          const res2  = await fetch(`https://api.postcodes.io/outcodes/${encodeURIComponent(clean)}`);
          const json2 = await res2.json();
          if (json2.status === 200) {
            setSearchLat(json2.result.latitude);
            setSearchLng(json2.result.longitude);
          }
        }
      } catch { /* silent */ } finally {
        setSearching(false);
        setSearched(true);
      }
    }
    autoSearch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Handle pin click → scroll + highlight card ── */
  const handlePinClick = useCallback((id: string) => {
    setHighlightId(id);
    const el = document.getElementById(`card-${id}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => setHighlightId(null), 2000);
  }, []);

  /* ── Geocode postcode via postcodes.io ── */
  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!postcode.trim()) return;
    setSearching(true);
    setGeoError(null);
    setPage(1);
    try {
      const clean = postcode.trim().replace(/\s+/g, "").toUpperCase();
      const res   = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(clean)}`);
      const json  = await res.json();
      if (json.status === 200) {
        setSearchLat(json.result.latitude);
        setSearchLng(json.result.longitude);
      } else {
        /* Try outcode (e.g. "SW1") */
        const res2  = await fetch(`https://api.postcodes.io/outcodes/${encodeURIComponent(clean)}`);
        const json2 = await res2.json();
        if (json2.status === 200) {
          setSearchLat(json2.result.latitude);
          setSearchLng(json2.result.longitude);
        } else {
          setGeoError("Postcode not found. Please check and try again.");
          setSearchLat(null);
          setSearchLng(null);
        }
      }
    } catch {
      setGeoError("Could not geocode postcode. Please check your connection.");
      setSearchLat(null);
      setSearchLng(null);
    } finally {
      setSearching(false);
      setSearched(true);
      /* Fire-and-forget search event for admin stats */
      fetch("/api/admin/log-search", { method: "POST" }).catch(() => {});
    }
  }

  /* ── Distance helper ── */
  const withDistance = useCallback((s: Solicitor): number | null => {
    if (searchLat === null || searchLng === null) return null;
    return distanceMiles(searchLat, searchLng, s.lat, s.lng);
  }, [searchLat, searchLng]);

  /* ── Filter + sort ── */
  const filtered = useMemo(() => {
    let list = [...allSolicitors];
    if (legalArea)    list = list.filter(s => s.legalAreas.includes(legalArea as LegalArea));
    if (jurisdiction) list = list.filter(s =>
      s.jurisdiction === jurisdiction ||
      (Array.isArray(s.jurisdictions) && s.jurisdictions.includes(jurisdiction))
    );
    if (searchLat !== null && searchLng !== null) {
      list.sort((a, b) =>
        distanceMiles(searchLat, searchLng, a.lat, a.lng) -
        distanceMiles(searchLat, searchLng, b.lat, b.lng)
      );
    }
    return list;
  }, [allSolicitors, legalArea, jurisdiction, searchLat, searchLng]);

  const paginated = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  );

  /* ── Input styles ── */
  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 16px", borderRadius: "10px",
    border: "1px solid #d1d5db", fontSize: "14px", fontFamily: "inherit",
    backgroundColor: "#fff", color: "#1c1c1c", outline: "none",
    boxSizing: "border-box",
  };
  const selectStyle: React.CSSProperties = { ...inputStyle, cursor: "pointer", appearance: "none" };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f7f3", fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)" }}>

      {/* ── Nav ── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, backgroundColor: "rgba(248,247,243,0.96)", backdropFilter: "blur(10px)", borderBottom: "1px solid #e5e0d8", padding: "0 48px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
          <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="8" fill="#0f6e56" />
            <path d="M20 8L28 13V20C28 25.5 24 30.2 20 32C16 30.2 12 25.5 12 20V13L20 8Z" fill="white" fillOpacity="0.9" />
            <path d="M17 20L19 22L23 18" stroke="#0f6e56" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontFamily: "var(--font-playfair,'Playfair Display',serif)", fontSize: "20px", fontWeight: 700, color: "#1c1c1c" }}>
            LegalClear <span style={{ color: "#0f6e56" }}>UK</span>
          </span>
        </Link>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          {isLoggedIn
            ? <Link href="/dashboard" style={{ fontSize: "14px", fontWeight: 600, color: "#555", textDecoration: "none" }}>Dashboard</Link>
            : <>
                <Link href="/login"    style={{ fontSize: "14px", fontWeight: 600, color: "#555", textDecoration: "none" }}>Sign in</Link>
                <Link href="/register" style={{ padding: "8px 18px", borderRadius: "8px", backgroundColor: "#0f6e56", color: "#fff", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}>Get started</Link>
              </>
          }
        </div>
      </nav>

      {/* ── Hero / Search ── */}
      <div style={{ backgroundColor: "#0f6e56", padding: "48px 24px 56px" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.6)", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 12px" }}>
            Find a Solicitor
          </p>
          <h1 style={{ fontFamily: "var(--font-playfair,'Playfair Display',serif)", fontSize: "clamp(28px,5vw,42px)", fontWeight: 700, color: "#fff", margin: "0 0 12px", lineHeight: 1.2 }}>
            Connect with a local solicitor
          </h1>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.75)", margin: "0 0 32px", lineHeight: 1.6 }}>
            Find SRA-registered solicitors near you, filtered by the law area you need.
          </p>

          {/* Search form */}
          <form onSubmit={handleSearch} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {/* Postcode */}
              <div style={{ flex: "2 1 220px", position: "relative" }}>
                <input
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  placeholder="Enter your postcode or town (e.g. SW1A 1AA)"
                  style={{ ...inputStyle, paddingLeft: "44px" }}
                  aria-label="Postcode or town"
                />
                <svg style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
              </div>

              {/* Legal area */}
              <div style={{ flex: "1 1 180px", position: "relative" }}>
                <select
                  value={legalArea}
                  onChange={(e) => { setLegalArea(e.target.value as LegalArea | ""); setPage(1); }}
                  style={selectStyle}
                  aria-label="Legal area"
                >
                  <option value="">All legal areas</option>
                  {LEGAL_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <svg style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
              </div>

              {/* Jurisdiction */}
              <div style={{ flex: "1 1 180px", position: "relative" }}>
                <select
                  value={jurisdiction}
                  onChange={(e) => { setJurisdiction(e.target.value as Jurisdiction | ""); setPage(1); }}
                  style={selectStyle}
                  aria-label="Jurisdiction"
                >
                  <option value="">All jurisdictions</option>
                  {JURISDICTIONS.map(j => <option key={j} value={j}>{j}</option>)}
                </select>
                <svg style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
            </div>

            <button
              type="submit"
              disabled={searching || !postcode.trim()}
              style={{
                padding: "13px 32px", borderRadius: "10px", border: "none",
                backgroundColor: searching || !postcode.trim() ? "rgba(255,255,255,0.4)" : "#fff",
                color: searching || !postcode.trim() ? "rgba(0,0,0,0.4)" : "#0f6e56",
                fontSize: "15px", fontWeight: 700, cursor: searching || !postcode.trim() ? "not-allowed" : "pointer",
                fontFamily: "inherit", transition: "all 0.15s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", alignSelf: "stretch",
              }}
            >
              {searching ? (
                <><span style={{ display: "inline-block", width: "16px", height: "16px", border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "#0f6e56", borderRadius: "50%", animation: "lc-spin 0.7s linear infinite" }} /> Searching…</>
              ) : (
                <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> Search solicitors</>
              )}
            </button>
          </form>

          {/* Trust note */}
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", margin: "16px 0 0", lineHeight: 1.6 }}>
            All solicitors listed are registered with the Solicitors Regulation Authority. LegalClear UK does not charge for listings and does not accept referral fees.
          </p>

          {geoError && (
            <p style={{ fontSize: "13px", color: "#fca5a5", margin: "12px 0 0", fontWeight: 600 }}>⚠️ {geoError}</p>
          )}
        </div>
      </div>

      {/* ── Results ── */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* Result count */}
        {(searched || legalArea || jurisdiction) && (
          <p style={{ fontSize: "14px", color: "#555", marginBottom: "24px" }}>
            {filtered.length > 0
              ? <><strong style={{ color: "#1c1c1c" }}>{filtered.length}</strong> solicitor{filtered.length !== 1 ? "s" : ""} found{legalArea ? ` for ${legalArea}` : ""}{searchLat ? ", sorted by distance" : ""}</>
              : null
            }
          </p>
        )}

        {/* Layout: map sidebar + results grid */}
        <div style={{ display: "flex", gap: "32px", alignItems: "flex-start" }}>

          {/* Map — sticky sidebar, hidden on mobile */}
          <div className="solicitor-map-sidebar" style={{ width: "380px", flexShrink: 0, position: "sticky", top: "80px", height: "560px", borderRadius: "12px", overflow: "hidden", border: "1px solid #e5e0d8" }}>
            <SolicitorMap
              solicitors={paginated}
              withDistance={withDistance}
              hoveredId={hoveredId}
              onPinClick={handlePinClick}
              searchLat={searchLat}
              searchLng={searchLng}
            />
          </div>

          {/* Cards */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {filtered.length === 0 && (searched || legalArea || jurisdiction) ? (
              <div style={{ textAlign: "center", padding: "64px 24px", backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #e5e0d8" }}>
                <div style={{ fontSize: "40px", marginBottom: "16px" }}>🔍</div>
                <p style={{ fontSize: "17px", fontWeight: 700, color: "#1c1c1c", margin: "0 0 8px" }}>
                  No solicitors found in your area for this legal area
                </p>
                <p style={{ fontSize: "14px", color: "#777", margin: "0 0 24px", lineHeight: 1.6 }}>
                  Try expanding your search or visit the Law Society website.
                </p>
                <a
                  href="https://solicitors.lawsociety.org.uk"
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 24px", borderRadius: "8px", backgroundColor: "#0f6e56", color: "#fff", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}
                >
                  Visit the Law Society →
                </a>
              </div>
            ) : filtered.length === 0 ? (
              /* Initial state — no search yet */
              <div style={{ textAlign: "center", padding: "64px 24px" }}>
                <div style={{ fontSize: "40px", marginBottom: "16px" }}>⚖️</div>
                <p style={{ fontSize: "17px", fontWeight: 700, color: "#1c1c1c", margin: "0 0 8px" }}>Search for solicitors above</p>
                <p style={{ fontSize: "14px", color: "#777", lineHeight: 1.6 }}>Enter your postcode and select a legal area to find SRA-registered solicitors near you.</p>
              </div>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}
                  ref={(el) => { cardRefs.current = new Map(); if (el) { /* reset */ } }}
                >
                  {paginated.map((s) => (
                    <SolicitorCard
                      key={s.id}
                      solicitor={s}
                      distance={withDistance(s)}
                      isHighlighted={hoveredId === s.id || highlightId === s.id}
                      isLoggedIn={isLoggedIn}
                      hasCases={hasCases}
                      onMouseEnter={() => setHoveredId(s.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      onSendPack={() => setModalSolicitor(s)}
                    />
                  ))}
                </div>
                <Pagination page={page} total={filtered.length} onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Solicitor CTA footer */}
      <div style={{ background: "#f0ece6", borderTop: "1px solid #e5e0d8", padding: "28px 40px", textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>
          Are you a solicitor?{" "}
          <Link href="/solicitors/register" style={{ color: "#0f6e56", fontWeight: 600, textDecoration: "underline" }}>
            List your firm for free
          </Link>
          {" "}— no referral fees, no subscription.
        </p>
      </div>

      {/* Send Pack Modal */}
      {modalSolicitor && (
        <SendPackModal
          solicitor={modalSolicitor}
          isLoggedIn={isLoggedIn}
          onClose={() => setModalSolicitor(null)}
        />
      )}

      {/* ── Global styles ── */}
      <style>{`
        @keyframes lc-spin { to { transform: rotate(360deg); } }

        /* Hide map sidebar on mobile, show full-width list */
        @media (max-width: 768px) {
          .solicitor-map-sidebar { display: none !important; }
        }

        /* Leaflet popup overrides */
        .leaflet-popup-content-wrapper {
          border-radius: 10px !important;
          font-family: var(--font-dm-sans, 'DM Sans', sans-serif) !important;
          font-size: 13px !important;
        }
      `}</style>
    </div>
  );
}
