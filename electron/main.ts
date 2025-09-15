import { dir as directory } from "./const";
import fs from "fs";

// import { app, BrowserWindow, ipcMain, shell } from "electron";
// import path from "path";
// import fs from "fs-extra";
// import { fileURLToPath } from "url";
// import {
//   loadConfig,
//   saveConfig,
//   buildModMapRecursive,
// } from "./configManager.js";

let win: BrowserWindow;

function createWindow() {
  win = new BrowserWindow({
    minWidth: 560,
    minHeight: 700,
    width: 560,
    height: 800,
    webPreferences: {
      preload: path.join(directory.__dirname, "preload.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

app.whenReady().then(createWindow);

// // -------- 유틸 함수 --------

// function getModsPath(smapiPath: string) {
//   const smapiDir = path.dirname(smapiPath);
//   return path.join(smapiDir, "Mods");
// }

// // -------------------- 모드 트리 --------------------
function scanModsTreeByManifest(dir: string): Record<string, any> {
  if (!fs.existsSync(dir)) return {};
  const tree: Record<string, any> = {};

  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    if (!fs.statSync(fullPath).isDirectory()) continue;

    const manifestPath = path.join(fullPath, "manifest.json");
    if (fs.existsSync(manifestPath)) {
      tree[entry] = [];
    } else {
      const subTree = scanModsTreeByManifest(fullPath);
      if (Object.keys(subTree).length > 0) {
        tree[entry] = subTree;
      }
    }
  }
  return tree;
}

// // -------- IPC 핸들러 --------
ipcMain.handle("get-mod-list-tree", () => {
  return scanModsTreeByManifest(directory.MODS_DIR);
});

// ipcMain.handle("get-paths", () => {
//   return { modsOriginalPath: MODS_DIR, configPath: CONFIG_PATH };
// });

// ipcMain.handle("apply-mods", async (_event, { smapiPath, modStates }) => {
//   if (!smapiPath) throw new Error("smapiPath is not provided");

//   const modsUserPath = getModsPath(smapiPath);
//   const modMap = buildModMapRecursive(MODS_DIR);

//   for (const [uniqueId, enabled] of Object.entries(modStates)) {
//     const src = modMap[uniqueId];
//     if (!src) {
//       console.warn(`Mod not found for UniqueID: ${uniqueId}`);
//       continue;
//     }

//     const dest = path.join(modsUserPath, path.basename(src));
//     if (enabled) {
//       fs.copySync(src, dest);
//     } else {
//       fs.removeSync(dest);
//     }
//   }
// });

// ipcMain.handle("reset-mods", async (_event, { smapiPath, modStates }) => {
//   const modsUserPath = getModsPath(smapiPath);
//   for (const uniqueId of Object.keys(modStates)) {
//     const modPath = path.join(modsUserPath, uniqueId);
//     fs.removeSync(modPath);
//   }
// });

ipcMain.handle("read-config", async () => {
  return loadConfig();
});

// ipcMain.handle("write-config", async (_event, data) => {
//   saveConfig(CONFIG_PATH, MODS_DIR, data);
// });

// // -------- 다국어 --------
// const localesDir = path.join(__dirname, "locales");
// let currentLang = "ko";

// function loadLocale(lang: string) {
//   const filePath = path.join(localesDir, `${lang}.json`);
//   if (!fs.existsSync(filePath)) return {};
//   return JSON.parse(fs.readFileSync(filePath, "utf-8"));
// }

// ipcMain.handle("set-lang", async (_event, { lang }) => {
//   currentLang = lang;
// });

// ipcMain.handle("get-lang", async () => currentLang);

// ipcMain.handle("load-locale", async () => {
//   return loadLocale(currentLang);
// });

// // -------- Mods 폴더 열기 --------
// ipcMain.handle("open-mods-folder", async () => {
//   shell.openPath(MODS_DIR);
// });

// main.ts
import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import {
  createPreset,
  deletePreset,
  listPresets,
  loadAllPresets,
  readPreset,
  updatePreset,
} from "./presetManager";
import { folderTreeToConfig, loadConfig, saveConfig } from "./configManager";
import { getModsFromDisk } from "./modManager"; // Mods 폴더 스캔 유틸 (필요 시 구현)

// Preset 가져오기
ipcMain.handle("get-presets", () => {
  const config = loadAllPresets();
  return config || {};
});

// Preset 목록 가져오기
ipcMain.handle("get-preset-list", () => {
  return listPresets();
});

// Mods 폴더 목록 가져오기
ipcMain.handle("get-mods", () => {
  return getModsFromDisk();
});

// 프리셋 생성
ipcMain.handle(
  "create-preset",
  (event, name: string, mods: Record<string, boolean>) => {
    createPreset(name, mods);
  }
);

// 프리셋 수정
ipcMain.handle(
  "update-preset",
  (
    event,
    oldName: string,
    newName: string,
    mods: Record<string, { name: string; enabled: boolean }>
  ) => {
    updatePreset(oldName, newName, mods);
  }
);

ipcMain.handle("read-preset", (event, presetName: string) => {
  return readPreset(presetName);
});

// 프리셋 삭제
ipcMain.handle("delete-preset", (event, name: string) => {
  deletePreset(name);
});
// 현재 OS 언어 가져오기
ipcMain.handle("get-locale", () => {
  return app.getLocale().startsWith("ko") ? "ko" : "en";
});

// 번역 리소스 불러오기
ipcMain.handle("get-translations", (event, locale: string) => {
  const filePath = path.join(directory.__dirname, `${locale}.json`);
  if (!fs.existsSync(filePath)) return {};
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
});
