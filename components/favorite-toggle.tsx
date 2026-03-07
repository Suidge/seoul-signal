"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "seoul-signal:favorites";

function readFavorites() {
  if (typeof window === "undefined") {
    return [] as string[];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeFavorites(items: string[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("favorites-updated", { detail: items }));
}

type Props = {
  slug: string;
  compact?: boolean;
};

export function FavoriteToggle({ slug, compact = false }: Props) {
  const [active, setActive] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      setActive(readFavorites().includes(slug));
      setReady(true);
    };

    sync();
    window.addEventListener("favorites-updated", sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener("favorites-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, [slug]);

  function toggleFavorite() {
    const current = readFavorites();
    const next = current.includes(slug)
      ? current.filter((item) => item !== slug)
      : [...current, slug];

    writeFavorites(next);
    setActive(next.includes(slug));
  }

  return (
    <button
      aria-label={active ? "取消收藏活动" : "收藏活动"}
      className={compact ? "favorite-chip" : "favorite-button"}
      onClick={toggleFavorite}
      type="button"
    >
      {ready && active ? "已收藏" : "收藏"}
    </button>
  );
}
