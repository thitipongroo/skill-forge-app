import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Integration tests hit a real database, so run them serially with a longer
// hook timeout. Requires DATABASE_URL to point at a reachable Postgres.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.integration.test.ts"],
    fileParallelism: false,
    hookTimeout: 30_000,
  },
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
});
