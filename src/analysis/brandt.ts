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

const DEBUG_BRANDT = true;

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

  const loadMagnitude = Math.sqrt(Px ** 2 + Py ** 2);
  const loadScale = loadMagnitude > 1e-9 ? loadMagnitude : 1;

  if (DEBUG_BRANDT) {
    console.group("Brandt Method Debug");
    console.log("Input", {
      xloc,
      yloc,
      Px,
      Py,
      Mo,
      J,
      n,
      centroid: [anchor_x_bar, anchor_y_bar],
      loadMagnitude,
      loadScale,
    });
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

    if (DEBUG_BRANDT) {
      console.log("Mo is zero. Direct shear case only.", {
        Fx_per_bolt,
        Fy_per_bolt,
        table,
      });
      console.groupEnd();
    }

    return [detailedOutput, [anchor_x_bar, anchor_y_bar], 0, table, 0];
  }

  const ax = (-Py * J) / (n * Mo);
  const ay = (Px * J) / (n * Mo);

  const IC_initial: [number, number] = [anchor_x_bar + ax, anchor_y_bar + ay];

  let IC_new: [number, number] = [...IC_initial];

  let Mp = Mo;

  let [Rx, Ry, Mi, table] = icBrandt(IC_new, xloc, yloc, Mp);

  let fxx = Px + Rx;
  let fyy = Py + Ry;
  let F = m.sqrt(fxx * fxx + fyy * fyy);

  let ax_new = (-fyy * J) / (n * Mo);
  let ay_new = (fxx * J) / (n * Mo);

  let Cu = Math.abs(Mi / (Mp / loadScale));

  if (DEBUG_BRANDT) {
    console.log("Iteration 0 / Initial IC", {
      IC: IC_initial,
      Mi,
      Mp,
      Mp_unit: Mp / loadScale,
      Cu,
      Rx,
      Ry,
      fxx,
      fyy,
      F,
      ax_new,
      ay_new,
      table,
    });
  }

  let count = 1;

  while (count < 5000) {
    IC_new = [IC_new[0] + ax_new / 10, IC_new[1] + ay_new / 10];

    const Mp_new = momentAboutPoint(Px, Py, Mo, IC_new[0], IC_new[1]);
    const Mp_unit = Mp_new / loadScale;

    Mp = Mp_new;

    [Rx, Ry, Mi, table] = icBrandt(IC_new, xloc, yloc, Mp);

    fxx = Px + Rx;
    fyy = Py + Ry;
    F = m.sqrt(fxx * fxx + fyy * fyy);

    Cu = Math.abs(Mi / Mp_unit);

    if (DEBUG_BRANDT) {
      console.log(`Iteration ${count}`, {
        IC: IC_new,
        Mi,
        Mp_new,
        Mp_unit,
        Cu,
        Rx,
        Ry,
        fxx,
        fyy,
        F,
        ax_new,
        ay_new,
        table,
      });
    }

    ax_new = (-fyy * J) / (n * Mo);
    ay_new = (fxx * J) / (n * Mo);

    if (F <= tol) break;

    count++;
  }

  if (DEBUG_BRANDT) {
    console.log("Final Brandt Result", {
      IC: IC_new,
      Cu,
      Mi,
      iterations: count,
      table,
    });
    console.groupEnd();
  }

  return [detailedOutput, IC_new, Cu, table, Mi];
}

function momentAboutPoint(
  Px: number,
  Py: number,
  MoAboutOrigin: number,
  x: number,
  y: number
): number {
  return MoAboutOrigin + Px * y - Py * x;
}

function icBrandt(
  IC: [number, number],
  xloc: number[],
  yloc: number[],
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