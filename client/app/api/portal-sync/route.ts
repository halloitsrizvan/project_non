import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export type SharedOffer = {
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

export type SharedSurplus = {
  id: string;
  farmerId?: string;
  farmerName: string;
  farmerPhone?: string;
  location: string;
  productId?: string;
  productName: string;
  surplusQuantity: string | number;
  unit: string;
  pricePerUnit?: string | number;
  reason?: string;
  images?: string[];
  status: "OPEN" | "RESOLVED";
  createdAt: string;
};

const INITIAL_OFFERS: SharedOffer[] = [
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
    message: "Grade A cleaned red onions packed in 50 kg mesh bags. Direct truck delivery available.",
    status: "PENDING",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

const INITIAL_VERIFIED: string[] = [
  "buyer-seed-1",
  "procurement@greenharvest.in",
  "buyer-seed-2",
  "anita.procure@malabarorganic.com",
  "shumaillab212@gmail.com",
];

// Persistent state across all network clients in the Next.js Node process
declare global {
  // eslint-disable-next-line no-var
  var __vithu_offers: SharedOffer[] | undefined;
  // eslint-disable-next-line no-var
  var __vithu_verified_buyers: string[] | undefined;
  // eslint-disable-next-line no-var
  var __vithu_surplus: SharedSurplus[] | undefined;
}

if (!globalThis.__vithu_offers) {
  globalThis.__vithu_offers = [...INITIAL_OFFERS];
}
if (!globalThis.__vithu_verified_buyers) {
  globalThis.__vithu_verified_buyers = [...INITIAL_VERIFIED];
}
if (!globalThis.__vithu_surplus) {
  globalThis.__vithu_surplus = [];
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
  return NextResponse.json(
    {
      success: true,
      offers: globalThis.__vithu_offers,
      verifiedBuyers: globalThis.__vithu_verified_buyers,
      surplus: globalThis.__vithu_surplus,
    },
    { headers: corsHeaders }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action;

    if (action === "ADD_OFFER") {
      const offer: SharedOffer = body.offer;
      if (offer && offer.id) {
        const current = globalThis.__vithu_offers || [];
        globalThis.__vithu_offers = [offer, ...current.filter((o) => o.id !== offer.id)];
      }
    } else if (action === "UPDATE_OFFER_STATUS") {
      const { id, status } = body;
      const current = globalThis.__vithu_offers || [];
      globalThis.__vithu_offers = current.map((o) => (o.id === id ? { ...o, status } : o));
    } else if (action === "DELETE_OFFER") {
      const { id } = body;
      const current = globalThis.__vithu_offers || [];
      globalThis.__vithu_offers = current.filter((o) => o.id !== id);
    } else if (action === "SET_BUYER_VERIFIED") {
      const { identifier, isVerified } = body;
      if (identifier) {
        const idNorm = String(identifier).trim().toLowerCase();
        const current = globalThis.__vithu_verified_buyers || [];
        if (isVerified) {
          if (!current.some((x) => x.toLowerCase() === idNorm)) {
            globalThis.__vithu_verified_buyers = [...current, String(identifier).trim()];
          }
        } else {
          globalThis.__vithu_verified_buyers = current.filter(
            (x) => x.toLowerCase() !== idNorm && x !== identifier
          );
        }
      }
    } else if (action === "ADD_SURPLUS") {
      const item: SharedSurplus = body.surplus;
      if (item && item.id) {
        const current = globalThis.__vithu_surplus || [];
        globalThis.__vithu_surplus = [item, ...current.filter((s) => s.id !== item.id)];
      }
    } else if (action === "DELETE_SURPLUS") {
      const { id } = body;
      const current = globalThis.__vithu_surplus || [];
      globalThis.__vithu_surplus = current.filter((s) => s.id !== id);
    }

    return NextResponse.json(
      {
        success: true,
        offers: globalThis.__vithu_offers,
        verifiedBuyers: globalThis.__vithu_verified_buyers,
        surplus: globalThis.__vithu_surplus,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Sync error" },
      { status: 400, headers: corsHeaders }
    );
  }
}
