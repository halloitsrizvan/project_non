"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, LogIn, Menu, Sprout, UserPlus, Users, X } from "lucide-react";

export default function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 20);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Close menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header className={`site-header ${scrolled ? "site-header--scrolled" : ""}`}>
        <div className="site-header-inner">
          {/* Brand Logo & Name */}
          <Link href="/" className="brand" aria-label="vithu home" onClick={() => setMobileMenuOpen(false)}>
            <Image className="brand-logo" src="/images/vithu-logo.png" alt="" width={36} height={36} priority />
            <span className="brand-text">vithu</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="primary-nav" aria-label="Main navigation">
            <a href="#home">Home</a>
            <a href="#how-it-works">How it works</a>
            <a href="#farmers">For farmers</a>
            <a href="#buyers">For buyers</a>
          </nav>

          {/* Actions: Log in & Sign up (Prominently displayed on BOTH Desktop & Mobile) */}
          <div className="header-actions">
            <Link className="header-login-btn" href="/login">
              Log in
            </Link>
            <Link className="header-signup-btn" href="/register">
              Sign up <span aria-hidden="true" className="header-arrow">↗</span>
            </Link>

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              className="mobile-menu-toggle"
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="mobile-drawer-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Navigation Drawer */}
      <div
        className={`mobile-drawer ${mobileMenuOpen ? "mobile-drawer--open" : ""}`}
        aria-modal="true"
        role="dialog"
        aria-label="Navigation menu"
      >
        <div className="mobile-drawer-head">
          <Link href="/" className="brand" onClick={() => setMobileMenuOpen(false)}>
            <Image src="/images/vithu-logo.png" alt="" width={32} height={32} />
            <span style={{ color: "#064b37", fontWeight: 800 }}>vithu</span>
          </Link>
          <button
            type="button"
            className="mobile-drawer-close"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* Highlighted Mobile Auth Buttons */}
        <div className="mobile-drawer-auth">
          <Link
            href="/register"
            className="mobile-auth-signup"
            onClick={() => setMobileMenuOpen(false)}
          >
            <UserPlus size={18} />
            <span>Create account (Sign up)</span>
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/login"
            className="mobile-auth-login"
            onClick={() => setMobileMenuOpen(false)}
          >
            <LogIn size={18} />
            <span>Log in to your workspace</span>
          </Link>
        </div>

        {/* Main Navigation Links */}
        <div className="mobile-drawer-nav">
          <p className="mobile-drawer-section-title">Navigation</p>
          <a href="#home" onClick={() => setMobileMenuOpen(false)}>
            Home
          </a>
          <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>
            How it works
          </a>
          <a href="#farmers" onClick={() => setMobileMenuOpen(false)}>
            For farmers
          </a>
          <a href="#buyers" onClick={() => setMobileMenuOpen(false)}>
            For buyers
          </a>
        </div>

        {/* Role Quick Links */}
        <div className="mobile-drawer-roles">
          <p className="mobile-drawer-section-title">Get started by role</p>
          <Link
            href="/register?role=farmer"
            className="mobile-role-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="mobile-role-icon"><Sprout size={18} /></span>
            <div>
              <strong>Join as a Farmer</strong>
              <small>List harvests, connect with buyers, track orders</small>
            </div>
            <ArrowRight size={16} />
          </Link>

          <Link
            href="/register?role=buyer"
            className="mobile-role-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="mobile-role-icon" style={{ background: "#e1f0e4", color: "#0c6340" }}><Users size={18} /></span>
            <div>
              <strong>Join as a Buyer</strong>
              <small>Source fresh produce directly from farmers</small>
            </div>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="mobile-drawer-footer">
          <p>© 2026 vithu · From farm to market, together.</p>
        </div>
      </div>
    </>
  );
}
