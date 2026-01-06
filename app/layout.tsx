"use client";

import "./globals.css";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <html lang="en">
      <body>
        <header
          style={{
            borderBottom: "1px solid #e5e7eb",
            background: "#ffffff",
          }}
        >
          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Link
              href="/"
              style={{
                fontWeight: 700,
                fontSize: 20,
                textDecoration: "none",
                color: "#111",
              }}
            >
              Deklata
            </Link>

            <nav style={{ display: "flex", gap: 20, alignItems: "center" }}>
              <Link href="/how-it-works">How it works</Link>

              {!loading && user && (
                <>
                  <Link href="/dashboard">Dashboard</Link>
                  <Link href="/add-item">Add item</Link>
                </>
              )}

              {!loading && user ? (
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    window.location.href = "/";
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 14,
                    color: "#111",
                  }}
                >
                  Logout
                </button>
              ) : (
                !loading && <Link href="/login">Login</Link>
              )}
            </nav>
          </div>
        </header>

        <main
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "32px 20px",
          }}
        >
          {children}
        </main>
      </body>
    </html>
  );
}
