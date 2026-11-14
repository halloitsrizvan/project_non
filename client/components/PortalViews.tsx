"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ClipboardList, Package, Search, Sprout, TriangleAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { ownedProducts, ProductCard, useFarmerId, useOrders, useProducts, ViewState } from "./PortalCommon";
import {
  AdminDashboard, AdminOrders, AdminProducts, AdminSettings, AdminSchemes, AdminSurplus, AdminUsers,
} from "./AdminViews";
export { BuyerProductDetail, MyProducts, OrderList, ProductFormPage } from "./PortalWorkflows";

export function UnavailablePage({ name, detail }: { name: string; detail: string }) {
  return <div className="portal-state portal-unavailable"><TriangleAlert size={29} /><h2>{name} is not connected yet</h2><p>{detail}</p><span>We will show live information here when the backend exposes this feature.</span></div>;
}

export function FarmerDashboard() {
  const { user } = useAuth();
  const products = useProducts();
  const orders = useOrders();
  const farmer = useFarmerId();
  const owned = ownedProducts(products.data?.items, user?.id, farmer.data);
  const pending = orders.data?.filter((o) => o.status === "PENDING") ?? [];
  return (
    <div className="portal-stack">
      <div className="portal-stat-grid">
        <div className="portal-stat"><span><Package size={18} /> Your products</span><strong>{products.isPending || farmer.isPending ? "…" : owned.length}</strong><small>Identified from current marketplace results</small></div>
        <div className="portal-stat"><span><ClipboardList size={18} /> Orders</span><strong>{orders.isPending ? "…" : orders.data?.length ?? 0}</strong><small>Orders returned by the API</small></div>
        <div className="portal-stat"><span><Sprout size={18} /> Need a response</span><strong>{orders.isPending ? "…" : pending.length}</strong><small>Pending buyer requests</small></div>
      </div>
      <div className="portal-two-col">
        <section className="portal-panel"><div className="portal-panel-head"><h2>Recent orders</h2><Link href="/farmer/orders">View all <ArrowRight size={16} /></Link></div><ViewState loading={orders.isPending} error={orders.error} empty={orders.data?.length ? undefined : "Orders from buyers will appear here."} retry={() => orders.refetch()}>{orders.data?.slice(0, 3).map((order) => <div className="portal-list-row" key={order.id}><span>Order #{order.id.slice(0, 8)}</span><strong>{order.status}</strong></div>)}</ViewState></section>
        <section className="portal-panel"><div className="portal-panel-head"><h2>Quick actions</h2></div><div className="portal-quick-links"><Link href="/farmer/demand">Market Demand & Crop Timing (Seeds Guide) <ArrowRight size={17} /></Link><Link href="/farmer/buyers">Browse buyer requirements <ArrowRight size={17} /></Link><Link href="/farmer/products/new">Add a product <ArrowRight size={17} /></Link><Link href="/farmer/products">View my products <ArrowRight size={17} /></Link><Link href="/farmer/schemes">Find government schemes <ArrowRight size={17} /></Link></div></section>
      </div>
    </div>
  );
}

export function BuyerDashboard() {
  const orders = useOrders();
  const pending = orders.data?.filter((o) => o.status === "PENDING") ?? [];
  const completed = orders.data?.filter((o) => o.status === "COMPLETED") ?? [];
  return (
    <div className="portal-stack">
      <div className="portal-stat-grid">
        <div className="portal-stat"><span>Total orders</span><strong>{orders.isPending ? "…" : orders.data?.length ?? 0}</strong></div>
        <div className="portal-stat"><span>Pending orders</span><strong>{orders.isPending ? "…" : pending.length}</strong></div>
        <div className="portal-stat"><span>Completed orders</span><strong>{orders.isPending ? "…" : completed.length}</strong></div>
      </div>
      <section className="portal-panel">
        <div className="portal-panel-head"><h2>Recent purchases</h2><Link href="/buyer/orders">View all <ArrowRight size={16} /></Link></div>
        <ViewState loading={orders.isPending} error={orders.error} empty={orders.data?.length ? undefined : "Your purchases will appear here after you place an order."} retry={() => orders.refetch()}>
          {orders.data?.slice(0, 4).map((order) => <div className="portal-list-row" key={order.id}><span>Order #{order.id.slice(0, 8)}</span><strong>{order.status}</strong></div>)}
        </ViewState>
      </section>
      <div className="portal-two-col">
        <Link className="portal-promo" href="/buyer/demand">
          <span><strong>Trending & Peak Demand Produce</strong><small>See high-demand crops at prime harvesting quality.</small></span>
          <ArrowRight size={24} />
        </Link>
        <Link className="portal-promo" style={{ background: "#134e38" }} href="/buyer/requirements/new">
          <span><strong>Post a produce requirement</strong><small>&ldquo;I need this product&rdquo; – Let farmers quote directly.</small></span>
          <ArrowRight size={24} />
        </Link>
      </div>
    </div>
  );
}

export function BuyerMarketplace() {
  const [draft, setDraft] = useState({ search: "", category: "", location: "" });
  const [filters, setFilters] = useState(draft);
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const query = new URLSearchParams({ limit: "12", page: String(page) });
  if (filters.search) query.set("search", filters.search);
  if (filters.category) query.set("category", filters.category);
  if (filters.location) query.set("location", filters.location);
  const products = useProducts(query.toString());
  const sorted = useMemo(() => {
    const list = [...(products.data?.items ?? [])];
    if (sort === "price-low") list.sort((a, b) => Number(a.pricePerUnit) - Number(b.pricePerUnit));
    if (sort === "price-high") list.sort((a, b) => Number(b.pricePerUnit) - Number(a.pricePerUnit));
    return list;
  }, [products.data, sort]);
  return (
    <div className="portal-stack">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f0f8ed", border: "1px solid #d2e7ce", borderRadius: 12, padding: "12px 18px", fontSize: 13, color: "#194d34", flexWrap: "wrap", gap: 10 }}>
        <span>Cannot find the crop or quantity you need?</span>
        <Link href="/buyer/requirements/new" style={{ fontWeight: 800, color: "#0d6543", display: "inline-flex", alignItems: "center", gap: 5 }}>
          Post a requirement (&ldquo;I need this product&rdquo;) <ArrowRight size={15} />
        </Link>
      </div>
      <form className="portal-filter-bar" onSubmit={(event) => { event.preventDefault(); setPage(1); setFilters(draft); }}>
        <label><span>Search produce</span><input value={draft.search} onChange={(e) => setDraft({ ...draft, search: e.target.value })} placeholder="Tomatoes, rice, bananas…" /></label>
        <label><span>Category</span><input value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} placeholder="All categories" /></label>
        <label><span>Location</span><input value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} placeholder="Any location" /></label>
        <button type="submit" className="portal-button"><Search size={17} /> Search</button>
      </form>
      <div className="portal-results-head"><p>{products.data ? `${products.data.meta?.total ?? sorted.length} products found` : "Explore fresh produce"}</p><div><button type="button" onClick={() => { const clear = { search: "", category: "", location: "" }; setDraft(clear); setFilters(clear); setPage(1); }}>Clear filters</button><select aria-label="Sort shown products" value={sort} onChange={(e) => setSort(e.target.value)}><option value="newest">Default order</option><option value="price-low">Price: low to high (this page)</option><option value="price-high">Price: high to low (this page)</option></select></div></div>
      <ViewState loading={products.isPending} error={products.error} empty={sorted.length ? undefined : "No products match your search yet. Try another name or location."} retry={() => products.refetch()}>{sorted.length > 0 && <div className="portal-product-grid">{sorted.map((product) => <ProductCard key={product.id} product={product} href={`/buyer/products/${product.id}`} />)}</div>}</ViewState>
      {(products.data?.meta?.totalPages ?? 0) > 1 && <div className="portal-pagination"><button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page} of {products.data?.meta?.totalPages}</span><button type="button" disabled={page >= (products.data?.meta?.totalPages ?? 1)} onClick={() => setPage(page + 1)}>Next</button></div>}
    </div>
  );
}

export function ProfilePage({ role }: { role: "FARMER" | "BUYER" }) {
  const { user } = useAuth();
  const profile = useQuery({ queryKey: [role, "profile"], queryFn: () => api<Record<string, unknown>>(role === "FARMER" ? "farmers/me" : "buyers/me") });
  const fields = [
    ["Name", user?.name], ["Email", user?.email], ["Phone", user?.phone],
    ["State", profile.data?.state], ["District", profile.data?.district],
    ["Location", profile.data?.location], ["Farming type", profile.data?.farmingType],
    ["Business name", profile.data?.businessName],
  ].filter((entry) => entry[1] !== undefined && entry[1] !== null && entry[1] !== "");
  return <section className="portal-panel"><div className="portal-panel-head"><h2>Account details</h2></div><ViewState loading={profile.isPending} error={profile.error} retry={() => profile.refetch()}><dl className="portal-profile-list">{fields.map(([label, value]) => <div key={String(label)}><dt>{String(label)}</dt><dd>{String(value)}</dd></div>)}</dl><p className="portal-muted">Profile editing is not available in the current API.</p></ViewState></section>;
}
