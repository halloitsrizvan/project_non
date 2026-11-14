"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

export type BuyerRequirement = {
  id: string;
  buyerId: string;
  buyerName: string;
  businessName?: string;
  phone?: string;
  email?: string;
  productName: string;
  category: string;
  quantity: string | number;
  unit: string;
  targetPrice?: string | number;
  neededBy?: string;
  urgency: "NORMAL" | "HIGH" | "URGENT";
  location: string;
  deliveryAddress?: string;
  description: string;
  status: "OPEN" | "FULFILLED" | "CLOSED";
  createdAt: string;
};

export type RequirementInput = Omit<BuyerRequirement, "id" | "createdAt" | "status">;

export type SupplyOffer = {
  id: string;
  requirementId: string;
  requirementTitle: string;
  buyerId: string;
  buyerName: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  farmerLocation?: string;
  productId?: string;
  productName?: string;
  quantity: string | number;
  unit: string;
  pricePerUnit: string | number;
  totalAmount: number;
  availableDate: string;
  deliveryOption: "DELIVERY" | "PICKUP" | "FLEXIBLE";
  message?: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED";
  createdAt: string;
};

export type SupplyOfferInput = Omit<SupplyOffer, "id" | "status" | "createdAt" | "totalAmount"> & {
  totalAmount?: number;
};

const STORAGE_KEY = "vithu:buyer-requirements";
const OFFERS_STORAGE_KEY = "vithu:supply-offers";
const VERIFIED_BUYERS_STORAGE_KEY = "vithu:admin-verified-buyers";

export const INITIAL_REQUIREMENTS: BuyerRequirement[] = [
  {
    id: "req-101",
    buyerId: "buyer-seed-1",
    buyerName: "Rajesh Kumar",
    businessName: "Green Harvest Supermarkets",
    phone: "+91 98471 23456",
    email: "procurement@greenharvest.in",
    productName: "Fresh Red Onions",
    category: "Vegetables",
    quantity: "1500",
    unit: "kg",
    targetPrice: "28",
    neededBy: "Within 3 days",
    urgency: "URGENT",
    location: "Ernakulam, Kerala",
    deliveryAddress: "Green Harvest Central Warehouse, Kalamassery, Ernakulam",
    description: "Seeking medium-to-large sorted Nashik/Maharashtra red onions. Dry outer skin, packed in 50 kg mesh bags. Immediate payment upon delivery inspection.",
    status: "OPEN",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: "req-102",
    buyerId: "buyer-seed-2",
    buyerName: "Anita Sharma",
    businessName: "Malabar Organic Foods",
    phone: "+91 94462 87654",
    email: "anita.procure@malabarorganic.com",
    productName: "Nendran Banana (Raw)",
    category: "Fruits",
    quantity: "3000",
    unit: "kg",
    targetPrice: "42",
    neededBy: "Next week",
    urgency: "HIGH",
    location: "Thrissur, Kerala",
    deliveryAddress: "Malabar Foods Processing Plant, Ollur, Thrissur",
    description: "Looking for pesticide-free mature raw Nendran bananas suitable for banana chip production. Farmers with farmgate pickup can quote directly.",
    status: "OPEN",
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: "req-103",
    buyerId: "buyer-seed-3",
    buyerName: "Suresh Menon",
    businessName: "Kerala Agro Millers",
    phone: "+91 98950 11223",
    email: "suresh@agrotraders.org",
    productName: "Matta Rice (Paddy)",
    category: "Grains & Cereals",
    quantity: "5",
    unit: "tonne",
    targetPrice: "34",
    neededBy: "Within 10 days",
    urgency: "NORMAL",
    location: "Palakkad, Kerala",
    deliveryAddress: "Agro Mill Yard, Chittur Road, Palakkad",
    description: "Need newly harvested Jaya / Matta paddy with moisture content below 14%. Direct farmer collection with truck weighing available.",
    status: "OPEN",
    createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
  },
  {
    id: "req-104",
    buyerId: "buyer-seed-4",
    buyerName: "Farooq Hassan",
    businessName: "Hassan Fresh Produce Exports",
    phone: "+91 97455 33441",
    email: "exports@hassanagro.com",
    productName: "Green Cardamom (8mm+)",
    category: "Spices",
    quantity: "200",
    unit: "kg",
    targetPrice: "2150",
    neededBy: "Immediate",
    urgency: "URGENT",
    location: "Idukki, Kerala",
    deliveryAddress: "Spices Hub, Kumily, Idukki",
    description: "Grade A green cardamom bold 8mm pods with vibrant color. Sample verification required prior to bulk delivery. Cash payment terms.",
    status: "OPEN",
    createdAt: new Date(Date.now() - 3600000 * 50).toISOString(),
  },
];

