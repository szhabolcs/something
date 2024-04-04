import type { Config } from "drizzle-kit";
export default {
  schema: "./src/repositories/schema.ts",
  out: "./drizzle",
} satisfies Config;
