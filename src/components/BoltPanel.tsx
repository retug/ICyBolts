import { useState, useEffect } from "react";

import type { BoltData } from "../types/bolts";
import { boltSizeOptions } from "../data/boltSizes";

type BoltPanelProps = {
  bolts: BoltData[];
  setBolts: React.Dispatch<React.SetStateAction<BoltData[]>>;
  selectedBoltIds: string[];
  setSelectedBoltIds: React.Dispatch<React.SetStateAction<string[]>>;
  customBoltX: number;
  setCustomBoltX: React.Dispatch<React.SetStateAction<number>>;
  customBoltY: number;
  setCustomBoltY: React.Dispatch<React.SetStateAction<number>>;
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
}: BoltPanelProps) {
  const [rows, setRows] = useState(2);
  const [cols, setCols] = useState(2);
  const [spacingX, setSpacingX] = useState(4);
  const [spacingY, setSpacingY] = useState(4);
  const [customX, setCustomX] = useState(0);
  const [customY, setCustomY] = useState(0);

  useEffect(() => {
  function onKeyDown(event: KeyboardEvent) {
    const activeElement =
      document.activeElement as HTMLElement | null;

    const isTyping =
      activeElement?.tagName === "INPUT" ||
      activeElement?.tagName === "TEXTAREA" ||
      activeElement?.tagName === "SELECT";

    if (isTyping) return;

    if (
      event.key === "Delete" ||
      event.key === "Backspace"
    ) {
      if (selectedBoltIds.length === 0) return;

      setBolts((prev) =>
        prev.filter(
          (bolt) =>
            !selectedBoltIds.includes(bolt.id)
        )
      );

      setSelectedBoltIds([]);
    }
  }

  window.addEventListener("keydown", onKeyDown);

  return () => {
    window.removeEventListener(
      "keydown",
      onKeyDown
    );
  };
}, [
  selectedBoltIds,
  setBolts,
  setSelectedBoltIds,
]);

  const selectedBolts = bolts.filter((bolt) =>
    selectedBoltIds.includes(bolt.id)
  );

  function updateBolt(
    id: string,
    field: keyof BoltData,
    value: string
  ) {
    setBolts((prev) =>
      prev.map((bolt) =>
        bolt.id === id
          ? {
              ...bolt,
              [field]:
                field === "label"
                  ? value
                  : Number(value),
            }
          : bolt
      )
    );
  }

  function updateBoltSize(label: string) {
    const selectedSize = boltSizeOptions.find(
      (size) => size.label === label
    );

    if (!selectedSize) return;

    setBolts((prev) =>
      prev.map((bolt) => ({
        ...bolt,
        label: selectedSize.label,
        unitSystem: selectedSize.unitSystem,
        diameter: selectedSize.diameter,
        renderSize: selectedSize.renderSize,
      }))
    );
  }

  function addParametricGridToAnalysis() {
    const selectedSize =
      boltSizeOptions.find(
        (b) => b.label === bolts[0]?.label
      ) ??
      boltSizeOptions.find(
        (b) => b.label === "3/4"
      )!;

    const generatedBolts: BoltData[] = [];

    const xStart =
      -((cols - 1) * spacingX) / 2;

    const yStart =
      -((rows - 1) * spacingY) / 2;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        generatedBolts.push({
          id: crypto.randomUUID(),
          label: selectedSize.label,
          x: xStart + c * spacingX,
          y: yStart + r * spacingY,
          unitSystem:
            selectedSize.unitSystem,
          diameter:
            selectedSize.diameter,
          renderSize:
            selectedSize.renderSize,
          force: {
            fx: 0,
            fy: 0,
          },
        });
      }
    }

    setBolts(generatedBolts);
  }

  function getCurrentBoltSize() {
  return (
    boltSizeOptions.find((b) => b.label === bolts[0]?.label) ??
    boltSizeOptions.find((b) => b.label === "3/4")!
  );
}

function addCustomBolt() {
  const selectedSize = getCurrentBoltSize();

  setBolts((prev) => [
    ...prev,
    {
      id: crypto.randomUUID(),
      label: selectedSize.label,
      x: customBoltX,
      y: customBoltY,
      unitSystem: selectedSize.unitSystem,
      diameter: selectedSize.diameter,
      renderSize: selectedSize.renderSize,
      force: {
        fx: 0,
        fy: 0,
      },
    },
  ]);
}