export const INITIAL_OFFERS: SupplyOffer[] = [
  {
    id: "offer-seed-1",
    requirementId: "req-101",
    requirementTitle: "Fresh Red Onions",
    buyerId: "buyer-seed-1",
    buyerName: "Rajesh Kumar",
    farmerId: "farmer-seed-1",
    farmerName: "George Mathew",
    farmerPhone: "+91 94471 23890",
    farmerLocation: "Wayanad, Kerala",
    quantity: "1500",
    unit: "kg",
    pricePerUnit: "27",
    totalAmount: 40500,
    availableDate: "Ready for immediate delivery",
    deliveryOption: "DELIVERY",
    message: "Grade A cleaned red onions packed in 50 kg mesh bags. Direct truck delivery to Kalamassery warehouse available tomorrow.",
    status: "PENDING",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

export const INITIAL_VERIFIED_BUYERS: string[] = [
  "buyer-seed-1",
  "procurement@greenharvest.in",
  "buyer-seed-2",
  "anita.procure@malabarorganic.com",
  "shumaillab212@gmail.com",
];

// Helper to normalize backend requirement objects
function formatBackendReq(raw: any): BuyerRequirement {
  return {
    id: String(raw.id),
    buyerId: String(raw.buyerId || raw.buyer?.id || ""),
    buyerName: raw.buyerName || raw.buyer?.user?.name || "Verified Buyer",
    businessName: raw.businessName || raw.buyer?.businessName || undefined,
    phone: raw.phone || raw.buyer?.user?.phone || undefined,
    email: raw.email || raw.buyer?.user?.email || undefined,
    productName: raw.productName,
    category: raw.category || "Produce",
    quantity: String(raw.quantity),
    unit: raw.unit || "kg",
    targetPrice: raw.targetPrice !== null && raw.targetPrice !== undefined ? String(raw.targetPrice) : undefined,
    neededBy: raw.neededBy || undefined,
    urgency: (raw.urgency || "NORMAL") as "NORMAL" | "HIGH" | "URGENT",
    location: raw.location || "Kerala",
    deliveryAddress: raw.deliveryAddress || undefined,
    description: raw.description || "",
    status: (raw.status || "OPEN") as "OPEN" | "FULFILLED" | "CLOSED",
    createdAt: raw.createdAt ? new Date(raw.createdAt).toISOString() : new Date().toISOString(),
  };
}

// ----------------------------------------------------
// Requirements Storage & Live Backend API
// ----------------------------------------------------
export function getBuyerRequirements(): BuyerRequirement[] {
  if (typeof window === "undefined") return INITIAL_REQUIREMENTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_REQUIREMENTS));
      return INITIAL_REQUIREMENTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_REQUIREMENTS;
  } catch {
    return INITIAL_REQUIREMENTS;
  }
}

export function saveBuyerRequirements(requirements: BuyerRequirement[], notify = true): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(requirements));
    if (notify) {
      window.dispatchEvent(new CustomEvent("vithu:requirements-updated", { detail: requirements }));
    }
  } catch {}
}

export async function addBuyerRequirement(input: RequirementInput): Promise<BuyerRequirement> {
  const all = getBuyerRequirements();

  // Try creating on the real backend database first
  try {
    const payload = {
      productName: input.productName.trim(),
      category: input.category.trim(),
      quantity: String(input.quantity),
      unit: input.unit.trim(),
      targetPrice: input.targetPrice ? String(input.targetPrice) : undefined,
      neededBy: input.neededBy?.trim() || undefined,
      urgency: input.urgency || "NORMAL",
      location: input.location.trim(),
      deliveryAddress: input.deliveryAddress?.trim() || undefined,
      description: input.description.trim(),
    };

    const res = await api<any>("buyer-requirements", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (res && (res.id || res.data?.id)) {
      const createdItem = formatBackendReq(res.data || res);
      const updated = [createdItem, ...all.filter((r) => r.id !== createdItem.id)];
      saveBuyerRequirements(updated);
      return createdItem;
    }
  } catch (err) {
    console.warn("Backend database save error (fallback to local):", err);
  }

  // Local fallback object if backend returned an error
  const newReq: BuyerRequirement = {
    ...input,
    id: `req-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    status: "OPEN",
    createdAt: new Date().toISOString(),
  };
  const updated = [newReq, ...all];
  saveBuyerRequirements(updated);
  return newReq;
}

export async function updateBuyerRequirementStatus(
  id: string,
  status: "OPEN" | "FULFILLED" | "CLOSED"
): Promise<void> {
  const all = getBuyerRequirements();
  const updated = all.map((req) => (req.id === id ? { ...req, status } : req));
  saveBuyerRequirements(updated);

  // If id is a backend UUID, sync update with backend
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    try {
      await api(`buyer-requirements/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
    } catch (e) {
      console.warn("Backend requirement status update failed:", e);
    }
  }
}

