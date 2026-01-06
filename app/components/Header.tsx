"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
    setQuery("");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid #eee",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            fontSize: 18,
            fontWeight: 600,
            textDecoration: "none",
            color: "#111",
            whiteSpace: "nowrap",
          }}
        >
          Deklata
        </Link>

        {/* Search */}
        <form
          onSubmit={handleSearch}
          style={{
            flex: 1,
            maxWidth: 420,
            position: "relative",
          }}
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search items…"
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: 999,
              border: "1px solid #ddd",
              fontSize: 14,
              background: "#fafafa",
            }}
          />
        </form>

        {/* Nav */}
        <nav style={{ display: "flex", gap: 14, alignItems: "center" }}>
          {user && (
            <Link
              href="/add-item"
              style={{
                fontSize: 14,
                color: "#555",
                textDecoration: "none",
              }}
            >
              Add item
            </Link>
          )}

          {!user ? (
            <Link
              href="/login"
              style={{
                padding: "8px 14px",
                borderRadius: 999,
                background: "#111",
                color: "#fff",
                textDecoration: "none",
                fontSize: 14,
              }}
            >
              Log in
            </Link>
          ) : (
            <button
              onClick={handleLogout}
              style={{
                background: "none",
                border: "none",
                fontSize: 14,
                color: "#555",
                cursor: "pointer",
              }}
            >
              Log out
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
