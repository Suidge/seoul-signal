import artistsData from "@/data/artists.json";
import communityData from "@/data/community.json";
import eventsData from "@/data/events.json";
import guidesData from "@/data/guides.json";
import siteMetaData from "@/data/site-meta.json";
import sourceRegistryData from "@/data/source-registry.json";
import sourceStatusData from "@/data/source-status.json";

export type TicketLink = {
  label: string;
  href: string;
  type: "official" | "resale" | "fanclub";
};

export type EventStatusValue = "on_sale" | "announced" | "sold_out";

export type EventItem = {
  id: string;
  artist: string;
  artistSlug?: string;
  slug: string;
  city: string;
  country: string;
  venue: string;
  startDate: string;
  timezone?: string;
  status: EventStatusValue;
  source: string;
  sourceUrl?: string;
  sourceConfidence?: "official" | "partner" | "venue";
  tags: string[];
  title?: string;
  description?: string;
  purchaseHint?: string;
  priceNote?: string;
  travelNote?: string;
  checklist?: string[];
  ticketSaleDate?: string;
  doorsTime?: string;
  ticketLinks: TicketLink[];
};

export type ArtistProfile = {
  slug: string;
  name: string;
  nameKo?: string;
  fandom?: string;
  tagline: string;
  intro: string;
  accent: string;
  officialUrl?: string;
};

export type GuideItem = {
  slug: string;
  title: string;
  category: "ticketing" | "travel" | "fandom";
  summary: string;
  body: string;
  bullets: string[];
  relatedArtists?: string[];
};

export type CommunityPost = {
  slug: string;
  title: string;
  city: string;
  kind: "meetup" | "fan-project" | "watch-party";
  summary: string;
  dateLabel: string;
  relatedArtists?: string[];
};

export type SourceRegistryItem = {
  id: string;
  label: string;
  category: "artist" | "ticketing" | "venue";
  artistSlug?: string;
  city?: string;
  url: string;
};

export type SourceStatusItem = SourceRegistryItem & {
  checkedAt?: string;
  method?: string | null;
  ok: boolean;
  status?: number | null;
  finalUrl?: string | null;
  etag?: string | null;
  lastModified?: string | null;
  contentType?: string | null;
  error?: string;
};

export const artists = artistsData as ArtistProfile[];
export const events = eventsData as EventItem[];
export const guides = guidesData as GuideItem[];
export const communityPosts = communityData as CommunityPost[];
export const sourceRegistry = sourceRegistryData as SourceRegistryItem[];
export const sourceStatus = sourceStatusData as SourceStatusItem[];
export const siteMeta = siteMetaData as {
  generatedAt: string;
  siteMode: string;
  coverageNote: string;
  counts: {
    artists: number;
    events: number;
    guides: number;
    communityPosts: number;
    monitoredSources: number;
  };
  sourceHealth?: {
    ok: number;
    failed: number;
    lastCheckedAt: string | null;
  };
};

export const featuredArtists = artists.slice(0, 10).map((artist) => artist.name);

export const productPillars = [
  {
    title: "低维护试运行",
    body: "公开前台放在 GitHub Pages，本地主机只负责低频整理数据、探测来源状态并自动推送。"
  },
  {
    title: "中文决策支持",
    body: "把开票节点、交通、选座和风险提示按中文粉丝最常见的决策路径组织。"
  },
  {
    title: "逐步验证 fandom",
    body: "先看哪些艺人、城市和内容最受欢迎，再决定后续做多深的账号和社区。"
  }
];

export const launchHighlights = [
  {
    title: "主流艺人覆盖",
    body: "先把站内艺人页扩到主流关注对象，哪怕不是每个艺人都已有完整巡演，也先把官方入口和监测状态搭起来。"
  },
  {
    title: "活动与指南并重",
    body: "试运行阶段不只展示活动卡片，还同步建设各城市和场馆的中文观演指南。"
  },
  {
    title: "自动维护优先",
    body: "本地主机每天自动探测官方来源、校验数据并推送 Pages 发布。"
  }
];

export function getStatusLabel(status: EventStatusValue) {
  switch (status) {
    case "on_sale":
      return "售票中";
    case "announced":
      return "已官宣";
    case "sold_out":
      return "已售罄";
    default:
      return status;
  }
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(date));
}

export function formatShortDate(date: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(date));
}

export function findArtistByName(name: string) {
  return artists.find((artist) => artist.name === name) ?? null;
}

export function findArtistBySlug(slug: string) {
  return artists.find((artist) => artist.slug === slug) ?? null;
}

export function slugifyArtistName(name: string) {
  return findArtistByName(name)?.slug ?? name.toLowerCase().replaceAll(" ", "-");
}

export function uniqueCountries(items: EventItem[]) {
  return [...new Set(items.map((item) => item.country))].sort();
}

export function formatMonthLabel(date: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long"
  }).format(new Date(date));
}

export function findSourceStatus(url?: string) {
  if (!url) {
    return null;
  }

  return sourceStatus.find((item) => item.url === url) ?? null;
}
