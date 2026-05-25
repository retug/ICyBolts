import type {
  BoltDesignation,
  BoltRenderSize,
  BoltShearPlane,
  BoltStrength,
  BoltThreadCondition,
  UnitSystem,
} from "../types/bolts";

export type BoltSizeOption = {
  label: string;
  unitSystem: UnitSystem;
  diameter: number;
  area?: number;
  renderSize: BoltRenderSize;
};

export type AiscBoltCapacityRecord = {
  designation: BoltDesignation;
  threadCondition: BoltThreadCondition;
  diameterLabel: string;
  singleShear: BoltStrength;
};

export const imperialBoltSizes: BoltSizeOption[] = [
  makeImperialBolt("1/4", 0.25),
  makeImperialBolt("5/16", 0.3125),
  makeImperialBolt("3/8", 0.375),
  makeImperialBolt("7/16", 0.4375),
  makeImperialBolt("1/2", 0.5),
  makeImperialBolt("5/8", 0.625, 0.307),
  makeImperialBolt("3/4", 0.75, 0.442),
  makeImperialBolt("7/8", 0.875, 0.601),
  makeImperialBolt("1", 1.0, 0.785),
  makeImperialBolt("1 1/8", 1.125, 0.994),
  makeImperialBolt("1 1/4", 1.25, 1.23),
  makeImperialBolt("1 3/8", 1.375, 1.48),
  makeImperialBolt("1 1/2", 1.5, 1.77),
];

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

export const aiscBoltCapacities: AiscBoltCapacityRecord[] = [
  rec("Group A", "N", "5/8", 8.29, 12.4),
  rec("Group A", "N", "3/4", 11.9, 17.9),
  rec("Group A", "N", "7/8", 16.2, 24.3),
  rec("Group A", "N", "1", 21.2, 31.8),
  rec("Group A", "N", "1 1/8", 26.8, 40.3),
  rec("Group A", "N", "1 1/4", 33.2, 49.8),
  rec("Group A", "N", "1 3/8", 40.0, 59.9),
  rec("Group A", "N", "1 1/2", 47.8, 71.7),

  rec("Group A", "X", "5/8", 10.4, 15.7),
  rec("Group A", "X", "3/4", 15.0, 22.5),
  rec("Group A", "X", "7/8", 20.4, 30.7),
  rec("Group A", "X", "1", 26.7, 40.0),
  rec("Group A", "X", "1 1/8", 33.8, 50.7),
  rec("Group A", "X", "1 1/4", 41.8, 62.7),
  rec("Group A", "X", "1 3/8", 50.3, 75.5),
  rec("Group A", "X", "1 1/2", 60.2, 90.3),

  rec("Group B", "N", "5/8", 10.4, 15.7),
  rec("Group B", "N", "3/4", 15.0, 22.5),
  rec("Group B", "N", "7/8", 20.4, 30.7),
  rec("Group B", "N", "1", 26.7, 40.0),
  rec("Group B", "N", "1 1/8", 33.8, 50.7),
  rec("Group B", "N", "1 1/4", 41.8, 62.7),
  rec("Group B", "N", "1 3/8", 50.3, 75.5),
  rec("Group B", "N", "1 1/2", 60.2, 90.3),

  rec("Group B", "X", "5/8", 12.9, 19.3),
  rec("Group B", "X", "3/4", 18.6, 27.8),
  rec("Group B", "X", "7/8", 25.2, 37.9),
  rec("Group B", "X", "1", 33.0, 49.5),
  rec("Group B", "X", "1 1/8", 41.7, 62.6),
  rec("Group B", "X", "1 1/4", 51.7, 77.5),
  rec("Group B", "X", "1 3/8", 62.2, 93.2),
  rec("Group B", "X", "1 1/2", 74.3, 112),

  rec("Group C", "N", "1", 35.3, 53.0),
  rec("Group C", "N", "1 1/8", 44.7, 67.1),
  rec("Group C", "N", "1 1/4", 55.4, 83.0),

  rec("Group C", "X", "1", 44.4, 66.6),
  rec("Group C", "X", "1 1/8", 56.2, 84.3),
  rec("Group C", "X", "1 1/4", 69.5, 104),

  rec("A307", "not-applicable", "5/8", 4.14, 6.23),
  rec("A307", "not-applicable", "3/4", 5.97, 8.97),
  rec("A307", "not-applicable", "7/8", 8.11, 12.2),
  rec("A307", "not-applicable", "1", 10.6, 15.9),
  rec("A307", "not-applicable", "1 1/8", 13.4, 20.2),
  rec("A307", "not-applicable", "1 1/4", 16.6, 25.0),
  rec("A307", "not-applicable", "1 3/8", 20.0, 30.0),
  rec("A307", "not-applicable", "1 1/2", 23.9, 35.9),
];

export function getBoltShearStrength(
  designation: BoltDesignation,
  threadCondition: BoltThreadCondition,
  diameterLabel: string,
  shearPlane: BoltShearPlane
): BoltStrength {
  const record = aiscBoltCapacities.find(
    (r) =>
      r.designation === designation &&
      r.threadCondition === threadCondition &&
      r.diameterLabel === diameterLabel
  );

  if (!record) {
    return { asd: null, lrfd: null };
  }

  const factor = shearPlane === "double" ? 2 : 1;

  return {
    asd: record.singleShear.asd === null ? null : record.singleShear.asd * factor,
    lrfd: record.singleShear.lrfd === null ? null : record.singleShear.lrfd * factor,
  };
}

function rec(
  designation: BoltDesignation,
  threadCondition: BoltThreadCondition,
  diameterLabel: string,
  asd: number | null,
  lrfd: number | null
): AiscBoltCapacityRecord {
  return {
    designation,
    threadCondition,
    diameterLabel,
    singleShear: { asd, lrfd },
  };
}

function makeImperialBolt(
  label: string,
  diameter: number,
  area?: number
): BoltSizeOption {
  return {
    label,
    unitSystem: "imperial",
    diameter,
    area,
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