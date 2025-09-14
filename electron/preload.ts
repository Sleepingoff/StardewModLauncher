import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("i18n", {
  setLanguage: (lang: string) => ipcRenderer.invoke("set-lang", { lang }),
  getLanguage: () => ipcRenderer.invoke("get-lang"),
  getMessages: (lang: string) => ipcRenderer.invoke("load-locale", { lang }),
});

contextBridge.exposeInMainWorld("api", {
  // 경로 가져오기
  getPaths: (): Promise<{
    modsOriginalPath: string;
    configPath: string;
  }> => ipcRenderer.invoke("get-paths"),

  // 모드 목록 가져오기
  getModList: (): Promise<string[]> => ipcRenderer.invoke("get-mod-list"),
  getModListTree: () => ipcRenderer.invoke("get-mod-list-tree"),
  setModList: (filePaths: string[], containerPath: string) =>
    ipcRenderer.invoke("mod-drop", { filePaths, containerPath }),
  // 모드 적용
  applyMods: (smapiPath: string, modStates: Record<string, boolean>) =>
    ipcRenderer.invoke("apply-mods", { smapiPath, modStates }),

  // 모드 초기화
  resetMods: (smapiPath: string, modStates: Record<string, boolean>) =>
    ipcRenderer.invoke("reset-mods", { smapiPath, modStates }),

  // 설정 읽기
  readConfig: (): Promise<Record<string, any>> =>
    ipcRenderer.invoke("read-config"),

  // 설정 쓰기
  writeConfig: (data: Record<string, any>) =>
    ipcRenderer.invoke("write-config", data),

  //내 MODS 폴더 열기
  openMyModsFolder: () => ipcRenderer.invoke("open-mods-folder"),
});
