import React, { Suspense, useState, useRef, useMemo, Component } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  ContactShadows,
  TransformControls,
  useGLTF,
} from "@react-three/drei";
import { useUser } from "../context/UserContext";
import { api } from "../services/api";
import StatusBanner from "../components/StatusBanner";
import * as THREE from "three";

// Fallback geometry component for missing models
function FallbackItem({ item, position, scale, rotation }) {
  const geometry = useMemo(() => {
    // Different shapes based on item category
    if (item.category?.toLowerCase().includes("lamp") || item.category?.toLowerCase().includes("light")) {
      return new THREE.CylinderGeometry(0.2, 0.2, 0.8, 8);
    } else if (item.category?.toLowerCase().includes("plant")) {
      return new THREE.ConeGeometry(0.3, 0.6, 8);
    } else if (item.category?.toLowerCase().includes("table")) {
      return new THREE.BoxGeometry(0.8, 0.1, 0.8);
    } else if (item.category?.toLowerCase().includes("chair")) {
      return new THREE.BoxGeometry(0.4, 0.6, 0.4);
    } else if (item.category?.toLowerCase().includes("poster")) {
      return new THREE.PlaneGeometry(0.8, 1.0);
    } else if (item.category?.toLowerCase().includes("shelf")) {
      return new THREE.BoxGeometry(0.6, 0.8, 0.2);
    } else {
      return new THREE.BoxGeometry(0.5, 0.5, 0.5);
    }
  }, [item.category]);

  return (
    <mesh geometry={geometry} position={position} scale={scale} rotation={[0, rotation, 0]}>
      <meshStandardMaterial color={item.rarity === "rare" ? "#8b5cf6" : "#a78bfa"} />
    </mesh>
  );
}

// Error boundary class component for catching GLTF loading errors
class ErrorCatcher extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ModelLoader error:', error, errorInfo);
    if (this.props.onError) {
      this.props.onError();
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Component to load a GLTF model with proper error handling
function ModelLoader({ modelPath }) {
  const gltf = useGLTF(modelPath);
  if (!gltf || !gltf.scene) {
    console.error(`Failed to load model: ${modelPath}`);
    return null;
  }
  return <primitive object={gltf.scene.clone()} />;
}

// Component to load and display a 3D item
function RoomItem({ placement, isSelected, onSelect, onTransform, transformMode }) {
  const { item, x, y, z, rotation, scale } = placement;
  const groupRef = useRef();
  const controlsRef = useRef();
  const [modelError, setModelError] = useState(true);

  // Check if model exists - default to true (use fallback) to prevent crashes
  const modelPath = `/models/${item.sku || item.id}.glb`;
  
  React.useEffect(() => {
    // Check if model file exists and is actually a GLB file (not HTML 404 page)
    console.log(`🔍 Checking for model: ${modelPath}`);
    fetch(modelPath, { method: 'HEAD' })
      .then(async (res) => {
        if (res.ok) {
          // Double-check it's actually a GLB file by checking content-type
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('model/gltf') || contentType && contentType.includes('application/octet-stream')) {
            console.log(`✅ Model found: ${modelPath} (${contentType})`);
            setModelError(false); // Model exists
          } else {
            // Might be HTML 404 page
            console.log(`⚠️ File exists but wrong content-type (${contentType}), using fallback`);
            setModelError(true);
          }
        } else {
          console.log(`❌ Model not found (${res.status}): ${modelPath}`);
          setModelError(true); // Model not found
        }
      })
      .catch((err) => {
        console.log(`❌ Error checking model: ${modelPath}`, err);
        setModelError(true); // Error checking, use fallback
      });
  }, [modelPath]);
  
  // Default to fallback until we confirm model exists
  // This prevents crashes from useGLTF trying to load non-existent files

  // Sync position when placement changes (but not when selected/dragging)
  const isDraggingRef = useRef(false);
  
  React.useEffect(() => {
    if (groupRef.current && !isSelected && !isDraggingRef.current) {
      groupRef.current.position.set(x, y, z);
      groupRef.current.rotation.y = rotation;
      groupRef.current.scale.setScalar(scale);
    }
  }, [x, y, z, rotation, scale, isSelected]);

  const handleClick = (e) => {
    e.stopPropagation();
    // Force immediate selection update
    onSelect(placement.id);
  };

  // Track previous values to detect changes
  const prevValuesRef = useRef({ x, y, z, rotation });
  
  // Update transform when controls change
  useFrame(() => {
    if (isSelected && groupRef.current && controlsRef.current) {
      const group = groupRef.current;
      const controls = controlsRef.current;
      
      // Check if controls are dragging
      const isDragging = controls.isDragging || false;
      isDraggingRef.current = isDragging;
      
      const pos = group.position;
      const rot = group.rotation.y;
      
      // Only update if position actually changed significantly
      if (
        Math.abs(pos.x - prevValuesRef.current.x) > 0.01 ||
        Math.abs(pos.y - prevValuesRef.current.y) > 0.01 ||
        Math.abs(pos.z - prevValuesRef.current.z) > 0.01 ||
        Math.abs(rot - prevValuesRef.current.rotation) > 0.01
      ) {
        prevValuesRef.current = { x: pos.x, y: pos.y, z: pos.z, rotation: rot };
        onTransform({
          x: pos.x,
          y: pos.y,
          z: pos.z,
          rotation: rot,
        });
      }
    } else {
      isDraggingRef.current = false;
      // Update prev values when not selected
      prevValuesRef.current = { x, y, z, rotation };
    }
  });

  return (
    <>
      <group ref={groupRef} position={[x, y, z]} rotation={[0, rotation, 0]} scale={scale}>
        {!modelError ? (
          <Suspense 
            fallback={<FallbackItem item={item} position={[0, 0, 0]} scale={1} rotation={0} />}
          >
            <ErrorCatcher 
              fallback={<FallbackItem item={item} position={[0, 0, 0]} scale={1} rotation={0} />}
              onError={() => {
                console.error(`Model load failed: ${modelPath}, using fallback`);
                setModelError(true);
              }}
            >
              <ModelLoader modelPath={modelPath} />
            </ErrorCatcher>
          </Suspense>
        ) : (
          <FallbackItem item={item} position={[0, 0, 0]} scale={1} rotation={0} />
        )}
        <mesh
          onClick={handleClick}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            document.body.style.cursor = "auto";
          }}
        >
          <boxGeometry args={[1.2, 1.2, 1.2]} />
          <meshStandardMaterial visible={false} />
        </mesh>
      </group>
      {isSelected && groupRef.current && (
        <TransformControls
          key={`controls-${placement.id}-${transformMode}-${isSelected}`}
          ref={controlsRef}
          mode={transformMode}
          object={groupRef.current}
          makeDefault={false}
        />
      )}
    </>
  );
}

