import type { Metadata } from "next";
import { createPostAction } from "@/app/actions";
import { Header } from "@/components/header";
import { requireUser } from "@/lib/auth";
import { postKindOptions } from "@/lib/community";

export const metadata: Metadata = {
  title: "发布帖子 | Seoul Signal"
};

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function NewCommunityPostPage({ searchParams }: Props) {
  await requireUser();
  const { error } = await searchParams;

  return (
    <main className="page-shell narrow-shell">
      <Header />
      <section className="auth-card">
        <p className="eyebrow">New Post</p>
        <h1>发布社区帖子</h1>
        <p className="hero-text">把你想分享的同行、应援、同看或票务信息发出来，让同圈粉丝更容易找到彼此。</p>
        {error ? <p className="form-error">标题或正文不符合要求，或数据库尚未配置。</p> : null}
        <form action={createPostAction} className="auth-form">
          <label className="field">
            <span>标题</span>
            <input name="title" required type="text" />
          </label>
          <label className="field">
            <span>城市</span>
            <input name="city" type="text" />
          </label>
          <label className="field">
            <span>类型</span>
            <select name="kind">
              {postKindOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>正文</span>
            <textarea minLength={20} name="body" required rows={8} />
          </label>
          <button className="primary-button" type="submit">
            发布帖子
          </button>
        </form>
      </section>
    </main>
  );
}
