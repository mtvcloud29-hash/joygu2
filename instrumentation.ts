export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { ensureSuperAdmin } = await import("@/lib/super-admin");
  await ensureSuperAdmin();
  const { notifyServerStarted } = await import("@/lib/discord-webhooks");
  notifyServerStarted({ environment: process.env.NODE_ENV ?? "development", version: process.env.npm_package_version ?? "1.0.0", build: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ?? "local", nodeVersion: process.version });
}
