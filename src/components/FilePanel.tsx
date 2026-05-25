import type { AppSettings } from "../types/app";

type FilePanelProps = {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
};

export function FilePanel({ settings, setSettings }: FilePanelProps) {
  const isDark = settings.theme === "dark";

  function updateSetting<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: `1px solid ${isDark ? "#334155" : "#d1d5db"}`,
    background: isDark ? "#020617" : "#f8fafc",
    color: isDark ? "#e5e7eb" : "#111827",
    fontWeight: 600,
  };

  return (
    <div style={{ display: "grid", gap: 22 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 32, letterSpacing: "-0.04em" }}>
          File
        </h1>

        <p style={{ marginTop: 8, color: isDark ? "#94a3b8" : "#64748b" }}>
          Set up the ICyBolts project, units, design standard, and file storage.
        </p>
      </div>

      <section
        style={{
          padding: 16,
          borderRadius: 18,
          background: isDark ? "#111827" : "#f8fafc",
          border: `1px solid ${isDark ? "#1e293b" : "#e5e7eb"}`,
          display: "grid",
          gap: 18,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 18 }}>Project Settings</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
          }}
        >
          <label style={{ display: "grid", gap: 6 }}>
            <span>Theme</span>

            <select
              style={inputStyle}
              value={settings.theme}
              onChange={(e) =>
                updateSetting(
                  "theme",
                  e.target.value as AppSettings["theme"]
                )
              }
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Design Code</span>

            <select
              style={inputStyle}
              value={settings.designCode}
              onChange={(e) =>
                updateSetting(
                  "designCode",
                  e.target.value as AppSettings["designCode"]
                )
              }
            >
              <option value="AISC">AISC</option>
              <option value="Eurocode">Eurocode</option>
            </select>
          </label>

          {settings.designCode === "AISC" && (
            <label style={{ display: "grid", gap: 6 }}>
              <span>AISC Design Method</span>

              <select
                style={inputStyle}
                value={settings.designMethod}
                onChange={(e) =>
                  updateSetting(
                    "designMethod",
                    e.target.value as AppSettings["designMethod"]
                  )
                }
              >
                <option value="LRFD">LRFD</option>
                <option value="ASD">ASD</option>
              </select>
            </label>
          )}

          <label style={{ display: "grid", gap: 6 }}>
            <span>Bolt Type</span>

            <select
              style={inputStyle}
              value={settings.boltType}
              onChange={(e) =>
                updateSetting(
                  "boltType",
                  e.target.value as AppSettings["boltType"]
                )
              }
            >
              <option value="bearing">Bearing</option>
              <option value="slip-critical">Slip Critical</option>
            </select>
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Units</span>

            <select
              style={inputStyle}
              value={settings.unitSystem}
              onChange={(e) =>
                updateSetting(
                  "unitSystem",
                  e.target.value as AppSettings["unitSystem"]
                )
              }
            >
              <option value="imperial">Imperial</option>
              <option value="metric">Metric</option>
            </select>
          </label>
        </div>
      </section>

      <section
        style={{
          padding: 16,
          borderRadius: 18,
          background: isDark ? "#111827" : "#f8fafc",
          border: `1px solid ${isDark ? "#1e293b" : "#e5e7eb"}`,
          display: "grid",
          gap: 12,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 18 }}>File</h2>

        <button style={primaryButton}>Save JSON</button>
        <button style={secondaryButton(isDark)}>Load JSON</button>
      </section>
    </div>
  );
}

const primaryButton: React.CSSProperties = {
  padding: "12px 14px",
  borderRadius: 12,
  border: "none",
  background: "#2563eb",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
};

function secondaryButton(isDark: boolean): React.CSSProperties {
  return {
    padding: "12px 14px",
    borderRadius: 12,
    border: `1px solid ${isDark ? "#334155" : "#cbd5e1"}`,
    background: isDark ? "#020617" : "#ffffff",
    color: isDark ? "#e5e7eb" : "#111827",
    fontWeight: 800,
    cursor: "pointer",
  };
}