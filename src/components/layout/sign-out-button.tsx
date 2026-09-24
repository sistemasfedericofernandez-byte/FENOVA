"use client";

import { useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.assign("/");
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      className={className}
    >
      {children}
      {loading ? "Saliendo..." : "Cerrar sesión"}
    </button>
  );
}
