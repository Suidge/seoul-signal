"use client";

import { useState } from "react";

type Props = {
  title: string;
};

export function ShareButton({ title }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {}
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button className="secondary-button" onClick={handleShare} type="button">
      {copied ? "链接已复制" : "分享"}
    </button>
  );
}
