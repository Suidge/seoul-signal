import Link from "next/link";
import { ArtistCard } from "@/components/artist-card";
import { CommunityCard } from "@/components/community-card";
import { EventCard } from "@/components/event-card";
import { GuideCard } from "@/components/guide-card";
import { Header } from "@/components/header";
import { getArtists, getEvents } from "@/lib/events";
import {
  type EventItem,
  communityPosts,
  formatShortDate,
  guides,
  launchHighlights,
  siteMeta,
  slugifyArtistName
} from "@/lib/site-data";

export default async function HomePage() {
  const [events, artists] = await Promise.all([getEvents(), getArtists()]);

  return (
    <main className="page-shell">
      <Header />
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">K-pop Tours, Tickets, Fandom</p>
          <h1>给中文 K-pop fans 的全球巡演日历、场馆指南与 fandom 入口。</h1>
          <p className="hero-text">
            试运行阶段先把最常被反复打开的内容做扎实：主流艺人覆盖、跨城观演指南、场馆速查和低维护的巡演更新。
          </p>
          <div className="hero-actions">
            <Link className="primary-button" href="/calendar">
              进入巡演日历
            </Link>
            <Link className="secondary-button" href="/guides">
              先看指南
            </Link>
          </div>
        </div>
        <div className="hero-panel">
          <p className="panel-label">试运行状态</p>
          <div className="hero-stats">
            <div>
              <strong>{events.length}</strong>
              <span>已整理活动</span>
            </div>
            <div>
              <strong>{artists.length}</strong>
              <span>艺人主页</span>
            </div>
            <div>
              <strong>{guides.length}</strong>
              <span>中文指南</span>
            </div>
          </div>
          <p className="content-summary">{siteMeta.coverageNote}</p>
          <div className="hero-stats compact-stats">
            <div>
              <strong>{siteMeta.counts.monitoredSources}</strong>
              <span>监测来源</span>
            </div>
            <div>
              <strong>{siteMeta.sourceHealth?.ok ?? 0}</strong>
              <span>来源正常</span>
            </div>
            <div>
              <strong>{siteMeta.sourceHealth?.failed ?? 0}</strong>
              <span>需要复查</span>
            </div>
          </div>
          {siteMeta.sourceHealth?.lastCheckedAt ? (
            <p className="content-summary">最近一次来源检查：{formatShortDate(siteMeta.sourceHealth.lastCheckedAt)}</p>
          ) : null}
          <div className="artist-cloud">
            {artists.slice(0, 8).map((artist) => (
              <span key={artist.slug}>{artist.name}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="pillar-grid">
        {launchHighlights.map((item) => (
          <article className="pillar-card" key={item.title}>
            <h2>{item.title}</h2>
            <p>{item.body}</p>
          </article>
        ))}
      </section>

      <section className="section-head">
        <div>
          <p className="eyebrow">Calendar</p>
          <h2>近期最值得先看的场次</h2>
        </div>
        <Link className="text-link" href="/calendar">
          查看全部活动
        </Link>
      </section>
      <section className="event-grid">
        {events.slice(0, 6).map((event: EventItem) => (
          <EventCard event={event} key={event.id} />
        ))}
      </section>

      <section className="section-head">
        <div>
          <p className="eyebrow">Artists</p>
          <h2>主流艺人先完整覆盖，再逐步加深内容密度</h2>
        </div>
        <Link className="text-link" href="/artists">
          查看艺人目录
        </Link>
      </section>
      <section className="artist-grid">
        {artists.slice(0, 6).map((artist) => (
          <ArtistCard
            artist={artist}
            eventCount={events.filter((event) => slugifyArtistName(event.artist) === artist.slug).length}
            key={artist.slug}
          />
        ))}
      </section>

      <section className="section-head">
        <div>
          <p className="eyebrow">Guides</p>
          <h2>先把中文用户真的会搜的指南做厚</h2>
        </div>
        <Link className="text-link" href="/guides">
          查看全部指南
        </Link>
      </section>
      <section className="content-grid">
        {guides.slice(0, 8).map((guide) => (
          <GuideCard guide={guide} key={guide.slug} />
        ))}
      </section>

      <section className="section-head">
        <div>
          <p className="eyebrow">Community</p>
          <h2>试运行先用精选内容验证 fandom 需求</h2>
        </div>
        <Link className="text-link" href="/community">
          进入社区页
        </Link>
      </section>
      <section className="content-grid">
        {communityPosts.map((post) => (
          <CommunityCard key={post.slug} post={post} />
        ))}
      </section>
    </main>
  );
}
