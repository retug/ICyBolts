import type { AppliedLoad } from "../types/bolts";

type LoadPanelProps = {
  loads: AppliedLoad[];
  setLoads: React.Dispatch<React.SetStateAction<AppliedLoad[]>>;
};

export function LoadPanel({ loads, setLoads }: LoadPanelProps) {
  function updateLoad(id: string, field: keyof AppliedLoad, value: string) {
    setLoads((prev) =>
      prev.map((load) =>
        load.id === id
          ? {
              ...load,
              [field]:
                field === "label"
                  ? value
                  : Number(value),
            }
          : load
      )
    );
  }

  function addLoad() {
    setLoads((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        label: `P${prev.length + 1}`,
        x: 0,
        y: 0,
        magnitude: 10,
        angleDeg: 0,
      },
    ]);
  }

  function removeLoad(id: string) {
    setLoads((prev) => prev.filter((load) => load.id !== id));
  }

  return (
    <div
      style={{
        position: "absolute",
        top: 16,
        left: 16,
        width: 320,
        padding: 16,
        background: "#111827",
        color: "white",
        borderRadius: 12,
        fontFamily: "Arial",
        zIndex: 10,
      }}
    >
      <h2 style={{ marginTop: 0 }}>Applied Loads</h2>

      {loads.map((load) => (
        <div
          key={load.id}
          style={{
            borderTop: "1px solid #374151",
            paddingTop: 12,
            marginTop: 12,
            display: "grid",
            gap: 8,
          }}
        >
          <input
            value={load.label}
            onChange={(e) => updateLoad(load.id, "label", e.target.value)}
            placeholder="Label"
          />

          <label>
            X Location
            <input
              type="number"
              value={load.x}
              onChange={(e) => updateLoad(load.id, "x", e.target.value)}
            />
          </label>

          <label>
            Y Location
            <input
              type="number"
              value={load.y}
              onChange={(e) => updateLoad(load.id, "y", e.target.value)}
            />
          </label>

          <label>
            Magnitude
            <input
              type="number"
              value={load.magnitude}
              onChange={(e) =>
                updateLoad(load.id, "magnitude", e.target.value)
              }
            />
          </label>

          <label>
            Angle, degrees
            <input
              type="number"
              value={load.angleDeg}
              onChange={(e) => updateLoad(load.id, "angleDeg", e.target.value)}
            />
          </label>

          <button onClick={() => removeLoad(load.id)}>Remove Load</button>
        </div>
      ))}

      <button style={{ marginTop: 12 }} onClick={addLoad}>
        Add Load
      </button>
    </div>
  );
}