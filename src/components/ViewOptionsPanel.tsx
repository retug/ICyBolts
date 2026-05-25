import type { CurrentBoltData } from "../App";

export type ViewOptions = {
  showBoltForceVectors: boolean;
  showBoltForceLabels: boolean;
  showAppliedForceLabels: boolean;
  showIC: boolean;
  autoRunAnalysis: boolean;
};

type ViewOptionsPanelProps = {
  viewOptions: ViewOptions;
  setViewOptions: React.Dispatch<React.SetStateAction<ViewOptions>>;
  currentBoltData: CurrentBoltData;
};

export function ViewOptionsPanel({
  viewOptions,
  setViewOptions,
  currentBoltData,
}: ViewOptionsPanelProps) {
  function updateOption(key: keyof ViewOptions, value: boolean) {
    setViewOptions((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  return (
    <div
      style={{
        position: "absolute",
        left: 16,
        bottom: 16,
        zIndex: 25,
        width: 260,
        padding: 14,
        borderRadius: 16,
        background: "rgba(15, 23, 42, 0.92)",
        color: "white",
        boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
        border: "1px solid rgba(148, 163, 184, 0.25)",
        display: "grid",
        gap: 10,
        fontSize: 13,
        backdropFilter: "blur(8px)",
      }}
    >
      <div style={{ fontWeight: 900, fontSize: 15 }}>View Options</div>

      <CheckRow
        label="Bolt force vectors"
        checked={viewOptions.showBoltForceVectors}
        onChange={(value) => updateOption("showBoltForceVectors", value)}
      />

      <CheckRow
        label="Bolt result force labels"
        checked={viewOptions.showBoltForceLabels}
        onChange={(value) => updateOption("showBoltForceLabels", value)}
      />

      <CheckRow
        label="Applied force / moment labels"
        checked={viewOptions.showAppliedForceLabels}
        onChange={(value) => updateOption("showAppliedForceLabels", value)}
      />

      <CheckRow
        label="Instantaneous center"
        checked={viewOptions.showIC}
        onChange={(value) => updateOption("showIC", value)}
      />

      <CheckRow
        label="Auto-run analysis"
        checked={viewOptions.autoRunAnalysis}
        onChange={(value) => updateOption("autoRunAnalysis", value)}
      />
      <div style={currentBoltBoxStyle}>
  <div style={{ fontWeight: 900, fontSize: 15 }}>Current Bolt Data</div>

  <div style={chipGridStyle}>
    <InfoChip label="Size" value={currentBoltData.label} />
    <InfoChip label="Type" value={currentBoltData.boltType} />
    <InfoChip label="Group" value={currentBoltData.designation} />
    <InfoChip
      label="Shear"
      value={currentBoltData.shearPlane === "single" ? "Single" : "Double"}
    />

    {currentBoltData.boltType === "bearing" ? (
      <>
        <InfoChip
          label="Threads"
          value={
            currentBoltData.threadCondition === "N"
              ? "Included"
              : currentBoltData.threadCondition === "X"
              ? "Excluded"
              : "N/A"
          }
        />
        <InfoChip
          label="Capacity"
          value={
            currentBoltData.capacity != null
              ? `${currentBoltData.capacity.toFixed(2)} k`
              : "N/A"
          }
        />
      </>
    ) : (
      <>
        <InfoChip label="Surface" value={currentBoltData.fayingSurface} />
        <InfoChip label="Hole" value={currentBoltData.holeType} />
        <InfoChip label="μ" value={currentBoltData.mu.toFixed(2)} />
      </>
    )}
  </div>
</div>
    </div>
  );
}

function CheckRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />

      <span>{label}</span>
    </label>
  );
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <div style={infoChipStyle}>
      <div style={infoChipLabelStyle}>{label}</div>
      <div style={infoChipValueStyle}>{value}</div>
    </div>
  );
}

const currentBoltBoxStyle: React.CSSProperties = {
  marginTop: 4,
  paddingTop: 10,
  borderTop: "1px solid rgba(148, 163, 184, 0.25)",
  display: "grid",
  gap: 8,
};

const chipGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 6,
};

const infoChipStyle: React.CSSProperties = {
  padding: "7px 8px",
  borderRadius: 10,
  background: "rgba(30, 41, 59, 0.9)",
  border: "1px solid rgba(148, 163, 184, 0.22)",
  display: "grid",
  gap: 2,
  minWidth: 0,
};

const infoChipLabelStyle: React.CSSProperties = {
  fontSize: 10,
  color: "#94a3b8",
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const infoChipValueStyle: React.CSSProperties = {
  fontSize: 12,
  color: "#f8fafc",
  fontWeight: 900,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};