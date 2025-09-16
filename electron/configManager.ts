import fs from "fs";
import path from "path";
import JSON5 from "json5";
import { dir as directory } from "./const";
import { loadAllPresets } from "./presetManager";
export interface ModInfo {
  uniqueId: string;
  name: string;
  path: string;
}

/**
 * Mods 폴더에서 UniqueID → 경로 매핑 생성
 */
// configManager.ts (또는 buildModMapRecursive 안쪽)
const REQUIRED_MODS = ["ConsoleCommands", "SaveBackup"];

export function buildModMapRecursive(
  dir: string,
  map: Record<string, any> = {}
): Record<string, any> {
  if (!fs.existsSync(dir)) return map;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (!entry.isDirectory()) continue;

    // ✅ 필수 모드 체크 (manifest.json 없어도 무조건 등록)
    if (REQUIRED_MODS.includes(entry.name)) {
      map[entry.name] = {
        uniqueId: entry.name, // UniqueID 대신 폴더명을 UniqueID처럼 사용
        name: entry.name,
        path: fullPath,
        enabled: true, // 무조건 활성화
        required: true, // UI에서 꺼지지 않도록 표시할 수 있음
      };
      continue;
    }

    const manifestPath = path.join(fullPath, "manifest.json");
    const manifest = safeParseManifest(manifestPath);

    if (manifest) {
      map[manifest.UniqueID] = {
        uniqueId: manifest.UniqueID,
        name: manifest.Name ?? entry.name,
        path: fullPath,
        enabled: true,
      };
    } else {
      buildModMapRecursive(fullPath, map);
    }
  }

  return map;
}

/**
 * config.json 불러오기
 */
export function loadConfig(presetName?: string): Record<string, any> {
  if (!fs.existsSync(directory.CONFIG_PATH)) {
    fs.writeFileSync(directory.CONFIG_PATH, "{}");
  }

  const raw = JSON.parse(fs.readFileSync(directory.CONFIG_PATH, "utf-8"));
  if (!presetName) return raw;

  let presetConfig = raw[presetName];
  if (!presetConfig) {
    // preset이 없으면 modMap 그대로 반환
    return buildModMapRecursive(directory.MODS_DIR);
  }

  // ✅ modMap 불러오기
  const modMap = buildModMapRecursive(directory.MODS_DIR);

  // ✅ config.json 상태 반영
  for (const [id, mod] of Object.entries(modMap)) {
    if (presetConfig[id]) {
      mod.enabled = presetConfig[id].enabled;
    }
  }

  return modMap; // 👈 이제 UI에서 바로 쓸 수 있는 구조
}

/**
 * config.json 저장하기
 * - 프리셋 단위로 UniqueID 상태 저장
 *
 * @param configPath config.json 파일 경로
 * @param modsDir Mods 폴더 경로
 * @param modConfig { presetName: { UniqueID: boolean } }
 */
export function saveConfig(
  folderTree: Record<string, any>,
  presetName: string
) {
  const newPreset = folderTreeToConfig(folderTree, directory.MODS_DIR);
  // { [presetName]: { uniqueId: {name, enabled} } }

  const presets = loadAllPresets(); // 기존 전체 프리셋 로드

  // 기존 프리셋에 덮어쓰기
  const merged = {
    ...presets,
    [presetName]: newPreset,
  };

  fs.writeFileSync(
    directory.CONFIG_PATH,
    JSON.stringify(merged, null, 2),
    "utf-8"
  );
}
/**
 * UI 트리 → modMap(flat)
 * @param folderTree UI에서 사용하는 트리 구조
 * @param baseDir Mods 디렉토리 경로
 */
export function folderTreeToConfig(
  folderTree: Record<string, any>,
  baseDir: string
): Record<
  string,
  { uniqueId: string; name: string; path: string; enabled: boolean }
> {
  const flatMap: Record<
    string,
    { uniqueId: string; name: string; path: string; enabled: boolean }
  > = {};

  function traverse(tree: Record<string, any>, currentPath: string) {
    for (const [key, value] of Object.entries(tree)) {
      const fullPath = path.join(currentPath, key);

      if (value && typeof value === "object") {
        if (!value.name) continue;
        if (value.uniqueId) {
          // ✅ leaf → modMap 항목으로 저장
          flatMap[value.uniqueId] = {
            uniqueId: value.uniqueId,
            name: value.name ?? key,
            path: fullPath,
            enabled: value.enabled ?? false,
          };
        } else {
          // ✅ 하위 폴더 탐색
          traverse(value, fullPath);
        }
      }
    }
  }

  traverse(folderTree, baseDir);
  return flatMap;
}

export function safeParseManifest(manifestPath: string): any | null {
  if (!fs.existsSync(manifestPath)) return null;

  try {
    const raw = fs.readFileSync(manifestPath, "utf-8");
    const data = JSON5.parse(raw);

    if (data && data.UniqueID) {
      return data;
    }
    return null; // UniqueID 없는 경우도 스킵
  } catch (err) {
    console.warn(`⚠️ manifest.json parse failed: ${manifestPath}`, err);
    return null;
  }
}
/**
 * config.json → UI용 트리
 * @param config 특정 프리셋의 config.json 데이터
 * @param modsDir Mods 경로
 */
export function configToFolderTree(
  config: Record<string, { name: string; enabled: boolean }>
): Record<string, any> {
  const tree: Record<string, any> = {};

  for (const [uniqueId, { name, enabled }] of Object.entries(config)) {
    const modPath = findModPathByUniqueId(directory.MODS_DIR, uniqueId);

    if (!modPath) continue;

    const relativePath = path.relative(directory.MODS_DIR, modPath);

    const parts = relativePath.split(path.sep);

    let current = tree;
    parts.forEach((part, idx) => {
      if (!current[part]) current[part] = {};
      if (idx === parts.length - 1) {
        current[part].uniqueId = uniqueId;
        current[part].name = name;
        current[part].enabled = enabled;
      }
      current = current[part];
    });
  }
  return tree;
}

/**
 * UniqueID → 실제 경로 찾기
 */
function findModPathByUniqueId(
  modsDir: string,
  uniqueId: string
): string | null {
  function search(dir: string): string | null {
    if (!fs.existsSync(dir)) return null;
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const manifestPath = path.join(fullPath, "manifest.json");
        if (fs.existsSync(manifestPath)) {
          try {
            const manifest = safeParseManifest(manifestPath);
            if (manifest.UniqueID === uniqueId) {
              return fullPath;
            }
          } catch {}
        }
        const found = search(fullPath);
        if (found) return found;
      }
    }
    return null;
  }

  return search(modsDir);
}
