import artistsData from "@/data/artists.json";
import communityData from "@/data/community.json";
import eventsData from "@/data/events.json";
import guidesData from "@/data/guides.json";
import siteMetaData from "@/data/site-meta.json";
import sourceRegistryData from "@/data/source-registry.json";
import sourceStatusData from "@/data/source-status.json";
import tourPlansData from "@/data/tour-plans.json";

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
  tourName?: string;
  description?: string;
  purchaseHint?: string;
  priceNote?: string;
  travelNote?: string;
  checklist?: string[];
  ticketSaleDate?: string;
  doorsTime?: string;
  heroImage?: string;
  ticketLinks: TicketLink[];
};

export type ArtistMember = {
  slug: string;
  name: string;
  role: string;
  profile: string;
  initials: string;
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
  agency?: string;
  debutYear?: number;
  origin?: string;
  genres?: string[];
  memberCount?: number;
  coverImage?: string;
  heroImage?: string;
  members?: ArtistMember[];
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

export type TourPlanItem = {
  slug: string;
  artistSlug: string;
  artist: string;
  title: string;
  stage: "watch";
  note: string;
  regions: string[];
  source: string;
  sourceUrl?: string;
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
  access?: "open" | "restricted" | "broken";
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
export const tourPlans = tourPlansData as TourPlanItem[];
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
    tourPlans?: number;
  };
  sourceHealth?: {
    ok: number;
    failed: number;
    lastCheckedAt: string | null;
  };
};

export const featuredArtists = artists.slice(0, 14).map((artist) => artist.name);

export const productPillars = [
  {
    title: "活动与场馆在同一页判断",
    body: "把活动时间、售票状态、票务入口、场馆交通和选座提醒放在一条浏览路径里。"
  },
  {
    title: "艺人页不止是名单",
    body: "每个艺人页都同时承接成员档案、官方入口、巡演卡片和巡演雷达。"
  },
  {
    title: "更像 fandom front page",
    body: "视觉上靠近内容平台而不是工具后台，让第一次打开的人也愿意继续点进艺人和指南。"
  }
];

export const launchHighlights = [
  {
    title: "更大的艺人库",
    body: "把主流男团、女团、solo artist 和新团先铺开，建立长期浏览入口。"
  },
  {
    title: "排期卡片 + 巡演雷达",
    body: "对已整理日期的场次给出活动卡片，对仍在等待完整官宣的项目给出巡演雷达。"
  },
  {
    title: "成员档案可直接浏览",
    body: "艺人详情页不再只给一句介绍，而是补成员 profile、品牌色和更完整的页面结构。"
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

export function formatDate(date: string, timezone?: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone
  }).format(new Date(date));
}

export function formatShortDate(date: string, timezone?: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone
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

export function formatMonthLabel(date: string, timezone?: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    timeZone: timezone
  }).format(new Date(date));
}

export function findSourceStatus(url?: string) {
  if (!url) {
    return null;
  }

  return sourceStatus.find((item) => item.url === url) ?? null;
}
