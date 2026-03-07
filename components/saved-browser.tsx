"use client";

import { useEffect, useMemo, useState } from "react";
import { EventCard } from "@/components/event-card";
import type { EventItem } from "@/lib/site-data";

const STORAGE_KEY = "seoul-signal:favorites";

type Props = {
  events: EventItem[];
};

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

export function SavedBrowser({ events }: Props) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      setFavorites(readFavorites());
      setReady(true);
    };

    sync();
    window.addEventListener("favorites-updated", sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener("favorites-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const savedEvents = useMemo(
    () => events.filter((event) => favorites.includes(event.slug)),
    [events, favorites]
  );

  if (!ready) {
    return <section className="calendar-hero">正在加载收藏列表…</section>;
  }

  if (savedEvents.length === 0) {
    return (
      <section className="empty-state">
        <p className="eyebrow">Saved</p>
        <h2>你还没有收藏活动</h2>
        <p className="hero-text">
          在日历页或活动详情页点击“收藏”，这里就会成为你女儿自己的巡演观察清单。
        </p>
      </section>
    );
  }

  return (
    <section className="event-grid">
      {savedEvents.map((event) => (
        <EventCard event={event} key={event.id} />
      ))}
    </section>
  );
}
