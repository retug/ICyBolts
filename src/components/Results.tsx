import type { CSSProperties } from "react";
import { printBoltReport } from "../reports/printBoltReport";
import type { AppliedLoad, UnitSystem } from "../types/bolts";
import type { BoltAnalysisResult } from "../analysis/analyzeBoltGroup";
import type { AppSettings } from "../types/app";

type ResultsProps = {
  result: BoltAnalysisResult | null;
  loads: AppliedLoad[];
//   onRunAnalysis: () => void;
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
    maxBoltDcr === null ? "#64748b" : maxBoltDcr <= 1 ? "#16a34a" : "#dc2626";

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
    <div style={pageStyle}>
      <div style={headerStyle}>
        <div>
          <h2 style={titleStyle}>Results</h2>

          <p style={subtitleStyle}>
            Review bolt group capacity, force equilibrium, and instantaneous
            center output.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
            <button
                style={printButtonStyle}
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
      </div>

      {!result && (
        <section style={cardStyle}>
          <h3 style={sectionTitleStyle}>No Results Yet</h3>

          <p style={mutedTextStyle}>
            Click Run Analysis to calculate the bolt group response.
          </p>
        </section>
      )}

      {result && (
        <>
          <section style={summaryCardStyle}>
            <MetricCard
              label="Bolt Group Coefficient"
              value={result.Cu.toFixed(4)}
              sublabel="C"
            />

            <MetricCard
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

          <section style={cardStyle}>
            <SectionHeader
              title="Bolt Input Information"
              description="Selected bolt configuration and design capacities used for the check."
            />

            {inputBolt?.boltType === "slip-critical" ? (
              <>
                <div style={dataGridStyle}>
                  <DataItem
                    label="Bolt Diameter"
                    value={formatBoltDiameter(inputBolt?.label)}
                  />

                  <DataItem
                    label="Bolt Grade"
                    value={inputBolt?.designation ?? "N/A"}
                  />

                  <DataItem
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
                    label="Loading"
                    value={formatShearPlane(inputBolt?.shearPlane)}
                  />

                  <DataItem
                    label="Hole Type"
                    value={inputBolt?.holeType ?? "N/A"}
                  />

                  <DataItem label="Bolt Type" value="Slip Critical" />
                </div>

                <div style={capacityStripStyle}>
                  <DataItem
                    label="ASD Capacity"
                    value={formatCapacity(inputBolt?.shearStrength?.asd)}
                  />

                  <DataItem
                    label="LRFD Capacity"
                    value={formatCapacity(inputBolt?.shearStrength?.lrfd)}
                  />

                  <DataItem
                    label="Active Method"
                    value={settings.designMethod}
                  />
                </div>
              </>
            ) : (
              <>
                <div style={dataGridStyle}>
                  <DataItem
                    label="Bolt Diameter"
                    value={formatBoltDiameter(inputBolt?.label)}
                  />

                  <DataItem
                    label="Bolt Group"
                    value={inputBolt?.designation ?? "N/A"}
                  />

                  <DataItem
                    label="Thread Condition"
                    value={formatThreadCondition(inputBolt?.threadCondition)}
                  />

                  <DataItem
                    label="Loading"
                    value={formatShearPlane(inputBolt?.shearPlane)}
                  />

                  <DataItem label="Bolt Type" value="Bearing" />
                </div>

                <div style={capacityStripStyle}>
                  <DataItem
                    label="ASD Capacity"
                    value={formatCapacity(inputBolt?.shearStrength?.asd)}
                  />

                  <DataItem
                    label="LRFD Capacity"
                    value={formatCapacity(inputBolt?.shearStrength?.lrfd)}
                  />

                  <DataItem
                    label="Active Method"
                    value={settings.designMethod}
                  />
                </div>
              </>
            )}
          </section>

          <section style={cardStyle}>
            <SectionHeader
              title="Bolt Check Summary"
              description="Demand and capacity for the governing bolt force."
            />

            <div style={dataGridStyle}>
              <DataItem
                label="Max Bolt Shear"
                value={formatForce(maxBolt?.force?.magnitude ?? 0)}
              />

              <DataItem
                label="Controlling Capacity"
                value={
                  controllingCheck
                    ? formatForce(controllingCheck.capacity)
                    : "N/A"
                }
              />

              <DataItem
                label="Max Bolt DCR"
                value={maxBoltDcr === null ? "N/A" : maxBoltDcr.toFixed(3)}
                valueColor={statusColor}
              />

              <DataItem label="Status" value={status} valueColor={statusColor} />
            </div>
          </section>

          <section style={cardStyle}>
            <SectionHeader
              title="External Forces Applied"
              description="Resultant force and moment applied to the bolt group."
            />

            <div style={threeColumnRowStyle}>
              <DataItem label="ΣFx" value={formatForce(result.externalForces.fx)} />

              <DataItem label="ΣFy" value={formatForce(result.externalForces.fy)} />

              <DataItem
                label="ΣMo"
                value={formatMoment(result.externalForces.moment)}
              />
            </div>
          </section>

          <section style={cardStyle}>
            <SectionHeader
              title="Summation of Bolt Forces"
              description="Internal bolt force resultants from the IC analysis."
            />

            <div style={threeColumnRowStyle}>
              <DataItem label="ΣFx" value={formatForce(result.boltForces.fx)} />

              <DataItem label="ΣFy" value={formatForce(result.boltForces.fy)} />

              <DataItem
                label="ΣMo"
                value={formatMoment(result.boltForces.moment)}
              />
            </div>
          </section>

          <section style={cardStyle}>
            <SectionHeader
              title="Instantaneous Center"
              description="Calculated instantaneous center and Brandt coefficient."
            />

            <div style={fourColumnRowStyle}>
              <DataItem label="IC X" value={formatLength(result.IC[0])} />

              <DataItem label="IC Y" value={formatLength(result.IC[1])} />

              <DataItem label="C" value={result.Cu.toFixed(4)} />

              <DataItem label="Mi" value={result.Mi.toFixed(4)} />
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
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div style={{ display: "grid", gap: 4 }}>
      <h3 style={sectionTitleStyle}>{title}</h3>

      {description && <p style={mutedTextStyle}>{description}</p>}
    </div>
  );
}

function MetricCard({
  label,
  value,
  sublabel,
  valueColor = "#0f172a",
}: {
  label: string;
  value: string;
  sublabel?: string;
  valueColor?: string;
}) {
  return (
    <div style={metricCardStyle}>
      <div style={metricLabelStyle}>{label}</div>

      <div style={{ ...metricValueStyle, color: valueColor }}>{value}</div>

      {sublabel && <div style={metricSubLabelStyle}>{sublabel}</div>}
    </div>
  );
}

function DataItem({
  label,
  value,
  valueColor = "#0f172a",
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div style={dataItemStyle}>
      <div style={dataLabelStyle}>{label}</div>

      <div style={{ ...dataValueStyle, color: valueColor }}>{value}</div>
    </div>
  );
}

const pageStyle: CSSProperties = {
  display: "grid",
  gap: 18,
};

const printButtonStyle: CSSProperties = {
  padding: "11px 15px",
  borderRadius: 14,
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#0f172a",
  fontWeight: 900,
  cursor: "pointer",
  boxShadow: "0 12px 28px rgba(15, 23, 42, 0.12)",
  whiteSpace: "nowrap",
};

const headerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 14,
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: 30,
  letterSpacing: "-0.04em",
  color: "#f8fafc",
};

