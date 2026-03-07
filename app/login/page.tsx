import type { Metadata } from "next";
import Link from "next/link";
import { loginAction } from "@/app/actions";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "登录 | Seoul Signal"
};

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <main className="page-shell narrow-shell">
      <Header />
      <section className="auth-card">
        <p className="eyebrow">Login</p>
        <h1>登录社区账号</h1>
        <p className="hero-text">登录后可以发帖、评论、关注艺人，并把活动保存到个人主页。</p>
        {error ? <p className="form-error">邮箱或密码错误。</p> : null}
        <form action={loginAction} className="auth-form">
          <label className="field">
            <span>邮箱</span>
            <input name="email" required type="email" />
          </label>
          <label className="field">
            <span>密码</span>
            <input minLength={8} name="password" required type="password" />
          </label>
          <button className="primary-button" type="submit">
            登录
          </button>
        </form>
        <p className="hero-text">
          还没有账号？ <Link href="/signup">注册一个</Link>
        </p>
      </section>
    </main>
  );
}
