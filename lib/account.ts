import "server-only";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { hasDatabaseUrl } from "@/lib/runtime";

export async function isArtistFollowed(artistSlug: string) {
  if (!hasDatabaseUrl()) {
    return false;
  }

  const user = await getCurrentUser();
  if (!user) return false;

  const artist = await prisma.artist.findUnique({
    where: { slug: artistSlug }
  });
  if (!artist) return false;

  const follow = await prisma.artistFollow.findUnique({
    where: {
      userId_artistId: {
        userId: user.id,
        artistId: artist.id
      }
    }
  });

  return Boolean(follow);
}

export async function isEventSaved(eventSlug: string) {
  if (!hasDatabaseUrl()) {
    return false;
  }

  const user = await getCurrentUser();
  if (!user) return false;

  const event = await prisma.event.findUnique({
    where: { slug: eventSlug }
  });
  if (!event) return false;

  const favorite = await prisma.favoriteEvent.findUnique({
    where: {
      userId_eventId: {
        userId: user.id,
        eventId: event.id
      }
    }
  });

  return Boolean(favorite);
}

export async function getAccountSnapshot() {
  if (!hasDatabaseUrl()) {
    return null;
  }

  const user = await getCurrentUser();
  if (!user) return null;

  const [savedEvents, follows, posts] = await Promise.all([
    prisma.favoriteEvent.findMany({
      where: { userId: user.id },
      include: {
        event: {
          include: { artist: true, venue: true }
        }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.artistFollow.findMany({
      where: { userId: user.id },
      include: { artist: true },
      orderBy: { createdAt: "desc" }
    }),
    prisma.post.findMany({
      where: { authorId: user.id },
      orderBy: { createdAt: "desc" }
    })
  ]);

  return { user, savedEvents, follows, posts };
}
