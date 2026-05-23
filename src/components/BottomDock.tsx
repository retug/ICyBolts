import type { ActiveDockTab } from "../types/app";

type BottomDockProps = {
  activeTab: ActiveDockTab;
  setActiveTab: (tab: ActiveDockTab) => void;
};

export function BottomDock({ activeTab, setActiveTab }: BottomDockProps) {
  const tabs: { id: ActiveDockTab; label: string }[] = [
    { id: "file", label: "File" },
    { id: "bolts", label: "Bolt Data" },
    { id: "loads", label: "Load Data" },
    { id: "results", label: "Results" },
  ];

  return (
    <div
      style={{
        position: "absolute",
        bottom: 16,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 20,
        display: "flex",
        gap: 6,
        padding: 8,
        background: "#111827",
        borderRadius: 14,
        boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
      }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "none",
            cursor: "pointer",
            background: activeTab === tab.id ? "#2563eb" : "#1f2937",
            color: "white",
            fontWeight: 700,
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}