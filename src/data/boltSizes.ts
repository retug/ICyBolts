import type { BoltRenderSize, UnitSystem } from "../types/bolts";

export type BoltSizeOption = {
  label: string;
  unitSystem: UnitSystem;
  diameter: number;
  renderSize: BoltRenderSize;
};


// Imperial dimensions in inches.
// Head sizes are approximate for now.
// We can replace these with ANSI B18.2.1 exact values later.
export const imperialBoltSizes: BoltSizeOption[] = [
  makeImperialBolt("1/4", 0.25),
  makeImperialBolt("5/16", 0.3125),
  makeImperialBolt("3/8", 0.375),
  makeImperialBolt("7/16", 0.4375),
  makeImperialBolt("1/2", 0.5),
  makeImperialBolt("5/8", 0.625),
  makeImperialBolt("3/4", 0.75),
  makeImperialBolt("7/8", 0.875),
  makeImperialBolt("1", 1.0),
];

// Metric dimensions stored in inches for now.
// Display label is metric, but internal rendering stays consistent.
export const metricBoltSizes: BoltSizeOption[] = [
  makeMetricBolt("M6", 6),
  makeMetricBolt("M8", 8),
  makeMetricBolt("M10", 10),
  makeMetricBolt("M12", 12),
  makeMetricBolt("M16", 16),
  makeMetricBolt("M20", 20),
  makeMetricBolt("M24", 24),
];

export const boltSizeOptions: BoltSizeOption[] = [
  ...imperialBoltSizes,
  ...metricBoltSizes,
];

function makeImperialBolt(label: string, diameter: number): BoltSizeOption {
  return {
    label,
    unitSystem: "imperial",
    diameter,
    renderSize: createRenderSize(diameter),
  };
}

function makeMetricBolt(label: string, diameterMm: number): BoltSizeOption {
  const diameterInches = diameterMm / 25.4;

  return {
    label,
    unitSystem: "metric",
    diameter: diameterInches,
    renderSize: createRenderSize(diameterInches),
  };
}

function createRenderSize(diameter: number): BoltRenderSize {
  return {
    diameter,
    headAcrossFlats: 1.5 * diameter,
    headHeight: 0.6 * diameter,
    shaftLength: 2.5 * diameter,
  };
}