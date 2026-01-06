"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const CATEGORIES = [
  "All",
  "Books",
  "Electronics",
  "Furniture",
  "Clothing",
  "Others",
];

type Item = {
  id: string;
  title: string;
  description: string;
  pickup_location: string;
  image_url: string | null;
  category: string | null;
};

export default function HomePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [filtered, setFiltered] = useState<Item[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    const load = async () => {
      // 1️⃣ Fetch all items
      const { data: itemsData } = await supabase
        .from("items")
        .select("*");

      // 2️⃣ Fetch approved requests
      const { data: approvedRequests } = await supabase
        .from("requests")
        .select("item_id")
        .eq("status", "approved");

      const approvedItemIds = new Set(
        (approvedRequests ?? []).map((r) => r.item_id)
      );

      // 3️⃣ Remove approved items
      const availableItems =
        (itemsData ?? []).filter(
          (item) => !approvedItemIds.has(item.id)
        );

      setItems(availableItems);
      setFiltered(availableItems);
    };

    load();
  }, []);

  useEffect(() => {
    let result = items;

    if (activeCategory !== "All") {
      result = result.filter(
        (i) => i.category === activeCategory
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.pickup_location.toLowerCase().includes(q)
      );
    }

    setFiltered(result);
  }, [search, activeCategory, items]);

  return (
    <div className="page">
      <h1>Available Items</h1>

      {/* SEARCH */}
      <input
        placeholder="Search items…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          maxWidth: 420,
          padding: 12,
          borderRadius: 10,
          border: "1px solid #d1d5db",
          marginBottom: 16,
        }}
      />

      {/* CATEGORY CHIPS */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: "6px 14px",
              borderRadius: 999,
              border: "1px solid #e5e7eb",
              background:
                activeCategory === cat ? "#111" : "#fff",
              color:
                activeCategory === cat ? "#fff" : "#111",
              cursor: "pointer",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* GRID */}
      <div className="grid">
        {filtered.map((item) => (
          <Link
            key={item.id}
            href={`/items/${item.id}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div className="card">
              {item.image_url ? (
                <img src={item.image_url} alt={item.title} />
              ) : (
                <div style={{ height: 180, background: "#eee" }} />
              )}

              <div className="card-body">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <small>{item.category}</small>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p style={{ marginTop: 24 }}>
          No available items at the moment.
        </p>
      )}
    </div>
  );
}
