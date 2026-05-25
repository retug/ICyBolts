import type { UnitSystem } from "../types/bolts";
import type { BoltAnalysisResult } from "../analysis/analyzeBoltGroup";

type ResultsProps = {
  result: BoltAnalysisResult | null;
  onRunAnalysis: () => void;
  unitSystem: UnitSystem;
};

const KIP_TO_KN = 4.4482216153;
const KIP_IN_TO_KN_MM = 112.9848290276;

export function Results({ result, onRunAnalysis, unitSystem }: ResultsProps) {
  const forceUnit = unitSystem === "metric" ? "kN" : "kips";
  const momentUnit = unitSystem === "metric" ? "kN-mm" : "kip-in";
  const lengthUnit = unitSystem === "metric" ? "mm" : "in";

  const maxBoltDcr = result
    ? getMaxBoltDcr(result)
    : null;

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

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 28 }}>Results</h2>

        <p style={{ marginTop: 6, color: "#94a3b8", lineHeight: 1.45 }}>
          Review applied external forces, bolt force summations, and the
          instantaneous center solution.
        </p>
      </div>

      <button style={primaryButtonStyle} onClick={onRunAnalysis}>
        Run Analysis
      </button>

      {!result && (
        <section style={cardStyle}>
          <h3 style={sectionTitleStyle}>No Results Yet</h3>
          <p style={{ margin: 0, color: "#64748b", fontSize: 13 }}>
            Click Run Analysis to calculate the bolt group response.
          </p>
        </section>
      )}

      {result && (
        <>
          <section style={cardStyle}>
            <h3 style={sectionTitleStyle}>Bolt Check Summary</h3>

            <ResultRow
              label="Max Bolt DCR"
              value={maxBoltDcr === null ? "N/A" : maxBoltDcr.toFixed(3)}
              valueColor={
                maxBoltDcr === null
                  ? "#64748b"
                  : maxBoltDcr <= 1
                  ? "#15803d"
                  : "#b91c1c"
              }
            />

            <ResultRow
              label="Status"
              value={
                maxBoltDcr === null
                  ? "No bolt capacity available"
                  : maxBoltDcr <= 1
                  ? "OK"
                  : "NG"
              }
              valueColor={
                maxBoltDcr === null
                  ? "#64748b"
                  : maxBoltDcr <= 1
                  ? "#15803d"
                  : "#b91c1c"
              }
            />
          </section>

          <section style={cardStyle}>
            <h3 style={sectionTitleStyle}>External Forces Applied</h3>

            <ResultRow label="ΣFx" value={formatForce(result.externalForces.fx)} />
            <ResultRow label="ΣFy" value={formatForce(result.externalForces.fy)} />
            <ResultRow
              label="ΣMo"
              value={formatMoment(result.externalForces.moment)}
            />
          </section>

          <section style={cardStyle}>
            <h3 style={sectionTitleStyle}>Summation of Bolt Forces</h3>

            <ResultRow label="ΣFx" value={formatForce(result.boltForces.fx)} />
            <ResultRow label="ΣFy" value={formatForce(result.boltForces.fy)} />
            <ResultRow
              label="ΣMo"
              value={formatMoment(result.boltForces.moment)}
            />
          </section>

          <section style={cardStyle}>
            <h3 style={sectionTitleStyle}>Instantaneous Center</h3>

            <ResultRow label="IC X" value={formatLength(result.IC[0])} />
            <ResultRow label="IC Y" value={formatLength(result.IC[1])} />
            <ResultRow label="Cu" value={result.Cu.toFixed(4)} />
            <ResultRow label="Mi" value={result.Mi.toFixed(4)} />
          </section>
        </>
      )}
    </div>
  );
}

function getMaxBoltDcr(result: BoltAnalysisResult): number | null {
  const dcrs = result.bolts
    .map((bolt) => {
      const demand = bolt.force?.magnitude ?? 0;
      const capacity =
        bolt.capacity ??
        bolt.shearStrength?.lrfd ??
        bolt.shearStrength?.asd ??
        null;

      if (capacity === null || capacity <= 0) {
        return null;
      }

      return demand / capacity;
    })
    .filter((dcr): dcr is number => dcr !== null && Number.isFinite(dcr));

  if (dcrs.length === 0) {
    return null;
  }

  return Math.max(...dcrs);
}

function ResultRow({
  label,
  value,
  valueColor = "#111827",
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        padding: "10px 0",
        borderBottom: "1px solid #e5e7eb",
        fontSize: 14,
      }}
    >
      <span style={{ color: "#334155", fontWeight: 800 }}>{label}</span>
      <span style={{ color: valueColor, fontWeight: 800 }}>{value}</span>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  padding: 16,
  borderRadius: 18,
  background: "#f8fafc",
  border: "1px solid #e5e7eb",
  display: "grid",
  gap: 8,
};

const sectionTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 18,
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