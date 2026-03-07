import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header";
import { getCurrentUser } from "@/lib/auth";
import { getAccountSnapshot } from "@/lib/account";
import { getCommunityPosts } from "@/lib/community";
import { getEvents } from "@/lib/events";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "我的主页 | Seoul Signal"
};

export default async function MePage() {
  const user = await getCurrentUser();

  if (!user) {
    notFound();
  }

  const [events, posts, account] = await Promise.all([
    getEvents(),
    getCommunityPosts(),
    getAccountSnapshot()
  ]);
  const myPosts = account?.posts ?? posts.filter((post) => post.authorName === user.name);
  const savedEvents = account?.savedEvents ?? [];
  const follows = account?.follows ?? [];

  return (
    <main className="page-shell">
      <Header />
      <section className="artist-hero">
        <div>
          <p className="eyebrow">Profile</p>
          <h1>{user.name}</h1>
          <p className="hero-text">
            这里汇总你保存的活动、关注的艺人和发布的内容，方便持续追踪自己的 fandom 轨迹。
          </p>
        </div>
        <div className="artist-hero-panel">
          <div className="detail-row">
            <span>邮箱</span>
            <strong>{user.email}</strong>
          </div>
          <div className="detail-row">
            <span>城市</span>
            <strong>{user.city || "未填写"}</strong>
          </div>
          <div className="detail-row">
            <span>已保存活动</span>
            <strong>{savedEvents.length} 场</strong>
          </div>
          <div className="detail-row">
            <span>关注艺人</span>
            <strong>{follows.length} 个</strong>
          </div>
          <div className="detail-row">
            <span>我的帖子</span>
            <strong>{myPosts.length} 条</strong>
          </div>
        </div>
      </section>

      <section className="section-head">
        <div>
          <p className="eyebrow">Saved Events</p>
          <h2>你保存的活动</h2>
        </div>
        <Link className="text-link" href="/calendar">
          浏览活动
        </Link>
      </section>
      <section className="content-grid">
        {savedEvents.length ? (
          savedEvents.map((item) => (
            <article className="content-card" key={item.id}>
              <p className="eyebrow">{item.event.artist.name}</p>
              <h3>{item.event.title}</h3>
              <p className="content-summary">
                {item.event.venue.city}, {item.event.venue.country}
              </p>
              <Link className="text-link" href={`/events/${item.event.slug}`}>
                查看活动
              </Link>
            </article>
          ))
        ) : (
          <article className="empty-state">
            <p className="eyebrow">No Saved Events</p>
            <h2>你还没有保存活动</h2>
            <p className="hero-text">登录后可以在活动详情页把感兴趣的场次保存到这里。</p>
          </article>
        )}
      </section>

      <section className="section-head">
        <div>
          <p className="eyebrow">My Community</p>
          <h2>你的社区内容</h2>
        </div>
        <Link className="text-link" href="/community/new">
          发布新帖子
        </Link>
      </section>
      <section className="content-grid">
        {myPosts.length ? (
          myPosts.map((post) => (
            <article className="content-card" key={post.slug}>
              <p className="eyebrow">{String(post.kind).toLowerCase()}</p>
              <h3>{post.title}</h3>
              <p className="content-summary">
                {"summary" in post ? post.summary : post.body.slice(0, 80)}
              </p>
              <Link className="text-link" href={`/community/${post.slug}`}>
                查看帖子
              </Link>
            </article>
          ))
        ) : (
          <article className="empty-state">
            <p className="eyebrow">No Posts Yet</p>
            <h2>你还没有发过帖子</h2>
            <p className="hero-text">可以先发布一条同行、应援或票务提醒帖。</p>
          </article>
        )}
      </section>
    </main>
  );
}
