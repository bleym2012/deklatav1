"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo:
          typeof window !== "undefined"
            ? window.location.origin
            : undefined,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fafafa",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#fff",
          borderRadius: 20,
          padding: 32,
          boxShadow:
            "0 1px 2px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.06)",
          border: "1px solid #eee",
        }}
      >
        <h1
          style={{
            fontSize: 28,
            fontWeight: 600,
            marginBottom: 8,
            letterSpacing: "-0.02em",
            textAlign: "center",
          }}
        >
          Welcome to Deklata
        </h1>

        <p
          style={{
            color: "#666",
            fontSize: 15,
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          Log in to request or share items on campus.
        </p>

        {!sent ? (
          <>
            <label
              style={{
                fontSize: 14,
                fontWeight: 500,
                display: "block",
                marginBottom: 6,
              }}
            >
              Email address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@student.edu"
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 10,
                border: "1px solid #ddd",
                fontSize: 15,
                marginBottom: 16,
              }}
            />

            {error && (
              <p
                style={{
                  color: "#e53935",
                  fontSize: 14,
                  marginBottom: 12,
                }}
              >
                {error}
              </p>
            )}

            <button
              onClick={handleLogin}
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px 16px",
                background: "#111",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 500,
                cursor: "pointer",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Sending link…" : "Send magic login link"}
            </button>

            <p
              style={{
                marginTop: 16,
                fontSize: 13,
                color: "#777",
                textAlign: "center",
              }}
            >
              We’ll email you a secure login link. No password needed.
            </p>
          </>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "20px 0",
            }}
          >
            <p
              style={{
                fontSize: 16,
                marginBottom: 12,
              }}
            >
              Check your email 📩
            </p>

            <p
              style={{
                fontSize: 14,
                color: "#666",
              }}
            >
              We’ve sent a magic login link to <b>{email}</b>.
              <br />
              Click it to finish logging in.
            </p>
          </div>
        )}

        <div
          style={{
            marginTop: 28,
            textAlign: "center",
          }}
        >
          <button
            onClick={() => router.push("/")}
            style={{
              background: "none",
              border: "none",
              color: "#0070f3",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            ← Back to items
          </button>
        </div>
      </div>
    </div>
  );
}
