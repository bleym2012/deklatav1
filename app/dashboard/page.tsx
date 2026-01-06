"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Request = {
  id: string;
  status: string | null;
  item_id: string;
  items: {
    title: string;
    contact_info: string | null;
    owner_id: string;
  };
};

export default function DashboardPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [incoming, setIncoming] = useState<Request[]>([]);
  const [myRequests, setMyRequests] = useState<Request[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        router.push("/login");
        return;
      }

      setUserId(auth.user.id);

      /* ===============================
         REQUESTS FOR MY ITEMS (OWNER)
         =============================== */
      const { data: incomingData } = await supabase
        .from("requests")
        .select(
          `
          id,
          status,
          item_id,
          items (
            title,
            contact_info,
            owner_id
          )
        `
        )
        .order("created_at", { ascending: false });

      /* ===============================
         MY REQUESTS (REQUESTER)
         =============================== */
      const { data: myReqData } = await supabase
        .from("requests")
        .select(
          `
          id,
          status,
          item_id,
          items (
            title,
            contact_info,
            owner_id
          )
        `
        )
        .eq("requester_id", auth.user.id)
        .order("created_at", { ascending: false });

      setIncoming(incomingData ?? []);
      setMyRequests(myReqData ?? []);
    };

    load();
  }, [router]);

  const updateStatus = async (
    requestId: string,
    status: "approved" | "rejected"
  ) => {
    await supabase
      .from("requests")
      .update({ status })
      .eq("id", requestId);

    setIncoming((prev) =>
      prev.map((r) =>
        r.id === requestId ? { ...r, status } : r
      )
    );
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <h1>Dashboard</h1>

      {/* ======================================
          REQUESTS FOR MY ITEMS (OWNER VIEW)
         ====================================== */}
      <section style={{ marginBottom: 48 }}>
        <h2>Requests for your items</h2>

        {incoming.length === 0 && <p>No requests yet.</p>}

        {incoming.map((r) => {
          const status = r.status ?? "pending";

          return (
            <div
              key={r.id}
              style={{
                padding: 16,
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                marginBottom: 12,
              }}
            >
              <strong>{r.items.title}</strong>

              <div
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                  marginTop: 8,
                }}
              >
                <span style={badgeStyle(status)}>
                  {status.toUpperCase()}
                </span>

                {status === "pending" && (
                  <>
                    <button
                      onClick={() =>
                        updateStatus(r.id, "approved")
                      }
                    >
                      Approve
                    </button>
                    <button
                      onClick={() =>
                        updateStatus(r.id, "rejected")
                      }
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>

              {/* CONTACT (OWNER ALWAYS SEES THEIR OWN) */}
              {status === "approved" && r.items.contact_info && (
                <div
                  style={{
                    marginTop: 12,
                    padding: 12,
                    borderRadius: 10,
                    background: "#dcfce7",
                    fontWeight: 600,
                  }}
                >
                  📞 Contact: {r.items.contact_info}
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* ======================================
          MY REQUESTS (REQUESTER VIEW)
         ====================================== */}
      <section>
        <h2>My requests</h2>

        {myRequests.length === 0 && (
          <p>You haven’t requested any items yet.</p>
        )}

        {myRequests.map((r) => {
          const status = r.status ?? "pending";

          return (
            <div
              key={r.id}
              style={{
                padding: 16,
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <strong>{r.items.title}</strong>
                <span style={badgeStyle(status)}>
                  {status.toUpperCase()}
                </span>
              </div>

              {/* CONTACT (ONLY AFTER APPROVAL) */}
              {status === "approved" && r.items.contact_info && (
                <div
                  style={{
                    marginTop: 12,
                    padding: 12,
                    borderRadius: 10,
                    background: "#dcfce7",
                    fontWeight: 600,
                  }}
                >
                  📞 Contact: {r.items.contact_info}
                </div>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}

/* 🔖 Status badge (SAFE) */
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
