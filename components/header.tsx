import Link from "next/link";

export function Header() {
  return (
    <header className="site-header">
      <Link className="brand" href="/">
        Seoul Signal
      </Link>
      <nav className="nav">
        <Link href="/calendar">巡演日历</Link>
        <Link href="/artists">艺人目录</Link>
        <Link href="/saved">我的收藏</Link>
        <Link href="/#architecture">技术路线</Link>
        <Link href="/#vision">平台愿景</Link>
      </nav>
    </header>
  );
}
