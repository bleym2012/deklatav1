"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setLoggedIn(!!data.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setOpen(false);
    router.push("/");
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "#ffffff",
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            fontWeight: 800,
            fontSize: 20,
            textDecoration: "none",
            color: "#0f172a",
          }}
        >
          Deklata
        </Link>

        {/* Hamburger */}
        <button
          onClick={() => setOpen(!open)}
          aria-label="Menu"
          style={{
            border: "none",
            background: "transparent",
            fontSize: 26,
            cursor: "pointer",
          }}
        >
          ☰
        </button>
      </div>

      {/* Dropdown Menu */}
      {open && (
        <nav
          style={{
            borderTop: "1px solid #e5e7eb",
            background: "#ffffff",
          }}
        >
          <div
            style={{
              maxWidth: 1100,
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              padding: "8px 16px",
            }}
          >
            <MenuLink href="/how-it-works" label="How it works" setOpen={setOpen} />

            {loggedIn && (
              <>
                <MenuLink href="/dashboard" label="Dashboard" setOpen={setOpen} />
                <MenuLink href="/add-item" label="Add item" setOpen={setOpen} />
                <button
                  onClick={logout}
                  style={logoutStyle}
                >
                  Log out
                </button>
              </>
            )}

            {!loggedIn && (
              <MenuLink href="/login" label="Log in" setOpen={setOpen} />
            )}
          </div>
        </nav>
      )}
    </header>
  );
}

function MenuLink({
  href,
  label,
  setOpen,
}: {
  href: string;
  label: string;
  setOpen: (v: boolean) => void;
}) {
  return (
    <Link
      href={href}
      onClick={() => setOpen(false)}
      style={{
        padding: "12px 0",
        textDecoration: "none",
        color: "#0f172a",
        fontWeight: 500,
        borderBottom: "1px solid #f1f5f9",
      }}
    >
      {label}
    </Link>
  );
}

const logoutStyle: React.CSSProperties = {
  padding: "12px 0",
  textAlign: "left",
  background: "none",
  border: "none",
  color: "#dc2626",
  fontWeight: 600,
  cursor: "pointer",
};
