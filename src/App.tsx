import { useState, useEffect } from "react";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";

import { Bolt } from "./components/Bolts";
import { LoadPanel } from "./components/LoadPanel";
import { BoltPanel } from "./components/BoltPanel";
import { FilePanel } from "./components/FilePanel";
import { BottomDock } from "./components/BottomDock";
import { AppliedLoadArrow } from "./components/AppliedLoadArrow";
import { BoltSelectionBox } from "./components/BoltSelectionBox";
import { LoadSelectionBox } from "./components/LoadSelectionBox";

import { analyzeBoltGroup } from "./analysis/analyzeBoltGroup";

import type { AppliedLoad, BoltData } from "./types/bolts";
import type { ActiveDockTab, AppSettings } from "./types/app";

function CustomBoltPreviewDot({ x, y }: { x: number; y: number }) {
  return (
    <mesh position={[x, y, 1.25]}>
      <sphereGeometry args={[0.18, 24, 24]} />
      <meshStandardMaterial
        color="#f97316"
        emissive="#f97316"
        emissiveIntensity={0.35}
      />
    </mesh>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState<ActiveDockTab>("file");

  const [selectedBoltIds, setSelectedBoltIds] = useState<string[]>([]);
  const [hoveredBoltIds, setHoveredBoltIds] = useState<string[]>([]);

  const [selectedLoadIds, setSelectedLoadIds] = useState<string[]>([]);
  const [hoveredLoadIds, setHoveredLoadIds] = useState<string[]>([]);

  const [isCtrlSelecting, setIsCtrlSelecting] = useState(false);

  const [customBoltX, setCustomBoltX] = useState("0");
  const [customBoltY, setCustomBoltY] = useState("0");

  const [settings, setSettings] = useState<AppSettings>({
    designCode: "AISC",
    boltType: "bearing",
    unitSystem: "imperial",
    theme: "dark",
  });

  const isDark = settings.theme === "dark";

  const [loads, setLoads] = useState<AppliedLoad[]>([
    {
      id: "P1",
      label: "P1",
      x: 0,
      y: -6,
      inputMode: "magnitude-angle",
      magnitude: 20,
      angleDeg: 90,
      fx: 0,
      fy: 20,
      moment: 0,
    },
  ]);

  const [bolts, setBolts] = useState<BoltData[]>([
    {
      id: "B1",
      label: "3/4",
      x: -2,
      y: -2,
      unitSystem: "imperial",
      diameter: 0.75,
      renderSize: {
        diameter: 0.75,
        headAcrossFlats: 1.125,
        headHeight: 0.45,
        shaftLength: 2,
      },
      force: { fx: 10, fy: 5 },
    },
    {
      id: "B2",
      label: "3/4",
      x: 2,
      y: -2,
      unitSystem: "imperial",
      diameter: 0.75,
      renderSize: {
        diameter: 0.75,
        headAcrossFlats: 1.125,
        headHeight: 0.45,
        shaftLength: 2,
      },
      force: { fx: -7, fy: 4 },
    },
    {
      id: "B3",
      label: "3/4",
      x: 2,
      y: 2,
      unitSystem: "imperial",
      diameter: 0.75,
      renderSize: {
        diameter: 0.75,
        headAcrossFlats: 1.125,
        headHeight: 0.45,
        shaftLength: 2,
      },
      force: { fx: -8, fy: -3 },
    },
    {
      id: "B4",
      label: "3/4",
      x: -2,
      y: 2,
      unitSystem: "imperial",
      diameter: 0.75,
      renderSize: {
        diameter: 0.75,
        headAcrossFlats: 1.125,
        headHeight: 0.45,
        shaftLength: 2,
      },
      force: { fx: 5, fy: -9 },
    },
  ]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Control") {
        setIsCtrlSelecting(true);
      }

      if (event.key === "Delete" && activeTab === "bolts") {
        setBolts((prev) =>
          prev.filter((bolt) => !selectedBoltIds.includes(bolt.id))
        );
        setSelectedBoltIds([]);
        setHoveredBoltIds([]);
      }

      if (event.key === "Delete" && activeTab === "loads") {
        setLoads((prev) =>
          prev.filter((load) => !selectedLoadIds.includes(load.id))
        );
        setSelectedLoadIds([]);
        setHoveredLoadIds([]);
      }
    }

    function onKeyUp(event: KeyboardEvent) {
      if (event.key === "Control") {
        setIsCtrlSelecting(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [activeTab, selectedBoltIds, selectedLoadIds]);

  useEffect(() => {
    if (activeTab !== "bolts") {
      setSelectedBoltIds([]);
      setHoveredBoltIds([]);
    }

    if (activeTab !== "loads") {
      setSelectedLoadIds([]);
      setHoveredLoadIds([]);
    }
  }, [activeTab]);

  function runAnalysis() {
    const result = analyzeBoltGroup(bolts, loads);
    setBolts(result.bolts);
    setActiveTab("results");
  }

  function renderLeftPanel() {
    if (activeTab === "file") {
      return <FilePanel settings={settings} setSettings={setSettings} />;
    }

    if (activeTab === "bolts") {
      return (
        <BoltPanel
          bolts={bolts}
          setBolts={setBolts}
          selectedBoltIds={selectedBoltIds}
          setSelectedBoltIds={setSelectedBoltIds}
          customBoltX={customBoltX}
          setCustomBoltX={setCustomBoltX}
          customBoltY={customBoltY}
          setCustomBoltY={setCustomBoltY}
        />
      );
    }

    if (activeTab === "loads") {
      return (
        <LoadPanel
          loads={loads}
          setLoads={setLoads}
          selectedLoadIds={selectedLoadIds}
          unitSystem={settings.unitSystem}
        />
      );
    }

    return (
      <div>
        <h2>Results</h2>
        <p>Run the analysis to update bolt force vectors.</p>
        <button onClick={runAnalysis}>Run Analysis</button>
      </div>
    );
  }

  return (
    <div
    style={{
      width: "100vw",
      height: "100vh",
      overflow: "hidden",
      display: "flex",
      background: isDark ? "#020617" : "#f8fafc",
      color: isDark ? "#e5e7eb" : "#111827",
    }}
  >
    <aside
      style={{
        flex: "0 0 30%",
        width: "30%",
        maxWidth: "30%",
        height: "100vh",
        boxSizing: "border-box",
        padding: 18,
        overflowY: "auto",
        overflowX: "hidden",
        background: isDark ? "#0f172a" : "#ffffff",
        borderRight: `1px solid ${isDark ? "#1e293b" : "#d1d5db"}`,
        boxShadow: "4px 0 20px rgba(0,0,0,0.15)",
        zIndex: 10,
      }}
    >
      {renderLeftPanel()}
    </aside>

    <main
      style={{
        flex: "1 1 70%",
        width: "70%",
        height: "100vh",
        minWidth: 0,
        position: "relative",
        overflow: "hidden",
      }}
    >
        {isCtrlSelecting && (activeTab === "bolts" || activeTab === "loads") && (
          <div
            style={{
              position: "absolute",
              top: 16,
              left: 16,
              zIndex: 20,
              padding: "10px 14px",
              borderRadius: 12,
              background: "rgba(37, 99, 235, 0.92)",
              color: "white",
              fontWeight: 800,
              boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
              pointerEvents: "none",
            }}
          >
            Ctrl Selection: Add to Selection
          </div>
        )}

        <button
          onClick={runAnalysis}
          style={{
            position: "absolute",
            top: 16,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10,
            padding: "10px 18px",
            borderRadius: 10,
            border: "none",
            background: "#2563eb",
            color: "white",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Run Analysis
        </button>

        <Canvas
          orthographic
          camera={{
            position: [0, 0, 30],
            up: [0, 1, 0],
            zoom: 40,
            near: 0.1,
            far: 1000,
          }}
        >
          <color attach="background" args={[isDark ? "#020617" : "#f8fafc"]} />

          {activeTab === "bolts" && (
            <BoltSelectionBox
              selectedBoltIds={selectedBoltIds}
              setSelectedBoltIds={setSelectedBoltIds}
              setHoveredBoltIds={setHoveredBoltIds}
              setIsCtrlSelecting={setIsCtrlSelecting}
            />
          )}

          {activeTab === "loads" && (
            <LoadSelectionBox
              setSelectedLoadIds={setSelectedLoadIds}
              setHoveredLoadIds={setHoveredLoadIds}
              setIsCtrlSelecting={setIsCtrlSelecting}
            />
          )}

          <ambientLight intensity={0.7} />
          <directionalLight position={[10, -10, 10]} intensity={1.2} />

          <Grid
            args={[50, 50]}
            cellSize={1}
            sectionSize={5}
            fadeDistance={30}
            rotation={[Math.PI / 2, 0, 0]}
            position={[0, 0, -0.05]}
          />

          {activeTab === "bolts" && (
            <CustomBoltPreviewDot
              x={Number(customBoltX) || 0}
              y={Number(customBoltY) || 0}
            />
          )}

          {loads.map((load) => (
            <AppliedLoadArrow
              key={load.id}
              load={{
                ...load,
                isSelected: selectedLoadIds.includes(load.id),
                isHovered: hoveredLoadIds.includes(load.id),
              }}
            />
          ))}

          {bolts.map((bolt) => (
            <Bolt
              key={bolt.id}
              bolt={{
                ...bolt,
                isSelected: selectedBoltIds.includes(bolt.id),
                isHovered: hoveredBoltIds.includes(bolt.id),
              }}
            />
          ))}

          <OrbitControls
            enableRotate={false}
            enablePan={!isCtrlSelecting}
            enableZoom={true}
            target={[0, 0, 0]}
          />
        </Canvas>

        <BottomDock activeTab={activeTab} setActiveTab={setActiveTab} />
      </main>
    </div>
  );
}

export default App;