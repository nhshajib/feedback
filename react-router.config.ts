import type { Config } from "@react-router/dev/config";

export default {
  // Pure SPA mode - no server-side rendering, no loaders/actions
  ssr: false,
  future: {
    unstable_optimizeDeps: true,
  },
} satisfies Config;
