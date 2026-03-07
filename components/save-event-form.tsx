import Link from "next/link";
import { toggleFavoriteEventAction } from "@/app/actions";
import { getCurrentUser } from "@/lib/auth";
import { isEventSaved } from "@/lib/account";

type Props = {
  eventSlug: string;
};

export async function SaveEventForm({ eventSlug }: Props) {
  const [user, saved] = await Promise.all([
    getCurrentUser(),
    isEventSaved(eventSlug)
  ]);

  if (!user) {
    return (
      <Link className="secondary-button" href="/login">
        登录后保存活动
      </Link>
    );
  }

  return (
    <form action={toggleFavoriteEventAction}>
      <input name="eventSlug" type="hidden" value={eventSlug} />
      <button className="secondary-button" type="submit">
        {saved ? "取消保存" : "保存到主页"}
      </button>
    </form>
  );
}
