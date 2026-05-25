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
  area: number | null;
  renderSize: BoltRenderSize;
};

export type BearingLimitState = "bolt-shear";

export type SlipCriticalHoleType = "STD/SSLT" | "OVS/SSLP" | "LSL";
export type SlipCriticalFayingSurface = "Class A" | "Class B";

export type BearingShearDiameterData = {
  area: number;
  strengths: Partial<
    Record<
      BoltDesignation,
      Partial<Record<BoltThreadCondition, Record<BoltShearPlane, BoltStrength>>>
    >
  >;
};

export const bearingResistanceFactors: Record<
  BearingLimitState,
  {
    omega: number;
    phi: number;
  }
> = {
  "bolt-shear": {
    omega: 2.0,
    phi: 0.75,
  },
};

export const bearingShearData: Record<string, BearingShearDiameterData> = {
  "5/8": {
    area: 0.307,
    strengths: {
      "Group A": {
        N: shear(8.29, 12.4, 16.6, 24.9),
        X: shear(10.4, 15.7, 20.9, 31.3),
      },
      "Group B": {
        N: shear(10.4, 15.7, 20.9, 31.3),
        X: shear(12.9, 19.3, 25.8, 38.7),
      },
      A307: {
        "not-applicable": shear(4.14, 6.23, 8.29, 12.5),
      },
    },
  },

  "3/4": {
    area: 0.442,
    strengths: {
      "Group A": {
        N: shear(11.9, 17.9, 23.9, 35.8),
        X: shear(15.0, 22.5, 30.1, 45.1),
      },
      "Group B": {
        N: shear(15.0, 22.5, 30.1, 45.1),
        X: shear(18.6, 27.8, 37.1, 55.7),
      },
      A307: {
        "not-applicable": shear(5.97, 8.97, 11.9, 17.9),
      },
    },
  },

  "7/8": {
    area: 0.601,
    strengths: {
      "Group A": {
        N: shear(16.2, 24.3, 32.5, 48.7),
        X: shear(20.4, 30.7, 40.9, 61.3),
      },
      "Group B": {
        N: shear(20.4, 30.7, 40.9, 61.3),
        X: shear(25.2, 37.9, 50.5, 75.7),
      },
      A307: {
        "not-applicable": shear(8.11, 12.2, 16.2, 24.4),
      },
    },
  },

  "1": {
    area: 0.785,
    strengths: {
      "Group A": {
        N: shear(21.2, 31.8, 42.4, 63.6),
        X: shear(26.7, 40.0, 53.4, 80.1),
      },
      "Group B": {
        N: shear(26.7, 40.0, 53.4, 80.1),
        X: shear(33.0, 49.5, 65.9, 98.9),
      },
      "Group C": {
        N: shear(35.3, 53.0, 70.7, 106.0),
        X: shear(44.4, 66.6, 88.7, 133.0),
      },
      A307: {
        "not-applicable": shear(10.6, 15.9, 21.2, 31.9),
      },
    },
  },

  "1 1/8": {
    area: 0.994,
    strengths: {
      "Group A": {
        N: shear(26.8, 40.3, 53.7, 80.5),
        X: shear(33.8, 50.7, 67.6, 101.0),
      },
      "Group B": {
        N: shear(33.8, 50.7, 67.6, 101.0),
        X: shear(41.7, 62.6, 83.5, 125.0),
      },
      "Group C": {
        N: shear(44.7, 67.1, 89.5, 134.0),
        X: shear(56.2, 84.3, 112.0, 169.0),
      },
      A307: {
        "not-applicable": shear(13.4, 20.2, 26.8, 40.4),
      },
    },
  },

  "1 1/4": {
    area: 1.23,
    strengths: {
      "Group A": {
        N: shear(33.2, 49.8, 66.4, 99.6),
        X: shear(41.8, 62.7, 83.6, 125.0),
      },
      "Group B": {
        N: shear(41.8, 62.7, 83.6, 125.0),
        X: shear(51.7, 77.5, 103.0, 155.0),
      },
      "Group C": {
        N: shear(55.4, 83.0, 111.0, 166.0),
        X: shear(69.5, 104.0, 139.0, 209.0),
      },
      A307: {
        "not-applicable": shear(16.6, 25.0, 33.2, 49.9),
      },
    },
  },

  "1 3/8": {
    area: 1.48,
    strengths: {
      "Group A": {
        N: shear(40.0, 59.9, 79.9, 120.0),
        X: shear(50.3, 75.5, 101.0, 151.0),
      },
      "Group B": {
        N: shear(50.3, 75.5, 101.0, 151.0),
        X: shear(62.2, 93.2, 124.0, 186.0),
      },
      A307: {
        "not-applicable": shear(20.0, 30.0, 40.0, 60.1),
      },
    },
  },

  "1 1/2": {
    area: 1.77,
    strengths: {
      "Group A": {
        N: shear(47.8, 71.7, 95.6, 143.0),
        X: shear(60.2, 90.3, 120.0, 181.0),
      },
      "Group B": {
        N: shear(60.2, 90.3, 120.0, 181.0),
        X: shear(74.3, 112.0, 149.0, 223.0),
      },
      A307: {
        "not-applicable": shear(23.9, 35.9, 47.8, 71.9),
      },
    },
  },
};