const subtitleStyle: CSSProperties = {
  marginTop: 6,
  marginBottom: 0,
  color: "#94a3b8",
  lineHeight: 1.45,
  fontSize: 13,
};

const cardStyle: CSSProperties = {
  padding: 16,
  borderRadius: 18,
  background:
    "linear-gradient(180deg, rgba(248,250,252,0.98), rgba(241,245,249,0.96))",
  border: "1px solid rgba(203,213,225,0.9)",
  boxShadow: "0 14px 35px rgba(15, 23, 42, 0.12)",
  display: "grid",
  gap: 14,
};

const summaryCardStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 12,
};

const metricCardStyle: CSSProperties = {
  padding: 16,
  borderRadius: 18,
  background:
    "linear-gradient(180deg, rgba(255,255,255,1), rgba(248,250,252,1))",
  border: "1px solid #e2e8f0",
  boxShadow: "0 12px 30px rgba(15, 23, 42, 0.10)",
  display: "grid",
  gap: 8,
  minHeight: 112,
  alignContent: "center",
};

const metricLabelStyle: CSSProperties = {
  color: "#64748b",
  fontSize: 12,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

const metricValueStyle: CSSProperties = {
  fontSize: 28,
  lineHeight: 1.05,
  fontWeight: 900,
  letterSpacing: "-0.04em",
};

const metricSubLabelStyle: CSSProperties = {
  color: "#64748b",
  fontSize: 12,
  fontWeight: 700,
};

const sectionTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 18,
  color: "#0f172a",
  letterSpacing: "-0.02em",
};

const mutedTextStyle: CSSProperties = {
  margin: 0,
  color: "#64748b",
  fontSize: 13,
  lineHeight: 1.45,
};

const dataGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 10,
};

const threeColumnRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 10,
};

const fourColumnRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: 10,
};

const capacityStripStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 10,
  paddingTop: 12,
  borderTop: "1px solid #e2e8f0",
};

const dataItemStyle: CSSProperties = {
  padding: "12px 12px",
  borderRadius: 14,
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  display: "grid",
  gap: 4,
  minWidth: 0,
};

const dataLabelStyle: CSSProperties = {
  color: "#64748b",
  fontSize: 11,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  whiteSpace: "nowrap",
};

const dataValueStyle: CSSProperties = {
  color: "#0f172a",
  fontSize: 14,
  fontWeight: 900,
  lineHeight: 1.2,
  overflowWrap: "anywhere",
};

// const runButtonStyle: CSSProperties = {
//   padding: "11px 15px",
//   borderRadius: 14,
//   border: "1px solid rgba(147,197,253,0.55)",
//   background: "linear-gradient(180deg, #2563eb, #1d4ed8)",
//   color: "white",
//   fontWeight: 900,
//   cursor: "pointer",
//   boxShadow: "0 12px 28px rgba(37, 99, 235, 0.35)",
//   whiteSpace: "nowrap",
// };