import type { AppSettings } from "../types/app";
import type { AppliedLoad, BoltData } from "../types/bolts";
import type { ViewOptions } from "../components/ViewOptionsPanel";
import type { CurrentBoltData } from "../App";

export type ICyBoltsProjectFile = {
  fileType: "ICyBolts Project";
  version: 1;
  savedAt: string;
  settings: AppSettings;
  currentBoltData: CurrentBoltData;
  bolts: BoltData[];
  loads: AppliedLoad[];
  viewOptions?: ViewOptions;
};

function cleanBoltsForSave(bolts: BoltData[]): BoltData[] {
  return bolts.map(({ isSelected, isHovered, ...bolt }) => bolt);
}

function cleanLoadsForSave(loads: AppliedLoad[]): AppliedLoad[] {
  return loads.map(({ isSelected, isHovered, ...load }) => load);
}

export function createProjectFile(input: {
  settings: AppSettings;
  currentBoltData: CurrentBoltData;
  bolts: BoltData[];
  loads: AppliedLoad[];
  viewOptions?: ViewOptions;
}): ICyBoltsProjectFile {
  return {
    fileType: "ICyBolts Project",
    version: 1,
    savedAt: new Date().toISOString(),
    settings: input.settings,
    currentBoltData: input.currentBoltData,
    bolts: cleanBoltsForSave(input.bolts),
    loads: cleanLoadsForSave(input.loads),
    viewOptions: input.viewOptions,
  };
}

export function downloadProjectJson(projectFile: ICyBoltsProjectFile) {
  const json = JSON.stringify(projectFile, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `icybolts-project-${new Date()
    .toISOString()
    .slice(0, 10)}.json`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export async function readProjectJsonFile(
  file: File
): Promise<ICyBoltsProjectFile> {
  const text = await file.text();
  const parsed = JSON.parse(text) as Partial<ICyBoltsProjectFile>;

  if (parsed.fileType !== "ICyBolts Project") {
    throw new Error("This does not appear to be an ICyBolts project file.");
  }

  if (!Array.isArray(parsed.bolts) || !Array.isArray(parsed.loads)) {
    throw new Error("The ICyBolts project file is missing bolts or loads.");
  }

  if (!parsed.settings || !parsed.currentBoltData) {
    throw new Error("The ICyBolts project file is missing project settings.");
  }

  return parsed as ICyBoltsProjectFile;
}