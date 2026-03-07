import "server-only";

import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { hasDatabaseUrl } from "@/lib/runtime";

const SESSION_COOKIE = "seoul_signal_session";

function hashPassword(password: string, salt = randomBytes(16).toString("hex")) {
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  const candidate = scryptSync(password, salt, 64);
  return timingSafeEqual(candidate, Buffer.from(hash, "hex"));
}

export async function createUser(input: {
  email: string;
  name: string;
  password: string;
  city?: string;
}) {
  if (!hasDatabaseUrl()) {
    throw new Error("DATABASE_URL is required to create users.");
  }

  return prisma.user.create({
    data: {
      email: input.email.toLowerCase(),
      name: input.name,
      city: input.city,
      passwordHash: hashPassword(input.password)
    }
  });
}

export async function authenticateUser(email: string, password: string) {
  if (!hasDatabaseUrl()) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (!user) {
    return null;
  }

  return verifyPassword(password, user.passwordHash) ? user : null;
}

export async function createSession(userId: string) {
  if (!hasDatabaseUrl()) {
    throw new Error("DATABASE_URL is required to create sessions.");
  }

  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

  await prisma.session.create({
    data: {
      token,
      userId,
      expiresAt
    }
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token && hasDatabaseUrl()) {
    await prisma.session.deleteMany({
      where: { token }
    });
  }

  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  if (!hasDatabaseUrl()) {
    return null;
  }

  const token = (await cookies()).get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true }
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return session.user;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
