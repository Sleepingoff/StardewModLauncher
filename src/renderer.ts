interface ModStates {
  [modName: string]: boolean;
}
interface Presets {
  [presetName: string]: ModStates;
}

interface Window {
  api: {
    getPaths: () => Promise<{
      modsOriginalPath: string;
      configPath: string;
    }>;
    readConfig: () => Promise<Presets>;
    writeConfig: (config: Presets) => Promise<void>;
    getModListTree: () => Promise<Record<string, string[]>>; // 상위 폴더 → 하위 모드
    applyMods: (smapiPath: string, modStates: ModStates) => Promise<void>;
    resetMods: (modStates: ModStates) => Promise<void>;
    setModList: (filePaths: string[], containerPath: string) => Promise<void>;
    openMyModsFolder: () => Promise<void>;
  };

  i18n: {
    setLanguage: (lang: string) => Promise<Record<string, string>>;
    getLanguage: () => Promise<string>;
    getMessages: () => Promise<Record<string, string[]>>;
  };
}

const modContainer = document.getElementById("modCheckboxes")!;
const presetNameInput = document.getElementById(
  "presetName"
) as HTMLInputElement;
const savePresetBtn = document.getElementById(
  "savePresetBtn"
) as HTMLButtonElement;
const deletePresetBtn = document.getElementById(
  "deletePresetBtn"
) as HTMLButtonElement;
const applyBtn = document.getElementById("applyBtn") as HTMLButtonElement;
const resetBtn = document.getElementById("resetBtn") as HTMLButtonElement;
const refreshBtn = document.getElementById("refreshBtn") as HTMLButtonElement;
const openFolderBtn = document.getElementById(
  "openFolderBtn"
) as HTMLButtonElement;
const smapiPathInput = document.getElementById("smapiPath") as HTMLInputElement;

let modStates: ModStates = {};
let modsConfig: Presets = {};
let modTree: Record<string, string[]> = {};
let i18nMessages: Record<string, any> = {};
let currentPresetName: string = "";
// -------------------- 초기화 --------------------
async function init() {
  modsConfig = await window.api.readConfig();
  modTree = await window.api.getModListTree();
  i18nMessages = await window.i18n.setLanguage("ko"); // 초기 언어: 한국어
  renderMods(modTree);
  updateUITexts();
  updatePresetDropdownUI(modsConfig);
}

// -------------------- 모드 트리 렌더 --------------------

function loadModListUI(tree: Record<string, string[]>) {
  const modTree = tree; // main에서 scanModsTreeByManifest로 가져오는 함수
  modContainer.innerHTML = "";
  modStates = {};

  Object.entries(modTree).forEach(async ([parent, children]) => {
    if (children.length === 0) {
      // 하위 모드 없는 경우 → 그냥 체크박스
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = parent;
      checkbox.checked = true;

      const label = document.createElement("label");
      const span = document.createElement("span");
      label.appendChild(checkbox);
      label.appendChild(span);
      label.appendChild(document.createTextNode(parent));

      label.dataset.path = parent;

      modContainer.appendChild(label);
      modContainer.appendChild(document.createElement("br"));
      modContainer.dataset.path = `../`;
      modContainer.dataset.subcontainerName = "../Mods";

      modStates[parent] = true;

      checkbox.addEventListener("change", () => {
        modStates[parent] = checkbox.checked;
      });
    } else {
      // 하위 모드 있는 경우 → 체크박스 + 토글 버튼
      const wrapper = document.createElement("div");
      wrapper.style.marginBottom = "4px";

      const parentLabel = document.createElement("label");
      const spanCheckbox = document.createElement("span");

      const parentCheckbox = document.createElement("input");
      parentCheckbox.type = "checkbox";
      parentCheckbox.id = parent;
      parentCheckbox.checked = true;

      parentLabel.appendChild(parentCheckbox);
      parentLabel.appendChild(spanCheckbox);

      const toggleBtn = document.createElement("button");
      toggleBtn.textContent = parent;

      const subContainer = document.createElement("div");

      subContainer.style.display = "none";
      subContainer.style.paddingLeft = "20px";
      wrapper.id = parent;

      const childCheckboxes: HTMLInputElement[] = [];

      children.forEach((child) => {
        const label = document.createElement("label");
        const span = document.createElement("span");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = child;
        checkbox.checked = true;
        label.appendChild(checkbox);
        label.appendChild(span);
        label.appendChild(document.createTextNode(child));
        label.dataset.path = `${parent}/${child}`;
        subContainer.dataset.subcontainerName = parent;
        subContainer.appendChild(label);
        subContainer.appendChild(document.createElement("br"));

        modStates[child] = true;
        childCheckboxes.push(checkbox);

        checkbox.addEventListener("change", () => {
          modStates[child] = checkbox.checked;
          // 상위 체크박스 상태 갱신
          parentCheckbox.checked = childCheckboxes.every((c) => c.checked);
        });
      });

      // 상위 체크박스로 하위 전체 선택/해제
      parentCheckbox.addEventListener("change", () => {
        childCheckboxes.forEach((cb) => {
          cb.checked = parentCheckbox.checked;
          modStates[cb.id] = cb.checked;
        });
      });

      toggleBtn.addEventListener("click", () => {
        subContainer.style.display =
          subContainer.style.display === "none" ? "block" : "none";
      });

      wrapper.appendChild(parentLabel);
      wrapper.appendChild(toggleBtn);
      wrapper.appendChild(subContainer);
      wrapper.dataset.path = `${parent}`;
      modContainer.appendChild(wrapper);

      // 초기 상태 저장
      modStates[parent] = true;
    }
  });
}

