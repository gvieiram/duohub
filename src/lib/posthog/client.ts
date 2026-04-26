/**
 * Client-side PostHog singleton re-export.
 *
 * Initialization happens once in [`instrumentation-client.ts`](../../../instrumentation-client.ts)
 * at the project root — Next.js loads that file automatically on every client
 * boot, before the first render. From here on, any client component can do
 * `import { posthog } from "@/lib/posthog/client"` and call `.capture()` /
 * `.identify()` safely; if the env token is missing the library becomes a no-op.
 */
export { default as posthog } from "posthog-js";
