"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import { PortalShell } from "./PortalShell";
import {
  AdminDashboard, AdminOrders, AdminProducts, AdminSettings, AdminSchemes, AdminSurplus, AdminUsers,
} from "./AdminViews";
import {
  BuyerDashboard, BuyerMarketplace, FarmerDashboard, ProfilePage, UnavailablePage,
} from "./PortalViews";
import {
  BuyerRequirementFormPage, BuyerRequirementsPage, BuyerWishlistPage, FarmerBuyerRequirements,
} from "./PortalRequirements";
import { BuyerMarketDemandPage, FarmerMarketDemandPage } from "./PortalDemand";
import { FarmerSchemesPage, FarmerSurplusPage } from "./FarmerSchemesAndSurplus";
import { BuyerProductDetail, MyProducts, OrderList, ProductFormPage } from "./PortalWorkflows";
import type { Role } from "@/lib/api";

type PageConfig = { title: string; description: string; content: React.ReactNode; action?: React.ReactNode };

export default function PortalApp({ role }: { role: Role }) {
  return <Suspense fallback={<main className="portal-auth-state" aria-busy="true">Opening your workspace…</main>}><PortalBody role={role} /></Suspense>;
}

function PortalBody({ role }: { role: Role }) {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean).slice(1);
  const section = parts[0] ?? "dashboard";
  const unavailable = (name: string, detail: string) => <UnavailablePage name={name} detail={detail} />;
  let page: PageConfig;

  if (role === "FARMER") {
    if (section === "dashboard") page = { title: "Good to see you", description: "Here is what is happening with your harvest.", content: <FarmerDashboard />, action: <Link className="portal-button" href="/farmer/products/new"><Plus size={17} /> Add product</Link> };
    else if (section === "products" && parts[1] === "new") page = { title: "Add a product", description: "A few simple steps to show buyers what you have.", content: <ProductFormPage /> };
    else if (section === "products" && parts[2] === "edit") page = { title: "Edit product", description: "Update the details buyers can see.", content: <ProductFormPage id={parts[1]} /> };
    else if (section === "products" && !parts[1]) page = { title: "My products", description: "Keep your available produce up to date.", content: <MyProducts />, action: <Link className="portal-button" href="/farmer/products/new"><Plus size={17} /> Add product</Link> };
    else if (section === "orders" && !parts[1]) page = { title: "Orders", description: "Review requests from buyers and keep them updated.", content: <OrderList role="FARMER" /> };
    else if (section === "profile") page = { title: "Your profile", description: "Your account and farm information.", content: <ProfilePage role="FARMER" /> };
    else if (section === "demand" || section === "timing") page = { title: "Market Demand & Crop Timing", description: "Seasonal crop demand, sowing windows, seed recommendations, and expected farmgate prices.", content: <FarmerMarketDemandPage />, action: <Link className="portal-button" href="/farmer/buyers">View Buyer Inquiries</Link> };
    else if (section === "buyers" || section === "requirements") page = { title: "Buyer Requirements", description: "Direct produce requests from buyers looking for harvest. Connect with buyers directly.", content: <FarmerBuyerRequirements /> };
    else if (section === "schemes") page = { title: "Government Schemes & Subsidies", description: "Verified central and state government support, crop insurance, and equipment subsidies for your farm.", content: <FarmerSchemesPage /> };
    else if (section === "surplus") page = { title: "Surplus Produce & Farmgate Clearance", description: "Report excess harvest or procure surplus crops directly from farmers at wholesale discounted rates.", content: <FarmerSurplusPage /> };
    else page = { title: "Page not found", description: "", content: <Link href="/farmer/dashboard">Go to overview</Link> };
  } else if (role === "BUYER") {
    if (section === "dashboard") page = { title: "Welcome back", description: "A clear view of your purchasing activity.", content: <BuyerDashboard />, action: <Link className="portal-button" href="/buyer/marketplace">Find products</Link> };
    else if (section === "marketplace") page = { title: "Marketplace", description: "Find fresh produce from farmers.", content: <BuyerMarketplace /> };
    else if (section === "surplus") page = { title: "Surplus Produce & Bulk Clearance", description: "Procure excess harvest directly from farmers at wholesale discounted rates.", content: <FarmerSurplusPage /> };
    else if (section === "demand" || section === "trending") page = { title: "Trending High-Demand Produce", description: "Discover the most sought-after farm produce in peak harvest season across Kerala.", content: <BuyerMarketDemandPage />, action: <Link className="portal-button" href="/buyer/requirements/new"><Plus size={17} /> Post requirement</Link> };
    else if (section === "products" && parts[1]) page = { title: "Product details", description: "Check availability and place your order.", content: <BuyerProductDetail id={parts[1]} /> };
    else if (section === "orders") page = { title: "Your orders", description: "Track purchases and their current status.", content: <OrderList role="BUYER" /> };
    else if (section === "requirements" && parts[1] === "new") page = { title: "Post a requirement", description: "Let farmers know what produce you need, quantity, and budget.", content: <BuyerRequirementFormPage /> };
    else if (section === "requirements") page = { title: "Produce requirements", description: "Post and track produce you need from farmers.", content: <BuyerRequirementsPage />, action: <Link className="portal-button" href="/buyer/requirements/new"><Plus size={17} /> Post requirement</Link> };
    else if (section === "wishlist") page = { title: "Your wishlist", description: "Saved produce items from the marketplace.", content: <BuyerWishlistPage /> };
    else if (section === "profile") page = { title: "Your profile", description: "Your account and buyer information.", content: <ProfilePage role="BUYER" /> };
    else page = { title: "Page not found", description: "", content: <Link href="/buyer/dashboard">Go to overview</Link> };
  } else if (role === "ADMIN") {
    if (section === "dashboard") page = { title: "Platform overview", description: "Monitor users, products, orders, schemes, and surplus.", content: <AdminDashboard /> };
    else if (section === "users" && !parts[1]) page = { title: "User management", description: "View, search, and manage farmer and buyer accounts.", content: <AdminUsers /> };
    else if (section === "products" && !parts[1]) page = { title: "Product moderation", description: "Review every product listed on the marketplace.", content: <AdminProducts /> };
    else if (section === "orders" && !parts[1]) page = { title: "Order monitoring", description: "Track orders placed across the platform.", content: <AdminOrders /> };
    else if (section === "schemes" && !parts[1]) page = { title: "Government schemes", description: "Publish and maintain verified scheme information.", content: <AdminSchemes /> };
    else if (section === "surplus" && !parts[1]) page = { title: "Surplus products", description: "Products that need attention because they remain unsold.", content: <AdminSurplus /> };
    else if (section === "settings") page = { title: "Platform settings", description: "General configuration for the marketplace.", content: <AdminSettings /> };
    else page = { title: "Page not found", description: "", content: <Link href="/admin/dashboard">Go to overview</Link> };
  } else {
    page = { title: "Unknown role", description: "", content: <UnavailablePage name="Unknown role" detail="This role does not have a portal configured." /> };
  }

  return <PortalShell role={role} title={page.title} description={page.description} action={page.action}>{page.content}</PortalShell>;
}