export type SlipCriticalResistance = {
  asd: number | null;
  lrfd: number | null;
};

export type SlipCriticalHoleResistance = {
  omega: number;
  phi: number;
  single: SlipCriticalResistance;
  double: SlipCriticalResistance;
};

export type SlipCriticalDiameterData = {
  pretension: number | null;
  holes: Record<SlipCriticalHoleType, SlipCriticalHoleResistance>;
};

export type SlipCriticalBoltGroup = "Group A" | "Group B" | "Group C";

export const slipCriticalFayingSurfaces: Record<
  SlipCriticalFayingSurface,
  {
    mu: number;
    multiplierFromClassA: number;
  }
> = {
  "Class A": {
    mu: 0.3,
    multiplierFromClassA: 1.0,
  },
  "Class B": {
    mu: 0.5,
    multiplierFromClassA: 1.67,
  },
};

export const slipCriticalHoleFactors: Record<
  SlipCriticalHoleType,
  {
    omega: number;
    phi: number;
  }
> = {
  "STD/SSLT": {
    omega: 1.5,
    phi: 1.0,
  },
  "OVS/SSLP": {
    omega: 1.76,
    phi: 0.85,
  },
  "LSL": {
    omega: 2.14,
    phi: 0.7,
  },
};

export const slipCriticalData: Record<
  SlipCriticalBoltGroup,
  Record<string, SlipCriticalDiameterData>
