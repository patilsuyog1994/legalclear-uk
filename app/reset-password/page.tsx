"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
    } else {
      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
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
              Set new password
            </h1>
            <p style={{ fontSize: "15px", color: "#666" }}>Choose a strong password for your account</p>
          </div>

          {done ? (
            <div style={{ textAlign: "center", padding: "24px", borderRadius: "10px", backgroundColor: "#e8f4f0", border: "1px solid #c8e6dd" }}>
              <div style={{ fontSize: "36px", marginBottom: "12px" }}>✅</div>
              <p style={{ fontWeight: 700, color: "#0f6e56", fontSize: "16px", marginBottom: "6px" }}>Password updated!</p>
              <p style={{ fontSize: "14px", color: "#555" }}>Redirecting you to sign in…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#444", marginBottom: "8px" }}>New password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  style={{ width: "100%", padding: "12px 14px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "15px", color: "#1c1c1c", backgroundColor: "#fafafa", fontFamily: "inherit", outline: "none", transition: "border-color 0.15s", boxSizing: "border-box" }}
                  onFocus={(e) => (e.target.style.borderColor = "#0f6e56")}
                  onBlur={(e) => (e.target.style.borderColor = "#ddd")}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#444", marginBottom: "8px" }}>Confirm new password</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat your password"
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
                {loading ? "Updating…" : "Update password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
