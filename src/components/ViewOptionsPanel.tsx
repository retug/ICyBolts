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
};

export function ViewOptionsPanel({
  viewOptions,
  setViewOptions,
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