"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import {
  BadgeIndianRupee, BookOpen, Building2, ClipboardList, ClipboardPlus, Heart, LayoutDashboard,
  Link2, LogOut, Package, Search, Settings, ShieldCheck, Sprout, TrendingUp, Users,
  type LucideIcon,
} from "lucide-react";
import { roleHome, useAuth } from "@/lib/auth";
import type { Role } from "@/lib/api";

type NavItem = { label: string; href: string; icon: LucideIcon };
const navigation: Record<Role, NavItem[]> = {
  FARMER: [
    { label: "Overview", href: "/farmer/dashboard", icon: LayoutDashboard },
    { label: "Market Demand", href: "/farmer/demand", icon: TrendingUp },
    { label: "My products", href: "/farmer/products", icon: Package },
    { label: "Orders", href: "/farmer/orders", icon: ClipboardList },
    { label: "Buyer Requests", href: "/farmer/buyers", icon: Users },
    { label: "Schemes", href: "/farmer/schemes", icon: BookOpen },
    { label: "Surplus", href: "/farmer/surplus", icon: TrendingUp },
    { label: "Profile", href: "/farmer/profile", icon: Sprout },
  ],
  BUYER: [
    { label: "Overview", href: "/buyer/dashboard", icon: LayoutDashboard },
    { label: "Marketplace", href: "/buyer/marketplace", icon: Search },
    { label: "Trending Produce", href: "/buyer/demand", icon: TrendingUp },
    { label: "Post requirement", href: "/buyer/requirements", icon: ClipboardPlus },
    { label: "Orders", href: "/buyer/orders", icon: ClipboardList },
    { label: "Wishlist", href: "/buyer/wishlist", icon: Heart },
    { label: "Profile", href: "/buyer/profile", icon: Users },
  ],
  AGENCY: [
    { label: "Overview", href: "/agency/dashboard", icon: LayoutDashboard },
    { label: "Farmers", href: "/agency/farmers", icon: Users },
    { label: "Products", href: "/agency/products", icon: Package },
    { label: "Connections", href: "/agency/connections", icon: Link2 },
    { label: "Transactions", href: "/agency/transactions", icon: ClipboardList },
    { label: "Commissions", href: "/agency/commissions", icon: BadgeIndianRupee },
  ],
  ADMIN: [
    { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Products", href: "/admin/products", icon: Package },
    { label: "Orders", href: "/admin/orders", icon: ClipboardList },
    { label: "Schemes", href: "/admin/schemes", icon: BookOpen },
    { label: "Surplus", href: "/admin/surplus", icon: TrendingUp },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ],
};

const roleLabel: Record<Role, string> = {
  FARMER: "Farmer workspace",
  BUYER: "Buyer workspace",
  AGENCY: "Agency workspace",
  ADMIN: "Administration",
};

export function PortalShell({
  role, title, description, children, action,
}: {
  role: Role;
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [loading, user, router, pathname]);

  if (loading || !user) {
    return <main className="portal-auth-state" aria-busy="true"><Sprout size={30} /><p>Opening your workspace…</p></main>;
  }

  if (user.role !== role) {
    return (
      <main className="portal-auth-state">
        <ShieldCheck size={34} />
        <h1>This workspace belongs to another role.</h1>
        <p>You are signed in as {user.role.toLowerCase()}.</p>
        <Link className="portal-button" href={roleHome(user.role)}>Go to your workspace</Link>
      </main>
    );
  }

  const nav = navigation[role];
  return (
    <div className="portal-shell">
      <aside className="portal-sidebar">
        <Link href={roleHome(role)} className="portal-brand"><Image src="/images/vithu-logo.png" alt="" width={34} height={34} />vithu</Link>
        <p className="portal-role">{roleLabel[role]}</p>
        <nav aria-label={roleLabel[role]} className="portal-nav">
          {nav.map(({ label, href, icon: Icon }) => (
            <Link key={href} href={href} className={pathname === href || (href.endsWith("/products") && pathname.startsWith(href + "/")) || (href.endsWith("/marketplace") && pathname.startsWith("/buyer/products/")) || (href.endsWith("/requirements") && pathname.startsWith(href + "/")) ? "portal-nav-active" : ""}>
              <Icon size={18} strokeWidth={1.9} /><span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className="portal-sidebar-footer">
          <div className="portal-user"><span className="portal-avatar">{user.name.charAt(0).toUpperCase()}</span><span><strong>{user.name}</strong><small>{user.email ?? roleLabel[role]}</small></span></div>
          <button type="button" onClick={() => { logout(); router.replace("/login"); }}><LogOut size={17} /> Log out</button>
        </div>
      </aside>
      <div className="portal-main">
        <header className="portal-topbar">
          <Link href="/" className="portal-mobile-brand"><Image src="/images/vithu-logo.png" alt="" width={29} height={29} />vithu</Link>
          <span>{roleLabel[role]}</span>
          <button type="button" onClick={() => { logout(); router.replace("/login"); }} aria-label="Log out"><LogOut size={18} /></button>
        </header>
        <main className="portal-content">
          <div className="portal-page-heading"><div><p className="portal-overline">{roleLabel[role]}</p><h1>{title}</h1>{description && <p>{description}</p>}</div>{action}</div>
          {children}
        </main>
      </div>
      <nav className="portal-bottom-nav" aria-label="Quick navigation">
        {nav.slice(0, 4).map(({ label, href, icon: Icon }) => (
          <Link key={href} href={href} className={pathname === href ? "portal-nav-active" : ""}><Icon size={20} /><span>{label}</span></Link>
        ))}
      </nav>
    </div>
  );
}
