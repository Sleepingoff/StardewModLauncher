// renderer.ts
interface Presets {
  [presetName: string]: Record<string, boolean>;
}

interface ModStates {
  [modName: string]: {
    name: string;
    enabled: boolean;
  };
}

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
    writeInfo: (data: Record<string, string>) => Promise<void>;
    readInfo: () => Promise<Record<string, string>>;

    // 다국어 지원
    getLocale: () => Promise<string>; // ex) "en", "ko"
    getTranslations: (locale: string) => Promise<Record<string, any>>;
  };
}

// DOM Elements
const sectionTitle = document.getElementById("sectionTitle") as HTMLElement;
const contentArea = document.getElementById("contentArea") as HTMLElement;

// 상태
let selectedPreset: string | null = null;
let text: any = {}; // 번역 리소스 저장

// -----------------------------
// 번역 초기화
// -----------------------------
async function initTranslations() {
  const locale = await window.api.getLocale();
  text = await window.api.getTranslations(locale);
}
// === ModTree state & utils (ADD) =========================

const parentChildrenMap = new Map<string, string[]>(); // parentPath -> childPaths
const childParentMap = new Map<string, string>(); // childPath  -> parentPath
let modStates: ModStates = {};
let modTreeInitialized = false;

const byId = <T extends HTMLElement = HTMLElement>(id: string) =>
  document.getElementById(id) as T | null;

const joinPath = (...parts: string[]) => parts.filter(Boolean).join("/");

// 부모 클릭 시 하위 전체 토글
function setBranchChecked(rootPath: string, checked: boolean) {
  modStates[rootPath].enabled = checked;
  const children = parentChildrenMap.get(rootPath) || [];
  for (const child of children) {
    modStates[child].enabled = checked;
    const cb = document.querySelector<HTMLInputElement>(
      `input[type="checkbox"][data-path="${CSS.escape(child)}"]`
    );
    if (cb) cb.checked = checked;
    setBranchChecked(child, checked);
  }
}

// =========================================================
// === ModTree renderer (ADD) ==============================
function renderModTree(
  tree: Record<string, any>,
  container: HTMLElement,
  parentPath = ""
) {
  Object.entries(tree).forEach(([name, value]) => {
    const fullPath = parentPath ? `${parentPath}/${name}` : name;

    // 📌 leaf: 모드 노드 (__uniqueId, __enabled 보유)
    if (typeof value === "object" && value.uniqueId) {
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = fullPath;
      checkbox.checked = !!value.enabled;

      const label = document.createElement("label");
      const span = document.createElement("span");
      label.appendChild(checkbox);
      label.appendChild(span);
      label.appendChild(document.createTextNode(name));
      label.dataset.path = fullPath;

      container.appendChild(label);
      container.appendChild(document.createElement("br"));

      if (!modStates[value.uniqueId]) {
        modStates[value.uniqueId] = { name, enabled: value.enabled };
      } else {
        modStates[value.uniqueId].enabled = value.enabled;
      }

      checkbox.checked = modStates[value.uniqueId].enabled;

      checkbox.addEventListener("change", () => {
        modStates[value.uniqueId].enabled = checkbox.checked;
      });
    }
    // 📌 폴더 노드 (object지만 __uniqueId 없음)
    else if (typeof value === "object") {
      const wrapper = document.createElement("div");
      wrapper.style.marginBottom = "4px";

      const parentLabel = document.createElement("label");
      const spanCheckbox = document.createElement("span");

      const parentCheckbox = document.createElement("input");
      parentCheckbox.type = "checkbox";
      parentCheckbox.id = fullPath;

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

      // 🔁 재귀 호출
      renderModTree(value, subContainer, fullPath);
      // 부모 체크박스 초기 상태 계산
      const childCheckboxes = subContainer.querySelectorAll<HTMLInputElement>(
        'input[type="checkbox"]'
      );

      if (childCheckboxes.length > 0) {
        const allChecked = Array.from(childCheckboxes).every((c) => c.checked);
        parentCheckbox.checked = allChecked; // 모두 켜져 있으면 부모 = true
        parentCheckbox.indeterminate =
          !allChecked && Array.from(childCheckboxes).some((c) => c.checked); // 일부만 켜져 있으면 indeterminate
      } else {
        parentCheckbox.checked = false; // 자식이 없으면 기본 true
      }
      // 토글 버튼 (열고 닫기)
      toggleBtn.addEventListener("click", () => {
        subContainer.style.display =
          subContainer.style.display === "none" ? "block" : "none";
      });

      // 부모 체크박스 → 자식 전체 토글
      parentCheckbox.addEventListener("change", () => {
        const checked = parentCheckbox.checked;
        modStates[fullPath].enabled = checked;

        const childCheckboxes = subContainer.querySelectorAll<HTMLInputElement>(
          'input[type="checkbox"]'
        );
        childCheckboxes.forEach((child) => {
          child.checked = checked;
          if (!modStates[child.id]) {
            modStates[child.id] = {
              name: name,
              enabled: value.enabled ?? false,
            };
          } else {
            modStates[child.id].enabled = checked;
          }
        });
      });

      // 자식 체크박스 상태 → 부모 상태 갱신
      subContainer.addEventListener("change", (e) => {
        const target = e.target as HTMLInputElement;
        if (target.type === "checkbox") {
          modStates[target.id].enabled = target.checked;

          const childCheckboxes =
            subContainer.querySelectorAll<HTMLInputElement>(
              'input[type="checkbox"]'
            );
          const allChecked = Array.from(childCheckboxes).every(
            (c) => c.checked
          );

          parentCheckbox.checked = allChecked;
          modStates[fullPath].enabled = allChecked;
        }
      });
      if (!modStates[fullPath]) {
        modStates[fullPath] = { name: name, enabled: value.enabled ?? false };
      } else {
        modStates[fullPath].enabled = value.enabled ?? false;
      }
    }
  });
}

