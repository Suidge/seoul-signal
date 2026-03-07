import type { Metadata } from "next";
import Link from "next/link";
import { CommunityCard } from "@/components/community-card";
import { Header } from "@/components/header";
import { getCurrentUser } from "@/lib/auth";
import { getCommunityPosts } from "@/lib/community";

export const metadata: Metadata = {
  title: "Fandom 社区 | Seoul Signal",
  description: "面向中文 K-pop fans 的城市聚会、应援协作和同看活动入口。"
};

export default async function CommunityPage() {
  const [posts, user] = await Promise.all([getCommunityPosts(), getCurrentUser()]);

  return (
    <main className="page-shell">
      <Header />
      <section className="calendar-hero">
        <p className="eyebrow">Community</p>
        <h1>Fandom 社区入口</h1>
        <p className="hero-text">
          在这里可以围绕场次、城市和艺人发起真实交流，包括同行、应援、同看、票务提醒和一般讨论。
        </p>
        <div className="hero-actions">
          <Link className="primary-button" href={user ? "/community/new" : "/login"}>
            {user ? "发布帖子" : "登录后发帖"}
          </Link>
        </div>
      </section>
      <section className="content-grid">
        {posts.map((post) => (
          <CommunityCard key={post.slug} post={post} />
        ))}
      </section>
    </main>
  );
}
