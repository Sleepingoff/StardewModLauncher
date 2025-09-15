/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * The built directory structure
     *
     * ```tree
     * ├─┬─┬ dist
     * │ │ └── index.html
     * │ │
     * │ ├─┬ dist-electron
     * │ │ ├── main.js
     * │ │ └── preload.js
     * │
     * ```
     */
    APP_ROOT: string;
    /** /dist/ or /public/ */
    VITE_PUBLIC: string;
  }
}
interface Presets {
  [presetName: string]: Record<string, boolean>;
}
// Used in Renderer process, expose in `preload.ts`

interface Window {
  api: {
    // 프리셋 관련
    getPresets: () => Promise<Presets>;
    getPresetLists: () => Promise<string[]>;
    readPreset: (presetName: string) => Promise<ModStates>;
    createPreset: (name: string, mods: ModStates) => Promise<void>;
    updatePreset: (
      oldName: string,
      newName: string,
      mods: ModStates
    ) => Promise<void>;
    deletePreset: (name: string) => Promise<void>;

    getMods: () => Promise<string[]>;
    getModListTree: () => Promise<Record<string, string[]>>; // 상위 폴더 → 하위 모드
    applyMods: (smapiPath: string, modStates: ModStates) => Promise<void>;
    resetMods: (modStates: ModStates) => Promise<void>;

    openMyModsFolder: () => Promise<void>;
    readConfig: () => Promise<Presets>;
    syncConfigIngame: (smapiPath: string) => Promise<{ success: boolean }>;

    writeInfo: (data: Record<string, string>) => Promise<void>;
    readInfo: () => Promise<Record<string, string>>;

    // 다국어 지원
    getLocale: () => Promise<string>; // ex) "en", "ko"
    getTranslations: (locale: string) => Promise<Record<string, any>>;
  };
}