export async function deleteBuyerRequirement(id: string): Promise<void> {
  const all = getBuyerRequirements();
  const updated = all.filter((req) => req.id !== id);
  saveBuyerRequirements(updated);

  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    try {
      await api(`buyer-requirements/${id}`, { method: "DELETE" });
    } catch (e) {
      console.warn("Backend requirement deletion failed:", e);
    }
  }
}

export function useRequirements() {
  const [requirements, setRequirements] = useState<BuyerRequirement[]>(() => getBuyerRequirements());
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchLiveRequirements = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api<any>("buyer-requirements?limit=100");
      const rawList = Array.isArray(res)
        ? res
        : Array.isArray(res?.items)
        ? res.items
        : Array.isArray(res?.data)
        ? res.data
        : [];

      if (rawList.length > 0) {
        const backendItems = rawList.map(formatBackendReq);
        const backendIds = new Set(backendItems.map((item: BuyerRequirement) => item.id));

        // Merge backend items (top priority) + initial seeds as non-duplicate fallbacks
        const merged = [
          ...backendItems,
          ...INITIAL_REQUIREMENTS.filter((seed) => !backendIds.has(seed.id)),
        ];
        saveBuyerRequirements(merged, false);
        setRequirements(merged);
      } else {
        setRequirements(getBuyerRequirements());
      }
    } catch {
      setRequirements(getBuyerRequirements());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchLiveRequirements();

    // Cross-device network auto-refresh every 3.5 seconds
    const interval = setInterval(() => {
      fetchLiveRequirements();
    }, 3500);

    const handleUpdate = () => {
      setRequirements(getBuyerRequirements());
    };

    window.addEventListener("vithu:requirements-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener("vithu:requirements-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [fetchLiveRequirements]);

  return {
    requirements,
    loading,
    mounted,
    refetch: fetchLiveRequirements,
    addRequirement: addBuyerRequirement,
    updateStatus: updateBuyerRequirementStatus,
    deleteRequirement: deleteBuyerRequirement,
  };
}

// ----------------------------------------------------
// Farmer Supply Offers ("I have this product")
// Syncs across local network clients via /api/portal-sync
// ----------------------------------------------------
export function getSupplyOffers(): SupplyOffer[] {
  if (typeof window === "undefined") return INITIAL_OFFERS;
  try {
    const raw = window.localStorage.getItem(OFFERS_STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(OFFERS_STORAGE_KEY, JSON.stringify(INITIAL_OFFERS));
      return INITIAL_OFFERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_OFFERS;
  } catch {
    return INITIAL_OFFERS;
  }
}

export function saveSupplyOffers(offers: SupplyOffer[], notify = true): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(OFFERS_STORAGE_KEY, JSON.stringify(offers));
    if (notify) {
      window.dispatchEvent(new CustomEvent("vithu:offers-updated", { detail: offers }));
    }
  } catch {}
}

