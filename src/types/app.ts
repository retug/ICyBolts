export type ActiveDockTab = "file" | "bolts" | "loads" | "results";

export type DesignCode = "AISC" | "Eurocode";
export type BoltType = "bearing" | "slip-critical";
export type UnitSystem = "imperial" | "metric";
export type ThemeMode = "dark" | "light";

export type AppSettings = {
  designCode: DesignCode;
  boltType: BoltType;
  unitSystem: UnitSystem;
  theme: ThemeMode;
};