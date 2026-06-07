import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The portal is served under moona.id/portal. basePath keeps every route and
  // public asset self-contained under that path.
  basePath: "/portal",
};

export default nextConfig;
