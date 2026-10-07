import "./src/env"; // Triggers env validation at build time
import createMDX from "@next/mdx";
import { securityHeaderRules } from "./src/lib/securityHeaders";

const isDev = process.env.NODE_ENV === "development";

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

const nextConfig: import("next").NextConfig = {
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
  async headers() {
    return securityHeaderRules(isDev);
  },
};

export default withMDX(nextConfig);
