import type { Metadata } from "next";
import { Header } from "@/components/header";
import { SavedBrowser } from "@/components/saved-browser";
import { getEvents } from "@/lib/events";

export const metadata: Metadata = {
  title: "我的收藏 | Seoul Signal",
  description: "查看本地收藏的 K-pop 巡演活动。"
};

export default async function SavedPage() {
  const events = await getEvents();

  return (
    <main className="page-shell">
      <Header />
      <section className="calendar-hero">
        <p className="eyebrow">Saved</p>
        <h1>我的收藏</h1>
        <p className="hero-text">
          用来沉淀你女儿真正关心的活动。当前收藏保存在当前浏览器，适合作为第一版可用功能。
        </p>
      </section>
      <SavedBrowser events={events} />
    </main>
  );
}
