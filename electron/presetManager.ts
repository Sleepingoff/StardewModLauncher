import fs from "fs";
import { loadConfig, saveConfig } from "./configManager";
import { dir as directory } from "./const";
/**
 * config.json 전체 로드
 */
export function loadAllPresets(): Record<
  string,
  Record<string, { name: string; enabled: boolean }>
> {
  if (!fs.existsSync(directory.CONFIG_PATH)) return {};
  return JSON.parse(fs.readFileSync(directory.CONFIG_PATH, "utf-8"));
}

/**
 * 프리셋 목록만 가져오기
 */
export function listPresets(): string[] {
  const all = loadAllPresets();
  return Object.keys(all);
}

/**
 * 특정 프리셋 로드
 */
export function loadPreset(
  presetName: string
): Record<string, { name: string; enabled: boolean }> {
  const all = loadAllPresets();
  return all[presetName] ?? {};
}
// 프리셋 생성 (이미 존재하면 에러 처리)
export function createPreset(
  presetName: string,
  mods: Record<string, boolean>
) {
  const config = loadConfig(presetName);
  if (config[presetName]) {
    throw new Error(`Preset "${presetName}" already exists.`);
  }
  config[presetName] = mods;
  savePreset(presetName, config);
}

export function readPreset(presetName: string) {
  const config = loadConfig(presetName);
  return config;
}
// 프리셋 수정 (기존 이름을 새 이름으로 변경 가능)
export function updatePreset(
  oldName: string,
  newName: string,
  mods: Record<string, { name: string; enabled: boolean }>
) {
  const prevConfig = readPreset(oldName);
  const newConfig = {
    ...prevConfig,
    ...mods,
  };

  // 1️⃣ 새 프리셋 먼저 저장
  savePreset(newName, newConfig);

  // 2️⃣ 이름이 다르면 기존 프리셋 삭제
  if (oldName !== newName) {
    deletePreset(oldName);
  }
}
/*
 * 특정 프리셋 저장 (기존 파일에 merge)
 */
export function savePreset(
  presetName: string,
  presetData: Record<string, { name: string; enabled: boolean }>
) {
  // let all = loadAllPresets();
  // all[presetName] = presetData;
  // fs.writeFileSync(
  //   directory.CONFIG_PATH,
  //   JSON.stringify(all, null, 2),
  //   "utf-8"
  // );
  saveConfig(presetData, presetName);
}

/**
 * 특정 프리셋 삭제
 */
export function deletePreset(presetName: string) {
  let all = loadAllPresets();
  delete all[presetName];
  fs.writeFileSync(
    directory.CONFIG_PATH,
    JSON.stringify(all, null, 2),
    "utf-8"
  );
}
