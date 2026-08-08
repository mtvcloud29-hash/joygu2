import { S3Client } from "@aws-sdk/client-s3";

export function getR2Config() { const accountId = process.env.R2_ACCOUNT_ID; const accessKeyId = process.env.R2_ACCESS_KEY_ID; const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY; const bucket = process.env.R2_BUCKET; const publicUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, ""); if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicUrl) return null; return { bucket, publicUrl, client: new S3Client({ region: "auto", endpoint: `https://${accountId}.r2.cloudflarestorage.com`, credentials: { accessKeyId, secretAccessKey } }) }; }
export function mediaKind(mimeType: string): "IMAGE" | "VIDEO" | "DOCUMENT" { if (mimeType.startsWith("image/")) return "IMAGE"; if (mimeType.startsWith("video/")) return "VIDEO"; return "DOCUMENT"; }
export function safeMediaKey(name: string) { return name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/(^-|-$)/g, ""); }
