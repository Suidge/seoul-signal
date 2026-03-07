import Link from "next/link";
import { toggleArtistFollowAction } from "@/app/actions";
import { getCurrentUser } from "@/lib/auth";
import { isArtistFollowed } from "@/lib/account";

type Props = {
  artistSlug: string;
};

export async function FollowArtistForm({ artistSlug }: Props) {
  const [user, followed] = await Promise.all([
    getCurrentUser(),
    isArtistFollowed(artistSlug)
  ]);

  if (!user) {
    return (
      <Link className="secondary-button" href="/login">
        登录后关注艺人
      </Link>
    );
  }

  return (
    <form action={toggleArtistFollowAction}>
      <input name="artistSlug" type="hidden" value={artistSlug} />
      <button className="secondary-button" type="submit">
        {followed ? "取消关注" : "关注艺人"}
      </button>
    </form>
  );
}