export async function addSupplyOffer(input: SupplyOfferInput): Promise<SupplyOffer> {
  const all = getSupplyOffers();
  const qty = Number(input.quantity) || 0;
  const price = Number(input.pricePerUnit) || 0;
  const newOffer: SupplyOffer = {
    ...input,
    id: `offer-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    totalAmount: input.totalAmount ?? qty * price,
    status: "PENDING",
    createdAt: new Date().toISOString(),
  };
  const updated = [newOffer, ...all];
  saveSupplyOffers(updated);

  // Sync with shared Next.js server across network
  try {
    await fetch("/api/portal-sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "ADD_OFFER", offer: newOffer }),
    });
  } catch {}

  return newOffer;
}

export async function updateSupplyOfferStatus(
  id: string,
  status: "PENDING" | "ACCEPTED" | "DECLINED"
): Promise<void> {
  const all = getSupplyOffers();
  const updated = all.map((o) => (o.id === id ? { ...o, status } : o));
  saveSupplyOffers(updated);

  try {
    await fetch("/api/portal-sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "UPDATE_OFFER_STATUS", id, status }),
    });
  } catch {}
}

export async function deleteSupplyOffer(id: string): Promise<void> {
  const all = getSupplyOffers();
  const updated = all.filter((o) => o.id !== id);
  saveSupplyOffers(updated);

  try {
    await fetch("/api/portal-sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "DELETE_OFFER", id }),
    });
  } catch {}
}

export function useSupplyOffers() {
  const [offers, setOffers] = useState<SupplyOffer[]>(() => getSupplyOffers());
  const [mounted, setMounted] = useState(false);

  const syncNetworkOffers = useCallback(async () => {
    try {
      const res = await fetch("/api/portal-sync");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.offers)) {
          saveSupplyOffers(data.offers, false);
          setOffers(data.offers);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    setMounted(true);
    syncNetworkOffers();

    const interval = setInterval(() => {
      syncNetworkOffers();
    }, 3500);

    const handleUpdate = () => {
      setOffers(getSupplyOffers());
    };

    window.addEventListener("vithu:offers-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      clearInterval(interval);
      window.removeEventListener("vithu:offers-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [syncNetworkOffers]);

  return {
    offers,
    mounted,
    addOffer: addSupplyOffer,
    updateOfferStatus: updateSupplyOfferStatus,
    deleteOffer: deleteSupplyOffer,
    getOffersForRequirement: (reqId: string) => offers.filter((o) => o.requirementId === reqId),
    getOffersByFarmer: (farmerId?: string, farmerPhone?: string) =>
      offers.filter(
        (o) =>
          (farmerId && o.farmerId === farmerId) ||
          (farmerPhone && o.farmerPhone.replace(/[^0-9]/g, "") === farmerPhone.replace(/[^0-9]/g, ""))
      ),
  };
}

// ----------------------------------------------------
// Admin Verified Buyers Registry
// Syncs across local network clients via /api/portal-sync
// ----------------------------------------------------
export function getVerifiedBuyerIdentifiers(): string[] {
  if (typeof window === "undefined") return INITIAL_VERIFIED_BUYERS;
  try {
    const raw = window.localStorage.getItem(VERIFIED_BUYERS_STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(VERIFIED_BUYERS_STORAGE_KEY, JSON.stringify(INITIAL_VERIFIED_BUYERS));
      return INITIAL_VERIFIED_BUYERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_VERIFIED_BUYERS;
  } catch {
    return INITIAL_VERIFIED_BUYERS;
  }
}

export function isBuyerVerified(buyerId?: string, email?: string, phone?: string): boolean {
  const list = getVerifiedBuyerIdentifiers().map((item) => String(item).trim().toLowerCase());
  if (buyerId && list.includes(String(buyerId).trim().toLowerCase())) return true;
  if (email && list.includes(String(email).trim().toLowerCase())) return true;
  if (phone) {
    const clean = phone.replace(/[^0-9]/g, "");
    if (clean.length > 5 && list.some((item) => item.replace(/[^0-9]/g, "") === clean)) return true;
  }
  return false;
}

export async function setBuyerVerified(identifier: string, isVerified: boolean): Promise<void> {
  if (typeof window === "undefined" || !identifier) return;
  const list = getVerifiedBuyerIdentifiers();
  const normalized = identifier.trim().toLowerCase();
  let updated: string[];
  if (isVerified) {
    if (!list.some((item) => item.trim().toLowerCase() === normalized)) {
      updated = [...list, identifier.trim()];
    } else {
      updated = list;
    }
  } else {
    updated = list.filter((item) => item.trim().toLowerCase() !== normalized && item !== identifier.trim());
  }

  try {
    window.localStorage.setItem(VERIFIED_BUYERS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("vithu:verified-buyers-updated", { detail: updated }));
  } catch {}

  // Sync with shared Next.js server across network
  try {
    await fetch("/api/portal-sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "SET_BUYER_VERIFIED", identifier, isVerified }),
    });
  } catch {}
}

export function useVerifiedBuyers() {
  const [verifiedList, setVerifiedList] = useState<string[]>(() => getVerifiedBuyerIdentifiers());
  const [mounted, setMounted] = useState(false);

  const syncNetworkVerified = useCallback(async () => {
    try {
      const res = await fetch("/api/portal-sync");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.verifiedBuyers)) {
          window.localStorage.setItem(VERIFIED_BUYERS_STORAGE_KEY, JSON.stringify(data.verifiedBuyers));
          setVerifiedList(data.verifiedBuyers);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    setMounted(true);
    syncNetworkVerified();

    const interval = setInterval(() => {
      syncNetworkVerified();
    }, 3500);

    const handleUpdate = () => {
      setVerifiedList(getVerifiedBuyerIdentifiers());
    };

    window.addEventListener("vithu:verified-buyers-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      clearInterval(interval);
      window.removeEventListener("vithu:verified-buyers-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [syncNetworkVerified]);

  return {
    verifiedList,
    mounted,
    isVerified: (buyerId?: string, email?: string, phone?: string) => isBuyerVerified(buyerId, email, phone),
    toggleVerification: (identifier: string, status: boolean) => setBuyerVerified(identifier, status),
  };
}
