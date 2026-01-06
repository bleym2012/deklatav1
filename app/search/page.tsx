"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Item = {
  id: string;
  title: string;
  description: string;
  pickup_location: string;
  image_url: string | null;
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setItems([]);
      return;
    }

    const runSearch = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("items")
        .select(
          "id, title, description, pickup_location, image_url"
        )
        .ilike("title", `%${query}%`)
        .eq("status", "available");

      if (!error && data) {
        setItems(data);
      }

      setLoading(false);
    };

    runSearch();
  }, [query]);

  return (
    <main style={{ padding: 40, maxWidth: 1000, margin: "0 auto" }}>
      <h1>Search Items</h1>
      <p style={{ color: "#64748b", marginBottom: 24 }}>
        Search available items before logging in.
      </p>

      <input
        type="text"
        placeholder="Search for books, electronics, furniture…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: "100%",
          maxWidth: 480,
          padding: 12,
          borderRadius: 10,
          border: "1px solid #d1d5db",
          marginBottom: 24,
        }}
      />

      {loading && <p>Searching…</p>}

      {!loading && query && items.length === 0 && (
        <p>No items found.</p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 20,
        }}
      >
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/items/${item.id}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 14,
                overflow: "hidden",
                background: "#ffffff",
              }}
            >
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.title}
                  style={{
                    width: "100%",
                    height: 160,
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  style={{
                    height: 160,
                    background: "#f1f5f9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#64748b",
                  }}
                >
                  No image
                </div>
              )}

              <div style={{ padding: 14 }}>
                <h3 style={{ margin: 0 }}>{item.title}</h3>
                <p style={{ fontSize: 13, color: "#64748b" }}>
                  {item.pickup_location}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
