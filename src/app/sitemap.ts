import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

const paths = [
  "/",
  "/about",
  "/merchants",
  "/customers",
  "/how-it-works",
  "/contact",
  "/leadership",
  "/privacy",
  "/terms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return paths.map((p) => ({ url: `${SITE_URL}${p === "/" ? "" : p}` }));
}