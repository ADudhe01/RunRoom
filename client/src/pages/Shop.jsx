import React, { useEffect, useMemo, useState } from "react";
import ItemCard from "../components/ItemCard";
import StatusBanner from "../components/StatusBanner";
import { useUser } from "../context/UserContext";
import { api } from "../services/api";

const bundles = [
  {
    id: "reset-lounge",
    name: "Reset Lounge",
    description: "Pair the loveseat with the aurora bar for post-run hangs.",
    skus: ["sofa.clubhouse", "light.aurora-bar", "table.recovery-station"],
  },
  {
    id: "focus-studio",
    name: "Focus Studio",
    description: "Poster, shelf, and mat keep drills tidy and inspiring.",
    skus: ["poster.midnight-grid", "shelf.altitude", "mat.stride-lab"],
  },
];

export default function Shop() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("all");
  const [alert, setAlert] = useState(null);
  const [celebrationStamp, setCelebrationStamp] = useState(null);
  const { points, setPoints, inventory, setInventory, user } = useUser();

  useEffect(() => {
    async function fetchItems() {
      try {
        setLoading(true);
        const res = await api.get("/shop/items");
        setItems(res.items || []);
      } catch (err) {
        setAlert({ type: "error", message: err.message });
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, []);

  useEffect(() => {
    if (!celebrationStamp) return undefined;
    const timer = setTimeout(() => setCelebrationStamp(null), 1400);
    return () => clearTimeout(timer);
  }, [celebrationStamp]);

  const ownedIds = useMemo(
    () => new Set((inventory || []).map((entry) => entry.itemId)),
    [inventory]
  );

  const categories = useMemo(() => {
    const base = new Set(items.map((item) => item.category));
    return ["all", ...Array.from(base)];
  }, [items]);

  const visibleItems = useMemo(() => {
    if (category === "all") return items;
    return items.filter((item) => item.category === category);
  }, [category, items]);

  async function handleBuy(item) {
    if (!user) {
      setAlert({ type: "error", message: "Login to collect items." });
      return;
    }
    if (points < item.cost) {
      setAlert({ type: "error", message: "Earn more points to grab this item." });
      return;
    }

    try {
      setAlert(null);
      const res = await api.post("/shop/buy", { itemId: item._id });
      setPoints(Math.floor(res.pointsRemaining));
      setInventory(res.inventory || []);
      setAlert({
        type: "success",
        message: `${item.name} added to your room kit.`,
      });
      setCelebrationStamp(Date.now());
    } catch (err) {
      setAlert({ type: "error", message: err.message });
    }
  }

  return (
    <div className="page shop-page">
      <div className="shop-hero">
        <div>
          <p className="eyebrow">Curated catalog</p>
          <h2>Build your runner&apos;s den</h2>
          <p className="muted">
            Invest your kilometres into purposeful décor chosen for recovery, focus, and
            motivation.
          </p>
        </div>
        <div className="points-tile">
          <span>Available points</span>
          <strong>{Math.floor(points)}</strong>
        </div>
      </div>

      <StatusBanner
        tone={alert?.type || "info"}
        message={alert?.message}
        onDismiss={() => setAlert(null)}
      />

      {celebrationStamp && (
        <div className="shop-celebration" aria-hidden>
          <span className="sparkle sparkle-one" />
          <span className="sparkle sparkle-two" />
          <span className="sparkle sparkle-three" />
        </div>
      )}

      <div className="bundle-row">
        {bundles.map((bundle) => (
          <div key={bundle.id} className="bundle-card">
            <div className="bundle-headline">
              <h3>{bundle.name}</h3>
              <span>{bundle.skus.length} pieces</span>
            </div>
            <p className="muted small">{bundle.description}</p>
            <div className="bundle-items">
              {bundle.skus.map((sku) => {
                const item = items.find((entry) => entry.sku === sku);
                return (
                  <span key={sku} className="bundle-chip">
                    {item?.name || sku}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="catalog-toolbar">
        <div className="category-group">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`category-pill ${category === cat ? "is-active" : ""}`}
              onClick={() => setCategory(cat)}
            >
              {cat === "all" ? "All items" : cat}
            </button>
          ))}
        </div>
        <span className="muted small">
          {loading ? "Loading catalog..." : `${visibleItems.length} items`}
        </span>
      </div>

      <div className="shop-grid">
        {visibleItems.map((item) => (
          <ItemCard
            key={item._id}
            item={item}
            onBuy={handleBuy}
            disabled={points < item.cost}
            owned={ownedIds.has(item._id)}
          />
        ))}
      </div>
    </div>
  );
}
