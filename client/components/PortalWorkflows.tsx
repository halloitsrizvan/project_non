"use client";

/* eslint-disable @next/next/no-img-element -- Product image URLs come from the backend and can use arbitrary hosts. */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Heart, Package, Trash2, MessageCircle, Phone } from "lucide-react";
import { useState } from "react";
import { api, uploadProductImage, type Order, type Product, type ProductInput } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useWishlist } from "@/lib/wishlist";
import { money, ownedProducts, ProductCard, useFarmerId, useOrders, useProducts, ViewState } from "./PortalCommon";

export function MyProducts() {
  const { user } = useAuth();
  const products = useProducts();
  const farmer = useFarmerId();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const owned = ownedProducts(products.data?.items, user?.id, farmer.data);
  const remove = useMutation({
    mutationFn: (id: string) => api<void>(`products/${id}`, { method: "DELETE" }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["products"] }); setMessage("Product deleted."); },
    onError: (error: Error) => setMessage(error.message),
  });
  return <div className="portal-stack">{message && <p className="portal-notice" role="status">{message}</p>}<ViewState loading={products.isPending || farmer.isPending} error={products.error} empty={owned.length ? undefined : "No products linked to your account appear in the current marketplace results. Add your first product to get started."} retry={() => products.refetch()}>{owned.length ? <div className="portal-product-grid">{owned.map((product) => <div key={product.id}><ProductCard product={product} href={`/farmer/products/${product.id}/edit`} /><div className="portal-card-actions"><Link href={`/farmer/products/${product.id}/edit`}>Edit product</Link><button type="button" disabled={remove.isPending} onClick={() => { if (window.confirm(`Delete ${product.name}?`)) remove.mutate(product.id); }}><Trash2 size={15} /> Delete</button></div></div>)}</div> : <Link className="portal-button" href="/farmer/products/new">Add your first product</Link>}</ViewState></div>;
}

const steps = ["Product", "Quantity", "Price", "Images", "Location", "Review"];
const blank: ProductInput = { name: "", category: "", description: "", quantity: "", unit: "kg", pricePerUnit: "", location: "", images: [] };

export function ProductFormPage({ id }: { id?: string }) {
  const product = useQuery({ queryKey: ["product", id], queryFn: () => api<Product>(`products/${id}`), enabled: !!id });
  if (id && product.isPending) return <ViewState loading />;
  if (id && product.error) return <ViewState loading={false} error={product.error} retry={() => product.refetch()} />;
  return <ProductEditor key={id ?? "new"} id={id} initial={product.data} />;
}

