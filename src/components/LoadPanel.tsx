import { useState } from "react";

import type { AppliedLoad, LoadInputMode, UnitSystem } from "../types/bolts";

type LoadPanelProps = {
  loads: AppliedLoad[];
  setLoads: React.Dispatch<React.SetStateAction<AppliedLoad[]>>;
  selectedLoadIds: string[];
  unitSystem: UnitSystem;
  isDark?: boolean;
};

type NumberTextByLoad = Record<string, Record<string, string>>;

const KIP_TO_KN = 4.4482216153;
const KIP_IN_TO_KN_MM = 112.9848290276;

function isValidNumberText(value: string) {
  if (value.trim() === "") return false;
  if (value === "-") return false;
  return Number.isFinite(Number(value));
}

function toDisplayForce(valueKip: number, unitSystem: UnitSystem) {
  return unitSystem === "metric" ? valueKip * KIP_TO_KN : valueKip;
}

function fromDisplayForce(value: number, unitSystem: UnitSystem) {
  return unitSystem === "metric" ? value / KIP_TO_KN : value;
}

function toDisplayMoment(valueKipIn: number, unitSystem: UnitSystem) {
  return unitSystem === "metric" ? valueKipIn * KIP_IN_TO_KN_MM : valueKipIn;
}

function fromDisplayMoment(value: number, unitSystem: UnitSystem) {
  return unitSystem === "metric" ? value / KIP_IN_TO_KN_MM : value;
}

