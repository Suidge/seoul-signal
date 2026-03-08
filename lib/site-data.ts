import artistsData from "@/data/artists.json";
import communityData from "@/data/community.json";
import eventsData from "@/data/events.json";
import guidesData from "@/data/guides.json";
import officialUpdatesData from "@/data/official-updates.json";
import siteMetaData from "@/data/site-meta.json";
import sourceRegistryData from "@/data/source-registry.json";
import sourceStatusData from "@/data/source-status.json";
import tourPlansData from "@/data/tour-plans.json";

export type TicketLink = {
  label: string;
  href: string;
  type: "official" | "resale" | "fanclub";
};

export type ImageAttribution = {
  provider: string;
  creator: string;
  license: string;
  sourceUrl: string;
  sourceLabel?: string;
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
  heroImageAttribution?: ImageAttribution;
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
  imageAttribution?: ImageAttribution;
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

export type OfficialUpdateItem = {
  artistSlug: string;
  provider: string;
  sourceUrl: string;
  checkedAt: string;
  title: string | null;
  publishedAt: string | null;
  imageUrl: string | null;
  relevant: boolean;
  error?: string;
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
export const officialUpdates = officialUpdatesData as OfficialUpdateItem[];
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
    title: "同一页看清时间、票务和动线",
    body: "把活动时间、开票入口、场馆交通和选座提醒放在一条顺手可看的浏览路径里，少在十几个页面之间来回切。"
  },
  {
    title: "艺人页不只是名字列表",
    body: "成员档案、官方入口、已官宣场次和下一轮巡演消息，会一起收在同一个主页里，方便你顺着本命一路看下去。"
  },
  {
    title: "像粉丝真的会收藏的情报站",
    body: "不做后台感页面，而是把站点做成打开以后愿意继续点进艺人、场馆和城市指南的入口。"
  }
];

export const launchHighlights = [
  {
    title: "艺人范围持续铺开",
    body: "主流男团、女团、solo 和新团都已经开始收录，先把真正会被频繁搜索的现场信息铺起来。"
  },
  {
    title: "正式排期 + 巡演消息",
    body: "日期已经落地的场次会进正式日历，仍在升温的巡演动向会单独提醒，不把风声写成官宣。"
  },
  {
    title: "成员档案直接可看",
    body: "艺人页不只给一句简介，而是把成员 profile、现场看点和相关指南一起整理出来，方便你少补一轮功课。"
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
