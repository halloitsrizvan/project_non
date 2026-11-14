"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Calendar,
  Plus,
  Search,
  TrendingUp,
  Users,
} from "lucide-react";
import { CROP_DEMAND_DATA, type CropDemand } from "@/lib/demandData";
import { useRequirements } from "@/lib/requirements";

export function FarmerMarketDemandPage() {
  const [selectedSeason, setSelectedSeason] = useState<string>("CURRENT_MONTH");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const { requirements } = useRequirements();

  const totalOpenInquiries = useMemo(() => {
    return requirements.filter((r) => r.status === "OPEN").length;
  }, [requirements]);

  const filteredCrops = useMemo(() => {
    return CROP_DEMAND_DATA.filter((crop) => {
      if (selectedSeason === "CURRENT_MONTH" && !crop.isPlantedThisMonth) return false;
      if (selectedSeason !== "ALL" && selectedSeason !== "CURRENT_MONTH" && crop.season !== selectedSeason) return false;
      if (selectedCategory !== "ALL" && crop.category !== selectedCategory) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          crop.name.toLowerCase().includes(q) ||
          crop.category.toLowerCase().includes(q) ||
          crop.recommendedSeedVariety.toLowerCase().includes(q) ||
          crop.seedSources.toLowerCase().includes(q)
        );
      }
      return true;
    }).sort((a, b) => b.demandScore - a.demandScore);
  }, [selectedSeason, selectedCategory, search]);

  return (
    <div className="portal-stack">
      {/* Clean Portal Header */}
      <div className="portal-page-heading" style={{ marginBottom: 12 }}>
        <div>
          <p className="portal-overline">Agricultural Timing & Demand Guide</p>
          <h1 style={{ margin: "2px 0 6px" }}>What to Plant Now</h1>
          <p>
            Seasonal sowing guide for Kerala: high-demand crops, recommended seed varieties, harvest timing, and expected farmgate prices.
          </p>
        </div>
      </div>

      {/* Overview Stats (Standard Native Vithu Style) */}
      <div className="portal-demand-overview">
        <div className="portal-stat">
          <span><Calendar size={18} /> Current Sowing Season</span>
          <strong>November</strong>
          <small>Mundakan (Rabi) window active</small>
        </div>
        <div className="portal-stat">
          <span><TrendingUp size={18} /> Highest Market Demand</span>
          <strong>98%</strong>
          <small>Nendran Banana • ₹48–₹68/kg</small>
        </div>
        <div className="portal-stat">
          <span><Users size={18} /> Buyer Inquiries</span>
          <strong>{totalOpenInquiries}</strong>
          <small>Open procurement requests</small>
        </div>
      </div>

      {/* Simple, Clean Filters */}
      <div className="portal-demand-toolbar">
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <div className="portal-demand-pills">
            <button
              type="button"
              className={`portal-demand-pill ${selectedSeason === "CURRENT_MONTH" ? "active" : ""}`}
              onClick={() => setSelectedSeason("CURRENT_MONTH")}
            >
              Plant this Month (Nov)
            </button>
            <button
              type="button"
              className={`portal-demand-pill ${selectedSeason === "ALL" ? "active" : ""}`}
              onClick={() => setSelectedSeason("ALL")}
            >
              All Seasons
            </button>
            <button
              type="button"
              className={`portal-demand-pill ${selectedSeason === "WINTER_RABI" ? "active" : ""}`}
              onClick={() => setSelectedSeason("WINTER_RABI")}
            >
              Winter / Mundakan
            </button>
            <button
              type="button"
              className={`portal-demand-pill ${selectedSeason === "SUMMER_PUNCHA" ? "active" : ""}`}
              onClick={() => setSelectedSeason("SUMMER_PUNCHA")}
            >
              Summer / Puncha
            </button>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              height: 38,
              padding: "0 10px",
              borderRadius: 8,
              border: "1px solid #d4e3d3",
              fontSize: 12,
              background: "#fff",
              fontWeight: 700,
              color: "#284435",
            }}
          >
            <option value="ALL">All categories</option>
            <option value="Vegetables">Vegetables</option>
            <option value="Fruits">Fruits</option>
            <option value="Spices">Spices</option>
            <option value="Grains & Cereals">Grains & Cereals</option>
            <option value="Tubers">Tubers</option>
          </select>

          <div style={{ position: "relative", width: 220 }}>
            <input
              type="text"
              placeholder="Search crop or seed…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                height: 38,
                padding: "0 10px 0 30px",
                borderRadius: 8,
                border: "1px solid #d4e3d3",
                fontSize: 12,
              }}
            />
            <Search size={14} style={{ position: "absolute", left: 9, top: 12, color: "#7a9081" }} />
          </div>
        </div>
      </div>

      {/* Clean, Flat Crop Directory (No Nested Cards Inside Cards) */}
      {filteredCrops.length === 0 ? (
        <div className="portal-state">
          <Search size={32} />
          <h2>No matching crops found</h2>
          <p>Try switching to &ldquo;All Seasons&rdquo; or clearing your search term.</p>
        </div>
      ) : (
        <div className="portal-crop-grid">
          {filteredCrops.map((crop) => (
            <div className="portal-crop-card" key={crop.id}>
              <div>
                <div className="portal-crop-card-head">
                  <div>
                    <span className="portal-chip">{crop.category}</span>
                    <h3>{crop.name}</h3>
                  </div>
                  <span className="portal-crop-score">{crop.demandScore}% Demand</span>
                </div>

                {/* Flat, clean details list (No cards inside cards) */}
                <div className="portal-crop-details">
                  <div className="portal-crop-row">
                    <span>Sowing Timing</span>
                    <strong>{crop.sowWindow}</strong>
                  </div>
                  <div className="portal-crop-row">
                    <span>Harvest Window</span>
                    <strong>{crop.harvestWindow} ({crop.durationDays})</strong>
                  </div>
                  <div className="portal-crop-row">
                    <span>Recommended Variety</span>
                    <strong>{crop.recommendedSeedVariety}</strong>
                  </div>
                  <div className="portal-crop-row">
                    <span>Seed Source</span>
                    <strong>{crop.seedSources}</strong>
                  </div>
                  <div className="portal-crop-row">
                    <span>Expected Farmgate Price</span>
                    <strong className="portal-crop-price">{crop.expectedPrice}</strong>
                  </div>
                  <div className="portal-crop-row">
                    <span>Expected Return</span>
                    <strong>{crop.profitMargin}</strong>
                  </div>
                </div>

                <p className="portal-crop-reason">
                  {crop.farmerDemandReason}
                </p>
              </div>

              <div className="portal-crop-actions">
                <Link className="portal-button" href="/farmer/buyers">
                  <Users size={14} /> View Buyer Requests
                </Link>
                <Link className="portal-secondary-button" href="/farmer/products/new">
                  <Plus size={14} /> Pre-list
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Simple, Non-Nested Demand Comparison */}
      <section className="portal-ranking-panel">
        <div className="portal-ranking-head">
          <h2>Market Demand Ranking Overview</h2>
          <span style={{ fontSize: 12, color: "#6a8272" }}>Ranked by current Kerala wholesale demand score</span>
        </div>

        <div className="portal-ranking-list">
          {CROP_DEMAND_DATA.map((crop) => (
            <div className="portal-ranking-row" key={crop.id}>
              <span className="portal-ranking-name">{crop.name}</span>
              <div className="portal-ranking-bar-wrap">
                <div
                  className="portal-ranking-bar"
                  style={{ width: `${crop.demandScore}%` }}
                />
              </div>
              <span className="portal-ranking-val">{crop.expectedPrice.split("(")[0]}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function BuyerMarketDemandPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const filteredItems = useMemo(() => {
    return CROP_DEMAND_DATA.filter((crop) => {
      if (selectedCategory !== "ALL" && crop.category !== selectedCategory) return false;
      return true;
    });
  }, [selectedCategory]);

  return (
    <div className="portal-stack">
      {/* <div className="portal-page-heading" style={{ marginBottom: 12 }}>
        <div>
          <p className="portal-overline">Fresh Produce Guide</p>
          <h1 style={{ margin: "2px 0 6px" }}>In-Season & High-Demand Produce</h1>
          <p>
            Browse produce currently arriving from local Kerala harvests with peak freshness and direct farmgate prices.
          </p>
        </div>
      </div> */}

      <div className="portal-demand-toolbar">
        <div className="portal-demand-pills">
          {["ALL", "Vegetables", "Fruits", "Spices", "Grains & Cereals", "Tubers"].map((cat) => (
            <button
              key={cat}
              type="button"
              className={`portal-demand-pill ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === "ALL" ? "All Categories" : cat}
            </button>
          ))}
        </div>
      </div>

      <div className="portal-crop-grid">
        {filteredItems.map((crop) => (
          <div className="portal-crop-card" key={crop.id}>
            <div>
              <div className="portal-crop-card-head">
                <div>
                  <span className="portal-chip">{crop.category}</span>
                  <h3>{crop.name}</h3>
                </div>
                <span className="portal-crop-score">{crop.demandScore}% Rating</span>
              </div>

              <div className="portal-crop-details">
                <div className="portal-crop-row">
                  <span>Harvest Window</span>
                  <strong>{crop.harvestWindow}</strong>
                </div>
                <div className="portal-crop-row">
                  <span>Farmgate Rate</span>
                  <strong className="portal-crop-price">{crop.expectedPrice.split("(")[0]}</strong>
                </div>
                <div className="portal-crop-row">
                  <span>Key Districts</span>
                  <strong>{crop.producingDistricts.slice(0, 3).join(", ")}</strong>
                </div>
              </div>

              <p className="portal-crop-reason">
                {crop.buyerQualityReason}
              </p>
            </div>

            <div className="portal-crop-actions">
              <Link className="portal-button" href="/buyer/marketplace">
                <Search size={14} /> Find Produce
              </Link>
              <Link className="portal-secondary-button" href="/buyer/requirements/new">
                <Plus size={14} /> Post Request
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
