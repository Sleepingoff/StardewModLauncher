import fs from "fs-extra";
import { dir as directory } from "./const";

export function readInfo(): Record<string, any> {
  if (!fs.existsSync(directory.INFO_PATH)) {
    return {}; // 파일 없으면 빈 객체 반환
  }
  try {
    const raw = fs.readFileSync(directory.INFO_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("⚠️ Failed to read Info.json:", err);
    return {};
  }
}

export function writeInfo(data: Record<string, any>) {
  const prev = readInfo();
  const merged = { ...prev, ...data };

  try {
    fs.writeFileSync(
      directory.INFO_PATH,
      JSON.stringify(merged, null, 2),
      "utf-8"
    );
  } catch (err) {
    console.error("⚠️ Failed to write Info.json:", err);
  }
}
