import { createHash } from "node:crypto";
import type { NextRequest } from "next/server";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const FOLDER = "vithu/products";

function supportedImage(bytes: Uint8Array, type: string) {
  if (type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === "image/png") return bytes.slice(0, 8).every((byte, index) => byte === [137, 80, 78, 71, 13, 10, 26, 10][index]);
  if (type === "image/webp") return String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  if (type === "image/avif") return String.fromCharCode(...bytes.slice(4, 12)).includes("ftypavif");
  return false;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept",
};

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(request: NextRequest) {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  const backend = process.env.API_BASE_URL?.replace(/\/$/, "");
  if (!cloud || !key || !secret || !backend || !/^[\w-]+$/.test(cloud)) {
    return Response.json({ message: "Media storage is not configured." }, { status: 503 });
  }

  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return Response.json({ message: "Sign in as a farmer to upload images." }, { status: 401 });
  }

  try {
    const profileResponse = await fetch(`${backend}/auth/me`, {
      headers: { Authorization: authorization, Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!profileResponse.ok) {
      return Response.json({ message: "Your session could not be verified." }, { status: profileResponse.status === 401 ? 401 : 503 });
    }
    const profile = await profileResponse.json() as { data?: { role?: string } };
    if (profile.data?.role !== "FARMER") {
      return Response.json({ message: "Only farmers can upload product images." }, { status: 403 });
    }
  } catch {
    return Response.json({ message: "The backend is unavailable. Please try again." }, { status: 503 });
  }

  const contentLength = Number(request.headers.get("content-length"));
  if (contentLength > MAX_IMAGE_BYTES + 100_000) {
    return Response.json({ message: "Choose an image smaller than 5 MB." }, { status: 413 });
  }

  let file: File;
  try {
    const form = await request.formData();
    const value = form.get("file");
    if (!(value instanceof File)) throw new Error("Missing file");
    file = value;
  } catch {
    return Response.json({ message: "Select an image to upload." }, { status: 400 });
  }
  if (file.size === 0 || file.size > MAX_IMAGE_BYTES) {
    return Response.json({ message: "Choose an image smaller than 5 MB." }, { status: 413 });
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!supportedImage(bytes, file.type)) {
    return Response.json({ message: "Use a JPEG, PNG, WebP, or AVIF image." }, { status: 415 });
  }

  const timestamp = String(Math.floor(Date.now() / 1000));
  const signature = createHash("sha1").update(`folder=${FOLDER}&timestamp=${timestamp}${secret}`).digest("hex");
  const upload = new FormData();
  upload.set("file", new Blob([bytes], { type: file.type }), file.name);
  upload.set("folder", FOLDER);
  upload.set("timestamp", timestamp);
  upload.set("api_key", key);
  upload.set("signature", signature);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, {
      method: "POST",
      body: upload,
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) {
      return Response.json({ message: "Image upload failed. Please try again." }, { status: 502 });
    }
    const result = await response.json() as { secure_url?: string };
    if (!result.secure_url?.startsWith(`https://res.cloudinary.com/${cloud}/image/upload/`)) {
      return Response.json({ message: "Media storage returned an unexpected image URL." }, { status: 502 });
    }
    return Response.json({ url: result.secure_url });
  } catch {
    return Response.json({ message: "Media storage is unavailable. Please try again." }, { status: 502 });
  }
}
