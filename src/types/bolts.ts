import * as THREE from "three";

export type UnitSystem = "imperial" | "metric";

export type BoltForceVector = {
  fx: number;
  fy: number;
  fz?: number;
  magnitude?: number;
};

export type AppliedLoad = {
  id: string;
  label: string;
  x: number;
  y: number;
  magnitude: number;
  angleDeg: number;
};

export type BoltRenderSize = {
  diameter: number;
  headAcrossFlats: number;
  headHeight: number;
  shaftLength: number;
};

export type BoltData = {
  id: string;
  label: string;

  // Location in bolt group model coordinates
  x: number;
  y: number;
  z?: number;

  unitSystem: UnitSystem;

  // Nominal bolt diameter
  diameter: number;

  // Values used directly for rendering
  renderSize: BoltRenderSize;

  // Optional design / analysis data
  capacity?: number;

  // Result force vector from IC / Brandt analysis
  force?: BoltForceVector;

  // For future selection/highlighting
  isSelected?: boolean;
  isHovered?: boolean;
};