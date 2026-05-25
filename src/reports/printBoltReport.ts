import type { AppliedLoad, BoltData, UnitSystem } from "../types/bolts";
import type { AppSettings } from "../types/app";
import type { BoltAnalysisResult } from "../analysis/analyzeBoltGroup";

type PrintBoltReportArgs = {
  result: BoltAnalysisResult;
  loads: AppliedLoad[];
  settings: AppSettings;
  unitSystem: UnitSystem;
  sceneImageDataUrl?: string | null;
};

function fmt(value: number | undefined | null, digits = 3) {
  return typeof value === "number" && Number.isFinite(value)
    ? value.toFixed(digits)
    : "N/A";
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getForceMagnitude(bolt: BoltData) {
  const fx = bolt.force?.fx ?? 0;
  const fy = bolt.force?.fy ?? 0;
  return bolt.force?.magnitude ?? Math.sqrt(fx * fx + fy * fy);
}

function getMaxBoltForce(bolts: BoltData[]) {
  return Math.max(0, ...bolts.map(getForceMagnitude));
}

function getBoltCapacity(bolt: BoltData | undefined) {
  return bolt?.capacity ?? null;
}

function getMaxDcr(result: BoltAnalysisResult) {
  const capacities = result.bolts
    .map((b) => getBoltCapacity(b))
    .filter((c): c is number => typeof c === "number" && c > 0);

  if (capacities.length === 0) return null;

  return Math.max(
    ...result.bolts.map((bolt) => {
      const capacity = getBoltCapacity(bolt);
      if (!capacity || capacity <= 0) return 0;
      return getForceMagnitude(bolt) / capacity;
    })
  );
}

function getLoadComponents(load: AppliedLoad) {
  const angleRad = (load.angleDeg * Math.PI) / 180;

  return {
    fx: load.magnitude * Math.cos(angleRad),
    fy: load.magnitude * Math.sin(angleRad),
    moment: load.magnitude * Math.cos(angleRad) * -load.y +
      load.magnitude * Math.sin(angleRad) * load.x,
  };
}

export function printBoltReport({
  result,
  loads,
  settings,
  unitSystem,
  sceneImageDataUrl,
}: PrintBoltReportArgs) {
  const lengthUnit = unitSystem === "metric" ? "mm" : "in";
  const forceUnit = unitSystem === "metric" ? "kN" : "kips";
  const momentUnit = unitSystem === "metric" ? "kN-mm" : "kip-in";

  const lengthFactor = unitSystem === "metric" ? 25.4 : 1;
  const forceFactor = unitSystem === "metric" ? 4.4482216 : 1;
  const momentFactor = unitSystem === "metric" ? 112.984829 : 1;

  const formatLength = (v: number) => `${fmt(v * lengthFactor)} ${lengthUnit}`;
  const formatForce = (v: number) => `${fmt(v * forceFactor)} ${forceUnit}`;
  const formatMoment = (v: number) => `${fmt(v * momentFactor)} ${momentUnit}`;

  const maxBoltForce = getMaxBoltForce(result.bolts);
  const maxDcr = getMaxDcr(result);
  const status = maxDcr === null ? "N/A" : maxDcr <= 1 ? "OK" : "No Good";

  const loadSums = loads.reduce(
    (sum, load) => {
      const c = getLoadComponents(load);
      return {
        fx: sum.fx + c.fx,
        fy: sum.fy + c.fy,
        moment: sum.moment + c.moment,
      };
    },
    { fx: 0, fy: 0, moment: 0 }
  );

  const firstBolt = result.bolts[0];

  const boltType = firstBolt?.boltType ?? "bearing";
  const phiFactor = firstBolt?.phi ?? (boltType === "bearing" ? 0.75 : null);
  const omegaFactor = firstBolt?.omega ?? (boltType === "bearing" ? 2.0 : null);

  const boltRows = result.bolts
    .map((bolt, index) => {
      const capacity = getBoltCapacity(bolt);
      const demand = getForceMagnitude(bolt);
      const dcr = capacity && capacity > 0 ? demand / capacity : null;

      return `
        <tr>
          <td>B${index + 1}</td>
          <td>${escapeHtml(bolt.label)}</td>
          <td>${formatLength(bolt.x)}</td>
          <td>${formatLength(bolt.y)}</td>
          <td>${formatForce(bolt.force?.fx ?? 0)}</td>
          <td>${formatForce(bolt.force?.fy ?? 0)}</td>
          <td>${formatForce(demand)}</td>
          <td>${capacity ? formatForce(capacity) : "N/A"}</td>
          <td>${dcr === null ? "N/A" : fmt(dcr)}</td>
        </tr>
      `;
    })
    .join("");

  const loadRows = loads
    .map((load) => {
      const c = getLoadComponents(load);

      return `
        <tr>
          <td>${escapeHtml(load.label)}</td>
          <td>${formatLength(load.x)}</td>
          <td>${formatLength(load.y)}</td>
          <td>${formatForce(c.fx)}</td>
          <td>${formatForce(c.fy)}</td>
          <td>${formatMoment(c.moment)}</td>
        </tr>
      `;
    })
    .join("");

  const html = `
<!doctype html>
<html>
<head>
  <title>ICyBolts Report</title>
  <style>
    @page { size: letter; margin: 0.55in; }

    body {
      font-family: Arial, sans-serif;
      color: #111827;
      margin: 0;
      background: white;
    }

    .page {
      page-break-after: always;
    }

    .page:last-child {
      page-break-after: auto;
    }

    h1 {
      margin: 0 0 6px;
      font-size: 28px;
      color: #0f172a;
    }

    h2 {
      margin: 0 0 14px;
      font-size: 20px;
      color: #1e293b;
      border-bottom: 2px solid #2563eb;
      padding-bottom: 6px;
    }

    h3 {
      margin: 18px 0 8px;
      font-size: 15px;
      color: #334155;
    }

    .subtitle {
      color: #64748b;
      font-size: 13px;
      margin-bottom: 24px;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin: 16px 0;
    }

    .two {
      grid-template-columns: repeat(2, 1fr);
    }

    .card {
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      padding: 14px;
      background: #f8fafc;
    }

    .label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #64748b;
      font-weight: 700;
      margin-bottom: 6px;
    }

    .value {
      font-size: 19px;
      font-weight: 800;
      color: #0f172a;
    }

    .ok { color: #15803d; }
    .ng { color: #b91c1c; }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      font-size: 11px;
    }

    th {
      background: #e2e8f0;
      color: #0f172a;
      text-align: left;
      padding: 7px;
      border: 1px solid #cbd5e1;
    }

    td {
      padding: 7px;
      border: 1px solid #cbd5e1;
    }

    .scene {
      width: 100%;
      max-height: 430px;
      object-fit: contain;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      background: #020617;
      margin-bottom: 16px;
    }
  </style>
</head>

<body>
  <section class="page">
    <h1>ICyBolts Bolt Group Analysis Report</h1>
    <div class="subtitle">Generated from the current webpage analysis results.</div>

    <h2>1. Summary</h2>

    <div class="grid">
      <div class="card">
        <div class="label">Bolt Group Coefficient C</div>
        <div class="value">${fmt(result.Cu, 4)}</div>
      </div>

      <div class="card">
        <div class="label">Max Bolt Demand</div>
        <div class="value">${formatForce(maxBoltForce)}</div>
      </div>

      <div class="card">
        <div class="label">Max Bolt DCR</div>
        <div class="value">${maxDcr === null ? "N/A" : fmt(maxDcr)}</div>
      </div>

      <div class="card">
        <div class="label">Status</div>
        <div class="value ${status === "OK" ? "ok" : "ng"}">${status}</div>
      </div>

      <div class="card">
        <div class="label">Unit System</div>
        <div class="value">${escapeHtml(unitSystem)}</div>
      </div>

      <div class="card">
        <div class="label">Design Code</div>
        <div class="value">${escapeHtml(settings.designCode)}</div>
      </div>
    </div>
  </section>

  <section class="page">
    <h2>2. Bolt Data</h2>

    <div class="grid two">
      <div class="card">
        <div class="label">Bolt Type</div>
        <div class="value">${escapeHtml(boltType)}</div>
      </div>

      <div class="card">
        <div class="label">Bolt Diameter / Size</div>
        <div class="value">${escapeHtml(firstBolt?.label ?? "N/A")}</div>
      </div>

      <div class="card">
        <div class="label">Phi Factor</div>
        <div class="value">${
          boltType === "bearing" ? "0.75" : "See slip-critical settings"
        }</div>
      </div>

      <div class="card">
        <div class="label">Omega Factor</div>
        <div class="value">${
          boltType === "bearing" ? "2.00" : "See slip-critical settings"
        }</div>
      </div>
    </div>

    <h3>Bolt Locations and Forces</h3>

    <table>
      <thead>
        <tr>
          <th>Bolt</th>
          <th>Size</th>
          <th>X</th>
          <th>Y</th>
          <th>Fx</th>
          <th>Fy</th>
          <th>Resultant</th>
          <th>Capacity</th>
          <th>DCR</th>
        </tr>
      </thead>
      <tbody>${boltRows}</tbody>
    </table>
  </section>

  <section class="page">
    <h2>3. Applied Loading</h2>

    <table>
      <thead>
        <tr>
          <th>Load</th>
          <th>X Location</th>
          <th>Y Location</th>
          <th>Fx</th>
          <th>Fy</th>
          <th>Moment About Origin</th>
        </tr>
      </thead>
      <tbody>${loadRows}</tbody>
    </table>

    <h3>Summation of Applied Loads</h3>

    <div class="grid">
      <div class="card">
        <div class="label">ΣFx</div>
        <div class="value">${formatForce(loadSums.fx)}</div>
      </div>

      <div class="card">
        <div class="label">ΣFy</div>
        <div class="value">${formatForce(loadSums.fy)}</div>
      </div>

      <div class="card">
        <div class="label">ΣM</div>
        <div class="value">${formatMoment(loadSums.moment)}</div>
      </div>
    </div>
  </section>

  <section class="page">
    <h2>4. Results</h2>

    ${
      sceneImageDataUrl
        ? `<img class="scene" src="${sceneImageDataUrl}" />`
        : `<div class="card">Three.js scene screenshot was not available.</div>`
    }

    <div class="grid">
      <div class="card">
        <div class="label">C Coefficient</div>
        <div class="value">${fmt(result.Cu, 4)}</div>
      </div>

      <div class="card">
        <div class="label">Max Bolt DCR</div>
        <div class="value">${maxDcr === null ? "N/A" : fmt(maxDcr)}</div>
      </div>

      <div class="card">
        <div class="label">Status</div>
        <div class="value ${status === "OK" ? "ok" : "ng"}">${status}</div>
      </div>

      <div class="card">
        <div class="label">IC X</div>
        <div class="value">${formatLength(result.IC[0])}</div>
      </div>

      <div class="card">
        <div class="label">IC Y</div>
        <div class="value">${formatLength(result.IC[1])}</div>
      </div>

      <div class="card">
        <div class="label">Mi</div>
        <div class="value">${fmt(result.Mi, 4)}</div>
      </div>
    </div>
  </section>

  <script>
    window.onload = () => {
      window.focus();
      window.print();
    };
  </script>
</body>
</html>
`;

  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    alert("Popup blocked. Please allow popups for this site to print the PDF.");
    return;
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}