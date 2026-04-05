import type { Metadata } from "next";
import { ArtistCard } from "@/components/artist-card";
import { Header } from "@/components/header";
import { getArtists, getEvents, getTourPlans } from "@/lib/events";
import { slugifyArtistName } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "艺人目录 | Koncert Together",
  description: "浏览站内追踪的 K-pop 艺人、成员档案和巡演消息。"
};

export default async function ArtistsPage() {
  const [artists, events, plans] = await Promise.all([
    getArtists({ headlinersOnly: true }),
    getEvents(),
    getTourPlans()
  ]);

  return (
    <main className="page-shell">
      <Header />
      <section className="calendar-hero">
        <p className="eyebrow">艺人目录</p>
        <h1>艺人主页与成员档案</h1>
        <p className="hero-text">
          目录现在优先展示最热门、搜索量最高的 K-pop 艺人。每个主页都会把成员档案、官方入口、已官宣场次和还在升温的巡演消息放在一起，先把头部艺人覆盖做扎实。
        </p>
      </section>
      <section className="artist-grid">
        {artists.map((artist) => (
          <ArtistCard
            artist={artist}
            eventCount={events.filter((event) => slugifyArtistName(event.artist) === artist.slug).length}
            key={artist.slug}
            planCount={plans.filter((plan) => plan.artistSlug === artist.slug).length}
          />
        ))}
      </section>
    </main>
  );
}
