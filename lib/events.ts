import {
  type ArtistProfile,
  type EventItem,
  type EventStatusValue,
  type TourPlanItem,
  artists,
  events,
  findArtistByName,
  findArtistBySlug,
  formatDate,
  slugifyArtistName,
  tourPlans
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
  tourPlans: TourPlanItem[];
};

function toDetail(event: EventItem): EventDetail {
  const artist = findArtistByName(event.artist);

  return {
    ...event,
    title: event.title ?? `${event.artist} Live in ${event.city}`,
    description: event.description,
    purchaseHint: event.purchaseHint,
    artistNameKo: artist?.nameKo,
    tourName: event.tourName ?? `${event.artist} Tour`
  };
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
      const haystack = `${item.artist} ${item.city} ${item.country} ${item.venue}`.toLowerCase();
      if (!haystack.includes(filters.q.toLowerCase())) {
        return false;
      }
    }

    return true;
  });
}

export async function getEvents(filters: EventFilters = {}): Promise<EventItem[]> {
  return filterEvents(events, filters);
}

export async function getAllEvents(): Promise<EventItem[]> {
  return [...events].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );
}

export async function getArtists(): Promise<ArtistProfile[]> {
  return [...artists].sort((a, b) => a.name.localeCompare(b.name, "en"));
}

export async function getArtistBySlug(slug: string): Promise<ArtistDetail | null> {
  const artist = findArtistBySlug(slug);

  if (!artist) {
    return null;
  }

  const upcomingEvents = await getEvents({ artist: slug });
  const artistTourPlans = tourPlans.filter((item) => item.artistSlug === slug);

  return {
    ...artist,
    upcomingEvents,
    tourPlans: artistTourPlans
  };
}

export async function getEventBySlug(slug: string): Promise<EventDetail | null> {
  const event = events.find((item) => item.slug === slug);
  return event ? toDetail(event) : null;
}

export async function getTourPlans(): Promise<TourPlanItem[]> {
  return [...tourPlans].sort((a, b) => a.artist.localeCompare(b.artist, "en"));
}

export function formatEventDateLabel(date: string, timezone?: string) {
  return formatDate(date, timezone);
}