export function LoadPanel({
  loads,
  setLoads,
  selectedLoadIds,
  unitSystem,
  isDark = true,
}: LoadPanelProps) {
  const [newLoadX, setNewLoadX] = useState("0");
  const [newLoadY, setNewLoadY] = useState("0");
  const [newLoadMagnitude, setNewLoadMagnitude] = useState("10");
  const [newLoadAngleDeg, setNewLoadAngleDeg] = useState("0");
  const [newLoadFx, setNewLoadFx] = useState("10");
  const [newLoadFy, setNewLoadFy] = useState("0");
  const [newLoadMoment, setNewLoadMoment] = useState("0");
  const [newLoadInputMode, setNewLoadInputMode] =
    useState<LoadInputMode>("magnitude-angle");

  const [draftValues, setDraftValues] = useState<NumberTextByLoad>({});

  const styles = getStyles(isDark);

  const forceUnit = unitSystem === "metric" ? "kN" : "kips";
  const momentUnit = unitSystem === "metric" ? "kN-mm" : "kip-in";

  const selectedLoads = loads.filter((load) =>
    selectedLoadIds.includes(load.id)
  );

  function getDraft(load: AppliedLoad, field: keyof AppliedLoad) {
    const existing = draftValues[load.id]?.[field as string];

    if (existing !== undefined) return existing;

    const value = load[field];

    if (typeof value !== "number") return String(value ?? "");

    if (field === "magnitude" || field === "fx" || field === "fy") {
      return String(toDisplayForce(value, unitSystem));
    }

    if (field === "moment") {
      return String(toDisplayMoment(value, unitSystem));
    }

    return String(value);
  }

  function updateDraft(id: string, field: keyof AppliedLoad, value: string) {
    setDraftValues((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] ?? {}),
        [field]: value,
      },
    }));

    if (!isValidNumberText(value)) return;

    const numericValue = Number(value);

    setLoads((prev) =>
      prev.map((load) => {
        if (load.id !== id) return load;

        if (field === "magnitude") {
          const magnitude = fromDisplayForce(numericValue, unitSystem);
          const angleRad = (load.angleDeg * Math.PI) / 180;

          return {
            ...load,
            magnitude,
            fx: magnitude * Math.cos(angleRad),
            fy: magnitude * Math.sin(angleRad),
          };
        }

        if (field === "angleDeg") {
          const angleDeg = numericValue;
          const angleRad = (angleDeg * Math.PI) / 180;

          return {
            ...load,
            angleDeg,
            fx: load.magnitude * Math.cos(angleRad),
            fy: load.magnitude * Math.sin(angleRad),
          };
        }

        if (field === "fx" || field === "fy") {
          const currentFx =
            field === "fx" ? fromDisplayForce(numericValue, unitSystem) : load.fx;

          const currentFy =
            field === "fy" ? fromDisplayForce(numericValue, unitSystem) : load.fy;

          return {
            ...load,
            fx: currentFx,
            fy: currentFy,
            magnitude: Math.sqrt(currentFx ** 2 + currentFy ** 2),
            angleDeg: (Math.atan2(currentFy, currentFx) * 180) / Math.PI,
          };
        }

        if (field === "moment") {
          return {
            ...load,
            moment: fromDisplayMoment(numericValue, unitSystem),
          };
        }

        if (field === "x" || field === "y") {
          return {
            ...load,
            [field]: numericValue,
          };
        }

        return load;
      })
    );
  }

  function updateLoadText(id: string, field: keyof AppliedLoad, value: string) {
    setLoads((prev) =>
      prev.map((load) =>
        load.id === id
          ? {
              ...load,
              [field]: value,
            }
          : load
      )
    );
  }

  function updateInputMode(id: string, inputMode: LoadInputMode) {
    setLoads((prev) =>
      prev.map((load) =>
        load.id === id
          ? {
              ...load,
              inputMode,
            }
          : load
      )
    );
  }

  function addLoad() {
    if (
      !isValidNumberText(newLoadX) ||
      !isValidNumberText(newLoadY) ||
      !isValidNumberText(newLoadMoment)
    ) {
      return;
    }

    const x = Number(newLoadX);
    const y = Number(newLoadY);
    const moment = fromDisplayMoment(Number(newLoadMoment), unitSystem);

    let magnitude = 0;
    let angleDeg = 0;
    let fx = 0;
    let fy = 0;

    if (newLoadInputMode === "magnitude-angle") {
      if (!isValidNumberText(newLoadMagnitude) || !isValidNumberText(newLoadAngleDeg)) {
        return;
      }

      magnitude = fromDisplayForce(Number(newLoadMagnitude), unitSystem);
      angleDeg = Number(newLoadAngleDeg);

      const angleRad = (angleDeg * Math.PI) / 180;

      fx = magnitude * Math.cos(angleRad);
      fy = magnitude * Math.sin(angleRad);
    } else {
      if (!isValidNumberText(newLoadFx) || !isValidNumberText(newLoadFy)) {
        return;
      }

      fx = fromDisplayForce(Number(newLoadFx), unitSystem);
      fy = fromDisplayForce(Number(newLoadFy), unitSystem);

      magnitude = Math.sqrt(fx ** 2 + fy ** 2);
      angleDeg = (Math.atan2(fy, fx) * 180) / Math.PI;
    }

    setLoads((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        label: `P${prev.length + 1}`,
        x,
        y,
        inputMode: newLoadInputMode,
        magnitude,
        angleDeg,
        fx,
        fy,
        moment,
      },
    ]);
  }

  function deleteSelectedLoads() {
    setLoads((prev) => prev.filter((load) => !selectedLoadIds.includes(load.id)));
  }

  function removeLoad(id: string) {
    setLoads((prev) => prev.filter((load) => load.id !== id));
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div>
        <h2 style={styles.pageTitle}>Load Data</h2>

        <p style={styles.pageSubtitle}>
          Add applied loads and edit selected loads from the scene.
        </p>
      </div>

      <section style={styles.card}>
        <h3 style={styles.sectionTitle}>Add Load</h3>

        <label style={styles.label}>
          <span>Input Mode</span>

          <select
            style={styles.input}
            value={newLoadInputMode}
            onChange={(e) => setNewLoadInputMode(e.target.value as LoadInputMode)}
          >
            <option value="magnitude-angle">Force + Angle</option>
            <option value="components">Fx + Fy</option>
          </select>
        </label>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label style={styles.label}>
            <span>X Location</span>
            <input
              style={{
                ...styles.input,
                ...invalidStyle(newLoadX, isDark),
              }}
              value={newLoadX}
              onChange={(e) => setNewLoadX(e.target.value)}
            />
          </label>

          <label style={styles.label}>
            <span>Y Location</span>
            <input
              style={{
                ...styles.input,
                ...invalidStyle(newLoadY, isDark),
              }}
              value={newLoadY}
              onChange={(e) => setNewLoadY(e.target.value)}
            />
          </label>

          {newLoadInputMode === "magnitude-angle" ? (
            <>
              <label style={styles.label}>
                <span>Force ({forceUnit})</span>
                <input
                  style={{
                    ...styles.input,
                    ...invalidStyle(newLoadMagnitude, isDark),
                  }}
                  value={newLoadMagnitude}
                  onChange={(e) => setNewLoadMagnitude(e.target.value)}
                />
              </label>

              <label style={styles.label}>
                <span>Angle (deg)</span>
                <input
                  style={{
                    ...styles.input,
                    ...invalidStyle(newLoadAngleDeg, isDark),
                  }}
                  value={newLoadAngleDeg}
                  onChange={(e) => setNewLoadAngleDeg(e.target.value)}
                />
              </label>
            </>
          ) : (
            <>
              <label style={styles.label}>
                <span>Fx ({forceUnit})</span>
                <input
                  style={{
                    ...styles.input,
                    ...invalidStyle(newLoadFx, isDark),
                  }}
                  value={newLoadFx}
                  onChange={(e) => setNewLoadFx(e.target.value)}
                />
              </label>

              <label style={styles.label}>
                <span>Fy ({forceUnit})</span>
                <input
                  style={{
                    ...styles.input,
                    ...invalidStyle(newLoadFy, isDark),
                  }}
                  value={newLoadFy}
                  onChange={(e) => setNewLoadFy(e.target.value)}
                />
              </label>
            </>
          )}

          <label style={styles.label}>
            <span>Moment ({momentUnit})</span>
            <input
              style={{
                ...styles.input,
                ...invalidStyle(newLoadMoment, isDark),
              }}
              value={newLoadMoment}
              onChange={(e) => setNewLoadMoment(e.target.value)}
            />
          </label>
        </div>

        <button style={styles.primaryButton} onClick={addLoad}>
          Add Load
        </button>
      </section>

      <section style={styles.card}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "center",
          }}
        >
          <h3 style={styles.sectionTitle}>Selected Loads</h3>

          <button
            style={{
              ...styles.dangerButton,
              opacity: selectedLoads.length === 0 ? 0.45 : 1,
              cursor: selectedLoads.length === 0 ? "not-allowed" : "pointer",
            }}
            disabled={selectedLoads.length === 0}
            onClick={deleteSelectedLoads}
          >
            Delete
          </button>
        </div>

        {selectedLoads.length === 0 && (
          <p style={styles.emptyText}>
            Drag a selection window in the scene to edit loads.
          </p>
        )}

        {selectedLoads.length > 0 && (
          <div style={{ maxHeight: 440, overflowY: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Load</th>
                  <th style={styles.th}>X</th>
                  <th style={styles.th}>Y</th>
                  <th style={styles.th}>Mode</th>
                  <th style={styles.th}>Force</th>
                  <th style={styles.th}>Angle / Fy</th>
                  <th style={styles.th}>M</th>
                  <th style={styles.th}></th>
                </tr>
              </thead>

              <tbody>
                {selectedLoads.map((load) => (
                  <tr key={load.id}>
                    <td style={styles.td}>
                      <input
                        style={styles.tableInput}
                        value={load.label}
                        onChange={(e) =>
                          updateLoadText(load.id, "label", e.target.value)
                        }
                      />
                    </td>

                    <td style={styles.td}>
                      <input
                        style={{
                          ...styles.tableInput,
                          ...invalidStyle(getDraft(load, "x"), isDark),
                        }}
                        value={getDraft(load, "x")}
                        onChange={(e) => updateDraft(load.id, "x", e.target.value)}
                      />
                    </td>

                    <td style={styles.td}>
                      <input
                        style={{
                          ...styles.tableInput,
                          ...invalidStyle(getDraft(load, "y"), isDark),
                        }}
                        value={getDraft(load, "y")}
                        onChange={(e) => updateDraft(load.id, "y", e.target.value)}
                      />
                    </td>

                    <td style={styles.td}>
                      <select
                        style={styles.tableInput}
                        value={load.inputMode}
                        onChange={(e) =>
                          updateInputMode(load.id, e.target.value as LoadInputMode)
                        }
                      >
                        <option value="magnitude-angle">F/Ang</option>
                        <option value="components">Fx/Fy</option>
                      </select>
                    </td>

                    {load.inputMode === "magnitude-angle" ? (
                      <>
                        <td style={styles.td}>
                          <input
                            style={{
                              ...styles.tableInput,
                              ...invalidStyle(getDraft(load, "magnitude"), isDark),
                            }}
                            value={getDraft(load, "magnitude")}
                            onChange={(e) =>
                              updateDraft(load.id, "magnitude", e.target.value)
                            }
                          />
                        </td>

                        <td style={styles.td}>
                          <input
                            style={{
                              ...styles.tableInput,
                              ...invalidStyle(getDraft(load, "angleDeg"), isDark),
                            }}
                            value={getDraft(load, "angleDeg")}
                            onChange={(e) =>
                              updateDraft(load.id, "angleDeg", e.target.value)
                            }
                          />
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={styles.td}>
                          <input
                            style={{
                              ...styles.tableInput,
                              ...invalidStyle(getDraft(load, "fx"), isDark),
                            }}
                            value={getDraft(load, "fx")}
                            onChange={(e) =>
                              updateDraft(load.id, "fx", e.target.value)
                            }
                          />
                        </td>

                        <td style={styles.td}>
                          <input
                            style={{
                              ...styles.tableInput,
                              ...invalidStyle(getDraft(load, "fy"), isDark),
                            }}
                            value={getDraft(load, "fy")}
                            onChange={(e) =>
                              updateDraft(load.id, "fy", e.target.value)
                            }
                          />
                        </td>
                      </>
                    )}

                    <td style={styles.td}>
                      <input
                        style={{
                          ...styles.tableInput,
                          ...invalidStyle(getDraft(load, "moment"), isDark),
                        }}
                        value={getDraft(load, "moment")}
                        onChange={(e) =>
                          updateDraft(load.id, "moment", e.target.value)
                        }
                      />
                    </td>

                    <td style={styles.td}>
                      <button
                        style={styles.smallDangerButton}
                        onClick={() => removeLoad(load.id)}
                      >
                        Del
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p style={styles.noteText}>
              Force units: {forceUnit}. Moment units: {momentUnit}. Internal
              backend units remain kip and inches.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function invalidStyle(value: string, isDark: boolean): React.CSSProperties {
  return isValidNumberText(value)
    ? {}
    : {
        border: "1px solid #ef4444",
        background: isDark ? "rgba(127, 29, 29, 0.35)" : "#fee2e2",
        color: isDark ? "#fecaca" : "#7f1d1d",
      };
}

function getStyles(isDark: boolean): Record<string, React.CSSProperties> {
  return {
    pageTitle: {
      margin: 0,
      fontSize: 28,
      color: isDark ? "#f8fafc" : "#111827",
    },

    pageSubtitle: {
      marginTop: 8,
      color: isDark ? "#94a3b8" : "#64748b",
      lineHeight: 1.45,
      fontSize: 14,
    },

    card: {
      padding: 16,
      borderRadius: 18,
      background: isDark ? "#111827" : "#f8fafc",
      border: `1px solid ${isDark ? "#1e293b" : "#e5e7eb"}`,
      display: "grid",
      gap: 14,
      boxShadow: isDark ? "none" : "0 8px 22px rgba(15, 23, 42, 0.06)",
    },

    sectionTitle: {
      margin: 0,
      fontSize: 18,
      color: isDark ? "#f8fafc" : "#111827",
      fontWeight: 800,
    },

    label: {
      display: "grid",
      gap: 6,
      fontSize: 13,
      fontWeight: 700,
      color: isDark ? "#dbeafe" : "#334155",
    },

    input: {
      width: "100%",
      boxSizing: "border-box",
      padding: "10px 12px",
      borderRadius: 10,
      border: `1px solid ${isDark ? "#334155" : "#d1d5db"}`,
      background: isDark ? "#020617" : "#ffffff",
      color: isDark ? "#f8fafc" : "#111827",
      fontWeight: 700,
      outline: "none",
    },

    primaryButton: {
      width: "100%",
      padding: "12px 14px",
      borderRadius: 12,
      border: "none",
      background: "#2563eb",
      color: "white",
      fontWeight: 800,
      cursor: "pointer",
    },

    dangerButton: {
      padding: "8px 12px",
      borderRadius: 10,
      border: "none",
      background: "#dc2626",
      color: "white",
      fontWeight: 800,
    },

    smallDangerButton: {
      padding: "6px 8px",
      borderRadius: 8,
      border: "none",
      background: "#dc2626",
      color: "white",
      fontWeight: 800,
      cursor: "pointer",
    },

    table: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: 12,
      color: isDark ? "#e5e7eb" : "#111827",
    },

    th: {
      textAlign: "left",
      padding: "8px 6px",
      borderBottom: `1px solid ${isDark ? "#334155" : "#cbd5e1"}`,
      color: isDark ? "#93c5fd" : "#334155",
      fontSize: 11,
      textTransform: "uppercase",
      letterSpacing: "0.04em",
    },

    td: {
      padding: "6px",
      borderBottom: `1px solid ${isDark ? "#1e293b" : "#e5e7eb"}`,
      verticalAlign: "top",
      color: isDark ? "#e5e7eb" : "#111827",
    },

    tableInput: {
      width: "100%",
      minWidth: 58,
      boxSizing: "border-box",
      padding: "6px 8px",
      borderRadius: 8,
      border: `1px solid ${isDark ? "#334155" : "#d1d5db"}`,
      background: isDark ? "#020617" : "#ffffff",
      color: isDark ? "#f8fafc" : "#111827",
      fontWeight: 700,
      outline: "none",
    },

    emptyText: {
      color: isDark ? "#94a3b8" : "#64748b",
      fontSize: 13,
      margin: 0,
    },

    noteText: {
      color: isDark ? "#94a3b8" : "#64748b",
      fontSize: 12,
      marginBottom: 0,
    },
  };
}