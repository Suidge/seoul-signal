import Link from "next/link";
import type { CommunityPost } from "@/lib/site-data";

type Props = {
  post: CommunityPost | {
    slug: string;
    title: string;
    city: string;
    kind: string;
    summary: string;
    dateLabel: string;
  };
};

export function CommunityCard({ post }: Props) {
  return (
    <article className="content-card">
      <p className="eyebrow">{post.kind}</p>
      <h3>{post.title}</h3>
      <p className="content-summary">{post.summary}</p>
      <div className="meta-line">
        <span>{post.city}</span>
        <span>{post.dateLabel}</span>
      </div>
      <Link className="text-link" href={`/community/${post.slug}`}>
        查看讨论
      </Link>
    </article>
  );
}