function ProductEditor({ id, initial }: { id?: string; initial?: Product }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<ProductInput>(initial ? {
    name: initial.name, category: initial.category, description: initial.description ?? "",
    quantity: String(initial.quantity), unit: initial.unit, pricePerUnit: String(initial.pricePerUnit),
    location: initial.location ?? "", images: initial.images ?? [],
  } : blank);
  const [error, setError] = useState("");
  const [imageUrl, setImageUrl] = useState(initial?.images?.[0] ?? "");
  const [uploading, setUploading] = useState(false);
  const save = useMutation({
    mutationFn: () => {
      const payload = { ...values, images: imageUrl.trim() ? [imageUrl.trim()] : [] };
      if (id) {
        const { quantity: _quantity, ...update } = payload;
        void _quantity;
        return api<Product>(`products/${id}`, { method: "PATCH", body: JSON.stringify(update) });
      }
      return api<Product>("products", { method: "POST", body: JSON.stringify(payload) });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["products"] }); router.push("/farmer/products"); },
    onError: (failure: Error) => setError(failure.message),
  });
  const set = (key: keyof ProductInput, value: string) => setValues((current) => ({ ...current, [key]: value }));
  async function onImageSelected(file?: File) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return setError("Choose an image smaller than 5 MB.");
    setError("");
    setUploading(true);
    try {
      setImageUrl(await uploadProductImage(file));
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Image upload failed.");
    } finally {
      setUploading(false);
    }
  }
  function next() {
    if (uploading) return setError("Wait for the image upload to finish.");
    const required: Record<number, (keyof ProductInput)[]> = { 0: ["name", "category", "description"], 1: ["quantity", "unit"], 2: ["pricePerUnit"], 4: ["location"] };
    const missing = required[step]?.find((key) => !String(values[key] ?? "").trim());
    if (missing) return setError("Complete all fields in this step before continuing.");
    if (step === 1 && Number(values.quantity) <= 0) return setError("Quantity must be greater than zero.");
    if (step === 2 && Number(values.pricePerUnit) <= 0) return setError("Price must be greater than zero.");
    setError("");
    setStep((current) => Math.min(5, current + 1));
  }
  return (
    <div className="portal-form-card">
      <div className="portal-stepper" aria-label={`Step ${step + 1} of 6`}>{steps.map((label, index) => <button key={label} type="button" className={index === step ? "active" : index < step ? "done" : ""} onClick={() => { if (index < step) { setStep(index); setError(""); } }}><span>{index + 1}</span>{label}</button>)}</div>
      <div className="portal-form-step">
        <p className="portal-overline">Step {step + 1} of 6</p>
        <h2>{steps[step]}</h2>
        {step === 0 && <div className="portal-form-grid"><label>Product name<input value={values.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Fresh tomatoes" /></label><label>Category<input value={values.category} onChange={(e) => set("category", e.target.value)} placeholder="e.g. Vegetables" /></label><label className="portal-wide">Description<textarea value={values.description} onChange={(e) => set("description", e.target.value)} placeholder="Tell buyers about your harvest" rows={3} /></label></div>}
        {step === 1 && <div className="portal-form-grid"><label>Available quantity<input type="number" min="0.01" step="any" value={values.quantity} onChange={(e) => set("quantity", e.target.value)} disabled={!!id} /></label><label>Unit<select value={values.unit} onChange={(e) => set("unit", e.target.value)}><option value="kg">kg</option><option value="quintal">quintal</option><option value="tonne">tonne</option><option value="piece">piece</option><option value="litre">litre</option></select></label>{id && <p className="portal-muted portal-wide">The current API does not allow changing product quantity after publishing.</p>}</div>}
        {step === 2 && <div className="portal-form-grid"><label>Price per {values.unit}<input type="number" min="0.01" step="any" value={values.pricePerUnit} onChange={(e) => set("pricePerUnit", e.target.value)} placeholder="e.g. 25.00" /></label></div>}
        {step === 3 && <div className="portal-form-grid"><label className="portal-wide">Product photo (optional)<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={uploading} onChange={(event) => { void onImageSelected(event.target.files?.[0]); event.target.value = ""; }} /></label><p className="portal-muted portal-wide">JPEG, PNG, WebP, or AVIF, up to 5 MB. The photo uploads when selected.</p>{uploading && <p className="portal-muted portal-wide" role="status">Uploading photo...</p>}{imageUrl && <div className="portal-wide"><img src={imageUrl} alt="Product photo preview" style={{ maxWidth: 220, maxHeight: 160, objectFit: "cover", borderRadius: 12 }} /><p><button type="button" className="portal-secondary-button" onClick={() => setImageUrl("")}>Remove photo</button></p></div>}<label className="portal-wide">Or paste an image URL<input type="url" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="https://example.com/your-produce.jpg" /></label></div>}
        {step === 4 && <div className="portal-form-grid"><label className="portal-wide">Farm or pickup location<input value={values.location} onChange={(e) => set("location", e.target.value)} placeholder="District, state" /></label></div>}
        {step === 5 && <dl className="portal-review"><div><dt>Product</dt><dd>{values.name} · {values.category}</dd></div><div><dt>Quantity</dt><dd>{values.quantity} {values.unit}</dd></div><div><dt>Price</dt><dd>{money(values.pricePerUnit)} / {values.unit}</dd></div><div><dt>Location</dt><dd>{values.location}</dd></div><div><dt>Image</dt><dd>{imageUrl || "No image added"}</dd></div></dl>}
        {error && <p className="portal-error" role="alert">{error}</p>}
        <div className="portal-form-actions"><button type="button" className="portal-secondary-button" onClick={() => step ? setStep(step - 1) : router.push("/farmer/products")}><ArrowLeft size={17} /> {step ? "Back" : "Cancel"}</button>{step < 5 ? <button type="button" className="portal-button" onClick={next}>Continue <ArrowRight size={17} /></button> : <button type="button" className="portal-button" disabled={save.isPending} onClick={() => save.mutate()}>{save.isPending ? "Saving…" : id ? "Save changes" : "Publish product"}</button>}</div>
      </div>
    </div>
  );
}

export function BuyerProductDetail({ id }: { id: string }) {
  const router = useRouter();
  const product = useQuery({ queryKey: ["product", id], queryFn: () => api<Product>(`products/${id}`) });
  const { has, toggle, mounted } = useWishlist();
  const wishlisted = mounted && has(id);
  const [quantity, setQuantity] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const order = useMutation({
    mutationFn: () => api<Order>("orders", { method: "POST", body: JSON.stringify({ items: [{ productId: id, quantity }], deliveryAddress: address, notes }) }),
    onSuccess: () => router.push("/buyer/orders"),
    onError: (failure: Error) => setError(failure.message),
  });
  if (product.isPending) return <ViewState loading />;
  if (product.error) return <ViewState loading={false} error={product.error} retry={() => product.refetch()} />;
  const item = product.data;
  const available = Number(item.availableQuantity);
  const count = Number(quantity);
  function updateQuantity(raw: string) {
    if (raw === "") {
      setQuantity("");
      setError("");
      return;
    }
    if (!/^(?:0|[1-9]\d*)(?:\.\d{0,3})?$/.test(raw)) return;
    if (Number(raw) > available) {
      setQuantity(String(item.availableQuantity));
      setError(`Only ${item.availableQuantity} ${item.unit} available.`);
      return;
    }
    setQuantity(raw);
    setError("");
  }
  function placeOrder() {
    if (!Number.isFinite(available) || !Number.isFinite(count) || count <= 0 || count > available) return setError("Enter a quantity within the available amount.");
    if (!address.trim()) return setError("Enter a delivery address.");
    setError("");
    order.mutate();
  }
  return (
    <div className="portal-detail-grid">
      <div className="portal-detail-image">
        {item.images?.[0] ? <img src={item.images[0]} alt={item.name} /> : <Package size={72} />}
      </div>
      <div className="portal-panel portal-detail-info">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <span className="portal-chip">{item.category}</span>
          <button
            type="button"
            className={`portal-wishlist-toggle ${wishlisted ? "active" : ""}`}
            style={{ position: "static" }}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            title={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
            onClick={() => toggle(id)}
          >
            <Heart
              size={18}
              fill={wishlisted ? "#e53e3e" : "none"}
              stroke={wishlisted ? "#e53e3e" : "#4b6757"}
              strokeWidth={wishlisted ? 0 : 2}
            />
          </button>
        </div>
        <h2>{item.name}</h2>
        <p>{item.description || "No description provided."}</p>
        <dl className="portal-review">
          <div><dt>Price</dt><dd>{money(item.pricePerUnit)} / {item.unit}</dd></div>
          <div><dt>Available</dt><dd>{item.availableQuantity} {item.unit}</dd></div>
          <div><dt>Location</dt><dd>{item.location || "Not listed"}</dd></div>
          <div><dt>Farmer</dt><dd>{item.farmer?.name || "Farmer details unavailable"}</dd></div>
        </dl>
        <div className="portal-order-form">
          <h3>Place an order</h3>
          <label>Quantity ({item.unit})<input type="number" min="0.001" max={available} step="0.001" value={quantity} onChange={(e) => updateQuantity(e.target.value)} /></label>
          <label>Delivery address<textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} placeholder="Where should this order go?" /></label>
          <label>Notes (optional)<textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} /></label>
          <p className="portal-total">Estimated total <strong>{money(Number(item.pricePerUnit) * (Number.isFinite(count) ? count : 0))}</strong></p>
          {error && <p className="portal-error" role="alert">{error}</p>}
          <div style={{ display: "flex", gap: "10px", marginTop: "12px", flexWrap: "wrap" }}>
            <button
              type="button"
              className="portal-button"
              disabled={order.isPending || !quantity || !Number.isFinite(available) || count <= 0 || count > available}
              onClick={placeOrder}
              style={{ flex: 1, minWidth: "150px" }}
            >
              {order.isPending ? "Placing order…" : "Place order"}
            </button>
            <button
              type="button"
              className="portal-secondary-button"
              onClick={() => toggle(id)}
              style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              <Heart size={17} fill={wishlisted ? "#e53e3e" : "none"} stroke={wishlisted ? "#e53e3e" : "currentColor"} />
              <span>{wishlisted ? "Saved" : "Save to Wishlist"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function OrderList({ role }: { role: "FARMER" | "BUYER" }) {
  const orders = useOrders();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const update = useMutation({
    mutationFn: ({ id, action }: { id: string; action: "CONFIRMED" | "COMPLETED" | "REJECTED" | "cancel" }) => action === "cancel"
      ? api<Order>(`orders/${id}/cancel`, { method: "POST" })
      : api<Order>(`orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status: action }) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["orders"] }); setMessage("Order updated."); },
    onError: (failure: Error) => setMessage(failure.message),
  });

  return (
    <div className="portal-stack">
      {message && <p className="portal-notice" role="status">{message}</p>}
      <ViewState
        loading={orders.isPending}
        error={orders.error}
        empty={orders.data?.length ? undefined : role === "FARMER" ? "Buyer orders will appear here." : "Your orders will appear here after you purchase products."}
        retry={() => orders.refetch()}
      >
        {orders.data?.map((order) => {
          const otherPartyLabel = role === "FARMER" ? "Buyer" : "Farmer";
          const otherPartyName = role === "FARMER"
            ? (order.buyer?.name || order.buyer?.businessName || "Buyer")
            : (order.farmer?.name || "Farmer");
          const otherPartyPhone = role === "FARMER"
            ? (order.buyer?.phone || "")
            : (order.farmer?.phone || "");

          const cleanDigits = otherPartyPhone.replace(/\D/g, "");
          const waPhone = cleanDigits.length === 10 ? `91${cleanDigits}` : cleanDigits;
          const itemsSummary = order.items?.map((item) => `${item.productName || "Product"} (${item.quantity} ${item.unit ?? "units"})`).join(", ") || "produce";
          const waMessage = role === "BUYER"
            ? `Hello ${otherPartyName}, I am contacting you regarding my order #${order.id.slice(0, 8)} (${itemsSummary}) on Vithu.`
            : `Hello ${otherPartyName}, regarding your order #${order.id.slice(0, 8)} (${itemsSummary}) on Vithu.`;
          const waUrl = waPhone ? `https://wa.me/${waPhone}?text=${encodeURIComponent(waMessage)}` : "";

          return (
            <article className="portal-order-card" key={order.id} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div className="portal-order-head">
                <div>
                  <span className="portal-overline">Order #{order.id.slice(0, 8)}</span>
                  <h2>{order.items?.map((item) => item.productName || item.productId).join(", ") || "Order details"}</h2>
                </div>
                <span className={`portal-status status-${order.status.toLowerCase()}`}>{order.status.toLowerCase()}</span>
              </div>

              {/* Farmer / Buyer Info Strip with Quick WhatsApp */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  background: "#f7faf7",
                  border: "1px solid #e1ede2",
                  borderRadius: "10px",
                  padding: "12px 16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: "#e8f5ec",
                      color: "#0d6543",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "14px",
                    }}
                  >
                    {otherPartyName.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#60806e", letterSpacing: "0.3px" }}>
                      {otherPartyLabel}
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#143c26" }}>
                      {otherPartyName}
                      {otherPartyPhone ? <span style={{ fontWeight: 500, fontSize: "12px", color: "#547360", marginLeft: "8px" }}>({otherPartyPhone})</span> : null}
                    </div>
                  </div>
                </div>

                {/* Quick Contact Buttons */}
                {waPhone ? (
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        background: "#25D366",
                        color: "#fff",
                        fontSize: "12.5px",
                        fontWeight: 700,
                        padding: "7px 14px",
                        borderRadius: "8px",
                        textDecoration: "none",
                        boxShadow: "0 2px 6px rgba(37,211,102,0.25)",
                      }}
                    >
                      <MessageCircle size={15} /> WhatsApp {otherPartyLabel}
                    </a>
                    <a
                      href={`tel:${waPhone}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        background: "#fff",
                        border: "1px solid #c9ded0",
                        color: "#18452e",
                        fontSize: "12px",
                        fontWeight: 600,
                        padding: "7px 12px",
                        borderRadius: "8px",
                        textDecoration: "none",
                      }}
                    >
                      <Phone size={14} /> Call
                    </a>
                  </div>
                ) : null}
              </div>

              {/* Order Meta */}
              <div className="portal-order-meta" style={{ marginTop: 0 }}>
                <span>Placed: {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Date unavailable"}</span>
                <span>Total: <strong>{money(order.totalAmount ?? order.total)}</strong></span>
                {order.deliveryAddress ? <span>Delivery: {order.deliveryAddress}</span> : null}
                {order.notes ? <span>Note: {order.notes}</span> : null}
              </div>

              {/* Items Breakdown */}
              {order.items?.length ? (
                <div className="portal-order-items" style={{ margin: "4px 0 0" }}>
                  {order.items.map((item, index) => (
                    <p key={item.id ?? index}>
                      <strong>{item.quantity} {item.unit ?? "units"}</strong> · {item.productName ?? item.productId ?? "Product"}
                      {item.unitPrice ? ` (@ ${money(item.unitPrice)} / ${item.unit ?? "unit"})` : ""}
                    </p>
                  ))}
                </div>
              ) : null}

              {/* Actions */}
              <div className="portal-card-actions">
                {role === "FARMER" && order.status === "PENDING" && (
                  <>
                    <button disabled={update.isPending} onClick={() => update.mutate({ id: order.id, action: "CONFIRMED" })}>Accept</button>
                    <button disabled={update.isPending} onClick={() => { if (window.confirm("Reject this order?")) update.mutate({ id: order.id, action: "REJECTED" }); }}>Reject</button>
                  </>
                )}
                {role === "FARMER" && order.status === "CONFIRMED" && (
                  <button disabled={update.isPending} onClick={() => update.mutate({ id: order.id, action: "COMPLETED" })}>Mark completed</button>
                )}
                {role === "BUYER" && order.status === "PENDING" && (
                  <button disabled={update.isPending} onClick={() => { if (window.confirm("Cancel this order?")) update.mutate({ id: order.id, action: "cancel" }); }}>Cancel order</button>
                )}
              </div>
            </article>
          );
        })}
      </ViewState>
    </div>
  );
}
