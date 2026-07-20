import "server-only";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

// `DATABASE_URL` is auto-injected by the Vercel + Neon Marketplace integration.
// `POSTGRES_URL` covers the legacy Vercel Postgres env var.
let cached: NeonQueryFunction<false, false> | null = null;

export function getSql(): NeonQueryFunction<false, false> {
  if (cached) return cached;
  const connectionString =
    process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (!connectionString) {
    throw new Error(
      "Missing DATABASE_URL. Install the Neon integration on Vercel or set the env var locally.",
    );
  }
  cached = neon(connectionString);
  return cached;
}
