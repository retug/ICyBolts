export type ActiveDockTab = "file" | "bolts" | "loads" | "results";

export type DesignCode = "AISC" | "Eurocode";
export type UnitSystem = "imperial" | "metric";
export type ThemeMode = "dark" | "light";
export type DesignMethod = "ASD" | "LRFD";

export type AppSettings = {
  designCode: DesignCode;
  unitSystem: UnitSystem;
  theme: ThemeMode;
  designMethod: DesignMethod;
};