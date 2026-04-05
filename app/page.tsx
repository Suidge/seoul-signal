import Link from "next/link";
import { ArtistCard } from "@/components/artist-card";
import { CommunityCard } from "@/components/community-card";
import { EventCard } from "@/components/event-card";
import { GuideCard } from "@/components/guide-card";
import { Header } from "@/components/header";
import { TourPlanCard } from "@/components/tour-plan-card";
import { getArtists, getEvents, getTourPlans } from "@/lib/events";
import { assetPath } from "@/lib/assets";
import {
  communityPosts,
  guides,
  hasDisplayVisual,
  hasRealVisual,
  launchHighlights,
  slugifyArtistName,
  uniqueCountries
} from "@/lib/site-data";

export default async function HomePage() {
  const [events, artists, plans] = await Promise.all([
    getEvents(),
    getArtists({ headlinersOnly: true }),
    getTourPlans()
  ]);
  const countries = uniqueCountries(events);
  const cities = new Set(events.map((event) => event.city));
  const sourcedArtists = artists.filter((artist) => hasRealVisual(artist.imageQuality));
  const collageArtists = (sourcedArtists.length ? sourcedArtists : artists.filter((artist) => hasDisplayVisual(artist.imageQuality))).slice(0, 4);
  const featuredArtistCards = [
    ...artists.filter((artist) => hasRealVisual(artist.imageQuality)),
    ...artists.filter((artist) => !hasRealVisual(artist.imageQuality))
  ].slice(0, 9);

  return (
    <main className="page-shell">
      <Header />
      <section className="hero hero-rich">
        <div className="hero-copy">
          <p className="eyebrow">全球巡演情报</p>
          <h1>Koncert Together</h1>
          <p className="hero-text hero-lead">
            给中文 K-pop fans 的全球巡演日历、艺人主页、成员档案、场馆指南和抢票前情报站。
          </p>
          <p className="hero-text">
            从首尔、东京、香港、曼谷到巴黎、伦敦、洛杉矶，把真正会影响观演体验的时间、开票入口、场馆动线和城市经验放在同一条浏览路径里。
          </p>
          <div className="hero-actions">
            <Link className="primary-button" href="/calendar">
              浏览全部排期
            </Link>
            <Link className="secondary-button" href="/artists">
              进入艺人目录
            </Link>
          </div>
        </div>
        <div className="hero-panel hero-collage-panel">
          <div className="hero-stats">
            <div>
              <strong>{events.length}</strong>
              <span>排期卡片</span>
            </div>
            <div>
              <strong>{plans.length}</strong>
              <span>巡演雷达</span>
            </div>
            <div>
              <strong>{artists.length}</strong>
              <span>艺人主页</span>
            </div>
          </div>
          <div className="hero-stats compact-stats">
            <div>
              <strong>{cities.size}</strong>
              <span>覆盖城市</span>
            </div>
            <div>
              <strong>{countries.length}</strong>
              <span>国家/地区</span>
            </div>
            <div>
              <strong>{guides.length}</strong>
              <span>中文指南</span>
            </div>
          </div>
          <div className="hero-collage">
            {collageArtists.map((artist) => (
              <Link className="hero-collage-card" href={`/artists/${artist.slug}`} key={artist.slug}>
                {artist.coverImage && hasDisplayVisual(artist.imageQuality) ? <img alt={artist.name} src={assetPath(artist.coverImage)} /> : null}
                <span>{artist.name}</span>
              </Link>
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
          <p className="eyebrow">日历</p>
          <h2>先看已经整理到可直接决策的场次</h2>
        </div>
        <Link className="text-link" href="/calendar">
          查看全部活动
        </Link>
      </section>
      <section className="event-grid">
        {events.slice(0, 6).map((event) => (
          <EventCard event={event} key={event.id} />
        ))}
      </section>

      <section className="section-head">
        <div>
          <p className="eyebrow">艺人</p>
          <h2>从热门团体到 solo，你关心的现场看点都往这里收</h2>
        </div>
        <Link className="text-link" href="/artists">
          查看艺人目录
        </Link>
      </section>
      <section className="artist-grid">
        {featuredArtistCards.map((artist) => (
          <ArtistCard
            artist={artist}
            eventCount={events.filter((event) => slugifyArtistName(event.artist) === artist.slug).length}
            key={artist.slug}
            planCount={plans.filter((plan) => plan.artistSlug === artist.slug).length}
          />
        ))}
      </section>

      <section className="section-head">
        <div>
          <p className="eyebrow">巡演消息</p>
          <h2>官宣还没落到具体日期的项目，先在这里盯住风向</h2>
        </div>
        <Link className="text-link" href="/calendar">
          在日历页继续看
        </Link>
      </section>
      <section className="content-grid">
        {plans.slice(0, 6).map((plan) => (
          <TourPlanCard key={plan.slug} plan={plan} />
        ))}
      </section>

      <section className="section-head">
        <div>
          <p className="eyebrow">指南</p>
          <h2>把中文用户真正会搜的观演问题讲清楚</h2>
        </div>
        <Link className="text-link" href="/guides">
          查看全部指南
        </Link>
      </section>
      <section className="content-grid">
        {guides.slice(0, 6).map((guide) => (
          <GuideCard guide={guide} key={guide.slug} />
        ))}
      </section>

      <section className="section-head">
        <div>
          <p className="eyebrow">粉圈现场</p>
          <h2>从同行、应援到场馆经验，收录大家最在意的实战内容</h2>
        </div>
        <Link className="text-link" href="/community">
          查看精选
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
