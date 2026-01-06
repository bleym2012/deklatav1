"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Item = {
  id: string;
  title: string;
  contact_info: string | null;
  owner_id: string;
};

type RequestRow = {
  id: string;
  status: string | null;
  item_id: string;
  items: Item[]; // ✅ IMPORTANT: array, not object
};

export default function DashboardPage() {
  const [incoming, setIncoming] = useState<RequestRow[]>([]);
  const [myRequests, setMyRequests] = useState<RequestRow[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      setUserId(user.id);

      // Requests for my items
      const { data: incomingData } = await supabase
        .from("requests")
        .select(
          `
          id,
          status,
          item_id,
          items (
            id,
            title,
            contact_info,
            owner_id
          )
        `
        )
        .eq("items.owner_id", user.id);

      // Requests I made
      const { data: myReqData } = await supabase
        .from("requests")
        .select(
          `
          id,
          status,
          item_id,
          items (
            id,
            title,
            contact_info,
            owner_id
          )
        `
        )
        .eq("requester_id", user.id);

      setIncoming(incomingData ?? []);
      setMyRequests(myReqData ?? []);
      setLoading(false);
    };

    load();
  }, []);

  if (loading) return <p style={{ padding: 24 }}>Loading dashboard…</p>;

  return (
    <div style={{ padding: 32, maxWidth: 900, margin: "0 auto" }}>
      <h1>Dashboard</h1>

      {/* INCOMING REQUESTS */}
      <section style={{ marginTop: 40 }}>
        <h2>Requests for My Items</h2>

        {incoming.length === 0 && <p>No requests yet.</p>}

        {incoming.map((r) => {
          const item = r.items?.[0];
          if (!item) return null;

          return (
            <div
              key={r.id}
              style={{
                border: "1px solid #eee",
                borderRadius: 10,
                padding: 16,
                marginTop: 12,
              }}
            >
              <strong>{item.title}</strong>
              <div>Status: {r.status ?? "pending"}</div>

              {r.status === "approved" && item.contact_info && (
                <div style={{ marginTop: 8 }}>
                  📞 Contact: <strong>{item.contact_info}</strong>
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* MY REQUESTS */}
      <section style={{ marginTop: 50 }}>
        <h2>My Requests</h2>

        {myRequests.length === 0 && <p>You haven’t requested any items.</p>}

        {myRequests.map((r) => {
          const item = r.items?.[0];
          if (!item) return null;

          return (
            <div
              key={r.id}
              style={{
                border: "1px solid #eee",
                borderRadius: 10,
                padding: 16,
                marginTop: 12,
              }}
            >
              <strong>{item.title}</strong>
              <div>Status: {r.status ?? "pending"}</div>

              {r.status === "approved" && item.contact_info && (
                <div style={{ marginTop: 8 }}>
                  📞 Contact: <strong>{item.contact_info}</strong>
                </div>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}