function renderModTree(
  tree: Record<string, any>,
  container: HTMLElement,
  parentPath = ""
) {
  Object.entries(tree).forEach(([name, children]) => {
    const fullPath = parentPath ? `${parentPath}/${name}` : name;

    // children이 배열(파일 리스트)인지 객체(폴더)인지 구분
    const isLeaf = Array.isArray(children) && children.length === 0;

    if (isLeaf) {
      // 하위 없음 → 체크박스
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = fullPath;
      checkbox.checked = true;

      const label = document.createElement("label");
      const span = document.createElement("span");
      label.appendChild(checkbox);
      label.appendChild(span);
      label.appendChild(document.createTextNode(name));
      label.dataset.path = fullPath;

      container.appendChild(label);
      container.appendChild(document.createElement("br"));

      modStates[fullPath] = true;

      checkbox.addEventListener("change", () => {
        modStates[fullPath] = checkbox.checked;
      });
    } else {
      // 하위 있음 → 부모 + 토글 + 재귀
      const wrapper = document.createElement("div");
      wrapper.style.marginBottom = "4px";

      const parentLabel = document.createElement("label");
      const spanCheckbox = document.createElement("span");

      const parentCheckbox = document.createElement("input");
      parentCheckbox.type = "checkbox";
      parentCheckbox.id = fullPath;
      parentCheckbox.checked = true;

      parentLabel.appendChild(parentCheckbox);
      parentLabel.appendChild(spanCheckbox);

      const toggleBtn = document.createElement("button");
      toggleBtn.textContent = name;

      const subContainer = document.createElement("div");
      subContainer.style.display = "none";
      subContainer.style.paddingLeft = "20px";

      wrapper.appendChild(parentLabel);
      wrapper.appendChild(toggleBtn);
      wrapper.appendChild(subContainer);
      container.appendChild(wrapper);

      // 재귀 호출 (children이 배열이 아니라 객체라고 가정)
      renderModTree(children, subContainer, fullPath);

      toggleBtn.addEventListener("click", () => {
        subContainer.style.display =
          subContainer.style.display === "none" ? "block" : "none";
      });
      parentCheckbox.addEventListener("change", () => {
        const checked = parentCheckbox.checked;

        // 부모 경로의 상태도 업데이트
        modStates[fullPath] = checked;

        // 하위 모든 체크박스 찾아서 상태 변경
        const childCheckboxes = subContainer.querySelectorAll<HTMLInputElement>(
          'input[type="checkbox"]'
        );
        childCheckboxes.forEach((child) => {
          child.checked = checked;
          modStates[child.id] = checked;
        });
      });
      // 자식 쪽 이벤트도 부모랑 연결
      subContainer.addEventListener("change", (e) => {
        const target = e.target as HTMLInputElement;
        if (target.type === "checkbox") {
          modStates[target.id] = target.checked;

          // 하위 체크박스 상태 조사
          const childCheckboxes =
            subContainer.querySelectorAll<HTMLInputElement>(
              'input[type="checkbox"]'
            );
          const allChecked = Array.from(childCheckboxes).every(
            (c) => c.checked
          );

          // 부모 상태 갱신
          parentCheckbox.checked = allChecked;
          modStates[fullPath] = allChecked;
        }
      });
      modStates[fullPath] = true;
    }
  });
}

// ✅ 렌더링 시작할 때는 기존 UI를 초기화
function renderMods(modTree: Record<string, any>) {
  const modContainer = document.getElementById("modCheckboxes")!;
  modContainer.innerHTML = ""; // 중복 방지
  renderModTree(modTree, modContainer);
}

// -------------------- 프리셋 관리 --------------------
const presetContainer = document.getElementById("presetDropdownContainer")!;
const presetSelected = document.getElementById("presetSelected")!;
const presetOptions = document.getElementById("presetOptions")!;

// 프리셋 데이터를 가져왔을 때
function updatePresetDropdownUI(presets: Record<string, any>) {
  presetOptions.innerHTML = "";
  Object.keys(presets).forEach((presetName) => {
    const li = document.createElement("li");
    li.textContent = presetName;
    presetOptions.appendChild(li);

    li.addEventListener("click", () => {
      presetSelected.textContent = presetName;
      currentPresetName = presetName;

      // 여기서 선택된 프리셋 반영
      const preset = presets[presetName];
      if (!preset) return;
      Object.entries(preset).forEach(([modName, enabled]) => {
        const checkbox = document.getElementById(modName) as HTMLInputElement;
        if (checkbox) {
          checkbox.checked = enabled as boolean;
          modStates[modName] = enabled as boolean;
        }
      });
      presetContainer.classList.remove("open");
      presetOptions.innerHTML = "";
    });
  });
}

