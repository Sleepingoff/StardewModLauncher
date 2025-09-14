"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("i18n", {
  setLanguage: (lang) => electron.ipcRenderer.invoke("set-lang", { lang }),
  getLanguage: () => electron.ipcRenderer.invoke("get-lang"),
  getMessages: (lang) => electron.ipcRenderer.invoke("load-locale", { lang })
});
electron.contextBridge.exposeInMainWorld("api", {
  // 경로 가져오기
  getPaths: () => electron.ipcRenderer.invoke("get-paths"),
  // 모드 목록 가져오기
  getModList: () => electron.ipcRenderer.invoke("get-mod-list"),
  getModListTree: () => electron.ipcRenderer.invoke("get-mod-list-tree"),
  setModList: (filePaths, containerPath) => electron.ipcRenderer.invoke("mod-drop", { filePaths, containerPath }),
  // 모드 적용
  applyMods: (smapiPath, modStates) => electron.ipcRenderer.invoke("apply-mods", { smapiPath, modStates }),
  // 모드 초기화
  resetMods: (smapiPath, modStates) => electron.ipcRenderer.invoke("reset-mods", { smapiPath, modStates }),
  // 설정 읽기
  readConfig: () => electron.ipcRenderer.invoke("read-config"),
  // 설정 쓰기
  writeConfig: (data) => electron.ipcRenderer.invoke("write-config", data),
  //내 MODS 폴더 열기
  openMyModsFolder: () => electron.ipcRenderer.invoke("open-mods-folder")
});
