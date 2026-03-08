import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CommunityCard } from "@/components/community-card";
import { EventCard } from "@/components/event-card";
import { GuideCard } from "@/components/guide-card";
import { Header } from "@/components/header";
import { ImageAttributionLine } from "@/components/image-attribution";
import { TourPlanCard } from "@/components/tour-plan-card";
import { getArtistBySlug, getArtists } from "@/lib/events";
import { assetPath } from "@/lib/assets";
import { communityPosts, guides, type EventItem } from "@/lib/site-data";
import { formatShortDate, officialUpdates } from "@/lib/site-data";

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
    title: `${artist.name} | Koncert Together`,
    description: `${artist.name} 的巡演情报页，包含成员档案、活动卡片、巡演消息和官方入口。`
  };
}

export default async function ArtistDetailPage({ params }: Props) {
  const { slug } = await params;
  const artist = await getArtistBySlug(slug);

  if (!artist) {
    notFound();
  }

  const relatedGuides = guides.filter((guide) => guide.relatedArtists?.includes(artist.slug)).slice(0, 4);
  const relatedPosts = communityPosts.filter((post) => post.relatedArtists?.includes(artist.slug)).slice(0, 3);
  const latestOfficialUpdate = officialUpdates.find((item) => item.artistSlug === artist.slug && item.relevant && item.title);

  return (
    <main className="page-shell">
      <Header />
      <section className="artist-hero artist-hero-rich" style={{ ["--artist-accent" as string]: artist.accent }}>
        <div className="artist-hero-copy">
          <p className="eyebrow">艺人主页</p>
          <h1>{artist.name}</h1>
          <p className="hero-text">{artist.intro}</p>
          <div className="hero-actions">
            <Link className="primary-button" href={`/calendar?artist=${artist.slug}`}>
              查看巡演
            </Link>
            {artist.officialUrl ? (
              <a className="secondary-button" href={artist.officialUrl} rel="noreferrer" target="_blank">
                官方入口
              </a>
            ) : null}
          </div>
        </div>
        <div className="artist-hero-visual">
          {artist.heroImage ? <img alt={artist.name} className="artist-hero-image" src={assetPath(artist.heroImage)} /> : null}
          <ImageAttributionLine attribution={artist.imageAttribution} />
        </div>
        <div className="artist-hero-panel">
          <div className="detail-row">
            <span>韩文名</span>
            <strong>{artist.nameKo ?? "暂无公开信息"}</strong>
          </div>
          <div className="detail-row">
            <span>粉丝名</span>
            <strong>{artist.fandom ?? "暂无公开信息"}</strong>
          </div>
          <div className="detail-row">
            <span>公司</span>
            <strong>{artist.agency ?? "暂无公开信息"}</strong>
          </div>
          <div className="detail-row">
            <span>出道</span>
            <strong>{artist.debutYear ?? "暂无公开信息"}</strong>
          </div>
          <div className="detail-row">
            <span>成员</span>
            <strong>{artist.memberCount ?? artist.members?.length ?? 0} 位</strong>
          </div>
          <div className="detail-row">
            <span>地区</span>
            <strong>{artist.origin ?? "暂无公开信息"}</strong>
          </div>
        </div>
      </section>

      <section className="section-head">
        <div>
          <p className="eyebrow">成员档案</p>
          <h2>成员看点与 profile</h2>
        </div>
      </section>
      <section className="member-grid">
        {(artist.members ?? []).map((member) => (
          <article className="member-card" key={member.slug}>
            <div className="member-avatar" style={{ ["--artist-accent" as string]: artist.accent }}>
              <span>{member.initials}</span>
            </div>
            <div>
              <h3>{member.name}</h3>
              <p className="member-role">{member.role}</p>
              <p className="artist-intro">{member.profile}</p>
            </div>
          </article>
        ))}
      </section>

      {latestOfficialUpdate ? (
        <>
          <section className="section-head">
            <div>
              <p className="eyebrow">官方动态</p>
              <h2>最近一条值得留意的官方更新</h2>
            </div>
          </section>
          <section className="content-grid">
            <article className="detail-block">
              <p className="eyebrow">{latestOfficialUpdate.provider}</p>
              <h2>{latestOfficialUpdate.title}</h2>
              <p>
                这一条是从官方页面自动同步过来的，适合在等新一轮排期、fanmeeting 或 teaser 时先盯住风向。
              </p>
              <p className="detail-note">
                最近同步: {formatShortDate(latestOfficialUpdate.checkedAt)}
              </p>
              {latestOfficialUpdate.publishedAt ? (
                <p className="detail-note">官方发布时间: {formatShortDate(latestOfficialUpdate.publishedAt)}</p>
              ) : null}
              <div className="link-row">
                <a className="ticket-link" href={latestOfficialUpdate.sourceUrl} rel="noreferrer" target="_blank">
                  查看官方页面
                </a>
              </div>
            </article>
          </section>
        </>
      ) : null}

      <section className="section-head">
        <div>
          <p className="eyebrow">已官宣排期</p>
          <h2>已整理排期</h2>
        </div>
        <Link className="text-link" href={`/calendar?artist=${artist.slug}`}>
          在日历页查看
        </Link>
      </section>
      <section className="event-grid">
        {artist.upcomingEvents.length ? (
          artist.upcomingEvents.map((event: EventItem) => <EventCard event={event} key={event.id} />)
        ) : (
          <article className="detail-block single-card-message">
            <p className="eyebrow">排期待补</p>
            <h2>这一页暂时还没有落到具体日期的正式场次</h2>
            <p>下面会继续盯住官宣和巡演消息，日期一出来就会第一时间补进日历。</p>
          </article>
        )}
      </section>

      <section className="section-head">
        <div>
          <p className="eyebrow">巡演消息</p>
          <h2>还在等完整官宣的巡演动向</h2>
        </div>
      </section>
      <section className="content-grid">
        {artist.tourPlans.length ? (
          artist.tourPlans.map((plan) => <TourPlanCard key={plan.slug} plan={plan} />)
        ) : (
          <article className="detail-block single-card-message">
            <p className="eyebrow">消息稳定</p>
            <h2>目前没有额外需要单独提醒的巡演动向</h2>
            <p>已经确认的内容都整理在上方活动卡片里了，后续有新城市或新轮次会继续补上。</p>
          </article>
        )}
      </section>

      {relatedGuides.length ? (
        <>
          <section className="section-head">
            <div>
              <p className="eyebrow">先看这些</p>
              <h2>入坑、抢票和观演前最值得先补的内容</h2>
            </div>
          </section>
          <section className="content-grid">
            {relatedGuides.map((guide) => (
              <GuideCard guide={guide} key={guide.slug} />
            ))}
          </section>
        </>
      ) : null}

      {relatedPosts.length ? (
        <>
          <section className="section-head">
            <div>
              <p className="eyebrow">粉圈现场</p>
              <h2>和这个艺人相关的应援、同行与场馆经验</h2>
            </div>
          </section>
          <section className="content-grid">
            {relatedPosts.map((post) => (
              <CommunityCard key={post.slug} post={post} />
            ))}
          </section>
        </>
      ) : null}
    </main>
  );
}
