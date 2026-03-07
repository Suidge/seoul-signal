import type { Metadata } from "next";
import { ArtistCard } from "@/components/artist-card";
import { Header } from "@/components/header";
import { getArtists, getEvents } from "@/lib/events";
import { slugifyArtistName } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "艺人目录 | Seoul Signal",
  description: "浏览当前站内追踪的 K-pop 艺人和 fandom 入口。"
};

export default async function ArtistsPage() {
  const [artists, events] = await Promise.all([getArtists(), getEvents()]);

  return (
    <main className="page-shell">
      <Header />
      <section className="calendar-hero">
        <p className="eyebrow">Artists</p>
        <h1>艺人与 fandom 入口</h1>
        <p className="hero-text">
          每个艺人页都同时承接巡演、官方入口、粉丝内容和入坑路径，方便从“查活动”自然进入 fandom 体验。
        </p>
      </section>
      <section className="artist-grid">
        {artists.map((artist) => (
          <ArtistCard
            artist={artist}
            eventCount={events.filter((event) => slugifyArtistName(event.artist) === artist.slug).length}
            key={artist.slug}
          />
        ))}
      </section>
    </main>
  );
}
