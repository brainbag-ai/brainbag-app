/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add external packages that need to be transpiled
  serverExternalPackages: [
    "pdf-parse"
  ],
  // Disable tracing to avoid permission issues
  experimental: {
    outputFileTracingRoot: undefined,
    outputFileTracingExcludes: {
      '*': ['**/*']
    }
  }
};

export default nextConfig;
