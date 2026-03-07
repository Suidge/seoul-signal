import { EventStatus, TicketLinkType } from "@/generated/prisma";
import { prisma } from "@/lib/db";
import {
  type ArtistProfile,
  type EventItem,
  type EventStatusValue,
  artists as mockArtists,
  events as mockEvents,
  findArtistByName,
  findArtistBySlug,
  formatDate,
  getStatusLabel,
  slugifyArtistName
} from "@/lib/site-data";

export type EventDetail = EventItem & {
  title: string;
  description?: string;
  purchaseHint?: string;
  sourceUrl?: string;
  doorsTime?: string;
  artistNameKo?: string;
  tourName?: string;
};

export type EventFilters = {
  artist?: string;
  country?: string;
  status?: EventStatusValue;
  q?: string;
};

export type ArtistDetail = ArtistProfile & {
  upcomingEvents: EventItem[];
};

function toMockDetail(event: EventItem): EventDetail {
  const artist = findArtistByName(event.artist);

  return {
    ...event,
    title: event.title ?? `${event.artist} Live in ${event.city}`,
    description:
      event.description ??
      "当前为演示数据。未来这里会展示完整活动介绍、购票说明、入场时间、观演须知和来源快照。",
    purchaseHint:
      event.purchaseHint ?? "正式接入数据库后，这里会优先显示官方购票规则和中文说明。",
    artistNameKo: artist?.nameKo,
    tourName: `${event.artist} World Tour`
  };
}

function mapStatus(status: EventStatus): EventStatusValue {
  switch (status) {
    case EventStatus.ANNOUNCED:
      return "announced";
    case EventStatus.ON_SALE:
      return "on_sale";
    case EventStatus.SOLD_OUT:
      return "sold_out";
    case EventStatus.CANCELLED:
      return "announced";
    default:
      return "announced";
  }
}

function mapTicketType(type: TicketLinkType) {
  switch (type) {
    case TicketLinkType.FANCLUB:
      return "fanclub";
    case TicketLinkType.RESALE:
      return "resale";
    case TicketLinkType.OFFICIAL:
    default:
      return "official";
  }
}

function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}

function filterEvents(items: EventItem[], filters: EventFilters) {
  return items.filter((item) => {
    if (filters.artist && slugifyArtistName(item.artist) !== filters.artist) {
      return false;
    }

    if (filters.country && item.country !== filters.country) {
      return false;
    }

    if (filters.status && item.status !== filters.status) {
      return false;
    }

    if (filters.q) {
      const haystack =
        `${item.artist} ${item.city} ${item.country} ${item.venue}`.toLowerCase();
      if (!haystack.includes(filters.q.toLowerCase())) {
        return false;
      }
    }

    return true;
  });
}

export async function getEvents(filters: EventFilters = {}): Promise<EventItem[]> {
  const items = await getAllEvents();
  return filterEvents(items, filters);
}

export async function getAllEvents(): Promise<EventItem[]> {
  if (!hasDatabaseUrl()) {
    return mockEvents;
  }

  try {
    const items = await prisma.event.findMany({
      orderBy: { startAt: "asc" },
      include: {
        artist: true,
        venue: true,
        ticketLinks: true
      }
    });

    return items.map<EventItem>((item) => ({
      id: item.id,
      artist: item.artist.name,
      slug: item.slug,
      city: item.venue.city,
      country: item.venue.country,
      venue: item.venue.name,
      startDate: item.startAt.toISOString(),
      status: mapStatus(item.status),
      source: item.sourceLabel,
      sourceUrl: item.sourceUrl ?? undefined,
      tags: [getStatusLabel(mapStatus(item.status)), item.venue.country],
      title: item.title,
      description: item.description ?? undefined,
      purchaseHint: item.purchaseHint ?? undefined,
      doorsTime: item.doorsTime ?? undefined,
      ticketLinks: item.ticketLinks.map((link) => ({
        label: link.label,
        href: link.href,
        type: mapTicketType(link.type)
      }))
    }));
  } catch {
    return mockEvents;
  }
}

export async function getArtists(): Promise<ArtistProfile[]> {
  if (!hasDatabaseUrl()) {
    return mockArtists;
  }

  try {
    const items = await prisma.artist.findMany({
      orderBy: { name: "asc" }
    });

    return items.map((item) => ({
      slug: item.slug,
      name: item.name,
      nameKo: item.nameKo ?? undefined,
      fandom: undefined,
      tagline: "Tracked on Seoul Signal",
      intro:
        item.description ??
        "已接入平台数据模型。后续会补充艺人介绍、站内内容和聚合事件。",
      accent: "#d36e57"
    }));
  } catch {
    return mockArtists;
  }
}

export async function getArtistBySlug(slug: string): Promise<ArtistDetail | null> {
  const artists = await getArtists();
  const artist = artists.find((item) => item.slug === slug) ?? findArtistBySlug(slug);

  if (!artist) {
    return null;
  }

  const upcomingEvents = await getEvents({ artist: slug });

  return {
    ...artist,
    upcomingEvents
  };
}

export async function getEventBySlug(slug: string): Promise<EventDetail | null> {
  if (!hasDatabaseUrl()) {
    const mockEvent = mockEvents.find((item) => item.slug === slug);
    return mockEvent ? toMockDetail(mockEvent) : null;
  }

  try {
    const item = await prisma.event.findUnique({
      where: { slug },
      include: {
        artist: true,
        tour: true,
        venue: true,
        ticketLinks: true
      }
    });

    if (!item) {
      return null;
    }

    return {
      id: item.id,
      artist: item.artist.name,
      artistNameKo: item.artist.nameKo ?? undefined,
      slug: item.slug,
      city: item.venue.city,
      country: item.venue.country,
      venue: item.venue.name,
      startDate: item.startAt.toISOString(),
      status: mapStatus(item.status),
      source: item.sourceLabel,
      sourceUrl: item.sourceUrl ?? undefined,
      tags: [
        getStatusLabel(mapStatus(item.status)),
        item.venue.city,
        item.venue.country
      ],
      ticketLinks: item.ticketLinks.map((link) => ({
        label: link.label,
        href: link.href,
        type: mapTicketType(link.type)
      })),
      title: item.title,
      description: item.description ?? undefined,
      purchaseHint: item.purchaseHint ?? undefined,
      doorsTime: item.doorsTime ?? undefined,
      tourName: item.tour?.name ?? undefined
    };
  } catch {
    const mockEvent = mockEvents.find((item) => item.slug === slug);
    return mockEvent ? toMockDetail(mockEvent) : null;
  }
}

export function formatEventDateLabel(date: string) {
  return formatDate(date);
}
