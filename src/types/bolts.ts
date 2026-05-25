export type UnitSystem = "imperial" | "metric";

export type BoltForceVector = {
  fx: number;
  fy: number;
  fz?: number;
  magnitude?: number;
};

export type LoadInputMode = "magnitude-angle" | "components";

export type AppliedLoad = {
  id: string;
  label: string;
  x: number;
  y: number;

  inputMode: LoadInputMode;

  // Backend/internal units:
  // force = kips
  // moment = kip-in
  magnitude: number;
  angleDeg: number;
  fx: number;
  fy: number;
  moment: number;

  isSelected?: boolean;
  isHovered?: boolean;
};

export type BoltRenderSize = {
  diameter: number;
  headAcrossFlats: number;
  headHeight: number;
  shaftLength: number;
};

export type BoltDesignation = "Group A" | "Group B" | "Group C" | "A307";
export type BoltThreadCondition = "N" | "X" | "not-applicable";
export type BoltShearPlane = "single" | "double";

export type BoltType = "bearing" | "slip-critical";
export type SlipCriticalFayingSurface = "Class A" | "Class B";
export type SlipCriticalHoleType = "STD/SSLT" | "OVS/SSLP" | "LSL";

export type BoltStrength = {
  asd: number | null;
  lrfd: number | null;
};


export type BoltData = {
  id: string;
  label: string;
  x: number;
  y: number;
  z?: number;
  unitSystem: UnitSystem;
  diameter: number;
  area?: number;
  renderSize: BoltRenderSize;

  designation?: BoltDesignation;
  threadCondition?: BoltThreadCondition;
  shearPlane?: BoltShearPlane;
  shearStrength?: BoltStrength;
  capacity?: number;

  force?: BoltForceVector;
  isSelected?: boolean;
  isHovered?: boolean;

  boltType?: BoltType;
  fayingSurface?: SlipCriticalFayingSurface;
  mu?: number;
  holeType?: SlipCriticalHoleType;
  slipCriticalStrength?: BoltStrength;
  omega?: number;
  phi?: number;
};