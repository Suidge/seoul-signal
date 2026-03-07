import type { Metadata } from "next";
import Link from "next/link";
import { signupAction } from "@/app/actions";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "注册 | Seoul Signal"
};

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function SignupPage({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <main className="page-shell narrow-shell">
      <Header />
      <section className="auth-card">
        <p className="eyebrow">Signup</p>
        <h1>创建账号</h1>
        <p className="hero-text">注册后就可以参与社区讨论、保存活动、关注艺人并管理自己的观演信息。</p>
        {error ? <p className="form-error">注册失败。可能是邮箱已存在，或数据库尚未配置。</p> : null}
        <form action={signupAction} className="auth-form">
          <label className="field">
            <span>昵称</span>
            <input name="name" required type="text" />
          </label>
          <label className="field">
            <span>邮箱</span>
            <input name="email" required type="email" />
          </label>
          <label className="field">
            <span>城市</span>
            <input name="city" type="text" />
          </label>
          <label className="field">
            <span>密码</span>
            <input minLength={8} name="password" required type="password" />
          </label>
          <button className="primary-button" type="submit">
            注册
          </button>
        </form>
        <p className="hero-text">
          已有账号？ <Link href="/login">去登录</Link>
        </p>
      </section>
    </main>
  );
}
