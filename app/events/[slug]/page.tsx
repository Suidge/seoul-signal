import Link from "next/link";
import { notFound } from "next/navigation";
import { FavoriteToggle } from "@/components/favorite-toggle";
import { Header } from "@/components/header";
import { ShareButton } from "@/components/share-button";
import { formatEventDateLabel, getEventBySlug, getEvents } from "@/lib/events";
import {
  type EventItem,
  findSourceStatus,
  formatShortDate,
  getStatusLabel
} from "@/lib/site-data";

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

  const sourceStatus = findSourceStatus(event.sourceUrl);

  return (
    <main className="page-shell">
      <Header />
      <section className="detail-hero">
        <div className="detail-copy">
          <p className="eyebrow">Event Detail</p>
          <h1>{event.title}</h1>
          <p className="hero-text">{event.description}</p>
          <div className="detail-actions">
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
          {event.priceNote ? <p className="detail-note">票务提示: {event.priceNote}</p> : null}
          {event.ticketSaleDate ? (
            <p className="detail-note">开票时间: {formatEventDateLabel(event.ticketSaleDate)}</p>
          ) : null}
        </article>
        <article className="detail-block">
          <p className="eyebrow">Travel</p>
          <h2>出行与准备</h2>
          <p>{event.travelNote ?? "暂未补充出行提示。"}</p>
          {event.checklist?.length ? (
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
          <p>试运行阶段优先保留官方或主办方入口，降低中文用户在跨平台找信息时的误差和跳转成本。</p>
          {event.sourceConfidence ? <p className="detail-note">来源层级: {event.sourceConfidence}</p> : null}
          {sourceStatus ? (
            <>
              <p className="detail-note">最近检查: {sourceStatus.checkedAt ? formatShortDate(sourceStatus.checkedAt) : "未检查"}</p>
              <p className="detail-note">来源状态: {sourceStatus.ok ? `正常 (${sourceStatus.status})` : `需复查${sourceStatus.status ? ` (${sourceStatus.status})` : ""}`}</p>
            </>
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
