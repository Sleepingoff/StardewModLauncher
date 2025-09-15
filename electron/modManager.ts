import fs from "fs";
import path from "path";
import { dir } from "./const";

export function getModsFromDisk(): string[] {
  const modsPath = dir.MODS_DIR;
  if (!fs.existsSync(modsPath)) return [];

  return fs.readdirSync(modsPath).filter((dir) => {
    const fullPath = path.join(modsPath, dir);
    return fs.statSync(fullPath).isDirectory();
  });
}
