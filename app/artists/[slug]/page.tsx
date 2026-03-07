import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CommunityCard } from "@/components/community-card";
import { EventCard } from "@/components/event-card";
import { FollowArtistForm } from "@/components/follow-artist-form";
import { GuideCard } from "@/components/guide-card";
import { Header } from "@/components/header";
import { getArtistBySlug, getArtists } from "@/lib/events";
import { communityPosts, guides, type EventItem } from "@/lib/site-data";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const artists = await getArtists();
  return artists.map((artist) => ({ slug: artist.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const artist = await getArtistBySlug(slug);

  if (!artist) {
    return {};
  }

  return {
    title: `${artist.name} | Seoul Signal`,
    description: `${artist.name} 的巡演聚合页，包含当前已追踪活动、购票入口与中文说明方向。`
  };
}

export default async function ArtistDetailPage({ params }: Props) {
  const { slug } = await params;
  const artist = await getArtistBySlug(slug);

  if (!artist) {
    notFound();
  }

  return (
    <main className="page-shell">
      <Header />
      <section className="artist-hero" style={{ ["--artist-accent" as string]: artist.accent }}>
        <div>
          <p className="eyebrow">Artist Hub</p>
          <h1>{artist.name}</h1>
          <p className="hero-text">{artist.intro}</p>
          <div className="hero-actions">
            <FollowArtistForm artistSlug={artist.slug} />
          </div>
        </div>
        <div className="artist-hero-panel">
          <div className="detail-row">
            <span>韩文名</span>
            <strong>{artist.nameKo ?? "待补充"}</strong>
          </div>
          <div className="detail-row">
            <span>粉丝名</span>
            <strong>{artist.fandom ?? "待补充"}</strong>
          </div>
          <div className="detail-row">
            <span>当前活动</span>
            <strong>{artist.upcomingEvents.length} 场</strong>
          </div>
          {artist.officialUrl ? (
            <a className="text-link" href={artist.officialUrl} rel="noreferrer" target="_blank">
              官方入口
            </a>
          ) : null}
        </div>
      </section>

      <section className="section-head">
        <div>
          <p className="eyebrow">Upcoming Events</p>
          <h2>已追踪巡演活动</h2>
        </div>
        <Link className="text-link" href={`/calendar?artist=${artist.slug}`}>
          在日历页查看
        </Link>
      </section>

      <section className="event-grid">
        {artist.upcomingEvents.map((event: EventItem) => (
          <EventCard event={event} key={event.id} />
        ))}
      </section>

      <section className="section-head">
        <div>
          <p className="eyebrow">Starter Kit</p>
          <h2>入坑和观演前先看这些</h2>
        </div>
      </section>
      <section className="content-grid">
        {guides.slice(0, 2).map((guide) => (
          <GuideCard guide={guide} key={guide.slug} />
        ))}
      </section>

      <section className="section-head">
        <div>
          <p className="eyebrow">Community</p>
          <h2>和这个艺人相关的 fandom 场景</h2>
        </div>
      </section>
      <section className="content-grid">
        {communityPosts.slice(0, 2).map((post) => (
          <CommunityCard key={post.slug} post={post} />
        ))}
      </section>
    </main>
  );
}
