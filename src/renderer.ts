// renderer.ts
import "./style.css";

interface ModStates {
  [uniqueId: string]: {
    uniqueId: string;
    name: string;
    enabled: boolean;
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

function getNestedValue(obj: any, path: string) {
  return path.split(".").reduce((acc, part) => acc?.[part], obj);
}

function applyI18n() {
  // 텍스트용
  document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n!;
    const value = getNestedValue(text, key);
    if (value) el.textContent = value;
  });

  // placeholder용
  document
    .querySelectorAll<HTMLInputElement>("[data-i18n-placeholder]")
    .forEach((el) => {
      const key = el.dataset.i18nPlaceholder!;
      const value = getNestedValue(text, key);
      if (value) el.placeholder = value;
    });
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

      // uniqueId, name 저장
      checkbox.dataset.uniqueId = value.uniqueId; // ✅ 여기서 UID 지정
      checkbox.dataset.name = name;

      const label = document.createElement("label");
      const span = document.createElement("span");
      label.appendChild(checkbox);
      label.appendChild(span);
      label.appendChild(document.createTextNode(name));
      label.dataset.path = fullPath;

      container.appendChild(label);
      container.appendChild(document.createElement("br"));

      modStates[value.uniqueId] = { ...value, enabled: checkbox.checked };

      checkbox.addEventListener("change", (e) => {
        const target = e.currentTarget as HTMLInputElement;
        const uniqueId = target.dataset.uniqueId!;

        modStates[uniqueId].enabled = checkbox.checked;
        updateModCount();
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
        'input[type="checkbox"][data-unique-id]'
      );

      if (childCheckboxes.length > 0) {
        const allChecked = Array.from(childCheckboxes).every((c) => c.checked);
        const someChecked = Array.from(childCheckboxes).some((c) => c.checked);

        parentCheckbox.checked = allChecked;
        parentCheckbox.indeterminate = !allChecked && someChecked;
      } else {
        parentCheckbox.checked = false;
      }

      // 토글 버튼 (열고 닫기)
      toggleBtn.addEventListener("click", () => {
        subContainer.style.display =
          subContainer.style.display === "none" ? "block" : "none";
      });

      // 부모 체크박스 → 자식 전체 토글
      parentCheckbox.addEventListener("change", () => {
        const checked = parentCheckbox.checked;

        const childCheckboxes = subContainer.querySelectorAll<HTMLInputElement>(
          'input[type="checkbox"][data-unique-id]'
        );

        childCheckboxes.forEach((child) => {
          child.checked = checked;

          const uid = child.dataset.uniqueId!;
          modStates[uid] = {
            ...modStates[uid],
            enabled: checked,
          };
        });

        parentCheckbox.indeterminate = false;
        updateModCount();
      });

      // 자식 체크박스 상태 → 부모 상태 갱신
      subContainer.addEventListener("change", (e) => {
        const target = e.target as HTMLInputElement;
        if (target.type === "checkbox" && target.dataset.uniqueId) {
          const uniqueId = target.dataset.uniqueId;
          modStates[uniqueId] = {
            ...modStates[uniqueId],
            enabled: target.checked,
          };
        }

        const leafBoxes = subContainer.querySelectorAll<HTMLInputElement>(
          'input[type="checkbox"][data-unique-id]'
        );
        const total = leafBoxes.length;
        const checkedCount = Array.from(leafBoxes).filter(
          (c) => c.checked
        ).length;
        parentCheckbox.checked = total > 0 && checkedCount === total;
        parentCheckbox.indeterminate = checkedCount > 0 && checkedCount < total;
        updateModCount();
      });
    }
  });
  updateModCount();
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

  // 관계 맵 초기화(경로 변경 가능성 반영)
  parentChildrenMap.clear();
  childParentMap.clear();

  renderBtnInModTrees();

  // 트리 데이터 재요청
  const tree = await window.api.readPreset(presetName?.value ?? "");
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
  sectionTitle.textContent = text.presetTitle || "Preset Manager";
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
            text.alerts?.overwritePreset || "Preset already exists. Overwrite?"
          ).replace("{presetName}", name)
        )
      ) {
        await window.api.updatePreset(name, name, {});
        renderPresetList();
      }
    }
  });
  presetContainer.appendChild(createBtn);
  contentArea.appendChild(presetContainer);
  //   contentArea.appendChild(createBtn);

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
      contentArea.innerHTML = "";

      renderBtnInModTrees();
      renderModTree(configs, contentArea);
    });

    ul.appendChild(li);
  });

  contentArea.appendChild(ul);
}

