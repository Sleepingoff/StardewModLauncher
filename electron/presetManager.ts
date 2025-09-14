import fs from "fs";
import path from "path";

/**
 * config.json 전체 로드
 */
export function loadAllPresets(
  configPath: string
): Record<string, Record<string, { name: string; enabled: boolean }>> {
  if (!fs.existsSync(configPath)) return {};
  return JSON.parse(fs.readFileSync(configPath, "utf-8"));
}

/**
 * 프리셋 목록만 가져오기
 */
export function listPresets(configPath: string): string[] {
  const all = loadAllPresets(configPath);
  return Object.keys(all);
}

/**
 * 특정 프리셋 로드
 */
export function loadPreset(
  configPath: string,
  presetName: string
): Record<string, { name: string; enabled: boolean }> {
  const all = loadAllPresets(configPath);
  return all[presetName] ?? {};
}

/**
 * 특정 프리셋 저장 (기존 파일에 merge)
 */
export function savePreset(
  configPath: string,
  presetName: string,
  presetData: Record<string, { name: string; enabled: boolean }>
) {
  let all = loadAllPresets(configPath);
  all[presetName] = presetData;
  fs.writeFileSync(configPath, JSON.stringify(all, null, 2), "utf-8");
}

/**
 * 특정 프리셋 삭제
 */
export function deletePreset(configPath: string, presetName: string) {
  let all = loadAllPresets(configPath);
  delete all[presetName];
  fs.writeFileSync(configPath, JSON.stringify(all, null, 2), "utf-8");
}
