import Link from "next/link";
import { FavoriteToggle } from "@/components/favorite-toggle";
import {
  type EventItem,
  findArtistByName,
  formatDate,
  getStatusLabel
} from "@/lib/site-data";

type Props = {
  event: EventItem;
};

export function EventCard({ event }: Props) {
  const artist = findArtistByName(event.artist);

  return (
    <article className="event-card">
      <div className="event-topline">
        <span className={`status-pill status-${event.status}`}>
          {getStatusLabel(event.status)}
        </span>
        <Link href={artist ? `/artists/${artist.slug}` : `/calendar?q=${encodeURIComponent(event.artist)}`}>
          {event.artist}
        </Link>
        <FavoriteToggle compact slug={event.slug} />
      </div>
      <h3>
        <Link href={`/events/${event.slug}`}>
          {event.city}, {event.country}
        </Link>
      </h3>
      <p className="event-meta">{event.venue}</p>
      <p className="event-date">{formatDate(event.startDate)}</p>
      <p className="event-source">来源: {event.source}</p>
      <div className="tag-row">
        {event.tags.map((tag) => (
          <span className="tag" key={tag}>
            {tag}
          </span>
        ))}
      </div>
      <div className="link-row">
        <Link className="ticket-link" href={`/events/${event.slug}`}>
          查看详情
        </Link>
        {event.ticketLinks.map((link) => (
          <a
            className="ticket-link"
            href={link.href}
            key={link.href}
            rel="noreferrer"
            target="_blank"
          >
            {link.label}
          </a>
        ))}
      </div>
    </article>
  );
}