// Simple room structure
function Room() {
  return (
    <>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>

      {/* Walls */}
      {/* Back wall */}
      <mesh position={[0, 2.5, -5]} receiveShadow>
        <planeGeometry args={[10, 5]} />
        <meshStandardMaterial color="#e8e8e8" />
      </mesh>

      {/* Left wall */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-5, 2.5, 0]} receiveShadow>
        <planeGeometry args={[10, 5]} />
        <meshStandardMaterial color="#e8e8e8" />
      </mesh>

      {/* Right wall */}
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[5, 2.5, 0]} receiveShadow>
        <planeGeometry args={[10, 5]} />
        <meshStandardMaterial color="#e8e8e8" />
      </mesh>
    </>
  );
}

export default function Room3D() {
  const { roomLayout, setRoomLayout, inventory, user } = useUser();
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [draftLayout, setDraftLayout] = useState(roomLayout || []);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  const [selectedPlacementId, setSelectedPlacementId] = useState(null);
  const [transformMode, setTransformMode] = useState("translate"); // "translate" or "rotate"

  // Update draft layout when roomLayout changes
  React.useEffect(() => {
    setDraftLayout(roomLayout || []);
  }, [roomLayout]);

  const availableItems = useMemo(
    () => (inventory || []).filter((slot) => slot.item),
    [inventory]
  );

  const handleTransform = (placementId, transform) => {
    setDraftLayout((prev) =>
      prev.map((p) =>
        p.id === placementId
          ? {
              ...p,
              x: transform.x,
              y: transform.y,
              z: transform.z,
              rotation: transform.rotation,
            }
          : p
      )
    );
  };

  const handleAddItem = (itemId) => {
    const entry = availableItems.find((slot) => slot.itemId === itemId);
    if (!entry?.item) return;

    const newPlacement = {
      id: `temp-${Date.now()}`,
      itemId: entry.itemId,
      item: entry.item,
      x: 0,
      y: 0,
      z: 0,
      rotation: 0,
      scale: 1,
    };

    setDraftLayout((prev) => [...prev, newPlacement]);
    setSelectedPlacementId(newPlacement.id);
  };

  const handleRemoveItem = (placementId) => {
    setDraftLayout((prev) => prev.filter((p) => p.id !== placementId));
    if (selectedPlacementId === placementId) {
      setSelectedPlacementId(null);
    }
  };

  const handleSave = async () => {
    if (!user) {
      setAlert({ type: "error", message: "Please log in to save your room." });
      return;
    }

    try {
      setSaving(true);
      setAlert(null);

      const payload = draftLayout.map(({ itemId, x, y, z, rotation, scale }) => ({
        itemId,
        x,
        y,
        z,
        rotation,
        scale,
      }));

      const res = await api.post("/room/save", { layout: payload });
      setRoomLayout(res.layout || []);
      setAlert({ type: "success", message: "Room layout saved successfully!" });
    } catch (err) {
      setAlert({ type: "error", message: err.message || "Failed to save room layout." });
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="page" style={{ position: "relative", minHeight: "calc(100vh - 150px)" }}>
        <div className="room-login-prompt">
          <div className="room-login-content">
            <h2>Please log in to view your room</h2>
            <p className="muted">Connect your Strava account and start earning points!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page room-page">
      <div className="room-3d-layout">
        <div className="room-3d-canvas">
          <Canvas
            shadows
            camera={{ position: [5, 5, 5], fov: 50 }}
            gl={{ antialias: true }}
            onPointerMissed={() => setSelectedPlacementId(null)}
          >
            <Suspense fallback={null}>
              <ambientLight intensity={0.5} />
              <directionalLight
                position={[5, 10, 5]}
                intensity={1}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
              />
              <Environment preset="apartment" />
              <ContactShadows
                position={[0, -0.01, 0]}
                opacity={0.4}
                scale={10}
                blur={2}
                far={4.5}
              />
              <Room />
              {draftLayout.map((placement) => (
                <RoomItem
                  key={placement.id}
                  placement={placement}
                  isSelected={selectedPlacementId === placement.id}
                  onSelect={setSelectedPlacementId}
                  onTransform={(transform) => handleTransform(placement.id, transform)}
                  transformMode={transformMode}
                />
              ))}
              <OrbitControls
                makeDefault
                enabled={!selectedPlacementId}
                minDistance={3}
                maxDistance={20}
              />
            </Suspense>
          </Canvas>
        </div>

        <div className="room-3d-sidebar">
          <div className="sidebar-header">
            <p className="eyebrow">3D Room</p>
            <h2>Decorate your space</h2>
            <p className="muted">
              Click items in your inventory to add them, then click placed items to select and move
              them. Use the colored controls (arrows/rings) to position items in 3D space.
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
                Visit the shop to purchase items and add them to your room.
              </p>
            ) : (
              <div className="inventory-scroll">
                {availableItems.map((entry) => (
                  <button
                    key={entry.slotId}
                    className={`inventory-chip ${selectedItemId === entry.itemId ? "is-active" : ""}`}
                    onClick={() => setSelectedItemId(entry.itemId)}
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
              onClick={() => selectedItemId && handleAddItem(selectedItemId)}
              disabled={!selectedItemId}
            >
              Add to Room
            </button>
          </section>

          <section className="sidebar-section">
            <div className="section-headline">
              <h3>Placed Items</h3>
              <span className="muted small">{draftLayout.length} placed</span>
            </div>
            {draftLayout.length === 0 ? (
              <p className="muted small">No items placed yet. Add items from your inventory.</p>
            ) : (
              <div className="placements-list">
                {draftLayout.map((placement) => (
                  <div
                    key={placement.id}
                    className={`placement-chip ${
                      selectedPlacementId === placement.id ? "is-active" : ""
                    }`}
                    onClick={() => setSelectedPlacementId(placement.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <div>
                      <strong>{placement.item?.name}</strong>
                      <span className="muted small">
                        ({placement.x.toFixed(1)}, {placement.y.toFixed(1)}, {placement.z.toFixed(1)})
                      </span>
                    </div>
                    <button
                      className="ghost-button tiny"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveItem(placement.id);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
            {selectedPlacementId && (
              <div className="placement-controls" style={{ marginTop: "1rem", padding: "1rem", border: "1px solid var(--border)", borderRadius: "12px", background: "rgba(124, 93, 250, 0.05)" }}>
                <p className="muted small" style={{ marginBottom: "0.5rem" }}>
                  <strong>Controls:</strong> Click and drag the colored arrows/rings to move/rotate
                </p>
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <button
                    className={`ghost-button ${transformMode === "translate" ? "is-active" : ""}`}
                    onClick={() => setTransformMode("translate")}
                    style={{ flex: 1, fontSize: "0.85rem" }}
                  >
                    Move
                  </button>
                  <button
                    className={`ghost-button ${transformMode === "rotate" ? "is-active" : ""}`}
                    onClick={() => setTransformMode("rotate")}
                    style={{ flex: 1, fontSize: "0.85rem" }}
                  >
                    Rotate
                  </button>
                </div>
                <p className="muted tiny">
                  Tip: Click outside the item or press ESC to deselect and return to camera controls
                </p>
              </div>
            )}
          </section>

          <button className="primary-button full" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Room Layout"}
          </button>
        </div>
      </div>
    </div>
  );
}

