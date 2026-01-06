"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const search = async () => {
      const { data } = await supabase
        .from("items")
        .select("*")
        .or(
          `title.ilike.%${query}%,description.ilike.%${query}%`
        );

      setItems(data || []);
      setLoading(false);
    };

    if (query) search();
  }, [query]);

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa", padding: "40px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>
          Search results
        </h1>
        <p style={{ color: "#666", marginBottom: 32 }}>
          Results for “{query}”
        </p>

        {loading && <p>Searching…</p>}

        {!loading && items.length === 0 && (
          <p style={{ color: "#777" }}>
            No items match your search.
          </p>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 24,
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
                  background: "#fff",
                  borderRadius: 16,
                  border: "1px solid #eee",
                  overflow: "hidden",
                  boxShadow: "0 12px 24px rgba(0,0,0,0.05)",
                }}
              >
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    style={{ width: "100%", height: 180, objectFit: "cover" }}
                  />
                ) : (
                  <div
                    style={{
                      height: 180,
                      background: "#f0f0f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#888",
                    }}
                  >
                    No image
                  </div>
                )}

                <div style={{ padding: 16 }}>
                  <h3 style={{ marginBottom: 6 }}>{item.title}</h3>
                  <p style={{ fontSize: 14, color: "#666" }}>
                    {item.category}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
