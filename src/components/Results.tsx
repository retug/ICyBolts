import type { CSSProperties } from "react";
import { printBoltReport } from "../reports/printBoltReport";
import type { AppliedLoad, UnitSystem } from "../types/bolts";
import type { BoltAnalysisResult } from "../analysis/analyzeBoltGroup";
import type { AppSettings } from "../types/app";

type ResultsProps = {
  result: BoltAnalysisResult | null;
  loads: AppliedLoad[];
  unitSystem: UnitSystem;
  settings: AppSettings;
  getSceneImageDataUrl?: () => string | null;
};

const KIP_TO_KN = 4.4482216153;
const KIP_IN_TO_KN_MM = 112.9848290276;

export function Results({
  result,
  loads,
  unitSystem,
  settings,
  getSceneImageDataUrl,
}: ResultsProps) {
  const isDark = settings.theme === "dark";
  const styles = getStyles(isDark);

  const forceUnit = unitSystem === "metric" ? "kN" : "kips";
  const momentUnit = unitSystem === "metric" ? "kN-mm" : "kip-in";
  const lengthUnit = unitSystem === "metric" ? "mm" : "in";

  const controllingCheck = result
    ? getControllingBoltCheck(result, settings)
    : null;

  const maxBolt = result ? getMaxForceBolt(result) : null;
  const inputBolt = controllingCheck?.bolt ?? maxBolt ?? result?.bolts[0];

  const maxBoltDcr = controllingCheck?.dcr ?? null;

  const status =
    maxBoltDcr === null ? "No Capacity" : maxBoltDcr <= 1 ? "OK" : "No Good";

  const statusColor =
    maxBoltDcr === null ? "#94a3b8" : maxBoltDcr <= 1 ? "#22c55e" : "#ef4444";

  function formatForce(value: number) {
    const displayValue = unitSystem === "metric" ? value * KIP_TO_KN : value;
    return `${displayValue.toFixed(3)} ${forceUnit}`;
  }

  function formatMoment(value: number) {
    const displayValue =
      unitSystem === "metric" ? value * KIP_IN_TO_KN_MM : value;

    return `${displayValue.toFixed(3)} ${momentUnit}`;
  }

  function formatLength(value: number) {
    const displayValue = unitSystem === "metric" ? value * 25.4 : value;
    return `${displayValue.toFixed(3)} ${lengthUnit}`;
  }

  function formatCapacity(value: number | null | undefined) {
    if (value === null || value === undefined) return "N/A";
    return formatForce(value);
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.pageTitle}>Results</h2>

          <p style={styles.pageSubtitle}>
            Review bolt group capacity, force equilibrium, and instantaneous
            center output.
          </p>
        </div>

        <button
          style={{
            ...styles.printButton,
            opacity: !result ? 0.45 : 1,
            cursor: !result ? "not-allowed" : "pointer",
          }}
          disabled={!result}
          onClick={() => {
            if (!result) return;

            printBoltReport({
              result,
              loads,
              settings,
              unitSystem,
              sceneImageDataUrl: getSceneImageDataUrl?.() ?? null,
            });
          }}
        >
          Print PDF
        </button>
      </div>

      {!result && (
        <section style={styles.card}>
          <h3 style={styles.sectionTitle}>No Results Yet</h3>

          <p style={styles.emptyText}>
            Click Run Analysis to calculate the bolt group response.
          </p>
        </section>
      )}

      {result && (
        <>
          <section style={styles.summaryGrid}>
            <MetricCard
              styles={styles}
              label="Bolt Group Coefficient"
              value={result.Cu.toFixed(4)}
              sublabel="C"
            />

            <MetricCard
              styles={styles}
              label="Max Bolt DCR"
              value={maxBoltDcr === null ? "N/A" : maxBoltDcr.toFixed(3)}
              sublabel={
                controllingCheck
                  ? `${formatForce(controllingCheck.demand)} / ${formatForce(
                      controllingCheck.capacity
                    )}`
                  : "No capacity available"
              }
              valueColor={statusColor}
            />

            <MetricCard
              styles={styles}
              label="Status"
              value={status}
              sublabel={
                maxBoltDcr === null
                  ? "Capacity not available"
                  : maxBoltDcr <= 1
                  ? "Demand ≤ Capacity"
                  : "Demand > Capacity"
              }
              valueColor={statusColor}
            />
          </section>

          <section style={styles.card}>
            <SectionHeader
              styles={styles}
              title="Bolt Input Information"
              description="Selected bolt configuration and design capacities used for the check."
            />

            {inputBolt?.boltType === "slip-critical" ? (
              <>
                <div style={styles.dataGrid}>
                  <DataItem
                    styles={styles}
                    label="Bolt Diameter"
                    value={formatBoltDiameter(inputBolt?.label)}
                  />

                  <DataItem
                    styles={styles}
                    label="Bolt Grade"
                    value={inputBolt?.designation ?? "N/A"}
                  />

                  <DataItem
                    styles={styles}
                    label="Faying Surface"
                    value={
                      inputBolt?.fayingSurface
                        ? `${inputBolt.fayingSurface} ${
                            inputBolt.mu !== undefined
                              ? `(μ = ${inputBolt.mu.toFixed(2)})`
                              : ""
                          }`
                        : "N/A"
                    }
                  />

                  <DataItem
                    styles={styles}
                    label="Loading"
                    value={formatShearPlane(inputBolt?.shearPlane)}
                  />

                  <DataItem
                    styles={styles}
                    label="Hole Type"
                    value={inputBolt?.holeType ?? "N/A"}
                  />

                  <DataItem styles={styles} label="Bolt Type" value="Slip Critical" />
                </div>

                <div style={styles.capacityStrip}>
                  <DataItem
                    styles={styles}
                    label="ASD Capacity"
                    value={formatCapacity(inputBolt?.shearStrength?.asd)}
                  />

                  <DataItem
                    styles={styles}
                    label="LRFD Capacity"
                    value={formatCapacity(inputBolt?.shearStrength?.lrfd)}
                  />

                  <DataItem
                    styles={styles}
                    label="Active Method"
                    value={settings.designMethod}
                  />
                </div>
              </>
            ) : (
              <>
                <div style={styles.dataGrid}>
                  <DataItem
                    styles={styles}
                    label="Bolt Diameter"
                    value={formatBoltDiameter(inputBolt?.label)}
                  />

                  <DataItem
                    styles={styles}
                    label="Bolt Group"
                    value={inputBolt?.designation ?? "N/A"}
                  />

                  <DataItem
                    styles={styles}
                    label="Thread Condition"
                    value={formatThreadCondition(inputBolt?.threadCondition)}
                  />

                  <DataItem
                    styles={styles}
                    label="Loading"
                    value={formatShearPlane(inputBolt?.shearPlane)}
                  />

                  <DataItem styles={styles} label="Bolt Type" value="Bearing" />
                </div>

                <div style={styles.capacityStrip}>
                  <DataItem
                    styles={styles}
                    label="ASD Capacity"
                    value={formatCapacity(inputBolt?.shearStrength?.asd)}
                  />

                  <DataItem
                    styles={styles}
                    label="LRFD Capacity"
                    value={formatCapacity(inputBolt?.shearStrength?.lrfd)}
                  />

                  <DataItem
                    styles={styles}
                    label="Active Method"
                    value={settings.designMethod}
                  />
                </div>
              </>
            )}
          </section>

          <section style={styles.card}>
            <SectionHeader
              styles={styles}
              title="Bolt Check Summary"
              description="Demand and capacity for the governing bolt force."
            />

            <div style={styles.dataGrid}>
              <DataItem
                styles={styles}
                label="Max Bolt Shear"
                value={formatForce(maxBolt?.force?.magnitude ?? 0)}
              />

              <DataItem
                styles={styles}
                label="Controlling Capacity"
                value={
                  controllingCheck
                    ? formatForce(controllingCheck.capacity)
                    : "N/A"
                }
              />

              <DataItem
                styles={styles}
                label="Max Bolt DCR"
                value={maxBoltDcr === null ? "N/A" : maxBoltDcr.toFixed(3)}
                valueColor={statusColor}
              />

              <DataItem
                styles={styles}
                label="Status"
                value={status}
                valueColor={statusColor}
              />
            </div>
          </section>

          <section style={styles.card}>
            <SectionHeader
              styles={styles}
              title="External Forces Applied"
              description="Resultant force and moment applied to the bolt group."
            />

            <div style={styles.threeColumnGrid}>
              <DataItem styles={styles} label="ΣFx" value={formatForce(result.externalForces.fx)} />
              <DataItem styles={styles} label="ΣFy" value={formatForce(result.externalForces.fy)} />
              <DataItem styles={styles} label="ΣMo" value={formatMoment(result.externalForces.moment)} />
            </div>
          </section>

          <section style={styles.card}>
            <SectionHeader
              styles={styles}
              title="Summation of Bolt Forces"
              description="Internal bolt force resultants from the IC analysis."
            />

            <div style={styles.threeColumnGrid}>
              <DataItem styles={styles} label="ΣFx" value={formatForce(result.boltForces.fx)} />
              <DataItem styles={styles} label="ΣFy" value={formatForce(result.boltForces.fy)} />
              <DataItem styles={styles} label="ΣMo" value={formatMoment(result.boltForces.moment)} />
            </div>
          </section>

          <section style={styles.card}>
            <SectionHeader
              styles={styles}
              title="Instantaneous Center"
              description="Calculated instantaneous center and Brandt coefficient."
            />

            <div style={styles.fourColumnGrid}>
              <DataItem styles={styles} label="IC X" value={formatLength(result.IC[0])} />
              <DataItem styles={styles} label="IC Y" value={formatLength(result.IC[1])} />
              <DataItem styles={styles} label="C" value={result.Cu.toFixed(4)} />
              <DataItem styles={styles} label="Mi" value={result.Mi.toFixed(4)} />
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function getControllingBoltCheck(
  result: BoltAnalysisResult,
  settings: AppSettings
) {
  const checks = result.bolts
    .map((bolt) => {
      const demand = bolt.force?.magnitude ?? 0;
      const capacity = getBoltCapacityForResults(bolt, settings);

      if (capacity === null || capacity <= 0) {
        return null;
      }

      return {
        bolt,
        demand,
        capacity,
        dcr: demand / capacity,
      };
    })
    .filter(
      (
        check
      ): check is {
        bolt: BoltAnalysisResult["bolts"][number];
        demand: number;
        capacity: number;
        dcr: number;
      } => check !== null && Number.isFinite(check.dcr)
    );

  if (checks.length === 0) return null;

  return checks.reduce((max, check) => (check.dcr > max.dcr ? check : max));
}

function getMaxForceBolt(result: BoltAnalysisResult) {
  if (result.bolts.length === 0) return null;

  return result.bolts.reduce((max, bolt) => {
    const mag = bolt.force?.magnitude ?? 0;
    const maxMag = max.force?.magnitude ?? 0;

    return mag > maxMag ? bolt : max;
  }, result.bolts[0]);
}

function getBoltCapacityForResults(
  bolt: BoltAnalysisResult["bolts"][number],
  settings: AppSettings
): number | null {
  if (settings.designMethod === "ASD" && bolt.shearStrength?.asd) {
    return bolt.shearStrength.asd;
  }

  if (settings.designMethod === "LRFD" && bolt.shearStrength?.lrfd) {
    return bolt.shearStrength.lrfd;
  }

  if (bolt.capacity && bolt.capacity > 0) {
    return bolt.capacity;
  }

  return null;
}

function formatBoltDiameter(label: string | undefined) {
  if (!label) return "N/A";

  if (label.startsWith("M")) {
    return label;
  }

  return `${label}"`;
}

function formatThreadCondition(threadCondition: string | undefined) {
  if (!threadCondition) return "N/A";

  if (threadCondition === "N") {
    return "N - Threads Included";
  }

  if (threadCondition === "X") {
    return "X - Threads Excluded";
  }

  if (threadCondition === "not-applicable") {
    return "Not Applicable";
  }

  return threadCondition;
}

function formatShearPlane(shearPlane: string | undefined) {
  if (shearPlane === "single") return "Single Shear";
  if (shearPlane === "double") return "Double Shear";
  return "N/A";
}

function SectionHeader({
  styles,
  title,
  description,
}: {
  styles: ReturnType<typeof getStyles>;
  title: string;
  description?: string;
}) {
  return (
    <div style={{ display: "grid", gap: 4 }}>
      <h3 style={styles.sectionTitle}>{title}</h3>
      {description && <p style={styles.mutedText}>{description}</p>}
    </div>
  );
}

function MetricCard({
  styles,
  label,
  value,
  sublabel,
  valueColor,
}: {
  styles: ReturnType<typeof getStyles>;
  label: string;
  value: string;
  sublabel?: string;
  valueColor?: string;
}) {
  return (
    <div style={styles.metricCard}>
      <div style={styles.metricLabel}>{label}</div>

      <div style={{ ...styles.metricValue, color: valueColor ?? styles.strongValue.color }}>
        {value}
      </div>

      {sublabel && <div style={styles.metricSubLabel}>{sublabel}</div>}
    </div>
  );
}

function DataItem({
  styles,
  label,
  value,
  valueColor,
}: {
  styles: ReturnType<typeof getStyles>;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div style={styles.dataItem}>
      <div style={styles.dataLabel}>{label}</div>

      <div style={{ ...styles.dataValue, color: valueColor ?? styles.dataValue.color }}>
        {value}
      </div>
    </div>
  );
}

function getStyles(isDark: boolean): Record<string, CSSProperties> {
  return {
    page: {
      display: "grid",
      gap: 18,
    },

    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 14,
    },

    pageTitle: {
      margin: 0,
      fontSize: 28,
      color: isDark ? "#f8fafc" : "#111827",
      letterSpacing: "-0.04em",
    },

    pageSubtitle: {
      marginTop: 8,
      marginBottom: 0,
      color: isDark ? "#94a3b8" : "#64748b",
      lineHeight: 1.45,
      fontSize: 14,
    },

    printButton: {
      padding: "11px 15px",
      borderRadius: 12,
      border: `1px solid ${isDark ? "#334155" : "#cbd5e1"}`,
      background: isDark ? "#020617" : "#ffffff",
      color: isDark ? "#f8fafc" : "#111827",
      fontWeight: 900,
      whiteSpace: "nowrap",
      boxShadow: isDark ? "none" : "0 8px 22px rgba(15, 23, 42, 0.08)",
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

    summaryGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      gap: 12,
    },

    metricCard: {
      padding: 16,
      borderRadius: 18,
      background: isDark ? "#111827" : "#f8fafc",
      border: `1px solid ${isDark ? "#1e293b" : "#e5e7eb"}`,
      display: "grid",
      gap: 8,
      minHeight: 112,
      alignContent: "center",
      boxShadow: isDark ? "none" : "0 8px 22px rgba(15, 23, 42, 0.06)",
    },

    metricLabel: {
      color: isDark ? "#93c5fd" : "#334155",
      fontSize: 11,
      fontWeight: 800,
      textTransform: "uppercase",
      letterSpacing: "0.06em",
    },

    metricValue: {
      color: isDark ? "#f8fafc" : "#111827",
      fontSize: 28,
      lineHeight: 1.05,
      fontWeight: 900,
      letterSpacing: "-0.04em",
    },

    strongValue: {
      color: isDark ? "#f8fafc" : "#111827",
    },

    metricSubLabel: {
      color: isDark ? "#94a3b8" : "#64748b",
      fontSize: 12,
      fontWeight: 700,
      lineHeight: 1.35,
    },

    sectionTitle: {
      margin: 0,
      fontSize: 18,
      color: isDark ? "#f8fafc" : "#111827",
      fontWeight: 800,
      letterSpacing: "-0.02em",
    },

    mutedText: {
      margin: 0,
      color: isDark ? "#94a3b8" : "#64748b",
      fontSize: 13,
      lineHeight: 1.45,
    },

    emptyText: {
      color: isDark ? "#94a3b8" : "#64748b",
      fontSize: 13,
      margin: 0,
    },

    dataGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      gap: 10,
    },

    threeColumnGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      gap: 10,
    },

    fourColumnGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
      gap: 10,
    },

    capacityStrip: {
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      gap: 10,
      paddingTop: 12,
      borderTop: `1px solid ${isDark ? "#1e293b" : "#e2e8f0"}`,
    },

    dataItem: {
      padding: "12px 12px",
      borderRadius: 14,
      background: isDark ? "#020617" : "#ffffff",
      border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
      display: "grid",
      gap: 4,
      minWidth: 0,
    },

    dataLabel: {
      color: isDark ? "#93c5fd" : "#334155",
      fontSize: 11,
      fontWeight: 800,
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      whiteSpace: "nowrap",
    },

    dataValue: {
      color: isDark ? "#f8fafc" : "#111827",
      fontSize: 14,
      fontWeight: 900,
      lineHeight: 1.2,
      overflowWrap: "anywhere",
    },
  };
}