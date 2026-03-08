import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <strong>Koncert Together</strong>
        <p>把官宣排期、场馆经验、成员档案和中文观演信息整理在一起，方便下一场更快做决定，也少踩一些老坑。</p>
      </div>
      <nav className="footer-nav">
        <Link href="/calendar">巡演日历</Link>
        <Link href="/artists">艺人目录</Link>
        <Link href="/guides">观演指南</Link>
        <Link href="/credits">图片署名</Link>
      </nav>
    </footer>
  );
}
