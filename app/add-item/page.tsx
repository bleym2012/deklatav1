"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const CATEGORIES = [
  "Books",
  "Electronics",
  "Furniture",
  "Clothing",
  "Others",
];

export default function AddItemPage() {
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [category, setCategory] = useState("Others");
  const [contactInfo, setContactInfo] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  /* 🔐 Auth guard */
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace("/login");
        return;
      }
      setUserId(data.user.id);
      setLoading(false);
    });
  }, [router]);

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setSaving(true);

    let imageUrl: string | null = null;

    if (imageFile) {
      const fileName = `${userId}-${Date.now()}-${imageFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("Item-images")
        .upload(fileName, imageFile);

      if (uploadError) {
        alert("Image upload failed");
        setSaving(false);
        return;
      }

      imageUrl = supabase.storage
        .from("Item-images")
        .getPublicUrl(fileName).data.publicUrl;
    }

    const { error } = await supabase.from("items").insert({
      title,
      description,
      pickup_location: pickupLocation,
      category,
      image_url: imageUrl,
      contact_info: contactInfo,
      owner_id: userId,
    });

    if (error) {
      alert(error.message);
      setSaving(false);
      return;
    }

    router.push("/");
  };

  if (loading) return null;

  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <h1>Add an Item</h1>
      <p style={{ color: "#64748b", marginBottom: 24 }}>
        Share something you no longer need with other students.
      </p>

      <form
        onSubmit={submit}
        style={{
          background: "#ffffff",
          padding: 24,
          borderRadius: 16,
          border: "1px solid #e5e7eb",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        {/* TITLE */}
        <div>
          <label className="label">Item name</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Office chair"
            required
            className="input"
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="label">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Condition, size, anything helpful…"
            required
            rows={4}
            className="input"
          />
        </div>

        {/* PICKUP LOCATION */}
        <div>
          <label className="label">Pickup location</label>
          <input
            value={pickupLocation}
            onChange={(e) => setPickupLocation(e.target.value)}
            placeholder="e.g. Block C"
            required
            className="input"
          />
        </div>

        {/* CATEGORY */}
        <div>
          <label className="label">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* CONTACT */}
        <div>
          <label className="label">
            Contact (shown only after approval)
          </label>
          <input
            value={contactInfo}
            onChange={(e) => setContactInfo(e.target.value)}
            placeholder="Phone number, WhatsApp, or email"
            required
            className="input"
          />
        </div>

        {/* IMAGE */}
        <div>
          <label className="label">Photo (optional)</label>

          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Preview"
              style={{
                width: "100%",
                height: 220,
                objectFit: "cover",
                borderRadius: 12,
                marginBottom: 8,
              }}
            />
          ) : (
            <div
              style={{
                height: 180,
                border: "1px dashed #cbd5f5",
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#64748b",
                marginBottom: 8,
              }}
            >
              Image preview will appear here
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              handleImageChange(e.target.files?.[0] || null)
            }
          />
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={saving}
          style={{
            marginTop: 12,
            padding: "14px",
            borderRadius: 12,
            background: "#0f172a",
            color: "#fff",
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
          }}
        >
          {saving ? "Adding item…" : "Add Item"}
        </button>
      </form>
    </div>
  );
}
