"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PostKind } from "@/generated/prisma";
import {
  authenticateUser,
  createSession,
  createUser,
  destroySession,
  requireUser
} from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasDatabaseUrl } from "@/lib/runtime";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export async function signupAction(formData: FormData) {
  if (!hasDatabaseUrl()) {
    redirect("/signup?error=db");
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const city = String(formData.get("city") ?? "").trim();

  if (!name || !email || password.length < 8) {
    redirect("/signup?error=invalid");
  }

  try {
    const user = await createUser({ name, email, password, city });
    await createSession(user.id);
  } catch {
    redirect("/signup?error=exists");
  }

  redirect("/me");
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const user = await authenticateUser(email, password);

  if (!user) {
    redirect("/login?error=invalid");
  }

  await createSession(user.id);
  redirect("/me");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

export async function createPostAction(formData: FormData) {
  const user = await requireUser();

  if (!hasDatabaseUrl()) {
    redirect("/community/new?error=db");
  }

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const kind = String(formData.get("kind") ?? "GENERAL") as PostKind;

  if (!title || body.length < 20) {
    redirect("/community/new?error=invalid");
  }

  const baseSlug = slugify(title);
  const existing = await prisma.post.count({
    where: { slug: { startsWith: baseSlug } }
  });

  const slug = existing ? `${baseSlug}-${existing + 1}` : baseSlug;

  await prisma.post.create({
    data: {
      slug,
      title,
      body,
      city,
      kind,
      authorId: user.id
    }
  });

  revalidatePath("/community");
  redirect(`/community/${slug}`);
}

export async function createCommentAction(formData: FormData) {
  const user = await requireUser();
  const postSlug = String(formData.get("postSlug") ?? "");
  const body = String(formData.get("body") ?? "").trim();

  if (!hasDatabaseUrl() || !postSlug || body.length < 2) {
    redirect(`/community/${postSlug || ""}`);
  }

  const post = await prisma.post.findUnique({
    where: { slug: postSlug }
  });

  if (!post) {
    redirect("/community");
  }

  await prisma.comment.create({
    data: {
      body,
      postId: post.id,
      authorId: user.id
    }
  });

  revalidatePath(`/community/${postSlug}`);
  redirect(`/community/${postSlug}`);
}

export async function toggleArtistFollowAction(formData: FormData) {
  const user = await requireUser();
  const artistSlug = String(formData.get("artistSlug") ?? "");

  if (!hasDatabaseUrl() || !artistSlug) {
    redirect(`/artists/${artistSlug}`);
  }

  const artist = await prisma.artist.findUnique({
    where: { slug: artistSlug }
  });

  if (!artist) {
    redirect("/artists");
  }

  const existing = await prisma.artistFollow.findUnique({
    where: {
      userId_artistId: {
        userId: user.id,
        artistId: artist.id
      }
    }
  });

  if (existing) {
    await prisma.artistFollow.delete({
      where: { id: existing.id }
    });
  } else {
    await prisma.artistFollow.create({
      data: {
        userId: user.id,
        artistId: artist.id
      }
    });
  }

  revalidatePath(`/artists/${artistSlug}`);
  revalidatePath("/me");
  redirect(`/artists/${artistSlug}`);
}

export async function toggleFavoriteEventAction(formData: FormData) {
  const user = await requireUser();
  const eventSlug = String(formData.get("eventSlug") ?? "");

  if (!hasDatabaseUrl() || !eventSlug) {
    redirect(`/events/${eventSlug}`);
  }

  const event = await prisma.event.findUnique({
    where: { slug: eventSlug }
  });

  if (!event) {
    redirect("/calendar");
  }

  const existing = await prisma.favoriteEvent.findUnique({
    where: {
      userId_eventId: {
        userId: user.id,
        eventId: event.id
      }
    }
  });

  if (existing) {
    await prisma.favoriteEvent.delete({
      where: { id: existing.id }
    });
  } else {
    await prisma.favoriteEvent.create({
      data: {
        userId: user.id,
        eventId: event.id
      }
    });
  }

  revalidatePath(`/events/${eventSlug}`);
  revalidatePath("/me");
  redirect(`/events/${eventSlug}`);
}
