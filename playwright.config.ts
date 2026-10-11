import { defineConfig, devices } from "@playwright/test"

// Own port and a production build: never the developer's dev server or its browser storage.
// Each test also gets a fresh browser context, so localStorage always starts empty.
const PORT = 3200

export default defineConfig({
    testDir: "./e2e",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    reporter: process.env.CI ? "github" : "list",
    use: {
        baseURL: `http://localhost:${PORT}`,
        locale: "es-CO",
        trace: "retain-on-failure",
    },
    projects: [
        { name: "desktop", use: { ...devices["Desktop Chrome"] } },
        { name: "mobile", use: { ...devices["Pixel 7"] } },
    ],
    webServer: {
        command: `pnpm build && pnpm start -p ${PORT}`,
        url: `http://localhost:${PORT}`,
        reuseExistingServer: false,
        timeout: 240_000,
    },
})