// -----------------------------
// 모드 체크박스 화면
// -----------------------------

function syncModStatesFromUI() {
  contentArea
    .querySelectorAll<HTMLInputElement>("input[type=checkbox]")
    .forEach((cb) => {
      const key = cb.dataset.uniqueId || cb.id; // label.dataset.path 활용 가능
      if (!key) return;

      modStates[key] = {
        ...modStates[key],
        enabled: cb.checked,
      };
    });
}

async function renderBtnInModTrees() {
  sectionTitle.innerHTML = "";

  const presetNameInfo = document.createElement("p");
  presetNameInfo.style.margin = "auto";
  presetNameInfo.textContent = text.info?.presetName || "Input Preset Name";

  const counter = document.createElement("span");
  counter.id = "counter";

  presetNameInfo.appendChild(counter);
  sectionTitle.prepend(presetNameInfo);
  const titleInput = document.createElement("input");
  titleInput.id = "presetName";
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
    syncModStatesFromUI();
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

  sectionTitle.appendChild(buttonContainer);

  contentArea.appendChild(sectionTitle);
}
function updateModCount() {
  syncModStatesFromUI();
  const total = Object.entries(modStates).filter(
    ([_, value]) => !!value?.uniqueId
  ).length;
  const checked = Object.entries(modStates).filter(
    ([_, value]) => !!value?.uniqueId && value.enabled
  ).length; // value.enabled가 true인 것만

  const counter = document.getElementById("counter");
  if (counter) {
    counter.textContent = `${checked} / ${total}`;
  }
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
const syncBtn = document.getElementById("syncBtn") as HTMLButtonElement;
const smapiPathInput = document.getElementById("smapiPath") as HTMLInputElement;

async function initUserInfo() {
  const info = await window.api.readInfo();
  if (info?.smapiPath) smapiPathInput.value = info.smapiPath;
}

savePathBtn.addEventListener("click", async () => {
  const smapiPath = smapiPathInput.value.trim();
  await window.api.writeInfo({ smapiPath });
  alert(text.alerts?.savePath ?? "saved smapi path");
});
// -------------------- Apply  --------------------
applyBtn.addEventListener("click", async () => {
  const smapiPath = smapiPathInput.value.trim();
  if (!smapiPath) return alert(text.alerts.noSmapiPath);

  if (!selectedPreset) return alert(text.alerts.noSelectedPreset);

  await window.api.applyMods(smapiPath, modStates);
  alert(text.alerts.modsApplied);
});

// -------------------- Reset Mods --------------------
resetBtn.addEventListener("click", async () => {
  const userInfo = await window.api.readInfo();
  if (!smapiPathInput.value) {
    alert(text.alerts.noSmapiPath);
    return;
  }
  await window.api.resetMods(userInfo.smapiPath ?? smapiPathInput.value);
  alert(text.alerts.modsReset);
});
// -------------------- Sync Mods Config --------------------
syncBtn.addEventListener("click", async () => {
  const smapiPath = smapiPathInput.value.trim();
  await window.api.syncConfigIngame(smapiPath);
  alert(text.alerts.syncConfigOption);
});

openFolderBtn.addEventListener("click", async () => {
  await window.api.openMyModsFolder();
  // await refreshModTree();
});

// -----------------------------
// 초기 실행
// -----------------------------
(async () => {
  await initTranslations();
  renderPresetList();
  initModTreeIfNeeded();
  initUserInfo();
  applyI18n();
})();
