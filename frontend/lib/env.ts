// Cloudflare Pages environment variable adapter
// Fixes the incompatibility between NextAuth.js v5 (expects process.env) 
// and Cloudflare Pages (injects via env object)

function getEnvVar(name: string): string | undefined {
  // Try multiple sources for maximum compatibility
  return (
    // Standard Node.js / Edge Runtime
    process.env[name] ||
    // Cloudflare Pages Functions (injected by @cloudflare/next-on-pages)
    (globalThis as any).__ENV__?.[name] ||
    // Cloudflare Workers runtime
    (globalThis as any).env?.[name]
  );
}

export const env = {
  GOOGLE_CLIENT_ID: getEnvVar('GOOGLE_CLIENT_ID'),
  GOOGLE_CLIENT_SECRET: getEnvVar('GOOGLE_CLIENT_SECRET'),
  AUTH_SECRET: getEnvVar('AUTH_SECRET'),
  NODE_ENV: getEnvVar('NODE_ENV') || 'production',
};

// Validate required variables at runtime
if (!env.GOOGLE_CLIENT_ID) {
  console.error('Missing GOOGLE_CLIENT_ID environment variable');
}
if (!env.GOOGLE_CLIENT_SECRET) {
  console.error('Missing GOOGLE_CLIENT_SECRET environment variable');
}
if (!env.AUTH_SECRET) {
  console.error('Missing AUTH_SECRET environment variable');
}
