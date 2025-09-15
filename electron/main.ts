import fs from "fs-extra";
import { dir as directory } from "./const";

import { shell } from "electron";
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
  return path.join(smapiPath, "../", "Mods");
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

ipcMain.handle(
  "apply-mods",
  async (_event, smapiPath: string, modStates: Record<string, any>) => {
    if (!smapiPath) throw new Error("smapiPath is not provided");

    const modsUserPath = getModsPath(smapiPath);
    const modMap = buildModMapRecursive(directory.MODS_DIR);

    for (const [key, value] of Object.entries(modStates)) {
      // key가 uniqueId인지, 그냥 폴더명인지 구분
      const uniqueId = value.uniqueId ?? key;
      const modInfo = modMap[uniqueId];

      if (!modInfo || !value.enabled) {
        continue;
      }

      const src = modInfo.path;
      const dest = path.join(modsUserPath, path.basename(src));

      if (value.enabled) {
        try {
          await fs.copy(src, dest, { overwrite: true });
        } catch (err) {
          console.error(`❌ Failed to copy ${uniqueId}:`, err);
        }
      } else {
        try {
          if (fs.existsSync(dest)) {
            await fs.remove(dest);
          }
        } catch (err) {
          console.error(`❌ Failed to remove ${uniqueId}:`, err);
        }
      }
    }
  }
);

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
  if (!fs.existsSync(directory.MODS_DIR)) fs.mkdirSync(directory.MODS_DIR);
  shell.openPath(directory.MODS_DIR);
});

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
const REQUIRED_MODS = ["ConsoleCommands", "SaveBackup"];

// 게임 옵션 동기화
async function syncModsRecursive(
  gameModsPath: string,
  programModsPath: string
) {
  const entries = fs.readdirSync(gameModsPath, { withFileTypes: true });

  for (const entry of entries) {
    const gameEntryPath = path.join(gameModsPath, entry.name);
    const programEntryPath = path.join(programModsPath, entry.name);

    if (entry.isDirectory()) {
      const manifestPath = path.join(gameEntryPath, "manifest.json");

      if (fs.existsSync(manifestPath)) {
        // 모드 폴더 발견 ✅
        try {
          const manifest = safeParseManifest(manifestPath);
          const uniqueId = manifest.UniqueID;
          if (!uniqueId) continue;

          if (!fs.existsSync(programEntryPath)) {
            // 📌 프로그램에 없는 모드 → 전체 복사
            await fs.copy(gameEntryPath, programEntryPath);
          } else {
            // 📌 프로그램에 이미 있는 경우 → config.json 덮어쓰기
            const programManifestPath = path.join(
              programEntryPath,
              "manifest.json"
            );
            const programConfigPath = path.join(
              programEntryPath,
              "config.json"
            );
            const gameConfigPath = path.join(gameEntryPath, "config.json");

            if (fs.existsSync(programManifestPath)) {
              const programManifest = safeParseManifest(programManifestPath);
              if (
                programManifest.UniqueID === uniqueId &&
                fs.existsSync(gameConfigPath)
              ) {
                await fs.copyFile(gameConfigPath, programConfigPath);
              }
            }
          }
        } catch (err) {
          console.error(`Failed to sync mod at ${gameEntryPath}:`, err);
        }
      } else {
        const folderName = path.basename(gameEntryPath);

        if (REQUIRED_MODS.includes(folderName)) {
        } else {
          console.warn(`Skipping mod at ${gameEntryPath} (invalid manifest)`);
          return; // 건너뛰기
        }

        // 폴더 안에 더 들어가서 탐색 (중첩 구조 지원)
        await syncModsRecursive(gameEntryPath, programEntryPath);
      }
    }
  }
}

ipcMain.handle("sync-config-ingame", async (_event, smapiPath: string) => {
  if (!smapiPath) throw new Error("smapiPath is not provided");

  const gameModsPath = getModsPath(smapiPath); // 게임 내 Mods 경로
  const programModsPath = directory.MODS_DIR; // 프로그램 내 Mods 경로

  await syncModsRecursive(gameModsPath, programModsPath);

  return { success: true };
});

//게임 폴더 내의 모든 모드 지우기
ipcMain.handle("reset-mods", async (_event, smapiPath: string) => {
  try {
    // 프로그램 내부 Mods 폴더 비우기
    await fs.emptyDir(path.join(smapiPath, "../", "Mods"));
  } catch (err) {
    console.error("Error resetting mods:", err);
    throw err;
  }
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
