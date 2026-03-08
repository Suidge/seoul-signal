import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "投稿入口 | Koncert Together",
  description: "向 Koncert Together 提交观演攻略、场次组织和应援项目。"
};

export default function CommunitySubmissionPage() {
  return (
    <main className="page-shell">
      <Header />
      <section className="calendar-hero">
        <p className="eyebrow">Submit</p>
        <h1>投稿入口</h1>
        <p className="hero-text">
          试运行阶段先通过 GitHub issue 收集场馆经验、应援项目和城市协作内容。这样可以先验证内容需求，再决定后续要不要做真正的站内社区系统。
        </p>
        <div className="hero-actions">
          <Link className="primary-button" href="https://github.com/Suidge/koncert-together/issues/new">
            提交内容
          </Link>
        </div>
      </section>
    </main>
  );
}