// 클릭 외부 영역 닫기
document.addEventListener("click", (e) => {
  if (!presetContainer.contains(e.target as Node)) {
    presetContainer.classList.remove("open");
    presetOptions.innerHTML = "";
  }
});

// 토글
presetSelected.addEventListener("click", () => {
  presetContainer.classList.toggle("open");
  if (!presetContainer.classList.contains("open")) {
    presetOptions.innerHTML = "";
  }
  updatePresetDropdownUI(modsConfig);
});

// 클릭 외부 영역 닫기
document.addEventListener("click", (e) => {
  if (!presetContainer.contains(e.target as Node)) {
    presetContainer.classList.remove("open");
    presetOptions.innerHTML = "";
  }
});

savePresetBtn.addEventListener("click", async () => {
  const presetName = presetNameInput.value.trim();
  if (!presetName) return alert(t("alerts.noPresetName"));
  modsConfig[presetName] = { ...modStates };
  await window.api.writeConfig(modsConfig);
  updatePresetDropdownUI(modsConfig);
  presetNameInput.value = "";
  alert(`Preset "${presetName}" saved!`);
});

deletePresetBtn.addEventListener("click", async () => {
  const presetName = currentPresetName;
  currentPresetName = "";
  if (!presetName) return alert(t("alerts.noSelectedPreset"));
  if (
    !confirm(
      t("alerts.deletePresetConfirm").replace("{presetName}", presetName)
    )
  )
    return;
  delete modsConfig[presetName];
  await window.api.writeConfig(modsConfig);
  presetSelected.textContent = t("alerts.noPresetName");
  alert(`Preset "${presetName}" deleted!`);
});

// -------------------- Apply & Launch --------------------
applyBtn.addEventListener("click", async () => {
  const smapiPath = smapiPathInput.value.trim();
  if (!smapiPath) return alert(t("alerts.noSmapiPath"));

  const selectedPreset = presetContainer.textContent;
  if (!selectedPreset) return alert(t("alerts.noSelectedPreset"));

  modsConfig[selectedPreset] = { ...modStates };
  await window.api.writeConfig(modsConfig);

  await window.api.applyMods(smapiPath, modStates);
  alert(t("alerts.modsApplied"));
});

// -------------------- Reset Mods --------------------
resetBtn.addEventListener("click", async () => {
  await window.api.resetMods(modStates);
  alert(t("alerts.modsReset"));
});

// 수동 새로고침 버튼
refreshBtn.addEventListener("click", async () => {
  await refreshModTree();
});
openFolderBtn.addEventListener("click", async () => {
  await window.api.openMyModsFolder();
  await refreshModTree();
});

async function refreshModTree() {
  const tree = await window.api.getModListTree();
  renderMods(tree);
  const presetName = presetContainer.textContent?.trim();
  if (presetName) {
    const preset = modsConfig[presetName];
    if (!preset) return;
    Object.entries(preset).forEach(([modName, enabled]) => {
      const checkbox = document.getElementById(modName) as HTMLInputElement;
      if (checkbox) {
        checkbox.checked = enabled as boolean;
        modStates[modName] = enabled as boolean;
      }
    });
  }
}

//다국어지원

function t(key: string): string {
  return (
    key
      .split(".")
      .reduce<any>(
        (obj, k) => (obj && typeof obj === "object" ? obj[k] : undefined),
        i18nMessages
      ) ?? key
  );
}
async function updateUITexts() {
  const autoLang = detectBrowserLang();
  await loadLanguage(autoLang);
  applyI18n(); // index.html에 i18n 적용
  savePresetBtn!.textContent = t("buttons.savePreset");
  deletePresetBtn!.textContent = t("buttons.deletePreset");
  applyBtn!.textContent = t("buttons.applyMods");
  resetBtn!.textContent = t("buttons.resetMods");
  refreshBtn!.textContent = t("buttons.refresh");
  openFolderBtn!.textContent = t("buttons.openMods");
}

function detectBrowserLang() {
  const lang = navigator.language || navigator.language; // ex) "ko-KR"
  // 지원하는 언어만 매핑 (en, ko, jp 등)
  if (lang.startsWith("ko")) return "ko";
  return "en"; // 기본 영어
}

async function loadLanguage(lang: string) {
  await window.i18n.setLanguage(lang);
  i18nMessages = await window.i18n.getMessages();
}

function applyI18n() {
  // 텍스트용
  document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n!;
    el.textContent = t(key);
  });

  // placeholder용
  document
    .querySelectorAll<HTMLInputElement>("[data-i18n-placeholder]")
    .forEach((el) => {
      const key = el.dataset.i18nPlaceholder!;
      el.placeholder = t(key);
    });
}

init();
