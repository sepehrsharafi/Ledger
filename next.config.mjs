/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // recharts is a large barrel export; rewriting the imports keeps the chart
    // screens from pulling the whole library into a route's compile graph.
    optimizePackageImports: ["recharts"],
  },
};

export default nextConfig;
