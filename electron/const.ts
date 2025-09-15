import { app } from "electron";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const userDataPath = app.getPath("userData");

export const CONFIG_PATH = path.join(userDataPath, "config.json");
export const INFO_PATH = path.join(userDataPath, "info.json");
export const MODS_DIR = path.join(userDataPath, "Mods");

export const dir = {
  __filename,
  __dirname,
  CONFIG_PATH,
  INFO_PATH,
  MODS_DIR,
};
