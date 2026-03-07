import type { MetadataRoute } from "next";
import { getAllEvents, getArtists } from "@/lib/events";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://seoul-signal.vercel.app";
  const [events, artists] = await Promise.all([getAllEvents(), getArtists()]);

  return [
    "",
    "/calendar",
    "/artists",
    "/saved",
    ...artists.map((artist) => `/artists/${artist.slug}`),
    ...events.map((event) => `/events/${event.slug}`)
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date()
  }));
}
