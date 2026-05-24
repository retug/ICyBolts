export type BrandtTableRow = {
  xIC: number;
  yIC: number;
  di: number;
  deltai: number;
  ri: number;
  Mi: number;
  Fx: number;
  Fy: number;
};

export type BrandtResult = [
  detailedOutput: unknown[],
  IC: [number, number],
  Cu: number,
  table: BrandtTableRow[],
  Mi: number
];

export function brandt(
  xloc: number[],
  yloc: number[],
  Px: number,
  Py: number,
  Mo: number,
  tol = 0.000001
): BrandtResult {
  const m = Math;

  const detailedOutput: unknown[] = [];
  const n = xloc.length;

  if (n === 0) {
    return [detailedOutput, [0, 0], 0, [], 0];
  }

  const anchor_x_bar = xloc.reduce((a, b) => a + b, 0) / n;
  const anchor_y_bar = yloc.reduce((a, b) => a + b, 0) / n;

  detailedOutput.push(["Anchor Group C.G.", [anchor_x_bar, anchor_y_bar]]);
  detailedOutput.push(["External Resultant", { Px, Py, Mo }]);

  let J = 0;

  for (let i = 0; i < n; i++) {
    J += (xloc[i] - anchor_x_bar) ** 2 + (yloc[i] - anchor_y_bar) ** 2;
  }

  if (Math.abs(Mo) < 1e-8) {
    const Fx_per_bolt = -Px / n;
    const Fy_per_bolt = -Py / n;

    const table: BrandtTableRow[] = xloc.map((x, i) => ({
      xIC: x - anchor_x_bar,
      yIC: yloc[i] - anchor_y_bar,
      di: 0,
      deltai: 0,
      ri: 0,
      Mi: 0,
      Fx: Fx_per_bolt,
      Fy: Fy_per_bolt,
    }));

    return [detailedOutput, [anchor_x_bar, anchor_y_bar], 0, table, 0];
  }

  const ax = (-Py * J) / (n * Mo);
  const ay = (Px * J) / (n * Mo);

  const IC_initial: [number, number] = [anchor_x_bar + ax, anchor_y_bar + ay];

  let [Rx, Ry, Mi, table] = icBrandt(IC_initial, xloc, yloc, Px, Py, Mo);

  let fxx = Px + Rx;
  let fyy = Py + Ry;
  let F = m.sqrt(fxx * fxx + fyy * fyy);

  let ax_new = (-fyy * J) / (n * Mo);
  let ay_new = (fxx * J) / (n * Mo);

  let IC_new: [number, number] = [...IC_initial];

  let Cu = Math.abs(Mi / Mo);

  let count = 0;

  while (count < 5000) {
    IC_new = [IC_new[0] + ax_new / 10, IC_new[1] + ay_new / 10];

    const Mp_new = momentAboutPoint(Px, Py, Mo, IC_new[0], IC_new[1]);

    [Rx, Ry, Mi, table] = icBrandt(IC_new, xloc, yloc, Px, Py, Mp_new);

    fxx = Px + Rx;
    fyy = Py + Ry;
    F = m.sqrt(fxx * fxx + fyy * fyy);

    Cu = Math.abs(Mi / Mp_new);

    ax_new = (-fyy * J) / (n * Mo);
    ay_new = (fxx * J) / (n * Mo);

    if (F <= tol) break;

    count++;
  }

  return [detailedOutput, IC_new, Cu, table, Mi];
}

function momentAboutPoint(
  Px: number,
  Py: number,
  MoAboutOrigin: number,
  x: number,
  y: number
) {
  return MoAboutOrigin + Px * y - Py * x;
}

function icBrandt(
  IC: [number, number],
  xloc: number[],
  yloc: number[],
  Px: number,
  Py: number,
  Mp: number
): [number, number, number, BrandtTableRow[]] {
  const m = Math;
  const deltamax = 0.34;

  const [ICx, ICy] = IC;

  const xIC = xloc.map((x) => x - ICx);
  const yIC = yloc.map((y) => y - ICy);

  const di = xIC.map((x, i) => {
    const d = m.sqrt(x * x + yIC[i] * yIC[i]);
    return d === 0 ? 1e-8 : d;
  });

  const dmax = Math.max(...di);

  const deltai = di.map((d) => (d / dmax) * deltamax);
  const ri = deltai.map((d) => m.pow(1 - m.exp(-10 * d), 0.55));
  const moment = ri.map((r, i) => r * di[i]);

  const Mi = moment.reduce((a, b) => a + b, 0);

  const Rult = -Mp / Mi;

  const fx = xIC.map((_, i) => ((-yIC[i] * ri[i]) / di[i]) * Rult);
  const fy = xIC.map((x, i) => ((x * ri[i]) / di[i]) * Rult);

  const Rx = fx.reduce((a, b) => a + b, 0);
  const Ry = fy.reduce((a, b) => a + b, 0);

  const table: BrandtTableRow[] = xIC.map((x, i) => ({
    xIC: x,
    yIC: yIC[i],
    di: di[i],
    deltai: deltai[i],
    ri: ri[i],
    Mi: moment[i],
    Fx: fx[i],
    Fy: fy[i],
  }));

  return [Rx, Ry, Mi, table];
}