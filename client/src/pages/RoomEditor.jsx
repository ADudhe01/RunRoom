import React, { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import RoomCanvas from "../components/RoomCanvas";
import StatusBanner from "../components/StatusBanner";
import { useUser } from "../context/UserContext";

const scenes = [
  {
    id: "calm-morning",
    name: "Calm Morning",
    description: "Poster, moss wall, and mat to greet sunrise miles.",
    placements: [
      { sku: "poster.midnight-grid", x: 20, y: 18, scale: 1 },
      { sku: "plant.moss-wall", x: 12, y: 55, scale: 0.9 },
      { sku: "mat.stride-lab", x: 55, y: 68, scale: 1.1 },
    ],
  },
  {
    id: "club-reset",
    name: "Club Reset",
    description: "Loveseat, glow bar, and table for cool-down chats.",
    placements: [
      { sku: "sofa.clubhouse", x: 45, y: 60, scale: 1.1 },
      { sku: "light.aurora-bar", x: 70, y: 25, scale: 0.9 },
      { sku: "table.recovery-station", x: 65, y: 65, scale: 0.8 },
    ],
  },
];

const createId = () =>
  (typeof globalThis !== "undefined" &&
    globalThis.crypto &&
    globalThis.crypto.randomUUID)
    ? globalThis.crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function decorateLayout(layout = [], inventory = []) {
  const inventoryMap = new Map(
    (inventory || []).map((entry) => [entry.itemId, entry.item])
  );

  return (layout || []).map((placement) => ({
    ...placement,
    localId: placement.localId || placement.id || createId(),
    item: placement.item || inventoryMap.get(placement.itemId) || placement.item,
  }));
}

export default function RoomEditor() {
  const { roomLayout, setRoomLayout, inventory } = useUser();
  const [draftLayout, setDraftLayout] = useState(() =>
    decorateLayout(roomLayout, inventory)
  );
  const [selectedItemId, setSelectedItemId] = useState(
    inventory?.[0]?.itemId || null
  );
  const [activePlacementId, setActivePlacementId] = useState(null);
  const [alert, setAlert] = useState(null);
  const [saving, setSaving] = useState(false);

  const availableItems = useMemo(
    () => (inventory || []).filter((slot) => slot.item),
    [inventory]
  );

  const skuLookup = useMemo(() => {
    const map = new Map();
    availableItems.forEach((slot) => {
      if (slot.item?.sku) {
        map.set(slot.item.sku, slot.item);
      }
    });
    return map;
  }, [availableItems]);

  useEffect(() => {
    setDraftLayout(decorateLayout(roomLayout, inventory));
  }, [roomLayout, inventory]);

  useEffect(() => {
    setSelectedItemId((prev) => {
      if (inventory?.some((slot) => slot.itemId === prev)) {
        return prev;
      }
      if (inventory?.length) {
        return inventory[0].itemId;
      }
      return null;
    });
  }, [inventory]);

  const activePlacement = useMemo(
    () => draftLayout.find((placement) => placement.localId === activePlacementId) || null,
    [draftLayout, activePlacementId]
  );

  function addPlacement() {
    const entry = availableItems.find((slot) => slot.item.id === selectedItemId);
    const item = entry?.item;
    if (!item) {
      setAlert({ type: "error", message: "Select an item from your inventory first." });
      return;
    }

    const nextPlacement = {
      localId: createId(),
      itemId: item.id,
      item,
      x: 48,
      y: 58,
      scale: 1,
    };

    setDraftLayout((prev) => [...prev, nextPlacement]);
    setActivePlacementId(nextPlacement.localId);
  }

  function removePlacement(localId) {
    setDraftLayout((prev) => prev.filter((placement) => placement.localId !== localId));
    if (activePlacementId === localId) {
      setActivePlacementId(null);
    }
  }

  function updateActivePlacement(values) {
    if (!activePlacementId) return;
    setDraftLayout((prev) =>
      prev.map((placement) =>
        placement.localId === activePlacementId ? { ...placement, ...values } : placement
      )
    );
  }

  async function handleSave() {
    try {
      setSaving(true);
      setAlert(null);
      const payload = draftLayout.map(({ itemId, x, y, scale }) => ({
        itemId,
        x,
        y,
        scale,
      }));
      const res = await api.post("/room/save", { layout: payload });
      setRoomLayout(res.layout || []);
      setAlert({ type: "success", message: "Room layout saved." });
    } catch (err) {
      setAlert({ type: "error", message: err.message });
    } finally {
      setSaving(false);
    }
  }

  function applyScene(scene) {
    const placements = scene.placements
      .map((slot) => {
        const item = skuLookup.get(slot.sku);
        if (!item) return null;
        return {
          localId: createId(),
          itemId: item.id,
          item,
          x: slot.x,
          y: slot.y,
          scale: slot.scale || 1,
        };
      })
      .filter(Boolean);

    if (!placements.length) {
      setAlert({
        type: "error",
        message: "You need these items before applying this scene.",
      });
      return;
    }

    setDraftLayout(placements);
    setActivePlacementId(placements[0]?.localId || null);
    setAlert({ type: "info", message: `${scene.name} scene applied.` });
  }

  return (
    <div className="page room-page">
      <div className="room-layout">
        <RoomCanvas
          layout={draftLayout}
          activePlacementId={activePlacementId}
          onSelectPlacement={setActivePlacementId}
          onCanvasClick={(event) => {
            if (!activePlacementId) return;
            const rect = event.currentTarget.getBoundingClientRect();
            const xPercent = ((event.clientX - rect.left) / rect.width) * 100;
            const yPercent = ((event.clientY - rect.top) / rect.height) * 100;
            updateActivePlacement({
              x: clamp(xPercent, 8, 90),
              y: clamp(yPercent, 25, 90),
            });
          }}
        />
      </div>

      <div className="room-sidebar">
        <div className="sidebar-header">
          <p className="eyebrow">Layout lab</p>
          <h2>Curate your space</h2>
          <p className="muted">
            Drop items, fine-tune their placement, and bring your kilometres to life.
          </p>
        </div>

        <StatusBanner
          tone={alert?.type || "info"}
          message={alert?.message}
          onDismiss={() => setAlert(null)}
        />

        <section className="sidebar-section">
          <div className="section-headline">
            <h3>Inventory</h3>
            <span className="muted small">{availableItems.length} items</span>
          </div>
          {availableItems.length === 0 ? (
            <p className="muted small">
              Pick up décor from the shop to unlock your inventory.
            </p>
          ) : (
            <div className="inventory-scroll">
              {availableItems.map((entry, idx) => (
                <button
                  key={entry.slotId || `${entry.item.id}-${idx}`}
                  className={`inventory-chip ${
                    selectedItemId === entry.item.id ? "is-active" : ""
                  }`}
                  onClick={() => setSelectedItemId(entry.item.id)}
                >
                  <img src={entry.item.imageUrl} alt={entry.item.name} />
                  <div>
                    <strong>{entry.item.name}</strong>
                    <span>{entry.item.category}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
          <button
            className="primary-button full"
            onClick={addPlacement}
            disabled={!selectedItemId}
          >
            Place selected item
          </button>
        </section>

        <section className="sidebar-section">
          <div className="section-headline">
            <h3>Placements</h3>
            <span className="muted small">{draftLayout.length} placed</span>
          </div>
          <p className="muted tiny room-tip">
            Tip: select an item from the list below, then click anywhere in the canvas to drop
            it precisely.
          </p>
          {draftLayout.length === 0 ? (
            <p className="muted small">No items placed yet. Add one to get started.</p>
          ) : (
            <div className="placements-list">
              {draftLayout.map((placement) => (
                <button
                  key={placement.localId}
                  className={`placement-chip ${
                    placement.localId === activePlacementId ? "is-active" : ""
                  }`}
                  onClick={() => setActivePlacementId(placement.localId)}
                >
                  <div>
                    <strong>{placement.item?.name}</strong>
                    <span className="muted small">
                      {Math.round(placement.x)}% × {Math.round(placement.y)}%
                    </span>
                  </div>
                  <span className="muted small">scale {placement.scale.toFixed(1)}</span>
                </button>
              ))}
            </div>
          )}

          {activePlacement && (
            <div className="placement-controls">
              <label className="slider-group">
                <span>X position ({Math.round(activePlacement.x)}%)</span>
                <input
                  type="range"
                  min="5"
                  max="85"
                  value={activePlacement.x}
                  onChange={(e) => updateActivePlacement({ x: Number(e.target.value) })}
                />
              </label>
              <label className="slider-group">
                <span>Y position ({Math.round(activePlacement.y)}%)</span>
                <input
                  type="range"
                  min="15"
                  max="85"
                  value={activePlacement.y}
                  onChange={(e) => updateActivePlacement({ y: Number(e.target.value) })}
                />
              </label>
              <label className="slider-group">
                <span>Scale ({activePlacement.scale.toFixed(1)}x)</span>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.05"
                  value={activePlacement.scale}
                  onChange={(e) =>
                    updateActivePlacement({
                      scale: Number(e.target.value),
                    })
                  }
                />
              </label>
              <button
                className="ghost-button full"
                onClick={() => removePlacement(activePlacement.localId)}
              >
                Remove placement
              </button>
            </div>
          )}
        </section>

        <section className="sidebar-section">
          <div className="section-headline">
            <h3>Quick scenes</h3>
          </div>
          <div className="scene-grid">
            {scenes.map((scene) => {
              const canApply = scene.placements.every((slot) => skuLookup.has(slot.sku));
              return (
                <button
                  key={scene.id}
                  className="scene-card"
                  onClick={() => applyScene(scene)}
                  disabled={!canApply}
                >
                  <strong>{scene.name}</strong>
                  <p className="muted small">{scene.description}</p>
                  {!canApply && <span className="muted tiny">Collect required items</span>}
                </button>
              );
            })}
          </div>
        </section>

        <button className="primary-button full" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save layout"}
        </button>
      </div>
    </div>
  );
}
