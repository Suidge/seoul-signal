import Link from "next/link";
import { notFound } from "next/navigation";
import { FavoriteToggle } from "@/components/favorite-toggle";
import { Header } from "@/components/header";
import { SaveEventForm } from "@/components/save-event-form";
import { ShareButton } from "@/components/share-button";
import {
  formatEventDateLabel,
  getEventBySlug,
  getEvents
} from "@/lib/events";
import { type EventItem, getStatusLabel } from "@/lib/site-data";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const events = await getEvents();
  return events.map((event: EventItem) => ({ slug: event.slug }));
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  return (
    <main className="page-shell">
      <Header />
      <section className="detail-hero">
        <div className="detail-copy">
          <p className="eyebrow">Event Detail</p>
          <h1>{event.title}</h1>
          <p className="hero-text">{event.description}</p>
          <div className="detail-actions">
            <SaveEventForm eventSlug={event.slug} />
            <FavoriteToggle slug={event.slug} />
            <ShareButton title={event.title} />
            {event.ticketLinks.map((link: EventItem["ticketLinks"][number]) => (
              <a
                className="primary-button"
                href={link.href}
                key={link.href}
                rel="noreferrer"
                target="_blank"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
        <aside className="detail-panel">
          <div className="detail-row">
            <span>艺人</span>
            <strong>{event.artist}</strong>
          </div>
          {event.artistNameKo ? (
            <div className="detail-row">
              <span>韩文名</span>
              <strong>{event.artistNameKo}</strong>
            </div>
          ) : null}
          {event.tourName ? (
            <div className="detail-row">
              <span>巡演</span>
              <strong>{event.tourName}</strong>
            </div>
          ) : null}
          <div className="detail-row">
            <span>状态</span>
            <strong>{getStatusLabel(event.status)}</strong>
          </div>
          <div className="detail-row">
            <span>时间</span>
            <strong>{formatEventDateLabel(event.startDate)}</strong>
          </div>
          <div className="detail-row">
            <span>场馆</span>
            <strong>
              {event.venue}, {event.city}
            </strong>
          </div>
          <div className="detail-row">
            <span>来源</span>
            <strong>{event.source}</strong>
          </div>
          {event.doorsTime ? (
            <div className="detail-row">
              <span>入场时间</span>
              <strong>{event.doorsTime}</strong>
            </div>
          ) : null}
        </aside>
      </section>

      <section className="detail-content">
        <article className="detail-block">
          <p className="eyebrow">Purchase Guide</p>
          <h2>购票与观演提示</h2>
          <p>{event.purchaseHint ?? "暂未补充购票说明。"}</p>
          {"priceNote" in event && event.priceNote ? (
            <p className="detail-note">票务提示: {event.priceNote}</p>
          ) : null}
          {"ticketSaleDate" in event && event.ticketSaleDate ? (
            <p className="detail-note">开票时间: {formatEventDateLabel(event.ticketSaleDate)}</p>
          ) : null}
        </article>
        <article className="detail-block">
          <p className="eyebrow">Travel</p>
          <h2>出行与准备</h2>
          <p>{"travelNote" in event && event.travelNote ? event.travelNote : "暂未补充出行提示。"}</p>
          {"checklist" in event && Array.isArray(event.checklist) ? (
            <ul className="checklist">
              {event.checklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
        </article>
        <article className="detail-block">
          <p className="eyebrow">Source</p>
          <h2>来源与可信度</h2>
          <p>
            当前页面会保留结构化来源字段，后续可继续增加来源快照、变更历史、人工审核状态和更新时间线。
          </p>
          {"sourceConfidence" in event && event.sourceConfidence ? (
            <p className="detail-note">来源层级: {event.sourceConfidence}</p>
          ) : null}
          {event.sourceUrl ? (
            <a className="text-link" href={event.sourceUrl} rel="noreferrer" target="_blank">
              查看来源页面
            </a>
          ) : null}
        </article>
      </section>

      <Link className="text-link back-link" href="/calendar">
        返回巡演日历
      </Link>
    </main>
  );
}
