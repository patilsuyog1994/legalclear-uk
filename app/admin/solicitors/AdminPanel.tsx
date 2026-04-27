"use client";

import { useEffect, useState, useCallback } from "react";

/* ── Types ───────────────────────────────────────────── */

interface SolicitorRow {
  id: string;
  firm_name: string;
  solicitor_name: string;
  job_title: string;
  sra_number: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  postcode: string;
  legal_areas: string[];
  jurisdictions: string[];
  description: string;
  how_heard: string;
  verified: boolean;
  featured: boolean;
  created_at: string;
}

interface Stats {
  totalSolicitors: number;
  packsThisMonth: number;
  searchesThisMonth: number;
}

/* ── Helpers ─────────────────────────────────────────── */

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/* ── Sub-components ──────────────────────────────────── */

function StatCard({ label, value, icon }: { label: string; value: number | string; icon: string }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e0d8", borderRadius: "12px", padding: "20px 24px", display: "flex", alignItems: "center", gap: "16px" }}>
      <div style={{ fontSize: "28px" }}>{icon}</div>
      <div>
        <div style={{ fontSize: "26px", fontWeight: 700, color: "#1c1c1c", lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>{label}</div>
      </div>
    </div>
  );
}

/* ── Edit Modal ──────────────────────────────────────── */

function EditModal({ row, onClose, onSaved }: { row: SolicitorRow; onClose: () => void; onSaved: (updated: Partial<SolicitorRow>) => void }) {
  const [form, setForm] = useState({
    firm_name: row.firm_name,
    solicitor_name: row.solicitor_name,
    job_title: row.job_title,
    email: row.email,
    phone: row.phone,
    website: row.website,
    address: row.address,
    postcode: row.postcode,
    description: row.description,
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const field = (key: keyof typeof form, label: string, type = "text") => (
    <div style={{ marginBottom: "14px" }}>
      <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#555", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
      {key === "description" ? (
        <textarea
          value={form[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          rows={4}
          style={{ width: "100%", border: "1px solid #d4cfc9", borderRadius: "8px", padding: "8px 12px", fontSize: "14px", boxSizing: "border-box", resize: "vertical", fontFamily: "inherit" }}
        />
      ) : (
        <input
          type={type}
          value={form[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          style={{ width: "100%", border: "1px solid #d4cfc9", borderRadius: "8px", padding: "8px 12px", fontSize: "14px", boxSizing: "border-box" }}
        />
      )}
    </div>
  );

  async function save() {
    setSaving(true);
    setErr("");
    try {
      const res = await fetch(`/api/admin/solicitors/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", data: form }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      onSaved(form);
      onClose();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "560px", maxHeight: "90vh", overflow: "auto", padding: "32px" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>Edit listing</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#888" }}>×</button>
        </div>
        {field("firm_name", "Firm name")}
        {field("solicitor_name", "Solicitor name")}
        {field("job_title", "Job title")}
        {field("email", "Email", "email")}
        {field("phone", "Phone")}
        {field("website", "Website")}
        {field("address", "Address")}
        {field("postcode", "Postcode")}
        {field("description", "Description")}
        {err && <p style={{ color: "#dc2626", fontSize: "13px", margin: "0 0 12px" }}>{err}</p>}
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: "8px", border: "1px solid #d4cfc9", background: "#fff", cursor: "pointer", fontSize: "14px" }}>Cancel</button>
          <button onClick={save} disabled={saving} style={{ padding: "10px 20px", borderRadius: "8px", border: "none", background: "#0f6e56", color: "#fff", cursor: "pointer", fontSize: "14px", fontWeight: 600, opacity: saving ? 0.7 : 1 }}>
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Reject Modal ────────────────────────────────────── */

function RejectModal({ row, onClose, onRejected }: { row: SolicitorRow; onClose: () => void; onRejected: () => void }) {
  const [reason, setReason] = useState("We were unable to verify your SRA registration number against the public register. Please check your SRA number and reapply, or contact us if you believe this is an error.");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function submit() {
    if (!reason.trim()) { setErr("Please enter a reason."); return; }
    setLoading(true);
    setErr("");
    try {
      const res = await fetch(`/api/admin/solicitors/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", reason }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      onRejected();
      onClose();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "480px", padding: "32px" }} onClick={e => e.stopPropagation()}>
        <h2 style={{ margin: "0 0 6px", fontSize: "18px", fontWeight: 700, color: "#dc2626" }}>Reject listing</h2>
        <p style={{ margin: "0 0 20px", fontSize: "14px", color: "#666" }}>
          A rejection email will be sent to <strong>{row.solicitor_name}</strong> at <em>{row.email}</em>. The listing will be deleted.
        </p>
        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#555", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Reason (included in email)</label>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          rows={4}
          style={{ width: "100%", border: "1px solid #d4cfc9", borderRadius: "8px", padding: "10px 12px", fontSize: "14px", boxSizing: "border-box", resize: "vertical", fontFamily: "inherit", marginBottom: "16px" }}
        />
        {err && <p style={{ color: "#dc2626", fontSize: "13px", margin: "0 0 12px" }}>{err}</p>}
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: "8px", border: "1px solid #d4cfc9", background: "#fff", cursor: "pointer", fontSize: "14px" }}>Cancel</button>
          <button onClick={submit} disabled={loading} style={{ padding: "10px 20px", borderRadius: "8px", border: "none", background: "#dc2626", color: "#fff", cursor: "pointer", fontSize: "14px", fontWeight: 600, opacity: loading ? 0.7 : 1 }}>
            {loading ? "Rejecting…" : "Reject & notify"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Panel ──────────────────────────────────────── */

export default function AdminPanel() {
  const [tab, setTab] = useState<"pending" | "active">("pending");
  const [solicitors, setSolicitors] = useState<SolicitorRow[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectRow, setRejectRow] = useState<SolicitorRow | null>(null);
  const [editRow, setEditRow] = useState<SolicitorRow | null>(null);

  const pending = solicitors.filter(s => !s.verified);
  const active  = solicitors.filter(s => s.verified);

  const load = useCallback(async () => {
    setLoading(true);
    const [solRes, statsRes] = await Promise.all([
      fetch("/api/admin/solicitors"),
      fetch("/api/admin/stats"),
    ]);
    if (solRes.ok)   { const j = await solRes.json();   setSolicitors(j.solicitors ?? []); }
    if (statsRes.ok) { const j = await statsRes.json(); setStats(j); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function approve(id: string) {
    setProcessingId(id);
    await fetch(`/api/admin/solicitors/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve" }),
    });
    setSolicitors(prev => prev.map(s => s.id === id ? { ...s, verified: true } : s));
    setProcessingId(null);
  }

  async function toggleFeatured(id: string) {
    setProcessingId(id);
    const res = await fetch(`/api/admin/solicitors/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle_featured" }),
    });
    const json = await res.json();
    if (res.ok) setSolicitors(prev => prev.map(s => s.id === id ? { ...s, featured: json.featured } : s));
    setProcessingId(null);
  }

  async function removeListing(id: string) {
    if (!confirm("Remove this listing permanently?")) return;
    setProcessingId(id);
    await fetch(`/api/admin/solicitors/${id}`, { method: "DELETE" });
    setSolicitors(prev => prev.filter(s => s.id !== id));
    setProcessingId(null);
  }

  const btn = (label: string, onClick: () => void, variant: "primary" | "danger" | "ghost" | "warn", disabled = false) => {
    const bg = { primary: "#0f6e56", danger: "#dc2626", ghost: "#fff", warn: "#f59e0b" }[variant];
    const color = variant === "ghost" ? "#1c1c1c" : "#fff";
    const border = variant === "ghost" ? "1px solid #d4cfc9" : "none";
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        style={{ padding: "6px 12px", borderRadius: "7px", border, background: bg, color, cursor: disabled ? "not-allowed" : "pointer", fontSize: "13px", fontWeight: 600, opacity: disabled ? 0.5 : 1, whiteSpace: "nowrap" }}
      >
        {label}
      </button>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f7f3", fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)" }}>
      {/* Header */}
      <div style={{ background: "#1c1c1c", padding: "20px 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: "11px", color: "#888", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>LegalClear UK</div>
          <div style={{ fontSize: "20px", fontWeight: 700, color: "#fff" }}>Solicitor Admin</div>
        </div>
        <button onClick={load} style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #444", background: "transparent", color: "#ccc", cursor: "pointer", fontSize: "13px" }}>
          ↻ Refresh
        </button>
      </div>

      <div style={{ padding: "32px 40px", maxWidth: "1200px", margin: "0 auto" }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "32px" }}>
          <StatCard label="Total solicitors listed" value={stats?.totalSolicitors ?? "—"} icon="⚖️" />
          <StatCard label="Case packs sent this month" value={stats?.packsThisMonth ?? "—"} icon="📨" />
          <StatCard label="Directory searches this month" value={stats?.searchesThisMonth ?? "—"} icon="🔍" />
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "4px", marginBottom: "24px", background: "#e5e0d8", borderRadius: "10px", padding: "4px", width: "fit-content" }}>
          {(["pending", "active"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "8px 20px", borderRadius: "7px", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 600,
                background: tab === t ? "#fff" : "transparent",
                color: tab === t ? "#1c1c1c" : "#888",
                boxShadow: tab === t ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              }}
            >
              {t === "pending" ? `Pending (${pending.length})` : `Active (${active.length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#888", fontSize: "15px" }}>Loading…</div>
        ) : tab === "pending" ? (

          /* ── Pending tab ── */
          pending.length === 0 ? (
            <div style={{ background: "#fff", border: "1px solid #e5e0d8", borderRadius: "12px", padding: "60px", textAlign: "center" }}>
              <div style={{ fontSize: "36px", marginBottom: "12px" }}>✓</div>
              <p style={{ color: "#888", fontSize: "15px", margin: 0 }}>No pending registrations</p>
            </div>
          ) : (
            <div style={{ background: "#fff", border: "1px solid #e5e0d8", borderRadius: "12px", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8f7f3", borderBottom: "1px solid #e5e0d8" }}>
                    {["Firm", "Solicitor", "SRA Number", "Email", "Submitted", "Actions"].map(h => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pending.map((s, i) => (
                    <tr key={s.id} style={{ borderBottom: i < pending.length - 1 ? "1px solid #f0ece6" : "none" }}>
                      <td style={{ padding: "14px 16px", fontSize: "14px", fontWeight: 600, color: "#1c1c1c" }}>{s.firm_name}</td>
                      <td style={{ padding: "14px 16px", fontSize: "14px", color: "#444" }}>
                        <div>{s.solicitor_name}</div>
                        <div style={{ fontSize: "12px", color: "#888" }}>{s.job_title}</div>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: "13px", fontFamily: "monospace", color: "#1c1c1c" }}>{s.sra_number}</td>
                      <td style={{ padding: "14px 16px", fontSize: "13px", color: "#444" }}>{s.email}</td>
                      <td style={{ padding: "14px 16px", fontSize: "13px", color: "#888", whiteSpace: "nowrap" }}>{fmt(s.created_at)}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          <a
                            href={`https://www.sra.org.uk/consumers/register/organisation/?sraNumber=${s.sra_number}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ padding: "6px 12px", borderRadius: "7px", border: "1px solid #d4cfc9", background: "#fff", color: "#1c1c1c", fontSize: "13px", fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}
                          >
                            Verify SRA ↗
                          </a>
                          {btn("Approve", () => approve(s.id), "primary", processingId === s.id)}
                          {btn("Reject", () => setRejectRow(s), "danger", processingId === s.id)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )

        ) : (

          /* ── Active tab ── */
          active.length === 0 ? (
            <div style={{ background: "#fff", border: "1px solid #e5e0d8", borderRadius: "12px", padding: "60px", textAlign: "center" }}>
              <p style={{ color: "#888", fontSize: "15px", margin: 0 }}>No active listings yet</p>
            </div>
          ) : (
            <div style={{ background: "#fff", border: "1px solid #e5e0d8", borderRadius: "12px", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8f7f3", borderBottom: "1px solid #e5e0d8" }}>
                    {["Firm", "Solicitor", "SRA Number", "Featured", "Actions"].map(h => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {active.map((s, i) => (
                    <tr key={s.id} style={{ borderBottom: i < active.length - 1 ? "1px solid #f0ece6" : "none" }}>
                      <td style={{ padding: "14px 16px", fontSize: "14px", fontWeight: 600, color: "#1c1c1c" }}>
                        <div>{s.firm_name}</div>
                        <div style={{ fontSize: "12px", color: "#888", fontWeight: 400 }}>{s.address}, {s.postcode}</div>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: "14px", color: "#444" }}>
                        <div>{s.solicitor_name}</div>
                        <div style={{ fontSize: "12px", color: "#888" }}>{s.email}</div>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: "13px", fontFamily: "monospace", color: "#1c1c1c" }}>{s.sra_number}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <button
                          onClick={() => toggleFeatured(s.id)}
                          disabled={processingId === s.id}
                          style={{
                            padding: "4px 12px", borderRadius: "20px", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: 700,
                            background: s.featured ? "#fef9c3" : "#f0ece6",
                            color: s.featured ? "#854d0e" : "#888",
                          }}
                        >
                          {s.featured ? "★ Featured" : "☆ Standard"}
                        </button>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", gap: "6px" }}>
                          {btn("Edit", () => setEditRow(s), "ghost")}
                          {btn("Remove", () => removeListing(s.id), "danger", processingId === s.id)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {rejectRow && (
        <RejectModal
          row={rejectRow}
          onClose={() => setRejectRow(null)}
          onRejected={() => setSolicitors(prev => prev.filter(s => s.id !== rejectRow.id))}
        />
      )}

      {editRow && (
        <EditModal
          row={editRow}
          onClose={() => setEditRow(null)}
          onSaved={(updated) => setSolicitors(prev => prev.map(s => s.id === editRow.id ? { ...s, ...updated } : s))}
        />
      )}

      <style>{`
        @media (max-width: 768px) {
          table { font-size: 12px; }
          th, td { padding: 10px 8px !important; }
        }
      `}</style>
    </div>
  );
}