> = {
  "Group A": {
    "5/8": slip(19, {
      "STD/SSLT": v(4.29, 6.44, 8.59, 12.9),
      "OVS/SSLP": v(3.66, 5.47, 7.32, 10.9),
      "LSL": v(3.01, 4.51, 6.02, 9.02),
    }),
    "3/4": slip(28, {
      "STD/SSLT": v(6.33, 9.49, 12.7, 19.0),
      "OVS/SSLP": v(5.39, 8.07, 10.8, 16.1),
      "LSL": v(4.44, 6.64, 8.87, 13.3),
    }),
    "7/8": slip(39, {
      "STD/SSLT": v(8.81, 13.2, 17.6, 26.4),
      "OVS/SSLP": v(7.51, 11.2, 15.0, 22.5),
      "LSL": v(6.18, 9.25, 12.4, 18.5),
    }),
    "1": slip(51, {
      "STD/SSLT": v(11.5, 17.3, 23.1, 34.6),
      "OVS/SSLP": v(9.82, 14.7, 19.6, 29.4),
      "LSL": v(8.08, 12.1, 16.2, 24.2),
    }),
    "1 1/8": slip(64, {
      "STD/SSLT": v(14.5, 21.7, 28.9, 43.4),
      "OVS/SSLP": v(12.3, 18.4, 24.7, 36.9),
      "LSL": v(10.1, 15.2, 20.3, 30.4),
    }),
    "1 1/4": slip(81, {
      "STD/SSLT": v(18.3, 27.5, 36.6, 54.9),
      "OVS/SSLP": v(15.6, 23.3, 31.2, 46.7),
      "LSL": v(12.8, 19.2, 25.7, 38.4),
    }),
    "1 3/8": slip(97, {
      "STD/SSLT": v(21.9, 32.9, 43.8, 65.8),
      "OVS/SSLP": v(18.7, 28.0, 37.4, 56.0),
      "LSL": v(15.4, 23.0, 30.7, 46.0),
    }),
    "1 1/2": slip(118, {
      "STD/SSLT": v(26.7, 40.0, 53.3, 80.0),
      "OVS/SSLP": v(22.7, 34.0, 45.3, 68.0),
      "LSL": v(18.7, 28.0, 37.4, 56.0),
    }),
  },

  "Group B": {
    "5/8": slip(24, {
      "STD/SSLT": v(5.42, 8.14, 10.8, 16.3),
      "OVS/SSLP": v(4.62, 6.92, 9.23, 13.8),
      "LSL": v(3.8, 5.7, 7.6, 11.4),
    }),
    "3/4": slip(35, {
      "STD/SSLT": v(7.91, 11.9, 15.8, 23.7),
      "OVS/SSLP": v(6.74, 10.1, 13.5, 20.2),
      "LSL": v(5.54, 8.31, 11.1, 16.6),
    }),
    "7/8": slip(49, {
      "STD/SSLT": v(11.1, 16.6, 22.1, 33.2),
      "OVS/SSLP": v(9.44, 14.1, 18.9, 28.2),
      "LSL": v(7.76, 11.6, 15.5, 23.3),
    }),
    "1": slip(64, {
      "STD/SSLT": v(14.5, 21.7, 28.9, 43.4),
      "OVS/SSLP": v(12.3, 18.4, 24.7, 36.9),
      "LSL": v(10.1, 15.2, 20.3, 30.4),
    }),
    "1 1/8": slip(80, {
      "STD/SSLT": v(18.1, 27.2, 36.2, 54.3),
      "OVS/SSLP": v(15.4, 23.1, 30.8, 46.1),
      "LSL": v(12.7, 19.0, 25.3, 38.0),
    }),
    "1 1/4": slip(102, {
      "STD/SSLT": v(23.1, 34.6, 46.2, 69.3),
      "OVS/SSLP": v(19.6, 29.4, 39.3, 58.8),
      "LSL": v(16.2, 24.2, 32.3, 48.4),
    }),
    "1 3/8": slip(121, {
      "STD/SSLT": v(27.4, 41.0, 54.7, 82.0),
      "OVS/SSLP": v(23.3, 34.9, 46.6, 69.7),
      "LSL": v(19.1, 28.5, 38.3, 57.4),
    }),
    "1 1/2": slip(148, {
      "STD/SSLT": v(33.4, 50.2, 66.9, 100.0),
      "OVS/SSLP": v(28.5, 42.6, 57.0, 85.3),
      "LSL": v(23.4, 35.1, 46.9, 70.2),
    }),
  },

  "Group C": {
    "1": slip(90, {
      "STD/SSLT": v(20.3, 30.5, 40.7, 61.0),
      "OVS/SSLP": v(17.3, 25.9, 34.7, 51.9),
      "LSL": v(14.3, 21.4, 28.5, 42.7),
    }),
    "1 1/8": slip(113, {
      "STD/SSLT": v(25.5, 38.3, 51.1, 76.6),
      "OVS/SSLP": v(21.8, 32.6, 43.5, 65.1),
      "LSL": v(17.9, 26.8, 35.8, 53.6),
    }),
    "1 1/4": slip(143, {
      "STD/SSLT": v(32.3, 48.5, 64.6, 97.0),
      "OVS/SSLP": v(27.5, 41.2, 55.1, 82.4),
      "LSL": v(22.7, 33.9, 45.3, 67.9),
    }),
  },
};

