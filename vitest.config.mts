import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

export default defineConfig({
    resolve: {
        alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    },
    test: {
        // Node has no `window`, so lib/storage falls back to defaults and never touches browser storage.
        environment: "node",
        include: ["src/**/*.test.ts"],
    },
})
