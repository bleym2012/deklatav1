"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Item = {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  pickup_location: string;
  owner_id: string;
};

type Request = {
  id: string;
  status: string;
};

export default function ItemDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = params.id as string;

  const [item, setItem] = useState<Item | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Get user + item + existing request
  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUserId(user?.id ?? null);

      const { data: itemData } = await supabase
        .from("items")
        .select("*")
        .eq("id", itemId)
        .single();

      setItem(itemData);

      if (user && itemData) {
        const { data: reqData } = await supabase
          .from("requests")
          .select("id, status")
          .eq("item_id", itemId)
          .eq("requester_id", user.id)
          .maybeSingle();

        setRequest(reqData ?? null);
      }

      setLoading(false);
    };

    load();
  }, [itemId]);

  const handleRequest = async () => {
    if (!userId) {
      router.push("/login");
      return;
    }

    if (!item) return;

    setSubmitting(true);

    const { data, error } = await supabase
      .from("requests")
      .insert({
        item_id: item.id,
        requester_id: userId,
        status: "pending",
      })
      .select("id, status")
      .single();

    if (!error) {
      setRequest(data);
    }

    setSubmitting(false);
  };

  if (loading) return <p>Loading...</p>;
  if (!item) return <p>Item not found.</p>;

  const isOwner = userId === item.owner_id;
  const alreadyRequested = !!request;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <h1>{item.title}</h1>

      {item.image_url && (
        <img
          src={item.image_url}
          alt={item.title}
          style={{
            width: "100%",
            maxHeight: 360,
            objectFit: "cover",
            borderRadius: 12,
            marginBottom: 16,
          }}
        />
      )}

      <p>{item.description}</p>
      <p style={{ color: "#555", marginTop: 8 }}>
        Pickup: {item.pickup_location}
      </p>

      {/* REQUEST BUTTON LOGIC */}
      {!isOwner && userId && (
        <div style={{ marginTop: 24 }}>
          {!alreadyRequested ? (
            <button
              onClick={handleRequest}
              disabled={submitting}
              style={{
                padding: "12px 20px",
                background: "#111",
                color: "#fff",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
              }}
            >
              {submitting ? "Sending request..." : "Request item"}
            </button>
          ) : (
            <button
              disabled
              style={{
                padding: "12px 20px",
                background: "#e5e7eb",
                color: "#111",
                borderRadius: 8,
                border: "none",
                cursor: "not-allowed",
              }}
            >
              Request sent – awaiting approval
            </button>
          )}
        </div>
      )}

      {!userId && (
        <p style={{ marginTop: 20 }}>
          <a href="/login">Log in</a> to request this item.
        </p>
      )}
    </div>
  );
}
