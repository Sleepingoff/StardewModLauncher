"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("i18n", {
  setLanguage: (lang) => electron.ipcRenderer.invoke("set-lang", { lang }),
  getLanguage: () => electron.ipcRenderer.invoke("get-lang"),
  getMessages: (lang) => electron.ipcRenderer.invoke("load-locale", { lang })
});
electron.contextBridge.exposeInMainWorld("api", {
  // // 경로 가져오기
  // getPaths: (): Promise<{
  //   modsOriginalPath: string;
  //   configPath: string;
  // }> => ipcRenderer.invoke("get-paths"),
  // // 모드 목록 가져오기
  getModList: () => electron.ipcRenderer.invoke("get-mod-list"),
  // getModListTree: () => ipcRenderer.invoke("get-mod-list-tree"),
  // setModList: (filePaths: string[], containerPath: string) =>
  //   ipcRenderer.invoke("mod-drop", { filePaths, containerPath }),
  // 모드 적용
  applyMods: (smapiPath, modStates) => electron.ipcRenderer.invoke("apply-mods", { smapiPath, modStates }),
  // 모드 초기화
  resetMods: (smapiPath, modStates) => electron.ipcRenderer.invoke("reset-mods", { smapiPath, modStates }),
  // // 설정 읽기
  readConfig: () => electron.ipcRenderer.invoke("read-config"),
  // 설정 쓰기
  readInfo: () => electron.ipcRenderer.invoke("read-info"),
  // 설정 쓰기
  writeInfo: (data) => electron.ipcRenderer.invoke("write-info", data),
  //내 MODS 폴더 열기
  openMyModsFolder: () => electron.ipcRenderer.invoke("open-mods-folder"),
  getPresets: () => electron.ipcRenderer.invoke("get-presets"),
  getPresetLists: () => electron.ipcRenderer.invoke("get-preset-list"),
  readPreset: (presetName) => electron.ipcRenderer.invoke("read-preset", presetName),
  getMods: () => electron.ipcRenderer.invoke("get-mods"),
  createPreset: (name, mods) => electron.ipcRenderer.invoke("create-preset", name, mods),
  updatePreset: (oldName, newName, mods) => electron.ipcRenderer.invoke("update-preset", oldName, newName, mods),
  deletePreset: (name) => electron.ipcRenderer.invoke("delete-preset", name),
  // 다국어 지원 추가
  getLocale: () => electron.ipcRenderer.invoke("get-locale"),
  getTranslations: (locale) => electron.ipcRenderer.invoke("get-translations", locale)
});
