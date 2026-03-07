import Link from "next/link";
import { logoutAction } from "@/app/actions";
import { getCurrentUser } from "@/lib/auth";

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="site-header">
      <Link className="brand" href="/">
        Seoul Signal
      </Link>
      <nav className="nav">
        <Link href="/calendar">巡演日历</Link>
        <Link href="/artists">艺人</Link>
        <Link href="/guides">指南</Link>
        <Link href="/community">社区</Link>
        {user ? (
          <>
            <Link href="/me">我的主页</Link>
            <form action={logoutAction}>
              <button className="nav-button" type="submit">
                退出
              </button>
            </form>
          </>
        ) : (
          <Link href="/login">登录</Link>
        )}
      </nav>
    </header>
  );
}
