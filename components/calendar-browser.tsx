"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarFilters } from "@/components/calendar-filters";
import { EventCard } from "@/components/event-card";
import { TourPlanCard } from "@/components/tour-plan-card";
import type { ArtistProfile, EventItem, EventStatusValue, TourPlanItem } from "@/lib/site-data";
import { formatMonthLabel, slugifyArtistName, uniqueCountries } from "@/lib/site-data";

type Props = {
  artists: ArtistProfile[];
  events: EventItem[];
  plans: TourPlanItem[];
};

function matches(item: EventItem, params: URLSearchParams) {
  const artist = params.get("artist");
  const country = params.get("country");
  const status = params.get("status") as EventStatusValue | null;
  const q = params.get("q");

  if (artist && slugifyArtistName(item.artist) !== artist) {
    return false;
  }

  if (country && item.country !== country) {
    return false;
  }

  if (status && item.status !== status) {
    return false;
  }

  if (q) {
    const haystack = `${item.artist} ${item.city} ${item.country} ${item.venue}`.toLowerCase();
    if (!haystack.includes(q.toLowerCase())) {
      return false;
    }
  }

  return true;
}

function matchesPlan(item: TourPlanItem, params: URLSearchParams) {
  const artist = params.get("artist");
  const q = params.get("q");

  if (artist && item.artistSlug !== artist) {
    return false;
  }

  if (q) {
    const haystack = `${item.artist} ${item.title} ${item.regions.join(" ")}`.toLowerCase();
    if (!haystack.includes(q.toLowerCase())) {
      return false;
    }
  }

  return true;
}

function sortEvents(items: EventItem[], sort: string) {
  const next = [...items];

  if (sort === "artist") {
    return next.sort((a, b) => a.artist.localeCompare(b.artist, "en"));
  }

  if (sort === "city") {
    return next.sort((a, b) => a.city.localeCompare(b.city, "en"));
  }

  return next.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
}

export function CalendarBrowser({ artists, events, plans }: Props) {
  const searchParams = useSearchParams();
  const sort = searchParams.get("sort") ?? "date";
  const filteredEvents = useMemo(
    () => sortEvents(events.filter((item) => matches(item, searchParams)), sort),
    [events, searchParams, sort]
  );
  const filteredPlans = useMemo(
    () => plans.filter((item) => matchesPlan(item, searchParams)),
    [plans, searchParams]
  );
  const current = {
    artist: searchParams.get("artist") ?? undefined,
    country: searchParams.get("country") ?? undefined,
    status: (searchParams.get("status") as EventStatusValue | null) ?? undefined,
    q: searchParams.get("q") ?? undefined,
    sort
  };

  const grouped = filteredEvents.reduce<Record<string, EventItem[]>>((acc, item) => {
    const label = formatMonthLabel(item.startDate, item.timezone);
    acc[label] ??= [];
    acc[label].push(item);
    return acc;
  }, {});

  const monthEntries = Object.entries(grouped);

  return (
    <>
      <CalendarFilters
        artistOptions={artists.map((artist) => ({ label: artist.name, value: artist.slug }))}
        countryOptions={uniqueCountries(events)}
        current={current}
      />
      <section className="insight-strip">
        <article>
          <strong>{filteredEvents.length}</strong>
          <span>活动结果</span>
        </article>
        <article>
          <strong>{monthEntries.length}</strong>
          <span>覆盖月份</span>
        </article>
        <article>
          <strong>{filteredPlans.length}</strong>
          <span>巡演雷达</span>
        </article>
        <article>
          <strong>{new Set(filteredEvents.map((event) => event.country)).size}</strong>
          <span>国家/地区</span>
        </article>
      </section>
      {filteredPlans.length ? (
        <section className="month-section">
          <div className="section-head compact-head">
            <div>
              <p className="eyebrow">Radar</p>
              <h2>尚未释放完整日期的项目</h2>
            </div>
          </div>
          <div className="content-grid">
            {filteredPlans.map((plan) => (
              <TourPlanCard key={plan.slug} plan={plan} />
            ))}
          </div>
        </section>
      ) : null}
      {filteredEvents.length === 0 ? (
        <section className="empty-state">
          <p className="eyebrow">No Results</p>
          <h2>当前筛选下没有活动</h2>
          <p className="hero-text">可以重置筛选，或改用城市和艺人关键词继续查找。</p>
        </section>
      ) : (
        monthEntries.map(([month, monthEvents]) => (
          <section className="month-section" key={month}>
            <div className="section-head compact-head">
              <div>
                <p className="eyebrow">Month</p>
                <h2>{month}</h2>
              </div>
            </div>
            <div className="event-grid">
              {monthEvents.map((event) => (
                <EventCard event={event} key={event.id} />
              ))}
            </div>
          </section>
        ))
      )}
    </>
  );
}
