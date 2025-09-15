import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_PATH = path.join(__dirname, "config.json");
const INFO_PATH = path.join(__dirname, "info.json");
const MODS_DIR = path.join(__dirname, "Mods");

export const dir = {
  __filename,
  __dirname,
  CONFIG_PATH,
  INFO_PATH,
  MODS_DIR,
};
