import Link from "next/link";

export function Header() {
  return (
    <header className="site-header">
      <Link className="brand" href="/">
        <span className="brand-kicker">Global K-pop Fan Guide</span>
        <strong>Koncert Together</strong>
      </Link>
      <nav className="nav">
        <Link href="/calendar">巡演日历</Link>
        <Link href="/artists">艺人</Link>
        <Link href="/guides">指南</Link>
        <Link href="/community">社区</Link>
        <Link href="/saved">收藏</Link>
      </nav>
    </header>
  );
}
