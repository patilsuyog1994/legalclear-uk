"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f7f3", fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif", display: "flex", flexDirection: "column" }}>
      {/* Navbar */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, backgroundColor: "rgba(248,247,243,0.96)", backdropFilter: "blur(10px)", borderBottom: "1px solid #e5e0d8", padding: "0 48px", height: "64px", display: "flex", alignItems: "center" }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
          <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="8" fill="#0f6e56" />
            <path d="M20 8L28 13V20C28 25.5 24 30.2 20 32C16 30.2 12 25.5 12 20V13L20 8Z" fill="white" fillOpacity="0.9" />
            <path d="M17 20L19 22L23 18" stroke="#0f6e56" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontSize: "20px", fontWeight: 700, color: "#1c1c1c" }}>
            LegalClear <span style={{ color: "#0f6e56" }}>UK</span>
          </span>
        </Link>
      </nav>

      {/* Card */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{ backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #e5e0d8", padding: "44px 48px", boxShadow: "0 2px 24px rgba(0,0,0,0.07)", width: "100%", maxWidth: "440px" }}>

          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <h1 style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontSize: "28px", fontWeight: 700, color: "#1c1c1c", marginBottom: "8px" }}>
              Forgot your password?
            </h1>
            <p style={{ fontSize: "15px", color: "#666" }}>Enter your email and we'll send you a reset link</p>
          </div>

          {sent ? (
            <div style={{ textAlign: "center", padding: "24px", borderRadius: "10px", backgroundColor: "#e8f4f0", border: "1px solid #c8e6dd" }}>
              <div style={{ fontSize: "36px", marginBottom: "12px" }}>✅</div>
              <p style={{ fontWeight: 700, color: "#0f6e56", fontSize: "16px", marginBottom: "6px" }}>Reset link sent!</p>
              <p style={{ fontSize: "14px", color: "#555" }}>Check your email inbox and click the link to reset your password.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#444", marginBottom: "8px" }}>Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  style={{ width: "100%", padding: "12px 14px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "15px", color: "#1c1c1c", backgroundColor: "#fafafa", fontFamily: "inherit", outline: "none", transition: "border-color 0.15s", boxSizing: "border-box" }}
                  onFocus={(e) => (e.target.style.borderColor = "#0f6e56")}
                  onBlur={(e) => (e.target.style.borderColor = "#ddd")}
                />
              </div>

              {error && (
                <div style={{ padding: "12px 16px", borderRadius: "8px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: "14px" }}>
                  ⚠️ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{ padding: "13px", borderRadius: "10px", border: "none", backgroundColor: loading ? "#a0c4b8" : "#0f6e56", color: "#fff", fontSize: "15px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", transition: "background-color 0.15s" }}
              >
                {loading ? "Sending…" : "Send reset link"}
              </button>

              <p style={{ textAlign: "center", fontSize: "14px", color: "#666" }}>
                Remember your password?{" "}
                <Link href="/login" style={{ color: "#0f6e56", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
