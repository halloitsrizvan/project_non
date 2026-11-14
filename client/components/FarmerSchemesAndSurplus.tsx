"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  ExternalLink,
  FileText,
  ShieldCheck,
  Calendar,
  Tag,
  MapPin,
  Building2,
  ChevronDown,
  ChevronUp,
  Phone,
  MessageCircle,
  Plus,
  X,
  Package,
  Layers,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";
import { api, getPage } from "../lib/api";

type Scheme = {
  id: string;
  name: string;
  department: string;
  description?: string;
  benefit?: string;
  benefits?: string;
  eligibility?: string;
  eligibilityCriteria?: string;
  requiredDocuments?: string[] | null;
  applicationProcess?: string;
  applicationUrl?: string;
  officialUrl?: string;
  deadline: string | null;
  state?: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
};

type Surplus = {
  id: string;
  productId?: string;
  farmerId?: string;
  productName?: string;
  farmerName?: string;
  farmerPhone?: string;
  location?: string;
  surplusQuantity?: string | number;
  remainingQuantity?: string | number;
  originalQuantity?: string | number;
  unit?: string;
  pricePerUnit?: string | number;
  reason?: string;
  status: string;
  createdAt?: string;
  product?: {
    id?: string;
    name?: string;
    unit?: string;
    pricePerUnit?: string | number;
    quantity?: string | number;
    availableQuantity?: string | number;
    location?: string;
    images?: string[];
  };
  farmer?: {
    id?: string;
    state?: string;
    district?: string;
    user?: {
      id?: string;
      name?: string;
      email?: string;
      phone?: string;
    };
  };
};

type SharedSurplus = {
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

const formatDate = (val?: string | null) => {
  if (!val) return "Ongoing / Open Enrollment";
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return "Ongoing";
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "Ongoing";
  }
};

/* =========================================================================
   1. GOVERNMENT SCHEMES PAGE
   ========================================================================= */

