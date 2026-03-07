import type { Metadata } from "next";
import { createCommentAction } from "@/app/actions";
import { Header } from "@/components/header";
import { getCurrentUser } from "@/lib/auth";
import { getCommunityPostBySlug, getCommunityPosts } from "@/lib/community";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const posts = await getCommunityPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getCommunityPostBySlug(slug);
  return post ? { title: `${post.title} | Seoul Signal`, description: post.summary } : {};
}

export default async function CommunityPostPage({ params }: Props) {
  const { slug } = await params;
  const [post, user] = await Promise.all([getCommunityPostBySlug(slug), getCurrentUser()]);

  if (!post) {
    notFound();
  }

  return (
    <main className="page-shell">
      <Header />
      <section className="detail-hero">
        <div className="detail-copy">
          <p className="eyebrow">{post.kind}</p>
          <h1>{post.title}</h1>
          <p className="hero-text">{post.body}</p>
        </div>
        <aside className="detail-panel">
          <div className="detail-row">
            <span>城市</span>
            <strong>{post.city}</strong>
          </div>
          <div className="detail-row">
            <span>作者</span>
            <strong>{post.authorName ?? "匿名"}</strong>
          </div>
          <div className="detail-row">
            <span>发布时间</span>
            <strong>{post.dateLabel}</strong>
          </div>
        </aside>
      </section>

      <section className="detail-content single-column">
        <article className="detail-block">
          <p className="eyebrow">Comments</p>
          <h2>评论区</h2>
          {post.comments.length ? (
            <div className="comment-list">
              {post.comments.map((comment) => (
                <article className="comment-card" key={comment.id}>
                  <div className="meta-line">
                    <span>{comment.authorName}</span>
                    <span>{comment.createdAtLabel}</span>
                  </div>
                  <p>{comment.body}</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="hero-text">还没有评论，可以由你先开场。</p>
          )}
        </article>

        {user ? (
          <article className="detail-block">
            <p className="eyebrow">Reply</p>
            <h2>发布评论</h2>
            <form action={createCommentAction} className="auth-form">
              <input name="postSlug" type="hidden" value={post.slug} />
              <label className="field">
                <span>内容</span>
                <textarea minLength={2} name="body" required rows={5} />
              </label>
              <button className="primary-button" type="submit">
                发表评论
              </button>
            </form>
          </article>
        ) : null}
      </section>
    </main>
  );
}
