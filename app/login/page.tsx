"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Login failed. Please try again.");
        return;
      }

      router.push(redirect);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <label style={labelStyle}>Email address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = "#0f6e56")}
          onBlur={(e) => (e.target.style.borderColor = "#ddd")}
        />
      </div>
      <div>
        <label style={labelStyle}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = "#0f6e56")}
          onBlur={(e) => (e.target.style.borderColor = "#ddd")}
        />
      </div>

      {error && (
        <div style={errorStyle}>⚠️ {error}</div>
      )}

      <button type="submit" disabled={loading} style={submitStyle(loading)}>
        {loading ? "Signing in…" : "Sign in"}
      </button>

      <p style={{ textAlign: "center", fontSize: "14px", color: "#666" }}>
        Don&apos;t have an account?{" "}
        <Link href="/register" style={{ color: "#0f6e56", fontWeight: 600, textDecoration: "none" }}>
          Create one
        </Link>
      </p>
    </form>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "13px",
  fontWeight: 600,
  color: "#444",
  marginBottom: "8px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "8px",
  border: "1px solid #ddd",
  fontSize: "15px",
  color: "#1c1c1c",
  backgroundColor: "#fafafa",
  fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
  outline: "none",
  transition: "border-color 0.15s",
  boxSizing: "border-box",
};

const errorStyle: React.CSSProperties = {
  padding: "12px 16px",
  borderRadius: "8px",
  backgroundColor: "#fef2f2",
  border: "1px solid #fecaca",
  color: "#dc2626",
  fontSize: "14px",
};

function submitStyle(loading: boolean): React.CSSProperties {
  return {
    padding: "13px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: loading ? "#a0c4b8" : "#0f6e56",
    color: "#fff",
    fontSize: "15px",
    fontWeight: 700,
    cursor: loading ? "not-allowed" : "pointer",
    fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
    transition: "background-color 0.15s",
  };
}

export default function LoginPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f7f3", fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif", display: "flex", flexDirection: "column" }}>
      {/* Navbar */}
      <nav className="lc-nav" style={navStyle}>
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
        <div style={cardStyle}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <h1 style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontSize: "30px", fontWeight: 700, color: "#1c1c1c", marginBottom: "8px" }}>
              Welcome back
            </h1>
            <p style={{ fontSize: "15px", color: "#666" }}>Sign in to access your saved cases</p>
          </div>

          <Suspense fallback={<div style={{ textAlign: "center", color: "#888" }}>Loading…</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>

      {/* Footer disclaimer */}
      <footer style={{ borderTop: "1px solid #e5e0d8", padding: "20px 24px", textAlign: "center", fontSize: "12px", color: "#999", lineHeight: 1.6 }}>
        © {new Date().getFullYear()} LegalClear UK · Not a law firm · For informational purposes only ·{" "}
        <a href="https://www.citizensadvice.org.uk" target="_blank" rel="noopener noreferrer" style={{ color: "#0f6e56", textDecoration: "none" }}>
          Citizens Advice
        </a>
      </footer>
    </div>
  );
}

const navStyle: React.CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 50,
  backgroundColor: "rgba(248,247,243,0.96)",
  backdropFilter: "blur(10px)",
  borderBottom: "1px solid #e5e0d8",
  padding: "0 48px",
  height: "64px",
  display: "flex",
  alignItems: "center",
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "#fff",
  borderRadius: "16px",
  border: "1px solid #e5e0d8",
  padding: "44px 48px",
  boxShadow: "0 2px 24px rgba(0,0,0,0.07)",
  width: "100%",
  maxWidth: "440px",
};