export function FarmerSchemesPage() {
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState<string>("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["farmer", "schemes"],
    queryFn: () => getPage<Scheme>("schemes?page=1&limit=50"),
  });

  const schemes = query.data?.items ?? [];

  const filtered = schemes.filter((s) => {
    if (s.status && s.status !== "PUBLISHED") return false;

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchDept = s.department?.toLowerCase().includes(q);
      const matchDesc = s.description?.toLowerCase().includes(q);
      const matchBenefit = (s.benefit || s.benefits || "").toLowerCase().includes(q);
      if (!matchName && !matchDept && !matchDesc && !matchBenefit) return false;
    }

    // Category / Dept filter
    if (filterDept === "KERALA") {
      const isKerala =
        s.department?.toLowerCase().includes("kerala") ||
        s.department?.toLowerCase().includes("keralam") ||
        s.name.toLowerCase().includes("keralam") ||
        s.state?.toLowerCase().includes("kerala");
      if (!isKerala) return false;
    } else if (filterDept === "CENTRAL") {
      const isCentral =
        s.name.toLowerCase().includes("pm-") ||
        s.name.toLowerCase().includes("pmfby") ||
        s.name.toLowerCase().includes("pradhan") ||
        s.department?.toLowerCase().includes("ministry") ||
        s.department?.toLowerCase().includes("central") ||
        s.department?.toLowerCase().includes("cooperation");
      if (!isCentral) return false;
    } else if (filterDept === "SUBSIDY") {
      const isSubsidy =
        s.name.toLowerCase().includes("subsidy") ||
        s.name.toLowerCase().includes("grant") ||
        s.name.toLowerCase().includes("support") ||
        s.benefits?.toLowerCase().includes("subsidy") ||
        s.benefit?.toLowerCase().includes("subsidy");
      if (!isSubsidy) return false;
    }

    return true;
  });

  const totalSchemes = schemes.length;
  const publishedCount = schemes.filter((s) => s.status === "PUBLISHED" || !s.status).length;

  return (
    <div className="portal-stack" style={{ gap: "24px" }}>
      {/* Overview Stat Strip */}
      <div className="portal-demand-metrics">
        <div className="portal-demand-stat-card">
          <div className="portal-demand-stat-label">Verified Schemes</div>
          <div className="portal-demand-stat-value">{publishedCount || totalSchemes}</div>
          <div className="portal-demand-stat-sub">Direct official government benefits</div>
        </div>
        <div className="portal-demand-stat-card">
          <div className="portal-demand-stat-label">Coverage Areas</div>
          <div className="portal-demand-stat-value">5 Sectors</div>
          <div className="portal-demand-stat-sub">Income, insurance, equipment, organic & soil</div>
        </div>
        <div className="portal-demand-stat-card">
          <div className="portal-demand-stat-label">Official Application</div>
          <div className="portal-demand-stat-value" style={{ color: "#0d6543" }}>100% Direct</div>
          <div className="portal-demand-stat-sub">Zero intermediaries, official gov portals</div>
        </div>
      </div>

      {/* Search & Department Filters */}
      <div className="portal-panel" style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", alignItems: "center", justifyContent: "space-between" }}>
          {/* Search */}
          <div style={{ position: "relative", minWidth: "260px", flex: "1 1 300px" }}>
            <Search
              size={17}
              style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#6b8b76" }}
            />
            <input
              type="text"
              placeholder="Search schemes, subsidies, or departments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px 10px 40px",
                border: "1px solid #d4e3d3",
                borderRadius: "10px",
                fontSize: "14px",
                outline: "none",
                background: "#fafdf9",
              }}
            />
          </div>

          {/* Filter Pills */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {[
              { id: "ALL", label: `All Schemes (${publishedCount})` },
              { id: "KERALA", label: "Kerala State Missions" },
              { id: "CENTRAL", label: "Central Govt (PM-KISAN / PMFBY)" },
              { id: "SUBSIDY", label: "Equipment & Subsidies" },
            ].map((pill) => (
              <button
                key={pill.id}
                type="button"
                onClick={() => setFilterDept(pill.id)}
                className={`portal-demand-pill ${filterDept === pill.id ? "active" : ""}`}
                style={{ padding: "8px 14px", fontSize: "13px", cursor: "pointer" }}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading & Error States */}
      {query.isPending && (
        <div className="portal-panel" style={{ textAlign: "center", padding: "48px 20px" }}>
          <p style={{ color: "#4d6b57", fontSize: "15px" }}>Loading verified government schemes...</p>
        </div>
      )}

      {query.isError && (
        <div className="portal-panel" style={{ textAlign: "center", padding: "40px 20px" }}>
          <AlertCircle size={32} style={{ color: "#d9534f", margin: "0 auto 12px" }} />
          <h3 style={{ fontSize: "16px", color: "#123423", marginBottom: "6px" }}>Could not load schemes</h3>
          <p style={{ color: "#6b8b76", fontSize: "14px", marginBottom: "16px" }}>{query.error.message}</p>
          <button className="portal-button" onClick={() => void query.refetch()}>
            Retry
          </button>
        </div>
      )}

      {/* Scheme List */}
      {!query.isPending && !query.isError && (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {filtered.length === 0 ? (
            <div className="portal-panel" style={{ textAlign: "center", padding: "48px 20px" }}>
              <Building2 size={36} style={{ color: "#8da996", margin: "0 auto 12px" }} />
              <h3 style={{ fontSize: "16px", color: "#123423", marginBottom: "6px" }}>No matching schemes found</h3>
              <p style={{ color: "#6b8b76", fontSize: "14px" }}>
                Try adjusting your search terms or filter selection.
              </p>
            </div>
          ) : (
            filtered.map((scheme) => {
              const benefitText = scheme.benefit || scheme.benefits;
              const eligibilityText = scheme.eligibility || scheme.eligibilityCriteria;
              const officialLink = scheme.officialUrl || scheme.applicationUrl || "https://kerala.gov.in";
              const isExpanded = expandedId === scheme.id;
              const docs = Array.isArray(scheme.requiredDocuments) ? scheme.requiredDocuments : null;

              return (
                <div
                  key={scheme.id}
                  className="portal-panel"
                  style={{
                    padding: "24px",
                    border: "1px solid #dce8db",
                    borderRadius: "14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    transition: "border-color 0.15s ease",
                  }}
                >
                  {/* Top Meta Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "#0d6543",
                          background: "#e8f6ec",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          border: "1px solid #c5ebd0",
                        }}
                      >
                        <ShieldCheck size={14} /> Official Verified Scheme
                      </span>
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#466952",
                          background: "#f0f5ee",
                          padding: "4px 10px",
                          borderRadius: "6px",
                        }}
                      >
                        {scheme.department}
                      </span>
                      {scheme.state && (
                        <span style={{ fontSize: "12px", color: "#63806e", padding: "4px 6px" }}>
                          📍 {scheme.state}
                        </span>
                      )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#567761", fontSize: "13px" }}>
                      <Calendar size={15} />
                      <span>Deadline: <strong>{formatDate(scheme.deadline)}</strong></span>
                    </div>
                  </div>

                  {/* Scheme Name & Description */}
                  <div>
                    <h2 style={{ fontSize: "19px", color: "#113824", margin: "0 0 8px", fontWeight: 700, letterSpacing: "-0.3px" }}>
                      {scheme.name}
                    </h2>
                    {scheme.description && (
                      <p style={{ fontSize: "14px", color: "#466352", lineHeight: 1.55, margin: 0 }}>
                        {scheme.description}
                      </p>
                    )}
                  </div>

                  {/* Highlights Grid (Benefits & Eligibility) */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                      gap: "14px",
                      background: "#f7faf7",
                      border: "1px solid #e2ece1",
                      borderRadius: "10px",
                      padding: "16px",
                    }}
                  >
                    {/* Benefit */}
                    {benefitText && (
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#0d6543", fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: "6px" }}>
                          <Sparkles size={14} /> Key Benefit & Subsidy
                        </div>
                        <p style={{ margin: 0, fontSize: "13.5px", color: "#153d26", fontWeight: 600, lineHeight: 1.45 }}>
                          {benefitText}
                        </p>
                      </div>
                    )}

                    {/* Eligibility */}
                    {eligibilityText && (
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#0d6543", fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: "6px" }}>
                          <CheckCircle2 size={14} /> Eligibility
                        </div>
                        <p style={{ margin: 0, fontSize: "13px", color: "#3d5746", lineHeight: 1.45 }}>
                          {eligibilityText}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Required Documents (if available) */}
                  {docs && docs.length > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", fontSize: "12px", color: "#4a6755" }}>
                      <span style={{ fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <FileText size={14} /> Required Documents:
                      </span>
                      {docs.map((doc, idx) => (
                        <span
                          key={idx}
                          style={{
                            background: "#eef5ed",
                            border: "1px solid #d4e5d3",
                            padding: "3px 8px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            color: "#1f4a30",
                          }}
                        >
                          {doc}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Expandable Application Process */}
                  {scheme.applicationProcess && isExpanded && (
                    <div style={{ background: "#fff", border: "1px dashed #cde0cc", padding: "14px", borderRadius: "8px" }}>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "#1f4a30", textTransform: "uppercase", marginBottom: "4px" }}>
                        How to Apply
                      </div>
                      <p style={{ margin: 0, fontSize: "13px", color: "#405b4a", lineHeight: 1.5 }}>
                        {scheme.applicationProcess}
                      </p>
                    </div>
                  )}

                  {/* Action Bar */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderTop: "1px solid #eef4ec",
                      paddingTop: "14px",
                      flexWrap: "wrap",
                      gap: "12px",
                    }}
                  >
                    {scheme.applicationProcess ? (
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : scheme.id)}
                        className="portal-secondary-button"
                        style={{ fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "6px", cursor: "pointer" }}
                      >
                        {isExpanded ? <>Less details <ChevronUp size={15} /></> : <>Application details <ChevronDown size={15} /></>}
                      </button>
                    ) : <div />}

                    <a
                      href={officialLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="portal-button"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "13.5px",
                        fontWeight: 700,
                        textDecoration: "none",
                        padding: "10px 18px",
                      }}
                    >
                      Apply on Official Portal <ExternalLink size={16} />
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Helpful Guidance Footer */}
      <div
        className="portal-panel"
        style={{
          background: "#f4f8f4",
          border: "1px solid #dce8db",
          padding: "18px 22px",
          borderRadius: "12px",
          display: "flex",
          gap: "14px",
          alignItems: "flex-start",
        }}
      >
        <ShieldCheck size={24} style={{ color: "#0d6543", flexShrink: 0, marginTop: "2px" }} />
        <div>
          <h4 style={{ margin: "0 0 4px", fontSize: "14px", color: "#143c26", fontWeight: 700 }}>
            Official Government Subsidy Portal Transparency
          </h4>
          <p style={{ margin: 0, fontSize: "13px", color: "#466352", lineHeight: 1.5 }}>
            Vithu aggregates verified state and central schemes to connect farmers with direct financial benefits.
            All applications are completed securely through official government portals (`kerala.gov.in`, `pmkisan.gov.in`, etc.) without commission or third-party agent fees.
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   2. SURPLUS PRODUCE CLEARANCE PAGE
   ========================================================================= */

export function FarmerSurplusPage() {
  const [search, setSearch] = useState("");
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportingSuccess, setReportingSuccess] = useState(false);

  const queryClient = useQueryClient();

  // 1. Fetch DB surplus items
  const surplusQuery = useQuery({
    queryKey: ["farmer", "surplus"],
    queryFn: () => getPage<Surplus>("surplus?page=1&limit=50"),
  });

  // 2. Fetch synced surplus items
  const syncQuery = useQuery({
    queryKey: ["portal-sync", "surplus"],
    queryFn: async () => {
      const res = await fetch("/api/portal-sync", { cache: "no-store" });
      const data = await res.json();
      return (data.surplus as SharedSurplus[]) || [];
    },
    refetchInterval: 4000,
  });

  // 3. Fetch farmer's own products for quick autofill in the modal
  const myProductsQuery = useQuery({
    queryKey: ["farmer", "my-products"],
    queryFn: () => api<any[]>("products"),
    retry: 1,
  });

  const dbItems = surplusQuery.data?.items ?? [];
  const syncedItems = syncQuery.data ?? [];

  // Merge items (synced items first, avoiding duplicate IDs)
  const allSurplus: Array<Surplus | SharedSurplus> = [
    ...syncedItems,
    ...dbItems.filter((dbItem) => !syncedItems.some((s) => s.id === dbItem.id)),
  ];

  const filteredSurplus = allSurplus.filter((item) => {
    const pName = (item as any).productName || (item as any).product?.name || "";
    const loc = (item as any).location || (item as any).product?.location || "";
    const reason = (item as any).reason || "";

    if (search.trim()) {
      const q = search.toLowerCase();
      if (!pName.toLowerCase().includes(q) && !loc.toLowerCase().includes(q) && !reason.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const totalListings = allSurplus.length;

  return (
    <div className="portal-stack" style={{ gap: "24px" }}>
      {/* Top Banner & Action */}
      <div
        className="portal-panel"
        style={{
          background: "linear-gradient(135deg, #104e33 0%, #0d6543 100%)",
          color: "#fff",
          padding: "24px 28px",
          borderRadius: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "18px",
        }}
      >
        <div>
          <span
            style={{
              fontSize: "12px",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              background: "rgba(255,255,255,0.18)",
              padding: "4px 10px",
              borderRadius: "20px",
              display: "inline-block",
              marginBottom: "8px",
            }}
          >
            Direct Farmgate Clearance
          </span>
          <h2 style={{ fontSize: "22px", margin: "0 0 6px", fontWeight: 700, color: "#fff" }}>
            Surplus Harvest & Bulk Clearance
          </h2>
          <p style={{ margin: 0, fontSize: "14px", color: "#d2eedb", maxWidth: "600px", lineHeight: 1.45 }}>
            Liquidate excess bumper harvest quickly, or procure fresh farm surplus directly from neighboring growers at discounted rates.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setReportingSuccess(false);
            setReportModalOpen(true);
          }}
          className="portal-button"
          style={{
            background: "#fff",
            color: "#0d6543",
            fontWeight: 700,
            fontSize: "14px",
            padding: "12px 20px",
            boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
            border: "none",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Plus size={18} /> Report Produce Surplus
        </button>
      </div>

      {/* Metrics Bar */}
      <div className="portal-demand-metrics">
        <div className="portal-demand-stat-card">
          <div className="portal-demand-stat-label">Active Surplus Batches</div>
          <div className="portal-demand-stat-value">{totalListings} Listings</div>
          <div className="portal-demand-stat-sub">Available for immediate farmgate pickup</div>
        </div>
        <div className="portal-demand-stat-card">
          <div className="portal-demand-stat-label">Discount Benefit</div>
          <div className="portal-demand-stat-value">15% - 30%</div>
          <div className="portal-demand-stat-sub">Below standard mandi wholesale price</div>
        </div>
        <div className="portal-demand-stat-card">
          <div className="portal-demand-stat-label">Matching Speed</div>
          <div className="portal-demand-stat-value" style={{ color: "#0d6543" }}>48 Hours</div>
          <div className="portal-demand-stat-sub">Direct call and WhatsApp procurement</div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="portal-panel" style={{ padding: "14px 18px" }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: "1 1 280px" }}>
            <Search
              size={17}
              style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#6b8b76" }}
            />
            <input
              type="text"
              placeholder="Search surplus crops, location, or variety (e.g. Garlic, Coconut, Kozhikode)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 14px 9px 40px",
                border: "1px solid #d4e3d3",
                borderRadius: "10px",
                fontSize: "14px",
                outline: "none",
                background: "#fafdf9",
              }}
            />
          </div>
          <div style={{ fontSize: "13px", color: "#50715b", fontWeight: 600 }}>
            Showing {filteredSurplus.length} surplus lots
          </div>
        </div>
      </div>

      {/* Surplus Grid */}
      {surplusQuery.isPending && (
        <div className="portal-panel" style={{ textAlign: "center", padding: "48px 20px" }}>
          <p style={{ color: "#4d6b57", fontSize: "15px" }}>Loading active surplus listings...</p>
        </div>
      )}

      {surplusQuery.isError && (
        <div className="portal-panel" style={{ textAlign: "center", padding: "40px 20px" }}>
          <AlertCircle size={32} style={{ color: "#d9534f", margin: "0 auto 12px" }} />
          <h3 style={{ fontSize: "16px", color: "#123423", marginBottom: "6px" }}>Could not load surplus listings</h3>
          <p style={{ color: "#6b8b76", fontSize: "14px", marginBottom: "16px" }}>{surplusQuery.error.message}</p>
          <button className="portal-button" onClick={() => void surplusQuery.refetch()}>
            Retry
          </button>
        </div>
      )}

      {!surplusQuery.isPending && !surplusQuery.isError && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" }}>
          {filteredSurplus.length === 0 ? (
            <div className="portal-panel" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "48px 20px" }}>
              <Package size={36} style={{ color: "#8da996", margin: "0 auto 12px" }} />
              <h3 style={{ fontSize: "16px", color: "#123423", marginBottom: "6px" }}>No surplus listings found</h3>
              <p style={{ color: "#6b8b76", fontSize: "14px", margin: "0 0 16px" }}>
                There are no open surplus produce lots matching your filter.
              </p>
              <button
                type="button"
                className="portal-button"
                onClick={() => setReportModalOpen(true)}
              >
                <Plus size={16} /> Report your produce surplus
              </button>
            </div>
          ) : (
            filteredSurplus.map((item) => {
              const productName =
                (item as any).productName ||
                (item as any).product?.name ||
                "Surplus Harvest";
              const unit = (item as any).unit || (item as any).product?.unit || "kg";
              const surplusQty =
                (item as any).surplusQuantity ??
                (item as any).remainingQuantity ??
                "";
              const price =
                (item as any).pricePerUnit ??
                (item as any).product?.pricePerUnit ??
                null;
              const location =
                (item as any).location ||
                (item as any).product?.location ||
                [
                  (item as any).farmer?.district,
                  (item as any).farmer?.state,
                ]
                  .filter(Boolean)
                  .join(", ") ||
                "Kerala";
              const farmerName =
                (item as any).farmerName ||
                (item as any).farmer?.user?.name ||
                "Verified Farmer";
              const farmerPhone =
                (item as any).farmerPhone ||
                (item as any).farmer?.user?.phone ||
                "+918593856375";
              const reason = (item as any).reason || "Bumper harvest available for rapid farmgate pickup.";
              const images = (item as any).images || (item as any).product?.images || [];
              const imageUrl = images[0] || null;

              const cleanPhone = farmerPhone.replace(/\D/g, "");
              const waText = encodeURIComponent(
                `Hello ${farmerName}, I saw your surplus listing for ${productName} (${surplusQty} ${unit}) on Vithu. I am interested in bulk procurement.`
              );

              return (
                <div
                  key={item.id}
                  className="portal-crop-card"
                  style={{
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "14px",
                    borderRadius: "14px",
                    border: "1px solid #dce8dc",
                  }}
                >
                  {/* Image & Header */}
                  <div>
                    {imageUrl ? (
                      <div
                        style={{
                          width: "100%",
                          height: "160px",
                          borderRadius: "10px",
                          overflow: "hidden",
                          marginBottom: "14px",
                          background: "#eef3ed",
                        }}
                      >
                        <img
                          src={imageUrl}
                          alt={productName}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "90px",
                          borderRadius: "10px",
                          marginBottom: "14px",
                          background: "linear-gradient(135deg, #eaf4ec 0%, #d8ebd9 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#0d6543",
                        }}
                      >
                        <Package size={32} />
                      </div>
                    )}

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", marginBottom: "6px" }}>
                      <div>
                        <h3 style={{ margin: "0 0 4px", fontSize: "18px", color: "#133824", fontWeight: 700 }}>
                          {productName}
                        </h3>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#5a7864", fontSize: "12.5px" }}>
                          <MapPin size={13} /> {location}
                        </div>
                      </div>

                      <div
                        style={{
                          background: "#e8f7ec",
                          border: "1px solid #bce6c6",
                          color: "#0b633f",
                          fontWeight: 800,
                          fontSize: "13px",
                          padding: "6px 10px",
                          borderRadius: "8px",
                          whiteSpace: "nowrap",
                          textAlign: "right",
                        }}
                      >
                        {surplusQty} {unit}
                        <div style={{ fontSize: "10px", fontWeight: 600, color: "#417d59" }}>SURPLUS</div>
                      </div>
                    </div>

                    {/* Price & Reason */}
                    <div style={{ background: "#f8fbf8", border: "1px solid #e7efe6", borderRadius: "8px", padding: "10px 12px", margin: "10px 0" }}>
                      {price && (
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                          <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#6a8873" }}>Farmgate Price</span>
                          <strong style={{ fontSize: "15px", color: "#0d6543", fontWeight: 800 }}>
                            ₹{price} <span style={{ fontSize: "12px", fontWeight: 500 }}>/ {unit}</span>
                          </strong>
                        </div>
                      )}
                      <p style={{ margin: 0, fontSize: "12.5px", color: "#486653", lineHeight: 1.45, fontStyle: "italic" }}>
                        "{reason}"
                      </p>
                    </div>

                    {/* Farmer Details */}
                    <div style={{ fontSize: "12px", color: "#547360", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span>Farmer: <strong>{farmerName}</strong></span>
                      <span style={{ color: "#0d6543", fontWeight: 600 }}>● Open for pickup</span>
                    </div>
                  </div>

                  {/* Contact / Procurement Actions */}
                  <div style={{ display: "flex", gap: "8px", borderTop: "1px solid #edf4ec", paddingTop: "12px" }}>
                    <a
                      href={`tel:${cleanPhone}`}
                      className="portal-secondary-button"
                      style={{
                        flex: 1,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        fontSize: "13px",
                        textDecoration: "none",
                        padding: "9px 12px",
                      }}
                    >
                      <Phone size={15} /> Call
                    </a>

                    <a
                      href={`https://wa.me/${cleanPhone}?text=${waText}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="portal-button"
                      style={{
                        flex: 1.2,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        fontSize: "13px",
                        textDecoration: "none",
                        padding: "9px 12px",
                        background: "#25D366",
                        borderColor: "#25D366",
                        color: "#fff",
                        fontWeight: 700,
                      }}
                    >
                      <MessageCircle size={16} /> WhatsApp
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Report Surplus Modal */}
      {reportModalOpen && (
        <ReportSurplusModal
          myProducts={myProductsQuery.data || []}
          onClose={() => setReportModalOpen(false)}
          onSuccess={() => {
            void queryClient.invalidateQueries({ queryKey: ["farmer", "surplus"] });
            void queryClient.invalidateQueries({ queryKey: ["portal-sync", "surplus"] });
            setReportModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

/* =========================================================================
   REPORT SURPLUS MODAL COMPONENT
   ========================================================================= */

function ReportSurplusModal({
  myProducts,
  onClose,
  onSuccess,
}: {
  myProducts: any[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [customProduceName, setCustomProduceName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg");
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [location, setLocation] = useState("Kerala");
  const [farmerName, setFarmerName] = useState("Local Farmer");
  const [farmerPhone, setFarmerPhone] = useState("+91 85938 56375");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleProductSelect = (id: string) => {
    setSelectedProductId(id);
    if (!id) return;
    const p = myProducts.find((item) => item.id === id);
    if (p) {
      setCustomProduceName(p.name || "");
      setUnit(p.unit || "kg");
      setPricePerUnit(p.pricePerUnit ? String(p.pricePerUnit) : "");
      if (p.location) setLocation(p.location);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const produceTitle = customProduceName.trim();
    if (!produceTitle) {
      setErrorMsg("Please enter or select a produce name.");
      return;
    }
    if (!quantity || Number(quantity) <= 0) {
      setErrorMsg("Please enter a valid surplus quantity.");
      return;
    }

    setSubmitting(true);
    try {
      const newSurplus: SharedSurplus = {
        id: `surplus-cust-${Date.now()}`,
        productId: selectedProductId || undefined,
        productName: produceTitle,
        farmerName: farmerName.trim() || "Local Farmer",
        farmerPhone: farmerPhone.trim() || "+91 85938 56375",
        location: location.trim() || "Kerala",
        surplusQuantity: quantity,
        unit: unit,
        pricePerUnit: pricePerUnit ? pricePerUnit : undefined,
        reason: reason.trim() || "Bumper harvest available for rapid farmgate pickup.",
        status: "OPEN",
        createdAt: new Date().toISOString(),
      };

      const res = await fetch("/api/portal-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ADD_SURPLUS",
          surplus: newSurplus,
        }),
      });

      if (!res.ok) {
        throw new Error("Could not sync surplus alert across devices.");
      }

      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit surplus alert.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(10, 30, 20, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "16px",
      }}
    >
      <div
        className="portal-panel"
        style={{
          width: "100%",
          maxWidth: "540px",
          background: "#fff",
          borderRadius: "16px",
          padding: "26px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
          <div>
            <h2 style={{ fontSize: "19px", margin: "0 0 4px", color: "#113824", fontWeight: 700 }}>
              Report Produce Surplus
            </h2>
            <p style={{ margin: 0, fontSize: "13px", color: "#567663" }}>
              Alert nearby buyers and traders to procure your unsold or bumper yield.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: "none", border: "none", color: "#6e8b78", cursor: "pointer", padding: "4px" }}
          >
            <X size={20} />
          </button>
        </div>

        {errorMsg && (
          <div style={{ background: "#fdf2f2", border: "1px solid #f5c6cb", color: "#721c24", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "14px" }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Autofill from existing inventory */}
          {myProducts && myProducts.length > 0 && (
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#183e2b", marginBottom: "6px" }}>
                Select from Your Listed Products (Optional)
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => handleProductSelect(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cce0ce",
                  fontSize: "14px",
                  background: "#f9fcf9",
                }}
              >
                <option value="">-- Choose from my listed products or enter below --</option>
                {myProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.availableQuantity || p.quantity} {p.unit} in stock)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Produce Name */}
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#183e2b", marginBottom: "6px" }}>
              Produce / Crop Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Nendran Banana, Red Onion, Ginger, Coconuts"
              value={customProduceName}
              onChange={(e) => setCustomProduceName(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "8px",
                border: "1px solid #cce0ce",
                fontSize: "14px",
              }}
            />
          </div>

          {/* Quantity & Unit */}
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "10px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#183e2b", marginBottom: "6px" }}>
                Surplus Quantity *
              </label>
              <input
                type="number"
                required
                min="1"
                placeholder="e.g. 500"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cce0ce",
                  fontSize: "14px",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#183e2b", marginBottom: "6px" }}>
                Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cce0ce",
                  fontSize: "14px",
                  background: "#fff",
                }}
              >
                <option value="kg">kg</option>
                <option value="quintal">quintal</option>
                <option value="ton">ton</option>
                <option value="piece">piece</option>
                <option value="box">box</option>
                <option value="crate">crate</option>
              </select>
            </div>
          </div>

          {/* Discount / Farmgate Price */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#183e2b", marginBottom: "6px" }}>
                Discounted Price / {unit} (₹)
              </label>
              <input
                type="number"
                placeholder="e.g. 35"
                value={pricePerUnit}
                onChange={(e) => setPricePerUnit(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cce0ce",
                  fontSize: "14px",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#183e2b", marginBottom: "6px" }}>
                Farm Location *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Wayanad, Kerala"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cce0ce",
                  fontSize: "14px",
                }}
              />
            </div>
          </div>

          {/* Contact Details */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#183e2b", marginBottom: "6px" }}>
                Farmer Name
              </label>
              <input
                type="text"
                placeholder="Your Name"
                value={farmerName}
                onChange={(e) => setFarmerName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cce0ce",
                  fontSize: "14px",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#183e2b", marginBottom: "6px" }}>
                Contact Phone / WhatsApp *
              </label>
              <input
                type="text"
                required
                placeholder="+91 9876543210"
                value={farmerPhone}
                onChange={(e) => setFarmerPhone(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cce0ce",
                  fontSize: "14px",
                }}
              />
            </div>
          </div>

          {/* Reason / Notes */}
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#183e2b", marginBottom: "6px" }}>
              Batch Context & Pickup Instructions
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Bumper harvest harvested this morning. Ready for immediate pickup or delivery to local food processing unit."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "8px",
                border: "1px solid #cce0ce",
                fontSize: "13.5px",
                resize: "vertical",
              }}
            />
          </div>

          {/* Modal Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
            <button
              type="button"
              className="portal-secondary-button"
              onClick={onClose}
              style={{ padding: "9px 16px" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="portal-button"
              disabled={submitting}
              style={{ padding: "9px 20px" }}
            >
              {submitting ? "Publishing..." : "Publish Surplus Alert"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
