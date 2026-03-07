import { PostKind } from "@/generated/prisma";
import { prisma } from "@/lib/db";
import { communityPosts } from "@/lib/site-data";
import { hasDatabaseUrl } from "@/lib/runtime";

export type CommunityListItem = {
  slug: string;
  title: string;
  city: string;
  kind: string;
  summary: string;
  dateLabel: string;
  authorName?: string;
};

export type CommunityDetail = CommunityListItem & {
  body: string;
  comments: Array<{
    id: string;
    body: string;
    authorName: string;
    createdAtLabel: string;
  }>;
};

function formatDateLabel(value: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(value);
}

function fallbackPosts(): CommunityDetail[] {
  return communityPosts.map((post) => ({
    ...post,
    authorName: "Seoul Signal Team",
    body: `${post.summary} 这是第一版社区内容示例，后续会替换成真实用户发布内容。`,
    comments: []
  }));
}

export async function getCommunityPosts(): Promise<CommunityListItem[]> {
  if (!hasDatabaseUrl()) {
    return fallbackPosts();
  }

  try {
    const posts = await prisma.post.findMany({
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
      include: { author: true }
    });

    return posts.map((post) => ({
      slug: post.slug,
      title: post.title,
      city: post.city ?? "线上",
      kind: post.kind.toLowerCase(),
      summary: post.body.slice(0, 80),
      dateLabel: formatDateLabel(post.createdAt),
      authorName: post.author.name
    }));
  } catch {
    return fallbackPosts();
  }
}

export async function getCommunityPostBySlug(
  slug: string
): Promise<CommunityDetail | null> {
  if (!hasDatabaseUrl()) {
    return fallbackPosts().find((post) => post.slug === slug) ?? null;
  }

  try {
    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        author: true,
        comments: {
          orderBy: { createdAt: "asc" },
          include: { author: true }
        }
      }
    });

    if (!post) {
      return null;
    }

    return {
      slug: post.slug,
      title: post.title,
      city: post.city ?? "线上",
      kind: post.kind.toLowerCase(),
      summary: post.body.slice(0, 80),
      dateLabel: formatDateLabel(post.createdAt),
      authorName: post.author.name,
      body: post.body,
      comments: post.comments.map((comment) => ({
        id: comment.id,
        body: comment.body,
        authorName: comment.author.name,
        createdAtLabel: formatDateLabel(comment.createdAt)
      }))
    };
  } catch {
    return fallbackPosts().find((post) => post.slug === slug) ?? null;
  }
}

export const postKindOptions = [
  { label: "一般讨论", value: PostKind.GENERAL },
  { label: "同行/拼房", value: PostKind.MEETUP },
  { label: "应援项目", value: PostKind.FAN_PROJECT },
  { label: "同看活动", value: PostKind.WATCH_PARTY },
  { label: "票务提醒", value: PostKind.TICKETING }
] as const;
