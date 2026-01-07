"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

/* ===============================
   TYPES (MATCH SUPABASE REALITY)
=============================== */

type IncomingRequest = {
  id: string;
  status: string;
  created_at: string;
  items: {
    id: string;
    title: string;
    contact_info: string | null;
    owner_id: string;
  }[];
  profiles: {
    email: string;
  }[];
};

type MyRequest = {
  id: string;
  status: string;
  created_at: string;
  items: {
    id: string;
    title: string;
    contact_info: string | null;
  }[];
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [incoming, setIncoming] = useState<IncomingRequest[]>([]);
  const [myRequests, setMyRequests] = useState<MyRequest[]>([]);

  useEffect(() => {
    const loadDashboard = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      /* ===============================
         REQUESTS FOR MY ITEMS (OWNER)
         ✅ WORKING QUERY
      =============================== */
      const { data: incomingData, error: incomingError } = await supabase
        .from("requests")
        .select(
          `
          id,
          status,
          created_at,
          items!inner (
            id,
            title,
            contact_info,
            owner_id
          ),
          profiles!inner (
            email
          )
        `
        )
        .eq("items.owner_id", user.id)
        .order("created_at", { ascending: false });

      if (incomingError) {
        console.error("Incoming requests error:", incomingError);
      }

      setIncoming(incomingData ?? []);

      /* ===============================
         MY REQUESTS (REQUESTER)
      =============================== */
      const { data: myReqData, error: myReqError } = await supabase
        .from("requests")
        .select(
          `
          id,
          status,
          created_at,
          items (
            id,
            title,
            contact_info
          )
        `
        )
        .eq("requester_id", user.id)
        .order("created_at", { ascending: false });

      if (myReqError) {
        console.error("My requests error:", myReqError);
      }

      setMyRequests(myReqData ?? []);
      setLoading(false);
    };

    loadDashboard();
  }, []);

  if (loading) {
    return <p>Loading dashboard…</p>;
  }

  return (
    <div>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 32 }}>
        Dashboard
      </h1>

      {/* ===============================
          REQUESTS FOR MY ITEMS
      =============================== */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16 }}>
          Requests for My Items
        </h2>

        {incoming.length === 0 && (
          <p style={{ color: "#6b7280" }}>
            No one has requested your items yet.
          </p>
        )}

        {incoming.map((r) => {
          const item = r.items[0];
          const requester = r.profiles[0];

          return (
            <div
              key={r.id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                padding: 16,
                marginBottom: 12,
              }}
            >
              <p>
                <strong>Item:</strong> {item?.title}
              </p>

              <p>
                <strong>Requester:</strong>{" "}
                {requester?.email ?? "Unknown"}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                <span style={{ textTransform: "capitalize" }}>
                  {r.status}
                </span>
              </p>

              {r.status === "approved" && item?.contact_info && (
                <p style={{ marginTop: 8 }}>
                  <strong>Your Contact (shared):</strong>{" "}
                  {item.contact_info}
                </p>
              )}
            </div>
          );
        })}
      </section>

      {/* ===============================
          MY REQUESTS
      =============================== */}
      <section>
        <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16 }}>
          My Requests
        </h2>

        {myRequests.length === 0 && (
          <p style={{ color: "#6b7280" }}>
            You haven’t requested any items.
          </p>
        )}

        {myRequests.map((r) => {
          const item = r.items[0];

          return (
            <div
              key={r.id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                padding: 16,
                marginBottom: 12,
              }}
            >
              <p>
                <strong>Item:</strong> {item?.title}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                <span style={{ textTransform: "capitalize" }}>
                  {r.status}
                </span>
              </p>

              {r.status === "approved" && item?.contact_info && (
                <p style={{ marginTop: 8 }}>
                  <strong>Owner Contact:</strong>{" "}
                  {item.contact_info}
                </p>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}