// =========================================================
// === ModTree init/refresh (ADD) ==========================
async function initModTreeIfNeeded() {
  const container = byId("modCheckboxes");
  if (!container) return; // 해당 영역이 없는 화면이면 패스

  // 중복 렌더 방지: 새로고침은 refreshModTree() 사용
  if (modTreeInitialized) return;
  modTreeInitialized = true;

  await refreshModTree(); // 최초 렌더
  bindRefreshButton();
}

async function refreshModTree() {
  // 기존 DOM 비움(상태는 modStates에 유지됨: 체크 유지 원하면 그대로 둠)
  contentArea.innerHTML = "";
  const presetName = sectionTitle.querySelector("input")!;

  // 트리 데이터 재요청
  const tree = await window.api.readPreset(presetName.value);

  // 관계 맵 초기화(경로 변경 가능성 반영)
  parentChildrenMap.clear();
  childParentMap.clear();

  renderBtnInModTrees();
  renderModTree(tree as any, contentArea);
}

function bindRefreshButton() {
  const btn = byId("refreshBtn");
  if (!btn) return;
  btn.addEventListener("click", async () => {
    await refreshModTree();
  });
}
// =========================================================

// -----------------------------
// 프리셋 리스트 화면
// -----------------------------
async function renderPresetList() {
  sectionTitle.textContent = text.title || "Preset Manager";
  contentArea.innerHTML = "";

  // 새 프리셋 입력창
  const presetContainer = document.createElement("div");
  presetContainer.id = "presetContainer";

  const input = document.createElement("input");
  input.id = "presetName";
  input.type = "text";
  input.placeholder = text.placeholders?.newPreset || "New Preset Name";
  presetContainer.appendChild(input);

  // 생성 버튼
  const createBtn = document.createElement("button");
  createBtn.id = "createPresetBtn";
  createBtn.textContent = text.buttons?.createPreset || "Create Preset";

  createBtn.addEventListener("click", async () => {
    const name = input.value.trim();
    if (!name)
      return alert(text.alerts?.noPresetName || "Please enter a preset name");

    try {
      await window.api.createPreset(name, {});
      renderPresetList();
    } catch (e) {
      if (
        confirm(
          (
            text.alerts?.duplicatePreset || "Preset already exists. Overwrite?"
          ).replace("{presetName}", name)
        )
      ) {
        await window.api.updatePreset(name, name, {});
        renderPresetList();
      }
    }
  });

  contentArea.appendChild(presetContainer);
  contentArea.appendChild(createBtn);

  const presets = await window.api.getPresetLists();

  // 프리셋 목록
  const ul = document.createElement("ul");
  ul.id = "presetList";

  presets.forEach((presetName) => {
    const li = document.createElement("li");
    li.textContent = presetName;
    li.classList.add("preset-item");
    li.addEventListener("click", async () => {
      const configs = await window.api.readPreset(presetName);
      selectedPreset = li.textContent;
      modStates = configs;
      contentArea.innerHTML = "";

      renderBtnInModTrees();
      renderModTree(modStates, contentArea);
    });

    ul.appendChild(li);
  });

  contentArea.appendChild(ul);
}

