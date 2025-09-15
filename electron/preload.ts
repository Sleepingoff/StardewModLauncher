import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("i18n", {
  setLanguage: (lang: string) => ipcRenderer.invoke("set-lang", { lang }),
  getLanguage: () => ipcRenderer.invoke("get-lang"),
  getMessages: (lang: string) => ipcRenderer.invoke("load-locale", { lang }),
});

contextBridge.exposeInMainWorld("api", {
  // // 경로 가져오기
  // getPaths: (): Promise<{
  //   modsOriginalPath: string;
  //   configPath: string;
  // }> => ipcRenderer.invoke("get-paths"),

  // // 모드 목록 가져오기
  getModList: (): Promise<string[]> => ipcRenderer.invoke("get-mod-list"),
  // getModListTree: () => ipcRenderer.invoke("get-mod-list-tree"),
  // setModList: (filePaths: string[], containerPath: string) =>
  //   ipcRenderer.invoke("mod-drop", { filePaths, containerPath }),
  // 모드 적용
  applyMods: (smapiPath: string, modStates: Record<string, boolean>) =>
    ipcRenderer.invoke("apply-mods", { smapiPath, modStates }),

  // 모드 초기화
  resetMods: (smapiPath: string, modStates: Record<string, boolean>) =>
    ipcRenderer.invoke("reset-mods", { smapiPath, modStates }),
  //게임 옵션 동기화
  syncConfigIngame: (smapiPath: string) =>
    ipcRenderer.invoke("sync-config-ingame", smapiPath),
  // 프리셋 읽기
  readConfig: (): Promise<Record<string, any>> =>
    ipcRenderer.invoke("read-config"),

  // 사용자 정보 읽기
  readInfo: () => ipcRenderer.invoke("read-info"),

  // 사용자 정보 쓰기
  writeInfo: (data: Record<string, string>) =>
    ipcRenderer.invoke("write-info", data),

  //내 MODS 폴더 열기
  openMyModsFolder: () => ipcRenderer.invoke("open-mods-folder"),

  getPresets: () => ipcRenderer.invoke("get-presets"),
  getPresetLists: () => ipcRenderer.invoke("get-preset-list"),
  readPreset: (presetName: string) =>
    ipcRenderer.invoke("read-preset", presetName),
  getMods: () => ipcRenderer.invoke("get-mods"),
  createPreset: (name: string, mods: Record<string, boolean>) =>
    ipcRenderer.invoke("create-preset", name, mods),
  updatePreset: (
    oldName: string,
    newName: string,
    mods: Record<string, boolean>
  ) => ipcRenderer.invoke("update-preset", oldName, newName, mods),
  deletePreset: (name: string) => ipcRenderer.invoke("delete-preset", name),

  // 다국어 지원 추가
  getLocale: () => ipcRenderer.invoke("get-locale"),
  getTranslations: (locale: string) =>
    ipcRenderer.invoke("get-translations", locale),
});
