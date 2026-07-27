"use client";

import { useState } from "react";
import { ShareIcon } from "@/components/icons";

export function ShareButton({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // el usuario canceló el share sheet, no hacemos nada
      }
      return;
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="flex min-h-11 items-center gap-1.5 rounded-full border border-zinc-300 px-4 text-sm font-medium dark:border-zinc-700"
    >
      <ShareIcon width={16} height={16} />
      {copied ? "¡Copiado!" : "Compartir"}
    </button>
  );
}
