"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarFilters } from "@/components/calendar-filters";
import { EventCard } from "@/components/event-card";
import type { ArtistProfile, EventItem, EventStatusValue } from "@/lib/site-data";
import { formatMonthLabel, slugifyArtistName, uniqueCountries } from "@/lib/site-data";

type Props = {
  artists: ArtistProfile[];
  events: EventItem[];
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
    const haystack =
      `${item.artist} ${item.city} ${item.country} ${item.venue}`.toLowerCase();
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

  return next.sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );
}

export function CalendarBrowser({ artists, events }: Props) {
  const searchParams = useSearchParams();
  const sort = searchParams.get("sort") ?? "date";
  const filteredEvents = useMemo(
    () => sortEvents(events.filter((item) => matches(item, searchParams)), sort),
    [events, searchParams, sort]
  );
  const current = {
    artist: searchParams.get("artist") ?? undefined,
    country: searchParams.get("country") ?? undefined,
    status: (searchParams.get("status") as EventStatusValue | null) ?? undefined,
    q: searchParams.get("q") ?? undefined
  };

  const grouped = filteredEvents.reduce<Record<string, EventItem[]>>((acc, item) => {
    const label = formatMonthLabel(item.startDate);
    acc[label] ??= [];
    acc[label].push(item);
    return acc;
  }, {});

  const monthEntries = Object.entries(grouped);

  return (
    <>
      <CalendarFilters
        artistOptions={artists.map((artist) => ({
          label: artist.name,
          value: artist.slug
        }))}
        countryOptions={uniqueCountries(events)}
        current={current}
      />
      <section className="insight-strip">
        <article>
          <strong>{filteredEvents.length}</strong>
          <span>结果</span>
        </article>
        <article>
          <strong>{monthEntries.length}</strong>
          <span>月份</span>
        </article>
        <article>
          <strong>{filteredEvents.filter((event) => event.status === "on_sale").length}</strong>
          <span>售票中</span>
        </article>
        <form action="/calendar" className="sort-form">
          {Array.from(searchParams.entries())
            .filter(([key]) => key !== "sort")
            .map(([key, value]) => (
              <input key={`${key}-${value}`} name={key} type="hidden" value={value} />
            ))}
          <label className="field">
            <span>排序</span>
            <select defaultValue={sort} name="sort">
              <option value="date">按日期</option>
              <option value="artist">按艺人</option>
              <option value="city">按城市</option>
            </select>
          </label>
        </form>
      </section>
      {filteredEvents.length === 0 ? (
        <section className="empty-state">
          <p className="eyebrow">No Results</p>
          <h2>当前筛选下没有活动</h2>
          <p className="hero-text">可以重置筛选，或者先按艺人进入详情页再逐步收藏。</p>
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