function deleteSelectedBolts() {
  setBolts((prev) =>
    prev.filter((bolt) => !selectedBoltIds.includes(bolt.id))
  );

  setSelectedBoltIds([]);
}

  return (
    <div
      style={{
        display: "grid",
        gap: 18,
      }}
    >
      <div>
        <h2
          style={{
            margin: 0,
            fontSize: 28,
          }}
        >
          Bolt Data
        </h2>

        <p
          style={{
            marginTop: 6,
            color: "#94a3b8",
            lineHeight: 1.45,
          }}
        >
          Create a parametric bolt
          group and edit selected
          bolts from the scene.
        </p>
      </div>

      <section style={cardStyle}>
        <h3 style={sectionTitleStyle}>
          Global Bolt Size
        </h3>

        <label style={labelStyle}>
          <span>Bolt Size</span>

          <select
            style={inputStyle}
            value={
              bolts[0]?.label ?? "3/4"
            }
            onChange={(e) =>
              updateBoltSize(
                e.target.value
              )
            }
          >
            {boltSizeOptions.map(
              (size) => (
                <option
                  key={`${size.unitSystem}-${size.label}`}
                  value={size.label}
                >
                  {size.unitSystem ===
                  "imperial"
                    ? `${size.label}"`
                    : size.label}
                </option>
              )
            )}
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
              onChange={(e) => setCustomBoltX(Number(e.target.value))}
            />
          </label>

          <label style={labelStyle}>
            <span>Y</span>
            <input
              style={inputStyle}
              type="number"
              step={0.25}
              value={customBoltY}
              onChange={(e) => setCustomBoltY(Number(e.target.value))}
            />
          </label>
        </div>

        <button style={primaryButtonStyle} onClick={addCustomBolt}>
          Add Bolt
        </button>
      </section>

      <section style={cardStyle}>
        <h3 style={sectionTitleStyle}>
          Parametric Grid
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "1fr 1fr",
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
              onChange={(e) =>
                setRows(
                  Number(
                    e.target.value
                  )
                )
              }
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
              onChange={(e) =>
                setCols(
                  Number(
                    e.target.value
                  )
                )
              }
            />
          </label>

          <label style={labelStyle}>
            <span>
              Horizontal Spacing
            </span>

            <input
              style={inputStyle}
              type="number"
              min={0}
              step={0.25}
              value={spacingX}
              onChange={(e) =>
                setSpacingX(
                  Number(
                    e.target.value
                  )
                )
              }
            />
          </label>

          <label style={labelStyle}>
            <span>
              Vertical Spacing
            </span>

            <input
              style={inputStyle}
              type="number"
              min={0}
              step={0.25}
              value={spacingY}
              onChange={(e) =>
                setSpacingY(
                  Number(
                    e.target.value
                  )
                )
              }
            />
          </label>
        </div>

        <button
          style={primaryButtonStyle}
          onClick={
            addParametricGridToAnalysis
          }
        >
          Add to Analysis
        </button>
      </section>

      <section style={cardStyle}>
        <h3 style={sectionTitleStyle}>
          Selected Bolts
        </h3>

        <button
  style={{
    ...primaryButtonStyle,
    background: selectedBoltIds.length > 0 ? "#dc2626" : "#94a3b8",
    cursor: selectedBoltIds.length > 0 ? "pointer" : "not-allowed",
  }}
  disabled={selectedBoltIds.length === 0}
  onClick={deleteSelectedBolts}
>
  Delete Selected Bolt{selectedBoltIds.length === 1 ? "" : "s"}
</button>

        {selectedBolts.length ===
          0 && (
          <p
            style={{
              color: "#64748b",
              fontSize: 13,
              margin: 0,
            }}
          >
            Drag a selection window
            in the scene to edit
            bolts.
          </p>
        )}

        {selectedBolts.length > 0 && (
          <div
            style={{
              maxHeight: 340,
              overflowY: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse:
                  "collapse",
                fontSize: 13,
              }}
            >
              <thead>
                <tr>
                  <th style={thStyle}>
                    Bolt
                  </th>

                  <th style={thStyle}>
                    X
                  </th>

                  <th style={thStyle}>
                    Y
                  </th>

                  <th style={thStyle}>
                    F
                  </th>
                </tr>
              </thead>

              <tbody>
                {selectedBolts.map(
                  (
                    bolt,
                    index
                  ) => (
                    <tr
                      key={bolt.id}
                    >
                      <td
                        style={
                          tdStyle
                        }
                      >
                        B
                        {index +
                          1}
                      </td>

                      <td
                        style={
                          tdStyle
                        }
                      >
                        <input
                          style={
                            tableInputStyle
                          }
                          type="number"
                          value={
                            bolt.x
                          }
                          step={
                            0.25
                          }
                          onChange={(
                            e
                          ) =>
                            updateBolt(
                              bolt.id,
                              "x",
                              e
                                .target
                                .value
                            )
                          }
                        />
                      </td>

                      <td
                        style={
                          tdStyle
                        }
                      >
                        <input
                          style={
                            tableInputStyle
                          }
                          type="number"
                          value={
                            bolt.y
                          }
                          step={
                            0.25
                          }
                          onChange={(
                            e
                          ) =>
                            updateBolt(
                              bolt.id,
                              "y",
                              e
                                .target
                                .value
                            )
                          }
                        />
                      </td>

                      <td
                        style={
                          tdStyle
                        }
                      >
                        {bolt.force?.magnitude?.toFixed(
                          2
                        ) ?? "-"}
                      </td>
                    </tr>
                  )
                )}
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