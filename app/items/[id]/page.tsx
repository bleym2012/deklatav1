"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Item = {
  id: string;
  title: string;
  description: string;
  pickup_location: string;
  image_url: string | null;
  category: string | null;
  owner_id: string;
  contact_info: string | null;
};

type Request = {
  id: string;
  status: string | null;
};

export default function ItemDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [item, setItem] = useState<Item | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: auth } = await supabase.auth.getUser();
      setUserId(auth.user?.id ?? null);

      const { data: itemData, error } = await supabase
        .from("items")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !itemData) {
        router.push("/");
        return;
      }

      setItem(itemData);

      if (auth.user) {
        const { data: req } = await supabase
          .from("requests")
          .select("id, status")
          .eq("item_id", id)
          .eq("requester_id", auth.user.id)
          .single();

        if (req) setRequest(req);
      }

      setLoading(false);
    };

    load();
  }, [id, router]);

  const requestItem = async () => {
    if (!userId) {
      router.push("/login");
      return;
    }

    const { data } = await supabase
      .from("requests")
      .insert({
        item_id: id,
        requester_id: userId,
      })
      .select()
      .single();

    if (data) setRequest(data);
  };

  if (loading || !item) return null;

  const status = request?.status ?? "pending";

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      {/* Back */}
      <button
        onClick={() => router.back()}
        style={{
          marginBottom: 20,
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#475569",
          fontSize: 14,
        }}
      >
        ← Back to items
      </button>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
          gap: 36,
        }}
      >
        {/* IMAGE */}
        <div>
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.title}
              style={{
                width: "100%",
                height: 420,
                objectFit: "cover",
                borderRadius: 18,
              }}
            />
          ) : (
            <div
              style={{
                height: 420,
                borderRadius: 18,
                background: "#e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#64748b",
              }}
            >
              No image available
            </div>
          )}
        </div>

        {/* DETAILS */}
        <div>
          {/* Title + Status badge */}
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <h1 style={{ margin: 0 }}>{item.title}</h1>
            {request && (
              <span style={badgeStyle(status)}>
                {status.toUpperCase()}
              </span>
            )}
          </div>

          <p style={{ color: "#64748b", marginBottom: 18 }}>
            Category: {item.category ?? "Others"}
          </p>

          <p style={{ fontSize: 16, marginBottom: 20 }}>
            {item.description}
          </p>

          <p style={{ marginBottom: 28 }}>
            📍 <strong>Pickup location:</strong> {item.pickup_location}
          </p>

          {/* ACTION AREA */}
          {userId === item.owner_id ? (
            <div style={infoBox}>
              You posted this item.
            </div>
          ) : !userId ? (
            <button onClick={() => router.push("/login")} style={primaryBtn}>
              Login to request item
            </button>
          ) : request ? (
            <div style={infoBox}>
              {status === "pending" && "Request sent — awaiting approval"}
              {status === "rejected" && "Request rejected"}
              {status === "approved" && "Request approved"}
            </div>
          ) : (
            <button onClick={requestItem} style={primaryBtn}>
              Request item
            </button>
          )}

          {/* CONTACT REVEAL (ONLY AFTER APPROVAL) */}
          {status === "approved" && request && (
            <div
              style={{
                marginTop: 20,
                padding: 16,
                borderRadius: 12,
                background: "#dcfce7",
                fontWeight: 600,
              }}
            >
              📞 Contact the owner: {item.contact_info}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- styles ---------- */

const primaryBtn: React.CSSProperties = {
  padding: "14px 20px",
  borderRadius: 14,
  background: "#0f172a",
  color: "#fff",
  fontWeight: 600,
  border: "none",
  cursor: "pointer",
};

const infoBox: React.CSSProperties = {
  padding: 14,
  borderRadius: 12,
  background: "#f1f5f9",
  color: "#475569",
  fontWeight: 600,
};

const badgeStyle = (status: string): React.CSSProperties => {
  const map: Record<string, { bg: string; text: string }> = {
    pending: { bg: "#fef3c7", text: "#92400e" },
    approved: { bg: "#dcfce7", text: "#166534" },
    rejected: { bg: "#fee2e2", text: "#991b1b" },
  };

  const safe = map[status] ?? map["pending"];

  return {
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    background: safe.bg,
    color: safe.text,
  };
};
