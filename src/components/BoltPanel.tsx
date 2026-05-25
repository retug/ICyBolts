import { useState } from "react";
import type { AppSettings } from "../types/app";
import type { CurrentBoltData } from "../App";
import type {
  BoltData,
  BoltDesignation,
  BoltShearPlane,
  BoltThreadCondition,
  BoltType,
} from "../types/bolts";

import {
  boltSizeOptions,
  slipCriticalFayingSurfaces,
  getBoltShearStrength,
} from "../data/boltSizes";

import type {
  SlipCriticalFayingSurface,
  SlipCriticalHoleType,
} from "../data/boltSizes";

type BoltPanelProps = {
  bolts: BoltData[];
  setBolts: React.Dispatch<React.SetStateAction<BoltData[]>>;
  selectedBoltIds: string[];
  setSelectedBoltIds: React.Dispatch<React.SetStateAction<string[]>>;
  customBoltX: string;
  setCustomBoltX: React.Dispatch<React.SetStateAction<string>>;
  customBoltY: string;
  setCustomBoltY: React.Dispatch<React.SetStateAction<string>>;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;

  currentBoltData: CurrentBoltData;
  setCurrentBoltData: React.Dispatch<React.SetStateAction<CurrentBoltData>>;
};

export function BoltPanel({
  bolts,
  setBolts,
  selectedBoltIds,
  setSelectedBoltIds,
  customBoltX,
  setCustomBoltX,
  customBoltY,
  setCustomBoltY,
  settings,
  setSettings,
  currentBoltData,
  setCurrentBoltData,
}: BoltPanelProps) {
  const [rows, setRows] = useState(2);
  const [cols, setCols] = useState(2);
  const [spacingX, setSpacingX] = useState(4);
  const [spacingY, setSpacingY] = useState(4);

  const {
    designation,
    threadCondition,
    shearPlane,
    fayingSurface,
    holeType,
    boltType = "bearing",
  } = currentBoltData;

  const selectedBolts = bolts.filter((bolt) =>
    selectedBoltIds.includes(bolt.id)
  );

  const selectedSize =
    boltSizeOptions.find((b) => b.label === currentBoltData.label) ??
    boltSizeOptions.find((b) => b.label === bolts[0]?.label) ??
    boltSizeOptions.find((b) => b.label === "3/4") ??
    boltSizeOptions[0];

  function updateSetting<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function getDesignPatch({
    diameterLabel,
    nextDesignation = designation,
    nextThreadCondition = threadCondition,
    nextShearPlane = shearPlane,
    nextFayingSurface = fayingSurface,
    nextHoleType = holeType,
    nextBoltType = boltType,
  }: {
    diameterLabel: string;
    nextDesignation?: BoltDesignation;
    nextThreadCondition?: BoltThreadCondition;
    nextShearPlane?: BoltShearPlane;
    nextFayingSurface?: SlipCriticalFayingSurface;
    nextHoleType?: SlipCriticalHoleType;
    nextBoltType?: BoltType;
  }) {
    const tc =
      nextDesignation === "A307" ? "not-applicable" : nextThreadCondition;

    const mu = slipCriticalFayingSurfaces[nextFayingSurface].mu;

    const strength = getBoltShearStrength({
      boltType: nextBoltType,
      designation: nextDesignation,
      threadCondition: tc,
      diameterLabel,
      shearPlane: nextShearPlane,
      fayingSurface: nextFayingSurface,
      holeType: nextHoleType,
    });

    const capacity =
      settings.designMethod === "ASD"
        ? strength.asd ?? undefined
        : strength.lrfd ?? undefined;

    return {
      boltType: nextBoltType,
      designation: nextDesignation,
      threadCondition: tc,
      shearPlane: nextShearPlane,
      fayingSurface: nextFayingSurface,
      holeType: nextHoleType,
      mu,
      shearStrength: strength,
      slipCriticalStrength:
        nextBoltType === "slip-critical" ? strength : undefined,
      capacity,
      omega: settings.designMethod === "ASD" ? 2.0 : undefined,
      phi: settings.designMethod === "LRFD" ? 0.75 : undefined,
    };
  }

  function updateCurrentBoltData<K extends keyof CurrentBoltData>(
    key: K,
    value: CurrentBoltData[K]
  ) {
    setCurrentBoltData((prev) => ({
      ...prev,
      [key]: value,
    }));

    setBolts((prev) =>
      prev.map((bolt) => ({
        ...bolt,
        [key]: value,
      }))
    );
  }

  function updateBolt(id: string, field: keyof BoltData, value: string) {
    setBolts((prev) =>
      prev.map((bolt) =>
        bolt.id === id
          ? {
              ...bolt,
              [field]: field === "label" ? value : Number(value),
            }
          : bolt
      )
    );
  }

  function applyDesignOptionsToBolts(
    nextDesignation = designation,
    nextThreadCondition = threadCondition,
    nextShearPlane = shearPlane,
    nextFayingSurface = fayingSurface,
    nextHoleType = holeType,
    nextBoltType = boltType
  ) {
    const currentPatch = getDesignPatch({
      diameterLabel: currentBoltData.label,
      nextDesignation,
      nextThreadCondition,
      nextShearPlane,
      nextFayingSurface,
      nextHoleType,
      nextBoltType,
    });

    setCurrentBoltData((prev) => ({
      ...prev,
      ...currentPatch,
    }));

    setBolts((prev) =>
      prev.map((bolt) => {
        const patch = getDesignPatch({
          diameterLabel: bolt.label,
          nextDesignation,
          nextThreadCondition,
          nextShearPlane,
          nextFayingSurface,
          nextHoleType,
          nextBoltType,
        });

        return {
          ...bolt,
          ...patch,
        };
      })
    );
  }

  function updateBoltSize(label: string) {
    const size = boltSizeOptions.find((option) => option.label === label);
    if (!size) return;

    const patch = getDesignPatch({
      diameterLabel: size.label,
    });

    setCurrentBoltData((prev) => ({
      ...prev,
      label: size.label,
      unitSystem: size.unitSystem,
      diameter: size.diameter,
      renderSize: size.renderSize,
      ...patch,
    }));

    setBolts((prev) =>
      prev.map((bolt) => ({
        ...bolt,
        label: size.label,
        unitSystem: size.unitSystem,
        diameter: size.diameter,
        renderSize: size.renderSize,
        ...patch,
      }))
    );
  }

  function addCustomBolt() {
    const x = Number(customBoltX);
    const y = Number(customBoltY);

    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    if (!selectedSize) return;

    const patch = getDesignPatch({
      diameterLabel: selectedSize.label,
    });

    const newBolt: BoltData = {
      id: crypto.randomUUID(),
      label: selectedSize.label,
      x,
      y,
      unitSystem: selectedSize.unitSystem,
      diameter: selectedSize.diameter,
      renderSize: selectedSize.renderSize,
      ...patch,
      force: {
        fx: 0,
        fy: 0,
      },
    };

    setBolts((prev) => [...prev, newBolt]);
    setSelectedBoltIds([newBolt.id]);
  }

  function addParametricGridToAnalysis() {
    if (!selectedSize) return;

    const patch = getDesignPatch({
      diameterLabel: selectedSize.label,
    });

    const generatedBolts: BoltData[] = [];

    const xStart = -((cols - 1) * spacingX) / 2;
    const yStart = -((rows - 1) * spacingY) / 2;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        generatedBolts.push({
          id: crypto.randomUUID(),
          label: selectedSize.label,
          x: xStart + c * spacingX,
          y: yStart + r * spacingY,
          unitSystem: selectedSize.unitSystem,
          diameter: selectedSize.diameter,
          renderSize: selectedSize.renderSize,
          ...patch,
          force: {
            fx: 0,
            fy: 0,
          },
        });
      }
    }

    setBolts(generatedBolts);
    setSelectedBoltIds([]);
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 28 }}>Bolt Data</h2>
      </div>

      <section style={cardStyle}>
        <h3 style={sectionTitleStyle}>Connection Type</h3>

        <label style={labelStyle}>
          <span>Bolt Type</span>
          <select
            style={inputStyle}
            value={boltType}
            onChange={(e) => {
              const value = e.target.value as BoltType;

              setCurrentBoltData((prev) => ({
                ...prev,
                boltType: value,
              }));

              applyDesignOptionsToBolts(
                designation,
                threadCondition,
                shearPlane,
                fayingSurface,
                holeType,
                value
              );
            }}
          >
            <option value="bearing">Bearing</option>
            <option value="slip-critical">Slip Critical</option>
          </select>
        </label>

        {boltType === "slip-critical" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            <label style={labelStyle}>
              <span>Faying Surface</span>
              <select
                style={inputStyle}
                value={fayingSurface}
                onChange={(e) => {
                  const value = e.target.value as SlipCriticalFayingSurface;

                  updateCurrentBoltData("fayingSurface", value);

                  applyDesignOptionsToBolts(
                    designation,
                    threadCondition,
                    shearPlane,
                    value,
                    holeType
                  );
                }}
              >
                <option value="Class A">Class A - μ = 0.30</option>
                <option value="Class B">Class B - μ = 0.50</option>
              </select>
            </label>

            <label style={labelStyle}>
              <span>Hole Type</span>
              <select
                style={inputStyle}
                value={holeType}
                onChange={(e) => {
                  const value = e.target.value as SlipCriticalHoleType;

                  updateCurrentBoltData("holeType", value);

                  applyDesignOptionsToBolts(
                    designation,
                    threadCondition,
                    shearPlane,
                    fayingSurface,
                    value
                  );
                }}
              >
                <option value="STD/SSLT">STD / SSLT</option>
                <option value="OVS/SSLP">OVS / SSLP</option>
                <option value="LSL">LSL</option>
              </select>
            </label>
          </div>
        )}
      </section>

      <section style={cardStyle}>
        <h3 style={sectionTitleStyle}>Global Bolt Size</h3>

        <label style={labelStyle}>
          <span>Bolt Size</span>
          <select
            style={inputStyle}
            value={currentBoltData.label}
            onChange={(e) => updateBoltSize(e.target.value)}
          >
            {boltSizeOptions.map((size) => (
              <option
                key={`${size.unitSystem}-${size.label}`}
                value={size.label}
              >
                {size.unitSystem === "imperial"
                  ? `${size.label}"`
                  : size.label}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section style={cardStyle}>
        <h3 style={sectionTitleStyle}>Bolt Design Options</h3>

        <label style={labelStyle}>
          <span>Bolt Designation</span>
          <select
            style={inputStyle}
            value={designation}
            onChange={(e) => {
              const value = e.target.value as BoltDesignation;
              const tc =
                value === "A307" ? "not-applicable" : threadCondition;

              updateCurrentBoltData("designation", value);
              updateCurrentBoltData("threadCondition", tc);

              applyDesignOptionsToBolts(
                value,
                tc,
                shearPlane,
                fayingSurface,
                holeType
              );
            }}
          >
            <option value="Group A">Group A</option>
            <option value="Group B">Group B</option>
            <option value="Group C">Group C</option>
            <option value="A307">A307</option>
          </select>
        </label>

        <label style={labelStyle}>
          <span>Thread Condition</span>
          <select
            style={inputStyle}
            value={threadCondition}
            disabled={designation === "A307"}
            onChange={(e) => {
              const value = e.target.value as BoltThreadCondition;

              updateCurrentBoltData("threadCondition", value);

              applyDesignOptionsToBolts(
                designation,
                value,
                shearPlane,
                fayingSurface,
                holeType
              );
            }}
          >
            <option value="N">N - Threads Included</option>
            <option value="X">X - Threads Excluded</option>
            <option value="not-applicable">Not Applicable</option>
          </select>
        </label>

        <label style={labelStyle}>
          <span>Shear Plane</span>
          <select
            style={inputStyle}
            value={shearPlane}
            onChange={(e) => {
              const value = e.target.value as BoltShearPlane;

              updateCurrentBoltData("shearPlane", value);

              applyDesignOptionsToBolts(
                designation,
                threadCondition,
                value,
                fayingSurface,
                holeType
              );
            }}
          >
            <option value="single">Single Shear</option>
            <option value="double">Double Shear</option>
          </select>
        </label>
      </section>

      <section style={cardStyle}>
        <h3 style={sectionTitleStyle}>Custom Bolt</h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          <label style={labelStyle}>
            <span>X</span>
            <input
              style={inputStyle}
              type="number"
              step={0.25}
              value={customBoltX}
              onChange={(e) => setCustomBoltX(e.target.value)}
            />
          </label>

          <label style={labelStyle}>
            <span>Y</span>
            <input
              style={inputStyle}
              type="number"
              step={0.25}
              value={customBoltY}
              onChange={(e) => setCustomBoltY(e.target.value)}
            />
          </label>
        </div>

        <button style={primaryButtonStyle} onClick={addCustomBolt}>
          Add Custom Bolt
        </button>
      </section>

      <section style={cardStyle}>
        <h3 style={sectionTitleStyle}>Parametric Grid</h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          <label style={labelStyle}>
            <span>Rows</span>
            <input
              style={inputStyle}
              type="number"
              min={1}
              step={1}
              value={rows}
              onChange={(e) => setRows(Number(e.target.value))}
            />
          </label>

          <label style={labelStyle}>
            <span>Columns</span>
            <input
              style={inputStyle}
              type="number"
              min={1}
              step={1}
              value={cols}
              onChange={(e) => setCols(Number(e.target.value))}
            />
          </label>

          <label style={labelStyle}>
            <span>Horizontal Spacing</span>
            <input
              style={inputStyle}
              type="number"
              min={0}
              step={0.25}
              value={spacingX}
              onChange={(e) => setSpacingX(Number(e.target.value))}
            />
          </label>

          <label style={labelStyle}>
            <span>Vertical Spacing</span>
            <input
              style={inputStyle}
              type="number"
              min={0}
              step={0.25}
              value={spacingY}
              onChange={(e) => setSpacingY(Number(e.target.value))}
            />
          </label>
        </div>

        <button style={primaryButtonStyle} onClick={addParametricGridToAnalysis}>
          Add to Analysis
        </button>
      </section>

      <section style={cardStyle}>
        <h3 style={sectionTitleStyle}>Selected Bolts</h3>

        {selectedBolts.length === 0 && (
          <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>
            Drag a selection window in the scene to edit bolts.
          </p>
        )}

        {selectedBolts.length > 0 && (
          <div style={{ maxHeight: 340, overflowY: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
              }}
            >
              <thead>
                <tr>
                  <th style={thStyle}>Bolt</th>
                  <th style={thStyle}>X</th>
                  <th style={thStyle}>Y</th>
                  <th style={thStyle}>Force</th>
                </tr>
              </thead>

              <tbody>
                {selectedBolts.map((bolt, index) => (
                  <tr key={bolt.id}>
                    <td style={tdStyle}>B{index + 1}</td>

                    <td style={tdStyle}>
                      <input
                        style={tableInputStyle}
                        type="number"
                        value={bolt.x}
                        step={0.25}
                        onChange={(e) =>
                          updateBolt(bolt.id, "x", e.target.value)
                        }
                      />
                    </td>

                    <td style={tdStyle}>
                      <input
                        style={tableInputStyle}
                        type="number"
                        value={bolt.y}
                        step={0.25}
                        onChange={(e) =>
                          updateBolt(bolt.id, "y", e.target.value)
                        }
                      />
                    </td>

                    <td style={tdStyle}>
                      {bolt.force?.magnitude?.toFixed(2) ?? "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  padding: 16,
  borderRadius: 18,
  background: "#f8fafc",
  border: "1px solid #e5e7eb",
  display: "grid",
  gap: 14,
};

const sectionTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 18,
};

const labelStyle: React.CSSProperties = {
  display: "grid",
  gap: 6,
  fontSize: 13,
  fontWeight: 700,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #d1d5db",
  background: "#ffffff",
  color: "#111827",
  fontWeight: 600,
};

const primaryButtonStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "none",
  background: "#2563eb",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "8px 6px",
  borderBottom: "1px solid #cbd5e1",
  color: "#334155",
};

const tdStyle: React.CSSProperties = {
  padding: "6px",
  borderBottom: "1px solid #e5e7eb",
};

const tableInputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "6px 8px",
  borderRadius: 8,
  border: "1px solid #d1d5db",
};