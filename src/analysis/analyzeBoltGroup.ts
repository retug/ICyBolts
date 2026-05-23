import type {
  AppliedLoad,
  BoltData,
} from "../types/bolts";

import { brandt } from "./brandt";

export type BoltAnalysisResult = {
  bolts: BoltData[];
  IC: [number, number];
  Cu: number;
  Mi: number;
};

export function analyzeBoltGroup(
  bolts: BoltData[],
  loads: AppliedLoad[]
): BoltAnalysisResult {
  if (loads.length === 0) {
    return {
      bolts,
      IC: [0, 0],
      Cu: 0,
      Mi: 0,
    };
  }

  const load = loads[0];

  const xloc = bolts.map((b) => b.x);
  const yloc = bolts.map((b) => b.y);

  const result = brandt(
    xloc,
    yloc,
    load.x,
    load.y,
    load.angleDeg,
    load.magnitude
  );

  const IC = result[1] as [number, number];
  const Cu = result[2] as number;

  const table = result[3] as {
    Fx: number;
    Fy: number;
  }[];

  const Mi = result[4] as number;

  const analyzedBolts = bolts.map((bolt, i) => ({
    ...bolt,
    force: {
      fx: table[i].Fx,
      fy: table[i].Fy,
      magnitude: Math.sqrt(table[i].Fx ** 2 + table[i].Fy ** 2),
    },
  }));

  return {
    bolts: analyzedBolts,
    IC,
    Cu,
    Mi,
  };
}