// -----------------------------
// 모드 체크박스 화면
// -----------------------------
async function renderBtnInModTrees() {
  sectionTitle.innerHTML = "";
  const titleInput = document.createElement("input");
  titleInput.value = selectedPreset!;
  let newName = titleInput.value;
  titleInput.addEventListener("change", (e) => {
    const target = e.target as HTMLInputElement;
    newName = target.value.trim();
  });
  sectionTitle.appendChild(titleInput);
  // 버튼 영역
  const buttonContainer = document.createElement("div");
  buttonContainer.id = "buttonContainer";

  const updateBtn = document.createElement("button");
  updateBtn.textContent = text.buttons?.updatePreset || "Update Preset";
  updateBtn.addEventListener("click", async () => {
    if (!selectedPreset) return;
    await window.api.updatePreset(
      selectedPreset.trim(),
      newName ?? selectedPreset.trim(),
      modStates
    );
    alert(text.alerts?.presetUpdated || `Preset ${newName} updated.`);
    refreshModTree();
  });

  const duplicateBtn = document.createElement("button");
  duplicateBtn.textContent =
    text.buttons?.duplicatePreset || "Duplicate Preset";
  duplicateBtn.addEventListener("click", async () => {
    if (!selectedPreset) return;
    const duplicateName = `${newName}_copy`;

    if (!duplicateName) return;
    await window.api.createPreset(duplicateName, modStates);
    renderPresetList();
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = text.buttons?.deletePreset || "Delete Preset";
  deleteBtn.addEventListener("click", async () => {
    if (!selectedPreset) return;
    if (
      confirm(
        (
          text.alerts?.deletePresetConfirm || "Delete preset {presetName}?"
        ).replace("{presetName}", selectedPreset)
      )
    ) {
      await window.api.deletePreset(selectedPreset);
      selectedPreset = null;
      renderPresetList();
    }
  });

  const backBtn = document.createElement("button");
  backBtn.textContent = text.buttons?.back || "Back";
  backBtn.addEventListener("click", () => {
    selectedPreset = null;
    renderPresetList();
  });

  buttonContainer.appendChild(updateBtn);
  buttonContainer.appendChild(duplicateBtn);
  buttonContainer.appendChild(deleteBtn);
  buttonContainer.appendChild(backBtn);

  contentArea.appendChild(buttonContainer);
}
// -----------------------------
// util buttons
// -----------------------------
const applyBtn = document.getElementById("applyBtn") as HTMLButtonElement;
const resetBtn = document.getElementById("resetBtn") as HTMLButtonElement;
const openFolderBtn = document.getElementById(
  "openFolderBtn"
) as HTMLButtonElement;
const savePathBtn = document.getElementById("savePathBtn") as HTMLButtonElement;
const smapiPathInput = document.getElementById("smapiPath") as HTMLInputElement;

async function initUserInfo() {
  const info = await window.api.readInfo();
  if (info?.smapiPath) smapiPathInput.value = info.smapiPath;
}

savePathBtn.addEventListener("click", async () => {
  const smapiPath = smapiPathInput.value.trim();
  await window.api.writeInfo({ smapiPath });
});
// -------------------- Apply  --------------------
applyBtn.addEventListener("click", async () => {
  const smapiPath = smapiPathInput.value.trim();
  if (!smapiPath) return alert(t("alerts.noSmapiPath"));

  const selectedPreset = presetContainer.textContent;
  if (!selectedPreset) return alert(t("alerts.noSelectedPreset"));

  await window.api.applyMods(smapiPath, modStates);
  alert(t("alerts.modsApplied"));
});

// -------------------- Reset Mods --------------------
resetBtn.addEventListener("click", async () => {
  await window.api.resetMods(modStates);
  alert(t("alerts.modsReset"));
});

openFolderBtn.addEventListener("click", async () => {
  await window.api.openMyModsFolder();
  await refreshModTree();
});

// -----------------------------
// 초기 실행
// -----------------------------
(async () => {
  await initTranslations();
  renderPresetList();
  initModTreeIfNeeded();
  initUserInfo();
})();
