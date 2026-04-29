"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "apple" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleOAuth(provider: "google" | "apple") {
    setError(null);
    setOauthLoading(provider);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });
    if (error) {
      setError(error.message);
      setOauthLoading(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Registration failed. Please try again.");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

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
              Create your account
            </h1>
            <p style={{ fontSize: "15px", color: "#666" }}>Free forever. No card required.</p>
          </div>

          {success ? (
            <div style={{ textAlign: "center", padding: "24px", borderRadius: "10px", backgroundColor: "#e8f4f0", border: "1px solid #c8e6dd" }}>
              <div style={{ fontSize: "36px", marginBottom: "12px" }}>✅</div>
              <p style={{ fontWeight: 700, color: "#0f6e56", fontSize: "16px", marginBottom: "6px" }}>Account created!</p>
              <p style={{ fontSize: "14px", color: "#555" }}>Check your email to confirm, then sign in. Redirecting…</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

              {/* Google */}
              <button
                type="button"
                onClick={() => handleOAuth("google")}
                disabled={!!oauthLoading}
                style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1px solid #ddd", backgroundColor: "#fff", cursor: oauthLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontSize: "15px", fontWeight: 600, color: "#1c1c1c", fontFamily: "inherit", transition: "background-color 0.15s", opacity: oauthLoading === "apple" ? 0.5 : 1 }}
                onMouseEnter={(e) => { if (!oauthLoading) e.currentTarget.style.backgroundColor = "#f8f7f3"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#fff"; }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {oauthLoading === "google" ? "Redirecting…" : "Continue with Google"}
              </button>


              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "4px 0" }}>
                <div style={{ flex: 1, height: "1px", backgroundColor: "#e5e0d8" }} />
                <span style={{ fontSize: "13px", color: "#999", whiteSpace: "nowrap" }}>or sign up with email</span>
                <div style={{ flex: 1, height: "1px", backgroundColor: "#e5e0d8" }} />
              </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label style={labelStyle}>Full name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Smith"
                  required
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#0f6e56")}
                  onBlur={(e) => (e.target.style.borderColor = "#ddd")}
                />
              </div>
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
                  placeholder="At least 6 characters"
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
                {loading ? "Creating account…" : "Create account"}
              </button>

              <p style={{ textAlign: "center", fontSize: "14px", color: "#666" }}>
                Already have an account?{" "}
                <Link href="/login" style={{ color: "#0f6e56", fontWeight: 600, textDecoration: "none" }}>
                  Sign in
                </Link>
              </p>
            </form>
            </div>
          )}
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
