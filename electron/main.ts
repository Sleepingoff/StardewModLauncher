import fs from "fs-extra";
import { dir as directory } from "./const";

import { shell } from "electron";
// import path from "path";
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
    icon: path.join(
      app.isPackaged
        ? process.resourcesPath
        : path.join(directory.__dirname, "public"),
      "Stardrop.png"
    ), // 아이콘 경로
    webPreferences: {
      preload: path.join(directory.__dirname, "preload.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(directory.__dirname, "../dist/index.html"));
  }
}

app.whenReady().then(createWindow);

// // -------- 유틸 함수 --------

function getModsPath(smapiPath: string) {
  const smapiDir = path.dirname(smapiPath);
  return path.join(smapiDir, "Mods");
}

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

ipcMain.handle("apply-mods", async (_event, { smapiPath, modStates }) => {
  if (!smapiPath) throw new Error("smapiPath is not provided");

  const modsUserPath = getModsPath(smapiPath);
  const modMap = buildModMapRecursive(directory.MODS_DIR);

  for (const [uniqueId, enabled] of Object.entries(modStates)) {
    const modInfo = modMap[uniqueId];
    if (!modInfo) {
      console.warn(`⚠️ Mod not found for UniqueID: ${uniqueId}`);
      continue;
    }

    const src = modInfo.path;
    const dest = path.join(modsUserPath, path.basename(src));

    if (enabled) {
      try {
        fs.copyFileSync(src, dest);
      } catch (err) {
        console.error(`❌ Failed to copy ${uniqueId}:`, err);
      }
    } else {
      try {
        if (fs.existsSync(dest)) {
          fs.removeSync(dest);
        }
      } catch (err) {
        console.error(`❌ Failed to remove ${uniqueId}:`, err);
      }
    }
  }
});

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
ipcMain.handle("open-mods-folder", async () => {
  shell.openPath(directory.MODS_DIR);
});

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
import {
  buildModMapRecursive,
  loadConfig,
  safeParseManifest,
} from "./configManager";
import { getModsFromDisk } from "./modManager"; // Mods 폴더 스캔 유틸 (필요 시 구현)
import { readInfo, writeInfo } from "./infoManager";

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
// 사용자 설정 읽기
ipcMain.handle("read-info", () => {
  return readInfo();
});

// 사용자 설정 쓰기
ipcMain.handle("write-info", (_event, data) => {
  return writeInfo(data);
});

// 게임 옵션 동기화
ipcMain.handle("sync-config-ingame", async (_event, smapiPath: string) => {
  if (!smapiPath) throw new Error("smapiPath is not provided");

  const gameModsPath = getModsPath(smapiPath); // 게임 내 Mods 경로
  const programModsPath = directory.MODS_DIR; // 프로그램 내 Mods 경로

  // 게임 Mods 폴더 순회
  const gameModFolders = fs.readdirSync(gameModsPath);

  for (const folder of gameModFolders) {
    const gameModPath = path.join(gameModsPath, folder);
    const manifestPath = path.join(gameModPath, "manifest.json");
    const configPath = path.join(gameModPath, "config.json");

    if (!fs.existsSync(manifestPath) || !fs.existsSync(configPath)) continue;

    try {
      const manifest = safeParseManifest(manifestPath);
      const uniqueId = manifest.UniqueID;
      if (!uniqueId) continue;

      // 프로그램 내 동일한 UniqueID 모드 탐색
      const programModPath = path.join(programModsPath, folder);
      const programManifest = path.join(programModPath, "manifest.json");
      const programConfig = path.join(programModPath, "config.json");

      if (fs.existsSync(programManifest)) {
        const programManifestData = safeParseManifest(programManifest);
        if (programManifestData.UniqueID === uniqueId) {
          // config.json 동기화 (덮어쓰기)
          await fs.copyFile(configPath, programConfig);
        }
      }
    } catch (err) {
      console.error(`Failed to sync config for ${folder}:`, err);
    }
  }

  return { success: true };
});

// 프리셋 생성
ipcMain.handle(
  "create-preset",
  (_event, name: string, mods: Record<string, boolean>) => {
    createPreset(name, mods);
  }
);

// 프리셋 수정
ipcMain.handle(
  "update-preset",
  (
    _event,
    oldName: string,
    newName: string,
    mods: Record<string, { name: string; enabled: boolean }>
  ) => {
    updatePreset(oldName, newName, mods);
  }
);

ipcMain.handle("read-preset", (_event, presetName: string) => {
  return readPreset(presetName);
});

// 프리셋 삭제
ipcMain.handle("delete-preset", (_event, name: string) => {
  deletePreset(name);
});
// 현재 OS 언어 가져오기
ipcMain.handle("get-locale", () => {
  return app.getLocale().startsWith("ko") ? "ko" : "en";
});

// 번역 리소스 불러오기
ipcMain.handle("get-translations", (_event, locale: string) => {
  const filePath = path.join(directory.__dirname, "locales", `${locale}.json`);
  if (!fs.existsSync(filePath)) return {};
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
});
