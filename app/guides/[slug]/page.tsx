import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { guides } from "@/lib/site-data";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return guides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = guides.find((item) => item.slug === slug);
  if (!guide) return {};
  return {
    title: `${guide.title} | Koncert Together`,
    description: guide.summary
  };
}

export default async function GuideDetailPage({ params }: Props) {
  const { slug } = await params;
  const guide = guides.find((item) => item.slug === slug);
  if (!guide) notFound();

  const categoryLabel =
    guide.category === "ticketing"
      ? "抢票指南"
      : guide.category === "travel"
        ? "出行准备"
        : "粉圈常识";

  return (
    <main className="page-shell">
      <Header />
      <section className="detail-hero">
        <div className="detail-copy">
          <p className="eyebrow">{categoryLabel}</p>
          <h1>{guide.title}</h1>
          <p className="hero-text">{guide.body}</p>
        </div>
      </section>
      <section className="detail-content single-column">
        <article className="detail-block">
          <p className="eyebrow">重点速记</p>
          <h2>重点记住</h2>
          <ul className="checklist">
            {guide.bullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        {guide.practical?.accessTips?.length ? (
          <article className="detail-block">
            <p className="eyebrow">路线与进场</p>
            <h2>先把交通和入场节奏想清楚</h2>
            <ul className="checklist">
              {guide.practical.accessTips.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ) : null}
        {guide.practical?.seatTips?.length ? (
          <article className="detail-block">
            <p className="eyebrow">选区逻辑</p>
            <h2>买票前先看这些座位判断点</h2>
            <ul className="checklist">
              {guide.practical.seatTips.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ) : null}
        {guide.practical?.stayTips?.length ? (
          <article className="detail-block">
            <p className="eyebrow">周边住宿</p>
            <h2>住哪里通常更省心</h2>
            <ul className="checklist">
              {guide.practical.stayTips.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ) : null}
        {guide.practical?.foodTips?.length ? (
          <article className="detail-block">
            <p className="eyebrow">餐饮补给</p>
            <h2>演前演后怎么吃更合理</h2>
            <ul className="checklist">
              {guide.practical.foodTips.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ) : null}
        {guide.practical?.convenienceTips?.length ? (
          <article className="detail-block">
            <p className="eyebrow">便利店与补件</p>
            <h2>最容易被忽略的小准备</h2>
            <ul className="checklist">
              {guide.practical.convenienceTips.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ) : null}
        {guide.practical?.links?.length ? (
          <article className="detail-block">
            <p className="eyebrow">地图与官方链接</p>
            <h2>把这些入口先存起来</h2>
            <div className="link-row">
              {guide.practical.links.map((item) => (
                <a className="ticket-link" href={item.href} key={item.href} rel="noreferrer" target="_blank">
                  {item.label}
                </a>
              ))}
            </div>
          </article>
        ) : null}
      </section>
    </main>
  );
}
