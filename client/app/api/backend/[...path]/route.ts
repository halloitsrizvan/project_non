import type { NextRequest } from "next/server";

const rules: Record<string, RegExp[]> = {
  GET: [
    /^auth\/me$/, /^users\/me$/, /^farmers\/me$/, /^buyers\/me$/,
    /^products$/, /^products\/[\w-]+$/, /^orders\/my$/, /^orders\/[\w-]+$/,
    /^admin\/(overview|activity|users|products|orders|schemes|surplus)$/,
    /^buyer-requirements$/, /^buyer-requirements\/my$/, /^buyer-requirements\/[\w-]+$/,
    /^wishlist$/,
  ],
  POST: [
    /^auth\/register$/, /^auth\/login$/, /^products$/, /^orders$/, /^orders\/[\w-]+\/cancel$/, /^admin\/schemes$/,
    /^buyer-requirements$/, /^wishlist\/[\w-]+$/,
  ],
  PATCH: [
    /^products\/[\w-]+$/, /^orders\/[\w-]+\/status$/, /^admin\/users\/[\w-]+\/status$/, /^admin\/schemes\/[\w-]+$/,
    /^buyer-requirements\/[\w-]+$/,
  ],
  DELETE: [
    /^products\/[\w-]+$/,
    /^buyer-requirements\/[\w-]+$/, /^wishlist\/[\w-]+$/,
  ],
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, X-Requested-With",
};

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

async function forward(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const endpoint = path.join("/");
  if (!rules[request.method]?.some((rule) => rule.test(endpoint))) {
    return Response.json({ success: false, message: "Endpoint unavailable." }, { status: 404, headers: corsHeaders });
  }

  const base = process.env.API_BASE_URL?.replace(/\/$/, "");
  if (!base) {
    return Response.json({ success: false, message: "API_BASE_URL is not configured." }, { status: 503, headers: corsHeaders });
  }

  const target = `${base}/${endpoint}${new URL(request.url).search}`;
  const headers = new Headers({
    Accept: "application/json",
    "X-Tunnel-Skip-AntiPhishing-Page": "true",
  });
  const authorization = request.headers.get("authorization");
  if (authorization) headers.set("Authorization", authorization);
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);

  try {
    const response = await fetch(target, {
      method: request.method,
      headers,
      body: request.method === "GET" ? undefined : await request.text(),
      cache: "no-store",
    });
    return new Response(await response.text(), {
      status: response.status,
      headers: {
        "content-type": response.headers.get("content-type") ?? "application/json",
        "cache-control": "no-store",
        ...corsHeaders,
      },
    });
  } catch {
    return Response.json(
      { success: false, message: "The backend is unavailable. Please try again." },
      { status: 502, headers: corsHeaders },
    );
  }
}

export { forward as GET, forward as POST, forward as PATCH, forward as DELETE };
