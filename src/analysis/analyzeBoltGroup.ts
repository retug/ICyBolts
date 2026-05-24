import type { AppliedLoad, BoltData } from "../types/bolts";

import { brandt } from "./brandt";

export type ForceSummary = {
  fx: number;
  fy: number;
  moment: number;
};

export type BoltAnalysisResult = {
  bolts: BoltData[];
  IC: [number, number];
  Cu: number;
  Mi: number;
  externalForces: ForceSummary;
  boltForces: ForceSummary;
};

export function analyzeBoltGroup(
  bolts: BoltData[],
  loads: AppliedLoad[]
): BoltAnalysisResult {
  const emptyResult: BoltAnalysisResult = {
    bolts,
    IC: [0, 0],
    Cu: 0,
    Mi: 0,
    externalForces: {
      fx: 0,
      fy: 0,
      moment: 0,
    },
    boltForces: {
      fx: 0,
      fy: 0,
      moment: 0,
    },
  };

  if (bolts.length === 0 || loads.length === 0) {
    return emptyResult;
  }

  const externalForces = sumExternalLoads(loads);

  const xloc = bolts.map((b) => b.x);
  const yloc = bolts.map((b) => b.y);

  const result = brandt(
    xloc,
    yloc,
    externalForces.fx,
    externalForces.fy,
    externalForces.moment
  );

  const IC = result[1];
  const Cu = result[2];
  const table = result[3];
  const Mi = result[4];

  const analyzedBolts = bolts.map((bolt, i) => ({
    ...bolt,
    force: {
      fx: table[i].Fx,
      fy: table[i].Fy,
      magnitude: Math.sqrt(table[i].Fx ** 2 + table[i].Fy ** 2),
    },
  }));

  const boltForces = analyzedBolts.reduce(
    (sum, bolt) => {
      const fx = bolt.force?.fx ?? 0;
      const fy = bolt.force?.fy ?? 0;

      return {
        fx: sum.fx + fx,
        fy: sum.fy + fy,
        moment: sum.moment + bolt.x * fy - bolt.y * fx,
      };
    },
    {
      fx: 0,
      fy: 0,
      moment: 0,
    }
  );

  return {
    bolts: analyzedBolts,
    IC,
    Cu,
    Mi,
    externalForces,
    boltForces,
  };
}

function sumExternalLoads(loads: AppliedLoad[]): ForceSummary {
  return loads.reduce(
    (sum, load) => {
      const fx = getLoadFx(load);
      const fy = getLoadFy(load);

      return {
        fx: sum.fx + fx,
        fy: sum.fy + fy,
        moment: sum.moment + load.x * fy - load.y * fx + (load.moment ?? 0),
      };
    },
    {
      fx: 0,
      fy: 0,
      moment: 0,
    }
  );
}

function getLoadFx(load: AppliedLoad) {
  if (load.inputMode === "components") {
    return load.fx;
  }

  return load.magnitude * Math.cos((load.angleDeg * Math.PI) / 180);
}

function getLoadFy(load: AppliedLoad) {
  if (load.inputMode === "components") {
    return load.fy;
  }

  return load.magnitude * Math.sin((load.angleDeg * Math.PI) / 180);
}