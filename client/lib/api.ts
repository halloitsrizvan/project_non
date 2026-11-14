export type Role = "FARMER" | "BUYER" | "AGENCY" | "ADMIN";

export type User = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: Role;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  description?: string;
  unit: string;
  pricePerUnit: string | number;
  location?: string;
  images?: string[];
  quantity: string | number;
  availableQuantity: string | number;
  farmerId?: string;
  farmer?: { id?: string; name?: string; location?: string };
  status?: string;
  createdAt?: string;
};

export type Order = {
  id: string;
  status: string;
  totalAmount?: string | number;
  total?: string | number;
  deliveryAddress?: string;
  createdAt?: string;
  buyer?: { name?: string };
  farmer?: { name?: string };
  items?: Array<{ id?: string; quantity: string | number; productName?: string; unit?: string; unitPrice?: string | number; productId?: string }>;
};

export type ProductInput = {
  name: string;
  category: string;
  description: string;
  quantity: string;
  unit: string;
  pricePerUnit: string;
  location: string;
  images?: string[];
};

export type RegisterInput = {
  name: string;
  email?: string;
  phone: string;
  password: string;
  role: "FARMER" | "BUYER";
};

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

let accessToken: string | null = null;
export function setAccessToken(token: string | null) {
  accessToken = token;
}

export async function uploadProductImage(file: File): Promise<string> {
  const form = new FormData();
  form.set("file", file);
  const headers = new Headers({ Accept: "application/json" });
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  const response = await fetch("/api/media/upload", {
    method: "POST",
    headers,
    body: form,
  });
  const result = await response.json() as { url?: string; message?: string };
  if (!response.ok || !result.url) {
    if (response.status === 401 && accessToken) window.dispatchEvent(new Event("vithu:unauthorized"));
    throw new ApiError(result.message || "Image upload failed.", response.status);
  }
  return result.url;
}

type Envelope<T> = { success?: boolean; data?: T; message?: string | string[]; error?: string };

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (options.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  const response = await fetch(`/api/backend/${path.replace(/^\//, "")}`, {
    ...options,
    headers,
    cache: "no-store",
  });
  const raw = await response.text();
  let payload: Envelope<T> | T | null;
  try {
    payload = raw ? JSON.parse(raw) : null;
  } catch {
    throw new ApiError("The server returned an unexpected response.", response.status);
  }
  if (!response.ok || (payload && typeof payload === "object" && "success" in payload && payload.success === false)) {
    const error = payload as Envelope<T> | null;
    const detail = error?.message ?? error?.error;
    const message = Array.isArray(detail) ? detail.join(". ") : detail;
    if (response.status === 401 && accessToken) window.dispatchEvent(new Event("vithu:unauthorized"));
    throw new ApiError(message || `Request failed (${response.status}).`, response.status);
  }
  if (payload && typeof payload === "object" && "data" in payload) return payload.data as T;
  return payload as T;
}

export type PageResult<T> = { items: T[]; meta?: { page: number; totalPages: number; total: number } };

export async function getPage<T>(path: string): Promise<PageResult<T>> {
  const headers = new Headers({ Accept: "application/json" });
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  const response = await fetch(`/api/backend/${path.replace(/^\//, "")}`, { headers, cache: "no-store" });
  const payload = (await response.json()) as any;
  if (!response.ok || payload.success === false) {
    const detail = payload.message;
    throw new ApiError(Array.isArray(detail) ? detail.join(". ") : detail || "Could not load data.", response.status);
  }
  const data = payload.data ?? payload;
  const items = Array.isArray(data?.items)
    ? data.items
    : Array.isArray(data)
    ? data
    : Array.isArray(payload?.items)
    ? payload.items
    : [];
  const meta = data?.meta ?? payload?.meta;
  return { items, meta };
}

export function roleHome(role: Role) {
  return `/${role.toLowerCase()}/dashboard`;
}

export function normalizeUser(value: unknown): User | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  const candidate = item.user && typeof item.user === "object" ? item.user as Record<string, unknown> : item;
  const role = String(candidate.role ?? "").toUpperCase();
  if (!["FARMER", "BUYER", "AGENCY", "ADMIN"].includes(role)) return null;
  return {
    id: String(candidate.id ?? candidate.userId ?? ""),
    name: String(candidate.name ?? candidate.fullName ?? "Your account"),
    email: typeof candidate.email === "string" ? candidate.email : undefined,
    phone: typeof candidate.phone === "string" ? candidate.phone : undefined,
    role: role as Role,
  };
}

export function readToken(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  const token = item.accessToken ?? item.access_token ?? item.token;
  return typeof token === "string" && token.length > 0 ? token : null;
}