export const imperialBoltSizes: BoltSizeOption[] = [
  makeImperialBolt("1/4", 0.25, null),
  makeImperialBolt("5/16", 0.3125, null),
  makeImperialBolt("3/8", 0.375, null),
  makeImperialBolt("7/16", 0.4375, null),
  makeImperialBolt("1/2", 0.5, null),
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

export function getBoltShearStrength(params: {
  boltType: "bearing" | "slip-critical";
  designation: BoltDesignation;
  threadCondition: BoltThreadCondition;
  diameterLabel: string;
  shearPlane: BoltShearPlane;
  fayingSurface?: SlipCriticalFayingSurface;
  holeType?: SlipCriticalHoleType;
}): BoltStrength {
  if (params.boltType === "slip-critical") {
    const slipStrength = getSlipCriticalResistance({
      boltGroup: params.designation as SlipCriticalBoltGroup,
      diameterLabel: params.diameterLabel,
      holeType: params.holeType ?? "STD/SSLT",
      shearPlane: params.shearPlane,
      fayingSurface: params.fayingSurface ?? "Class A",
    });

    return slipStrength ?? {
      asd: null,
      lrfd: null,
    };
  }

  const diameterData = bearingShearData[params.diameterLabel];

  if (!diameterData) {
    return {
      asd: null,
      lrfd: null,
    };
  }

  const normalizedThreadCondition =
    params.designation === "A307"
      ? "not-applicable"
      : params.threadCondition;

  return (
    diameterData.strengths[params.designation]?.[
      normalizedThreadCondition
    ]?.[params.shearPlane] ?? {
      asd: null,
      lrfd: null,
    }
  );
}

export function getSlipCriticalResistance(params: {
  boltGroup: SlipCriticalBoltGroup;
  diameterLabel: string;
  holeType: SlipCriticalHoleType;
  shearPlane: BoltShearPlane;
  fayingSurface: SlipCriticalFayingSurface;
}): SlipCriticalResistance | null {
  const diameterData = slipCriticalData[params.boltGroup]?.[params.diameterLabel];

  if (!diameterData) return null;

  const holeData = diameterData.holes[params.holeType];
  const base = params.shearPlane === "single" ? holeData.single : holeData.double;

  const multiplier =
    slipCriticalFayingSurfaces[params.fayingSurface].multiplierFromClassA;

  return {
    asd: base.asd === null ? null : round(base.asd * multiplier, 2),
    lrfd: base.lrfd === null ? null : round(base.lrfd * multiplier, 2),
  };
}

function makeImperialBolt(
  label: string,
  diameter: number,
  area: number | null
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
    area: null,
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

function shear(
  singleAsd: number | null,
  singleLrfd: number | null,
  doubleAsd: number | null,
  doubleLrfd: number | null
): Record<BoltShearPlane, BoltStrength> {
  return {
    single: {
      asd: singleAsd,
      lrfd: singleLrfd,
    },
    double: {
      asd: doubleAsd,
      lrfd: doubleLrfd,
    },
  };
}

function slip(
  pretension: number | null,
  holes: Record<SlipCriticalHoleType, SlipCriticalHoleResistance>
): SlipCriticalDiameterData {
  return {
    pretension,
    holes,
  };
}

function v(
  singleAsd: number | null,
  singleLrfd: number | null,
  doubleAsd: number | null,
  doubleLrfd: number | null
): SlipCriticalHoleResistance {
  return {
    omega: 0,
    phi: 0,
    single: {
      asd: singleAsd,
      lrfd: singleLrfd,
    },
    double: {
      asd: doubleAsd,
      lrfd: doubleLrfd,
    },
  };
}

for (const group of Object.values(slipCriticalData)) {
  for (const diameterData of Object.values(group)) {
    for (const holeType of Object.keys(
      diameterData.holes
    ) as SlipCriticalHoleType[]) {
      diameterData.holes[holeType].omega =
        slipCriticalHoleFactors[holeType].omega;

      diameterData.holes[holeType].phi =
        slipCriticalHoleFactors[holeType].phi;
    }
  }
}

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}