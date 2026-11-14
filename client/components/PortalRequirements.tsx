"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  ExternalLink,
  FileText,
  Filter,
  Heart,
  MapPin,
  MessageCircle,
  Package,
  PackageCheck,
  Phone,
  PhoneCall,
  Plus,
  Search,
  Send,
  Share2,
  ShieldCheck,
  Trash2,
  Truck,
  User,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { money, ProductCard, useProducts, ViewState } from "./PortalCommon";
import {
  useRequirements,
  useSupplyOffers,
  useVerifiedBuyers,
  type BuyerRequirement,
  type RequirementInput,
  type SupplyOffer,
  type SupplyOfferInput,
} from "@/lib/requirements";
import { useWishlist } from "@/lib/wishlist";

// ==========================================
// 1. BUYER: List Requirements Page
// ==========================================
export function BuyerRequirementsPage() {
  const { user } = useAuth();
  const { requirements, deleteRequirement, updateStatus } = useRequirements();
  const { offers, updateOfferStatus } = useSupplyOffers();
  const [tab, setTab] = useState<"my" | "all">("my");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [expandedOffers, setExpandedOffers] = useState<Record<string, boolean>>({});

  const toggleOffersExpanded = (reqId: string) => {
    setExpandedOffers((prev) => ({ ...prev, [reqId]: !prev[reqId] }));
  };

  const myRequirements = useMemo(() => {
    return requirements.filter(
      (r) => r.buyerId === user?.id || (user?.email && r.email === user.email) || (user?.phone && r.phone === user.phone)
    );
  }, [requirements, user]);

  const displayed = useMemo(() => {
    const list = tab === "my" ? myRequirements : requirements;
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (r) =>
        r.productName.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
    );
  }, [tab, myRequirements, requirements, search]);

  const urgentCount = myRequirements.filter((r) => r.urgency === "URGENT").length;
  const openCount = myRequirements.filter((r) => r.status === "OPEN").length;

  return (
    <div className="portal-stack">
      {notice && (
        <div className="portal-notice" role="status" style={{ display: "flex", justifyContent: "space-between" }}>
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice("")} style={{ border: 0, background: "none", cursor: "pointer" }}>✕</button>
        </div>
      )}

      {/* Overview Stats */}
      <div className="portal-stat-grid">
        <div className="portal-stat">
          <span><FileText size={18} /> My Posted Requests</span>
          <strong>{myRequirements.length}</strong>
          <small>Active produce requirements</small>
        </div>
        <div className="portal-stat">
          <span><Clock size={18} /> Open Requirements</span>
          <strong>{openCount}</strong>
          <small>Awaiting farmer offers</small>
        </div>
        <div className="portal-stat">
          <span><Plus size={18} /> Urgent Demands</span>
          <strong>{urgentCount}</strong>
          <small>High priority procurement</small>
        </div>
      </div>

      {/* Action Banner */}
      <div className="portal-promo" style={{ background: "#0c5339" }}>
        <div>
          <strong style={{ fontSize: 20 }}>Can&apos;t find what you need in the marketplace?</strong>
          <small style={{ fontSize: 13, color: "#d2ebd6", display: "block", marginTop: 4 }}>
            Post a requirement describing the produce, desired quantity, and target price. Local farmers will see your demand and submit supply offers with quotes directly.
          </small>
        </div>
        <Link className="portal-button" href="/buyer/requirements/new" style={{ background: "#7cd34b", color: "#063825" }}>
          <Plus size={17} /> Post requirement
        </Link>
      </div>

      {/* Tabs and Search */}
      <div className="portal-panel" style={{ padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div className="portal-tab-bar" style={{ margin: 0, border: 0, padding: 0 }}>
            <button
              type="button"
              className={`portal-tab-btn ${tab === "my" ? "active" : ""}`}
              onClick={() => setTab("my")}
            >
              My Postings ({myRequirements.length})
            </button>
            <button
              type="button"
              className={`portal-tab-btn ${tab === "all" ? "active" : ""}`}
              onClick={() => setTab("all")}
            >
              All Market Demands ({requirements.length})
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ position: "relative", width: 260 }}>
              <input
                type="text"
                placeholder="Search produce, location…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  height: 38,
                  padding: "0 12px 0 32px",
                  borderRadius: 8,
                  border: "1px solid #d4e1d4",
                  fontSize: 13,
                }}
              />
              <Search size={15} style={{ position: "absolute", left: 10, top: 12, color: "#7a8e7e" }} />
            </div>
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                style={{ border: 0, background: "none", color: "#136d49", fontSize: 12, cursor: "pointer", fontWeight: 700 }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Requirements List */}
      {displayed.length === 0 ? (
        <div className="portal-state">
          <FileText size={32} />
          <h2>No requirements found</h2>
          <p>
            {tab === "my"
              ? "You haven't posted any produce requirements yet. Tell farmers what you need to receive supply quotes."
              : "No market requirements match your search filter."}
          </p>
          {tab === "my" && (
            <Link className="portal-button" href="/buyer/requirements/new" style={{ marginTop: 12 }}>
              <Plus size={17} /> Post your first requirement
            </Link>
          )}
        </div>
      ) : (
        <div className="portal-req-grid">
          {displayed.map((req) => {
            const isOwner = req.buyerId === user?.id || (user?.phone && req.phone === user.phone) || (user?.email && req.email === user.email);
            const reqOffers = offers.filter((o) => o.requirementId === req.id);
            const isExpanded = expandedOffers[req.id] ?? (reqOffers.length > 0);

            return (
              <div key={req.id} className="portal-req-card">
                <div>
                  <div className="portal-req-head">
                    <span className="portal-chip">{req.category}</span>
                    <div style={{ display: "flex", gap: 6 }}>
                      <span className={`portal-badge portal-badge-${req.urgency.toLowerCase()}`}>
                        {req.urgency}
                      </span>
                      <span className={`portal-badge portal-badge-${req.status.toLowerCase()}`}>
                        {req.status}
                      </span>
                    </div>
                  </div>

                  <h3>{req.productName}</h3>

                  <div className="portal-req-meta-row">
                    <div className="portal-req-meta-item">
                      <span>Quantity needed</span>
                      <strong>{req.quantity} {req.unit}</strong>
                    </div>
                    <div className="portal-req-meta-item">
                      <span>Target price</span>
                      <strong>{req.targetPrice ? money(req.targetPrice) : "Open to quotes"}</strong>
                    </div>
                  </div>

                  <p className="portal-req-desc">{req.description}</p>

                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#687c6f", marginBottom: 10 }}>
                    <MapPin size={14} />
                    <span>{req.location}</span>
                    {req.neededBy && <span>• Needed: {req.neededBy}</span>}
                  </div>
                </div>

                {/* Farmer Supply Offers Section (Visible to Owner) */}
                {isOwner && (
                  <div className="portal-incoming-offers-box">
                    <div
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
                      onClick={() => toggleOffersExpanded(req.id)}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <PackageCheck size={16} color="#0c6542" />
                        <strong style={{ fontSize: 13, color: "#113c27" }}>
                          Farmer Supply Offers ({reqOffers.length})
                        </strong>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {reqOffers.some((o) => o.status === "PENDING") && (
                          <span className="portal-badge portal-badge-urgent" style={{ fontSize: 9 }}>
                            {reqOffers.filter((o) => o.status === "PENDING").length} NEW
                          </span>
                        )}
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div style={{ marginTop: 10 }}>
                        {reqOffers.length === 0 ? (
                          <p style={{ margin: "6px 0 0", fontSize: 12, color: "#778b7d" }}>
                            No farmer has submitted an offer for this requirement yet.
                          </p>
                        ) : (
                          reqOffers.map((offer) => {
                            const cleanPhone = (offer.farmerPhone || "").replace(/[^0-9]/g, "");
                            const whatsappUrl = cleanPhone
                              ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                                  `Hello ${offer.farmerName}, regarding your supply offer on Vithu for "${req.productName}" (${offer.quantity} ${offer.unit} @ ₹${offer.pricePerUnit}/${offer.unit}). Let's discuss delivery terms.`
                                )}`
                              : "";

                            return (
                              <div key={offer.id} className="portal-offer-item">
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                                  <div>
                                    <strong style={{ fontSize: 13, color: "#143a29" }}>{offer.farmerName}</strong>
                                    {offer.farmerLocation && (
                                      <small style={{ display: "block", color: "#687c6f", fontSize: 11 }}>
                                        {offer.farmerLocation}
                                      </small>
                                    )}
                                  </div>
                                  <span className={`portal-badge portal-badge-${offer.status.toLowerCase()}`}>
                                    {offer.status}
                                  </span>
                                </div>

                                <div style={{ margin: "6px 0", fontSize: 13, fontWeight: 700, color: "#0c5839" }}>
                                  Offered: {offer.quantity} {offer.unit} @ ₹{offer.pricePerUnit}/{offer.unit}
                                  <span style={{ fontSize: 11, fontWeight: 500, color: "#647c6c", marginLeft: 6 }}>
                                    (Total: {money(offer.totalAmount)})
                                  </span>
                                </div>

                                {offer.availableDate && (
                                  <div style={{ fontSize: 11, color: "#546b5a" }}>
                                    Delivery timeline: <strong>{offer.availableDate}</strong> • Mode: <strong>{offer.deliveryOption}</strong>
                                  </div>
                                )}

                                {offer.message && (
                                  <div style={{ fontSize: 11, color: "#4f6556", margin: "4px 0", fontStyle: "italic", background: "#f5f9f4", padding: "6px 8px", borderRadius: 6 }}>
                                    &ldquo;{offer.message}&rdquo;
                                  </div>
                                )}

                                <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap", alignItems: "center" }}>
                                  {offer.status === "PENDING" && (
                                    <>
                                      <button
                                        type="button"
                                        className="portal-button"
                                        style={{ height: 28, minHeight: 28, fontSize: 11, padding: "0 10px", background: "#0c6542" }}
                                        onClick={() => {
                                          updateOfferStatus(offer.id, "ACCEPTED");
                                          setNotice(`Accepted supply offer from ${offer.farmerName}!`);
                                        }}
                                      >
                                        <Check size={12} /> Accept Quote
                                      </button>
                                      <button
                                        type="button"
                                        className="portal-secondary-button"
                                        style={{ height: 28, minHeight: 28, fontSize: 11, padding: "0 10px", color: "#ad4c3c" }}
                                        onClick={() => {
                                          updateOfferStatus(offer.id, "DECLINED");
                                          setNotice(`Declined offer from ${offer.farmerName}.`);
                                        }}
                                      >
                                        Decline
                                      </button>
                                    </>
                                  )}
                                  {offer.farmerPhone && (
                                    <a
                                      href={`tel:${offer.farmerPhone}`}
                                      className="portal-contact-btn"
                                      style={{ height: 28, padding: "0 8px", fontSize: 11 }}
                                      title="Call farmer"
                                    >
                                      <Phone size={12} /> {offer.farmerPhone}
                                    </a>
                                  )}
                                  {whatsappUrl && (
                                    <a
                                      href={whatsappUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="portal-contact-btn"
                                      style={{ height: 28, padding: "0 8px", fontSize: 11, color: "#198754", borderColor: "#a3cfbb" }}
                                      title="WhatsApp farmer"
                                    >
                                      <MessageCircle size={12} /> WhatsApp
                                    </a>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="portal-req-buyer-info">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span className="portal-req-buyer-name">{req.buyerName}</span>
                      {req.businessName && <div className="portal-req-buyer-sub">{req.businessName}</div>}
                    </div>
                    <small style={{ color: "#8a9c8f" }}>
                      {new Date(req.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                    </small>
                  </div>

                  {isOwner && (
                    <div style={{ display: "flex", gap: 8, marginTop: 12, borderTop: "1px solid #edf2ec", paddingTop: 10 }}>
                      {req.status === "OPEN" ? (
                        <button
                          type="button"
                          className="portal-contact-btn"
                          onClick={() => {
                            updateStatus(req.id, "FULFILLED");
                            setNotice(`Marked "${req.productName}" as fulfilled.`);
                          }}
                        >
                          <CheckCircle2 size={14} /> Mark fulfilled
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="portal-contact-btn"
                          onClick={() => {
                            updateStatus(req.id, "OPEN");
                            setNotice(`Re-opened "${req.productName}" requirement.`);
                          }}
                        >
                          Reopen request
                        </button>
                      )}
                      <button
                        type="button"
                        className="portal-contact-btn"
                        style={{ color: "#ad4c3c" }}
                        onClick={() => {
                          if (window.confirm(`Delete requirement "${req.productName}"?`)) {
                            deleteRequirement(req.id);
                            setNotice("Requirement deleted.");
                          }
                        }}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ==========================================
// 2. BUYER: New Requirement Form Page ("I need this product")
// ==========================================
export function BuyerRequirementFormPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { addRequirement } = useRequirements();

  const [form, setForm] = useState<RequirementInput>({
    buyerId: user?.id ?? "buyer-anon",
    buyerName: user?.name ?? "",
    businessName: "",
    phone: user?.phone ?? "",
    email: user?.email ?? "",
    productName: "",
    category: "Vegetables",
    quantity: "",
    unit: "kg",
    targetPrice: "",
    neededBy: "Within a week",
    urgency: "NORMAL",
    location: "Kerala",
    deliveryAddress: "",
    description: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const setField = (key: keyof RequirementInput, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.productName.trim()) return setError("Please enter what product or crop you need.");
    if (!form.quantity || Number(form.quantity) <= 0) return setError("Please enter a valid quantity greater than zero.");
    if (!form.location.trim()) return setError("Please enter your delivery location/district.");
    if (!form.phone?.trim()) return setError("Please provide a contact phone number so farmers can reach you.");

    setError("");
    setSubmitting(true);

    try {
      await addRequirement({
        ...form,
        buyerId: user?.id ?? "buyer-anon",
        buyerName: form.buyerName.trim() || user?.name || "Buyer",
      });
      router.push("/buyer/requirements");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post requirement.");
      setSubmitting(false);
    }
  };

  return (
    <div className="portal-stack" style={{ maxWidth: 760, margin: "0 auto" }}>
      <div className="portal-form-card" style={{ padding: "28px 32px" }}>
        <div style={{ marginBottom: 24 }}>
          <p className="portal-overline">Produce Procurement</p>
          <h2 style={{ fontSize: 26, margin: "4px 0 8px", color: "#133b28" }}>
            &ldquo;I need this product&rdquo; – Post a Requirement
          </h2>
          <p className="portal-muted">
            Tell local farmers and suppliers what you want to purchase. Farmers can submit supply offers directly with their available stock and quotes.
          </p>
        </div>

        {error && <p className="portal-error" role="alert" style={{ marginBottom: 20 }}>{error}</p>}

        <form onSubmit={handleSubmit} className="portal-form-grid">
          {/* Product details */}
          <label className="portal-wide">
            Product name *
            <input
              type="text"
              required
              placeholder="e.g. Fresh Red Onions, Matta Rice, Robusta Bananas"
              value={form.productName}
              onChange={(e) => setField("productName", e.target.value)}
            />
          </label>

          <label>
            Category *
            <select value={form.category} onChange={(e) => setField("category", e.target.value)}>
              <option value="Vegetables">Vegetables</option>
              <option value="Fruits">Fruits</option>
              <option value="Grains & Cereals">Grains & Cereals</option>
              <option value="Pulses & Lentils">Pulses & Lentils</option>
              <option value="Spices">Spices</option>
              <option value="Oilseeds">Oilseeds</option>
              <option value="Dairy & Poultry">Dairy & Poultry</option>
              <option value="Other Produce">Other Produce</option>
            </select>
          </label>

          <label>
            Urgency / Timeline
            <select value={form.urgency} onChange={(e) => setField("urgency", e.target.value as "NORMAL" | "HIGH" | "URGENT")}>
              <option value="NORMAL">Normal (Flexible schedule)</option>
              <option value="HIGH">High Priority (Within 5-7 days)</option>
              <option value="URGENT">Urgent (Immediate / 1-3 days)</option>
            </select>
          </label>

          <label>
            Required Quantity *
            <input
              type="number"
              step="any"
              min="0.1"
              required
              placeholder="e.g. 500"
              value={form.quantity}
              onChange={(e) => setField("quantity", e.target.value)}
            />
          </label>

          <label>
            Unit of Measurement *
            <select value={form.unit} onChange={(e) => setField("unit", e.target.value)}>
              <option value="kg">kg (Kilograms)</option>
              <option value="quintal">quintal (100 kg)</option>
              <option value="tonne">tonne (1000 kg)</option>
              <option value="crate">crate</option>
              <option value="piece">piece</option>
              <option value="litre">litre</option>
            </select>
          </label>

          <label>
            Target / Expected Price per {form.unit} (₹)
            <input
              type="number"
              step="any"
              placeholder="Optional budget / target price"
              value={form.targetPrice}
              onChange={(e) => setField("targetPrice", e.target.value)}
            />
          </label>

          <label>
            Needed By Timeline
            <input
              type="text"
              placeholder="e.g. Within 3 days, by 25th Nov"
              value={form.neededBy}
              onChange={(e) => setField("neededBy", e.target.value)}
            />
          </label>

          <label className="portal-wide">
            Delivery Location (District & State) *
            <input
              type="text"
              required
              placeholder="e.g. Ernakulam, Kerala"
              value={form.location}
              onChange={(e) => setField("location", e.target.value)}
            />
          </label>

          <label className="portal-wide">
            Full Delivery Address or Warehouse (Optional)
            <input
              type="text"
              placeholder="e.g. Shop #12, Wholesale Market, Kalamassery"
              value={form.deliveryAddress}
              onChange={(e) => setField("deliveryAddress", e.target.value)}
            />
          </label>

          <label className="portal-wide">
            Quality Specifications & Notes
            <textarea
              rows={3}
              placeholder="Mention size, variety, organic certification, moisture limit, packaging preferences, or payment terms..."
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
            />
          </label>

          {/* Contact Details */}
          <div className="portal-wide" style={{ borderTop: "1px solid #e2eae1", paddingTop: 18, marginTop: 8 }}>
            <h4 style={{ fontSize: 15, margin: "0 0 12px", color: "#194531" }}>Your Contact Details for Farmers</h4>
          </div>

          <label>
            Contact Person Name *
            <input
              type="text"
              required
              placeholder="Your full name"
              value={form.buyerName}
              onChange={(e) => setField("buyerName", e.target.value)}
            />
          </label>

          <label>
            Business / Company Name (Optional)
            <input
              type="text"
              placeholder="e.g. Green Harvest Foods"
              value={form.businessName}
              onChange={(e) => setField("businessName", e.target.value)}
            />
          </label>

          <label>
            Phone Number (for Calls & WhatsApp) *
            <input
              type="tel"
              required
              placeholder="+91 98765 43210"
              value={form.phone}
              onChange={(e) => setField("phone", e.target.value)}
            />
          </label>

          <label>
            Email Address (Optional)
            <input
              type="email"
              placeholder="procurement@example.com"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
            />
          </label>

          <div className="portal-form-actions portal-wide" style={{ marginTop: 24 }}>
            <button
              type="button"
              className="portal-secondary-button"
              onClick={() => router.push("/buyer/requirements")}
            >
              <ArrowLeft size={16} /> Cancel
            </button>
            <button
              type="submit"
              className="portal-button"
              disabled={submitting}
            >
              {submitting ? "Posting requirement…" : "Publish requirement"} <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// 3. SELLER / FARMER: Buyer Requirements Page
// ==========================================
export function FarmerBuyerRequirements() {
  const { user } = useAuth();
  const { requirements } = useRequirements();
  const { offers, addOffer, updateOfferStatus, deleteOffer } = useSupplyOffers();
  const { isVerified } = useVerifiedBuyers();
  const productsQuery = useProducts("limit=50");

  const [mainTab, setMainTab] = useState<"demands" | "my-offers">("demands");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedUrgency, setSelectedUrgency] = useState("ALL");
  const [verificationFilter, setVerificationFilter] = useState<"ALL" | "VERIFIED" | "UNVERIFIED">("ALL");
  const [notice, setNotice] = useState("");

  // Contact Modal
  const [activeContactReq, setActiveContactReq] = useState<BuyerRequirement | null>(null);
  const [copied, setCopied] = useState(false);

  // Supply Offer Modal ("I have this product")
  const [offerModalReq, setOfferModalReq] = useState<BuyerRequirement | null>(null);
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);
  const [offerForm, setOfferForm] = useState<{
    quantity: string;
    unit: string;
    pricePerUnit: string;
    availableDate: string;
    deliveryOption: "DELIVERY" | "PICKUP" | "FLEXIBLE";
    message: string;
    farmerPhone: string;
    farmerLocation: string;
    selectedProductId: string;
  }>({
    quantity: "",
    unit: "kg",
    pricePerUnit: "",
    availableDate: "Ready for immediate delivery",
    deliveryOption: "DELIVERY",
    message: "",
    farmerPhone: user?.phone ?? "",
    farmerLocation: "Kerala",
    selectedProductId: "",
  });
  const [offerError, setOfferError] = useState("");
  const [submittingOffer, setSubmittingOffer] = useState(false);

  const categories = useMemo(() => {
    const set = new Set<string>();
    requirements.forEach((r) => set.add(r.category));
    return ["ALL", ...Array.from(set)];
  }, [requirements]);

  const filtered = useMemo(() => {
    return requirements.filter((r) => {
      if (r.status !== "OPEN") return false;
      if (selectedCategory !== "ALL" && r.category !== selectedCategory) return false;
      if (selectedUrgency !== "ALL" && r.urgency !== selectedUrgency) return false;

      const buyerVerified = isVerified(r.buyerId, r.email, r.phone);
      if (verificationFilter === "VERIFIED" && !buyerVerified) return false;
      if (verificationFilter === "UNVERIFIED" && buyerVerified) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          r.productName.toLowerCase().includes(q) ||
          r.buyerName.toLowerCase().includes(q) ||
          r.location.toLowerCase().includes(q) ||
          (r.businessName && r.businessName.toLowerCase().includes(q)) ||
          r.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [requirements, selectedCategory, selectedUrgency, verificationFilter, search, isVerified]);

  const myOffers = useMemo(() => {
    return offers.filter(
      (o) =>
        (user?.id && o.farmerId === user.id) ||
        (user?.phone && o.farmerPhone.replace(/\D/g, "") === user.phone.replace(/\D/g, "")) ||
        o.farmerName === user?.name
    );
  }, [offers, user]);

  const openOfferModal = (req: BuyerRequirement, existingOffer?: SupplyOffer) => {
    setOfferModalReq(req);
    setOfferError("");
    if (existingOffer) {
      setEditingOfferId(existingOffer.id);
      setOfferForm({
        quantity: String(existingOffer.quantity),
        unit: existingOffer.unit,
        pricePerUnit: String(existingOffer.pricePerUnit),
        availableDate: existingOffer.availableDate,
        deliveryOption: existingOffer.deliveryOption,
        message: existingOffer.message || "",
        farmerPhone: existingOffer.farmerPhone || user?.phone || "",
        farmerLocation: existingOffer.farmerLocation || "Kerala",
        selectedProductId: existingOffer.productId || "",
      });
    } else {
      setEditingOfferId(null);
      setOfferForm({
        quantity: String(req.quantity),
        unit: req.unit,
        pricePerUnit: req.targetPrice ? String(req.targetPrice) : "",
        availableDate: "Ready for immediate delivery",
        deliveryOption: "DELIVERY",
        message: `Fresh harvest of ${req.productName} available. Ready for dispatch.`,
        farmerPhone: user?.phone || "",
        farmerLocation: "Kerala",
        selectedProductId: "",
      });
    }
  };

  const handleProductSelect = (productId: string) => {
    const p = (productsQuery.data?.items ?? []).find((item) => item.id === productId);
    if (p) {
      setOfferForm((prev) => ({
        ...prev,
        selectedProductId: productId,
        unit: p.unit,
        pricePerUnit: String(p.pricePerUnit),
        message: `Offering listed produce: ${p.name}. Stock available: ${p.availableQuantity} ${p.unit}.`,
      }));
    } else {
      setOfferForm((prev) => ({ ...prev, selectedProductId: "" }));
    }
  };

  const handleOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerModalReq) return;
    const qty = Number(offerForm.quantity);
    const price = Number(offerForm.pricePerUnit);

    if (!qty || qty <= 0) {
      return setOfferError("Please enter a valid supply quantity greater than 0.");
    }
    if (!price || price <= 0) {
      return setOfferError("Please enter a valid price quote per unit in ₹.");
    }
    if (!offerForm.farmerPhone.trim()) {
      return setOfferError("Please provide a contact phone number so the buyer can reach you.");
    }

    setOfferError("");
    setSubmittingOffer(true);

    try {
      if (editingOfferId) {
        await deleteOffer(editingOfferId);
      }
      await addOffer({
        requirementId: offerModalReq.id,
        requirementTitle: offerModalReq.productName,
        buyerId: offerModalReq.buyerId,
        buyerName: offerModalReq.buyerName,
        farmerId: user?.id ?? "farmer-anon",
        farmerName: user?.name || "Verified Farmer",
        farmerPhone: offerForm.farmerPhone.trim(),
        farmerLocation: offerForm.farmerLocation.trim(),
        productId: offerForm.selectedProductId || undefined,
        quantity: qty,
        unit: offerForm.unit,
        pricePerUnit: price,
        totalAmount: qty * price,
        availableDate: offerForm.availableDate.trim(),
        deliveryOption: offerForm.deliveryOption,
        message: offerForm.message.trim(),
      });

      setNotice(
        `Supply offer submitted to ${offerModalReq.buyerName}! They have received your quote of ${qty} ${offerForm.unit} @ ₹${price}/${offerForm.unit}.`
      );
      setOfferModalReq(null);
      setEditingOfferId(null);
    } catch (err) {
      setOfferError(err instanceof Error ? err.message : "Failed to submit supply offer.");
    } finally {
      setSubmittingOffer(false);
    }
  };

  const copyToClipboard = (text: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const farmerProducts = productsQuery.data?.items ?? [];

  return (
    <div className="portal-stack">
      {notice && (
        <div className="portal-notice" role="status" style={{ display: "flex", justifyContent: "space-between" }}>
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice("")} style={{ border: 0, background: "none", cursor: "pointer" }}>✕</button>
        </div>
      )}

      {/* Stats bar */}
      <div className="portal-stat-grid">
        <div className="portal-stat">
          <span><Search size={18} /> Active Buyer Demands</span>
          <strong>{requirements.filter((r) => r.status === "OPEN").length}</strong>
          <small>Open procurements seeking harvest</small>
        </div>
        <div className="portal-stat">
          <span><PackageCheck size={18} /> My Supply Offers</span>
          <strong>{myOffers.length}</strong>
          <small>
            {myOffers.filter((o) => o.status === "ACCEPTED").length} accepted quotes
          </small>
        </div>
        <div className="portal-stat">
          <span><ShieldCheck size={18} /> Admin-Verified Buyers</span>
          <strong>
            {requirements.filter((r) => r.status === "OPEN" && isVerified(r.buyerId, r.email, r.phone)).length}
          </strong>
          <small>Verified by Kerala Agriculture Dept</small>
        </div>
      </div>

      {/* Tabs */}
      <div className="portal-panel" style={{ padding: "14px 20px" }}>
        <div className="portal-tab-bar" style={{ margin: 0, border: 0, padding: 0 }}>
          <button
            type="button"
            className={`portal-tab-btn ${mainTab === "demands" ? "active" : ""}`}
            onClick={() => setMainTab("demands")}
          >
            Active Buyer Demands ({filtered.length})
          </button>
          <button
            type="button"
            className={`portal-tab-btn ${mainTab === "my-offers" ? "active" : ""}`}
            onClick={() => setMainTab("my-offers")}
          >
            My Submitted Offers ({myOffers.length})
          </button>
        </div>
      </div>

      {mainTab === "demands" && (
        <>
          {/* Filter and Search Bar */}
          <div className="portal-filter-bar">
            <label>
              <span>Search produce or buyer</span>
              <input
                type="text"
                placeholder="e.g. Onions, Rice, Bananas, Ernakulam..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <label>
              <span>Category</span>
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === "ALL" ? "All categories" : c}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Buyer Trust</span>
              <select
                value={verificationFilter}
                onChange={(e) => setVerificationFilter(e.target.value as "ALL" | "VERIFIED" | "UNVERIFIED")}
              >
                <option value="ALL">All buyers</option>
                <option value="VERIFIED">Verified Buyers only</option>
                <option value="UNVERIFIED">Unverified only</option>
              </select>
            </label>
            <label>
              <span>Urgency</span>
              <select value={selectedUrgency} onChange={(e) => setSelectedUrgency(e.target.value)}>
                <option value="ALL">All priorities</option>
                <option value="URGENT">Urgent only</option>
                <option value="HIGH">High priority</option>
                <option value="NORMAL">Normal</option>
              </select>
            </label>
            <button
              type="button"
              className="portal-button"
              onClick={() => {
                setSearch("");
                setSelectedCategory("ALL");
                setSelectedUrgency("ALL");
                setVerificationFilter("ALL");
              }}
            >
              Reset
            </button>
          </div>

          {/* Results header */}
          <div className="portal-results-head">
            <p>Showing <strong>{filtered.length}</strong> active buyer requirements</p>
          </div>

          {/* Demands Grid */}
          {filtered.length === 0 ? (
            <div className="portal-state">
              <Search size={32} />
              <h2>No matching buyer requirements</h2>
              <p>Try broadening your search keyword or clearing the filters.</p>
            </div>
          ) : (
            <div className="portal-req-grid">
              {filtered.map((req) => {
                const cleanPhone = (req.phone || "").replace(/[^0-9]/g, "");
                const whatsappUrl = cleanPhone
                  ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                      `Hello ${req.buyerName}, I saw your requirement on Vithu for "${req.productName}" (${req.quantity} ${req.unit}). I have harvest available and would like to provide a quote.`
                    )}`
                  : "";

                // Admin verification check
                const verified = isVerified(req.buyerId, req.email, req.phone);

                // Check if this farmer has submitted an offer for this requirement
                const myOffer = offers.find(
                  (o) =>
                    o.requirementId === req.id &&
                    ((user?.id && o.farmerId === user.id) ||
                      (user?.phone && o.farmerPhone.replace(/\D/g, "") === user.phone.replace(/\D/g, "")) ||
                      o.farmerName === user?.name)
                );

                return (
                  <div key={req.id} className="portal-req-card">
                    <div>
                      <div className="portal-req-head">
                        <span className="portal-chip">{req.category}</span>
                        <span className={`portal-badge portal-badge-${req.urgency.toLowerCase()}`}>
                          {req.urgency}
                        </span>
                      </div>

                      <h3>{req.productName}</h3>

                      <div className="portal-req-meta-row">
                        <div className="portal-req-meta-item">
                          <span>Buyer needs</span>
                          <strong>{req.quantity} {req.unit}</strong>
                        </div>
                        <div className="portal-req-meta-item">
                          <span>Target price</span>
                          <strong>{req.targetPrice ? money(req.targetPrice) : "Negotiable"}</strong>
                        </div>
                      </div>

                      <p className="portal-req-desc">{req.description}</p>

                      <div style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 12, color: "#687c6f", marginBottom: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <MapPin size={14} color="#0c6542" />
                          <span>Delivery location: <strong>{req.location}</strong></span>
                        </div>
                        {req.neededBy && (
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <Clock size={14} color="#0c6542" />
                            <span>Needed: <strong>{req.neededBy}</strong></span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="portal-req-buyer-info">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                        <div>
                          <span className="portal-req-buyer-name">{req.buyerName}</span>
                          {req.businessName && <div className="portal-req-buyer-sub">{req.businessName}</div>}
                        </div>
                        {/* Verified Buyer badge: ONLY for buyers selected/verified by admin */}
                        {verified ? (
                          <span
                            className="portal-chip portal-chip-verified"
                            title="Verified by Kerala Agriculture Department / Vithu Admin"
                          >
                            <CheckCircle2 size={13} color="#166a3d" /> Verified Buyer
                          </span>
                        ) : (
                          <span
                            className="portal-chip portal-chip-unverified"
                            title="Buyer identity not verified by admin"
                          >
                            Unverified Buyer
                          </span>
                        )}
                      </div>

                      {/* Farmer Supply Offer ("I Have This Product") */}
                      {myOffer ? (
                        <div className="portal-farmer-offer-box">
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 11, fontWeight: 800, color: "#166a3d", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: 4 }}>
                              <CheckCircle2 size={13} color="#166a3d" /> Your Supply Offer
                            </span>
                            <span className={`portal-badge portal-badge-${myOffer.status.toLowerCase()}`}>
                              {myOffer.status}
                            </span>
                          </div>
                          <div style={{ marginTop: 5, fontSize: 13, fontWeight: 800, color: "#0c5438" }}>
                            {myOffer.quantity} {myOffer.unit} @ ₹{myOffer.pricePerUnit}/{myOffer.unit}
                            <span style={{ fontSize: 11, fontWeight: 500, color: "#5d7364", marginLeft: 6 }}>
                              (Total: {money(myOffer.totalAmount)})
                            </span>
                          </div>
                          {myOffer.availableDate && (
                            <div style={{ fontSize: 11, color: "#61766a", marginTop: 3 }}>
                              Dispatch: <strong>{myOffer.availableDate}</strong> • Mode: <strong>{myOffer.deliveryOption}</strong>
                            </div>
                          )}
                          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                            <button
                              type="button"
                              className="portal-secondary-button"
                              style={{ padding: "0 10px", minHeight: 28, fontSize: 11 }}
                              onClick={() => openOfferModal(req, myOffer)}
                            >
                              Edit Offer
                            </button>
                            <button
                              type="button"
                              style={{ border: 0, background: "none", color: "#ad4c3c", fontSize: 11, cursor: "pointer", fontWeight: 700 }}
                              onClick={() => {
                                if (window.confirm(`Withdraw your supply offer for "${req.productName}"?`)) {
                                  deleteOffer(myOffer.id);
                                  setNotice("Supply offer withdrawn.");
                                }
                              }}
                            >
                              Withdraw
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="portal-button"
                          style={{
                            width: "100%",
                            justifyContent: "center",
                            minHeight: 38,
                            marginTop: 10,
                            marginBottom: 8,
                            background: "#0c6542",
                            color: "#fff",
                            fontSize: 12,
                          }}
                          onClick={() => openOfferModal(req)}
                        >
                          <PackageCheck size={16} /> I Have This Product (Submit Offer)
                        </button>
                      )}

                      {/* Direct Contact Actions for Seller */}
                      <div className="portal-contact-actions">
                        {req.phone && (
                          <a
                            href={`tel:${req.phone}`}
                            className="portal-contact-btn"
                            title="Call buyer directly"
                          >
                            <Phone size={13} /> Call
                          </a>
                        )}
                        {whatsappUrl && (
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="portal-contact-btn"
                            style={{ color: "#198754", borderColor: "#a3cfbb" }}
                            title="Message on WhatsApp"
                          >
                            <MessageCircle size={13} /> WhatsApp
                          </a>
                        )}
                        <button
                          type="button"
                          className="portal-contact-btn"
                          onClick={() => setActiveContactReq(req)}
                        >
                          <User size={13} /> Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Main Tab 2: My Submitted Offers */}
      {mainTab === "my-offers" && (
        <div className="portal-stack">
          {myOffers.length === 0 ? (
            <div className="portal-state">
              <PackageCheck size={36} color="#0c6542" />
              <h2>No supply offers submitted yet</h2>
              <p>
                Browse open buyer demands under the <strong>Active Buyer Demands</strong> tab and click &ldquo;I Have This Product&rdquo; to send quotes to buyers.
              </p>
              <button
                type="button"
                className="portal-button"
                style={{ marginTop: 12 }}
                onClick={() => setMainTab("demands")}
              >
                Explore Buyer Demands
              </button>
            </div>
          ) : (
            <div className="portal-req-grid">
              {myOffers.map((offer) => {
                const req = requirements.find((r) => r.id === offer.requirementId);
                const cleanPhone = (offer.farmerPhone || "").replace(/[^0-9]/g, "");

                return (
                  <div key={offer.id} className="portal-req-card">
                    <div>
                      <div className="portal-req-head">
                        <span className="portal-chip">{req?.category || "Produce"}</span>
                        <span className={`portal-badge portal-badge-${offer.status.toLowerCase()}`}>
                          {offer.status}
                        </span>
                      </div>

                      <h3>{offer.requirementTitle}</h3>

                      <div className="portal-req-meta-row">
                        <div className="portal-req-meta-item">
                          <span>Quantity Offered</span>
                          <strong>{offer.quantity} {offer.unit}</strong>
                        </div>
                        <div className="portal-req-meta-item">
                          <span>Quoted Price</span>
                          <strong>{money(offer.pricePerUnit)} / {offer.unit}</strong>
                        </div>
                      </div>

                      <div style={{ background: "#edf6ee", padding: "10px 12px", borderRadius: 8, marginBottom: 12, fontSize: 13, color: "#10472e", fontWeight: 700 }}>
                        Total Payout: {money(offer.totalAmount)}
                      </div>

                      {offer.availableDate && (
                        <div style={{ fontSize: 12, color: "#546d5c", marginBottom: 6 }}>
                          Availability: <strong>{offer.availableDate}</strong>
                        </div>
                      )}
                      <div style={{ fontSize: 12, color: "#546d5c", marginBottom: 8 }}>
                        Delivery option: <strong>{offer.deliveryOption}</strong>
                      </div>

                      {offer.message && (
                        <p className="portal-req-desc" style={{ fontStyle: "italic", background: "#f8fbf7", padding: "8px 10px", borderRadius: 6 }}>
                          &ldquo;{offer.message}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="portal-req-buyer-info">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <span className="portal-req-buyer-name">Buyer: {offer.buyerName}</span>
                        </div>
                        <small style={{ color: "#8a9c8f" }}>
                          {new Date(offer.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                        </small>
                      </div>

                      <div style={{ display: "flex", gap: 8, marginTop: 12, borderTop: "1px solid #edf2ec", paddingTop: 10 }}>
                        {req && (
                          <button
                            type="button"
                            className="portal-secondary-button"
                            style={{ fontSize: 11, padding: "0 10px", minHeight: 30 }}
                            onClick={() => openOfferModal(req, offer)}
                          >
                            Edit Offer
                          </button>
                        )}
                        <button
                          type="button"
                          className="portal-secondary-button"
                          style={{ fontSize: 11, padding: "0 10px", minHeight: 30, color: "#ad4c3c" }}
                          onClick={() => {
                            if (window.confirm("Withdraw this offer?")) {
                              deleteOffer(offer.id);
                              setNotice("Offer withdrawn.");
                            }
                          }}
                        >
                          Withdraw
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* "I Have This Product" Offer Submission Modal */}
      {offerModalReq && (
        <div className="portal-modal-backdrop" onClick={() => setOfferModalReq(null)}>
          <div className="portal-modal portal-offer-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="portal-modal-close"
              onClick={() => setOfferModalReq(null)}
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <span className="portal-overline">Direct Farmer Supply Quote</span>
            <h2 style={{ fontSize: 22, margin: "4px 0 6px", color: "#113826" }}>
              Submit Offer: {offerModalReq.productName}
            </h2>
            <p style={{ fontSize: 12, color: "#61766a", margin: "0 0 16px" }}>
              Buyer <strong>{offerModalReq.buyerName}</strong> needs <strong>{offerModalReq.quantity} {offerModalReq.unit}</strong> delivered to <strong>{offerModalReq.location}</strong>.
              {offerModalReq.targetPrice && ` (Target price: ₹${offerModalReq.targetPrice}/${offerModalReq.unit})`}
            </p>

            {offerError && <p className="portal-error" role="alert" style={{ marginBottom: 14 }}>{offerError}</p>}

            <form onSubmit={handleOfferSubmit} className="portal-form-grid" style={{ gap: 12 }}>
              {/* Optional Link with listed inventory product */}
              {farmerProducts.length > 0 && (
                <label className="portal-wide">
                  Autofill from My Listed Produce (Optional)
                  <select
                    value={offerForm.selectedProductId}
                    onChange={(e) => handleProductSelect(e.target.value)}
                  >
                    <option value="">-- Choose from my inventory --</option>
                    {farmerProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.availableQuantity} {p.unit} in stock @ ₹{p.pricePerUnit})
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <label>
                Quantity You Have Available *
                <input
                  type="number"
                  step="any"
                  min="0.1"
                  required
                  placeholder="e.g. 1000"
                  value={offerForm.quantity}
                  onChange={(e) => setOfferForm({ ...offerForm, quantity: e.target.value })}
                />
              </label>

              <label>
                Unit of Measurement *
                <select
                  value={offerForm.unit}
                  onChange={(e) => setOfferForm({ ...offerForm, unit: e.target.value })}
                >
                  <option value={offerModalReq.unit}>{offerModalReq.unit} (Buyer requested)</option>
                  <option value="kg">kg (Kilograms)</option>
                  <option value="quintal">quintal (100 kg)</option>
                  <option value="tonne">tonne (1000 kg)</option>
                  <option value="crate">crate</option>
                  <option value="piece">piece</option>
                </select>
              </label>

              <label>
                Your Quoted Price per {offerForm.unit} (₹) *
                <input
                  type="number"
                  step="any"
                  min="0.5"
                  required
                  placeholder={offerModalReq.targetPrice ? `Target: ₹${offerModalReq.targetPrice}` : "e.g. 35"}
                  value={offerForm.pricePerUnit}
                  onChange={(e) => setOfferForm({ ...offerForm, pricePerUnit: e.target.value })}
                />
              </label>

              <label>
                Availability / Delivery Date *
                <input
                  type="text"
                  required
                  placeholder="e.g. Available today, Harvesting on 22nd Nov"
                  value={offerForm.availableDate}
                  onChange={(e) => setOfferForm({ ...offerForm, availableDate: e.target.value })}
                />
              </label>

              {/* Estimated Total Calculation */}
              {Number(offerForm.quantity) > 0 && Number(offerForm.pricePerUnit) > 0 && (
                <div
                  className="portal-wide"
                  style={{
                    background: "#edf7ee",
                    border: "1px solid #c2e2c6",
                    borderRadius: 8,
                    padding: "10px 14px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: 12, color: "#144931", fontWeight: 700 }}>
                    Estimated Total Payout:
                  </span>
                  <strong style={{ fontSize: 17, color: "#0b6943" }}>
                    {money(Number(offerForm.quantity) * Number(offerForm.pricePerUnit))}
                  </strong>
                </div>
              )}

              <label className="portal-wide">
                Delivery / Logistics Option *
                <select
                  value={offerForm.deliveryOption}
                  onChange={(e) => setOfferForm({ ...offerForm, deliveryOption: e.target.value as "DELIVERY" | "PICKUP" | "FLEXIBLE" })}
                >
                  <option value="DELIVERY">Direct Delivery: Farmer delivers to buyer&apos;s location ({offerModalReq.location})</option>
                  <option value="PICKUP">Farmgate Pickup: Buyer arranges transport from my farm</option>
                  <option value="FLEXIBLE">Flexible: Open to mutual logistics discussion</option>
                </select>
              </label>

              <label className="portal-wide">
                Produce Specifications & Notes for Buyer
                <textarea
                  rows={2}
                  placeholder="Mention quality grade, moisture level, packaging (mesh bags / crates), variety, or pesticide-free status..."
                  value={offerForm.message}
                  onChange={(e) => setOfferForm({ ...offerForm, message: e.target.value })}
                />
              </label>

              <label>
                Your Contact Phone *
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={offerForm.farmerPhone}
                  onChange={(e) => setOfferForm({ ...offerForm, farmerPhone: e.target.value })}
                />
              </label>

              <label>
                Your Farm Location (District) *
                <input
                  type="text"
                  required
                  placeholder="e.g. Wayanad, Palakkad"
                  value={offerForm.farmerLocation}
                  onChange={(e) => setOfferForm({ ...offerForm, farmerLocation: e.target.value })}
                />
              </label>

              <div className="portal-form-actions portal-wide" style={{ marginTop: 12 }}>
                <button
                  type="button"
                  className="portal-secondary-button"
                  onClick={() => setOfferModalReq(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="portal-button"
                  disabled={submittingOffer}
                  style={{ background: "#0c6542" }}
                >
                  <Send size={15} /> {submittingOffer ? "Submitting offer…" : "Send Supply Offer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Buyer Contact Modal */}
      {activeContactReq && (
        <div className="portal-modal-backdrop" onClick={() => setActiveContactReq(null)}>
          <div className="portal-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="portal-modal-close"
              onClick={() => setActiveContactReq(null)}
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <span className="portal-overline">Buyer Contact Details</span>
            <h2 style={{ fontSize: 22, margin: "4px 0 16px", color: "#113826" }}>
              {activeContactReq.buyerName}
            </h2>

            <dl className="portal-profile-list" style={{ maxWidth: "100%", marginBottom: 20 }}>
              {activeContactReq.businessName && (
                <div>
                  <dt>Business / Firm</dt>
                  <dd>{activeContactReq.businessName}</dd>
                </div>
              )}
              <div>
                <dt>Produce Wanted</dt>
                <dd>{activeContactReq.productName} ({activeContactReq.quantity} {activeContactReq.unit})</dd>
              </div>
              <div>
                <dt>Target Price</dt>
                <dd>{activeContactReq.targetPrice ? money(activeContactReq.targetPrice) : "Open to quote"}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd style={{ color: "#0d6543", fontWeight: 800 }}>
                  {activeContactReq.phone || "Not provided"}
                </dd>
              </div>
              {activeContactReq.email && (
                <div>
                  <dt>Email</dt>
                  <dd>{activeContactReq.email}</dd>
                </div>
              )}
              <div>
                <dt>Location</dt>
                <dd>{activeContactReq.location}</dd>
              </div>
              {activeContactReq.deliveryAddress && (
                <div>
                  <dt>Delivery Address</dt>
                  <dd>{activeContactReq.deliveryAddress}</dd>
                </div>
              )}
            </dl>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {activeContactReq.phone && (
                <a
                  href={`tel:${activeContactReq.phone}`}
                  className="portal-button"
                  style={{ flex: 1, minWidth: 120 }}
                >
                  <Phone size={15} /> Call now
                </a>
              )}
              {activeContactReq.phone && (
                <button
                  type="button"
                  className="portal-secondary-button"
                  onClick={() => copyToClipboard(activeContactReq.phone ?? "")}
                >
                  <Copy size={15} /> {copied ? "Copied!" : "Copy phone"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 4. BUYER: Functional Wishlist Page
// ==========================================
export function BuyerWishlistPage() {
  const products = useProducts("limit=100");
  const { wishlistIds, remove, count } = useWishlist();

  const wishlistedProducts = useMemo(() => {
    const all = products.data?.items ?? [];
    return all.filter((p) => wishlistIds.includes(p.id));
  }, [products.data, wishlistIds]);

  return (
    <div className="portal-stack">
      <div className="portal-results-head">
        <p>
          You have <strong>{count}</strong> {count === 1 ? "product" : "products"} saved in your wishlist
        </p>
        <Link href="/buyer/marketplace" className="portal-button" style={{ minHeight: 36, fontSize: 12 }}>
          <Search size={15} /> Browse marketplace
        </Link>
      </div>

      <ViewState
        loading={products.isPending}
        error={products.error}
        empty={
          count === 0
            ? "Your wishlist is empty. Browse the marketplace and tap the heart icon on any produce to save it for quick access."
            : undefined
        }
        retry={() => products.refetch()}
      >
        {count > 0 && wishlistedProducts.length === 0 && !products.isPending ? (
          <div className="portal-state">
            <Heart size={32} />
            <h2>Saved items out of current stock</h2>
            <p>
              Some of your saved items might have been sold out or are not on the first page of marketplace results.
            </p>
            <Link className="portal-button" href="/buyer/marketplace">
              Explore available produce
            </Link>
          </div>
        ) : (
          <div className="portal-product-grid">
            {wishlistedProducts.map((product) => (
              <div key={product.id} style={{ display: "flex", flexDirection: "column" }}>
                <ProductCard product={product} href={`/buyer/products/${product.id}`} />
                <div className="portal-card-actions" style={{ justifyContent: "space-between", marginTop: 6 }}>
                  <Link
                    href={`/buyer/products/${product.id}`}
                    className="portal-button"
                    style={{ minHeight: 32, padding: "0 14px", fontSize: 11 }}
                  >
                    Order now
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(product.id)}
                    style={{ color: "#b94a39", display: "inline-flex", alignItems: "center", gap: 4 }}
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ViewState>
    </div>
  );
}
