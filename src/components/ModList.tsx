import { ReactElement, useEffect, useState } from "react";
import styled from "styled-components";
import { Button } from "./Button";
import Header from "./Header";

interface ModNode {
  name: string;
  enabled?: boolean;
  uniqueId?: string;
  children?: Record<string, ModNode>;
}
interface Props {
  presetName: string;
}

const ModList = ({ presetName }: Props) => {
  const [mods, setMods] = useState<ModStates>({});
  const [smapiPath, setSmapiPath] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [applying, setApplying] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  // 🔑 프리셋 이름 수정 관련
  const [currentName, setCurrentName] = useState(presetName);

  // ⬇️ 앱 시작 시 저장된 사용자 정보에서 smapiPath 불러오기
  useEffect(() => {
    async function fetchInfo() {
      try {
        const info = await window.api.readInfo();
        if (info?.smapiPath) {
          setSmapiPath(info.smapiPath);
        }
      } catch (err) {
        alert("사용자 설정에서 스마피 경로를 먼저 저장해주세요!");
        console.error("사용자 정보 불러오기 실패:", err);
      }
    }
    fetchInfo();
  }, []);

  // ⬇️ 프리셋 변경 시 해당 프리셋의 모드 로드
  useEffect(() => {
    if (!presetName) {
      setMods({});
      return;
    }
    async function fetchMods() {
      try {
        const preset = await window.api.readPreset(presetName);
        setMods(preset);
        console.log(preset);
      } catch (err) {
        console.error("프리셋 로드 실패:", err);
      }
    }
    fetchMods();
  }, [presetName]);
  const toggleExpand = (path: string) => {
    setExpanded((prev) => ({ ...prev, [path]: !prev[path] }));
  };
  const toggleMod = (path: string) => {
    setMods((prev) => {
      const newMods = structuredClone(prev);
      const node = getNodeByPath(newMods, path);
      if (!node) return prev;

      if (node.uniqueId) {
        // leaf → 자기만 토글
        node.enabled = !node.enabled;
      } else {
        // folder → 하위 전체 leaf만 토글
        const shouldEnable = !getFolderChecked(node);

        const applyToChildren = (subNode: any) => {
          if (subNode.uniqueId) {
            subNode.enabled = shouldEnable;
          } else {
            Object.values(subNode).forEach(applyToChildren);
          }
        };

        Object.values(node).forEach(applyToChildren);
      }

      return newMods;
    });
  };

  const handleSavePreset = async () => {
    if (!currentName.trim()) {
      alert("프리셋 이름을 입력하세요.");
      return;
    }
    if (!presetName) return;

    setSaving(true);
    try {
      await window.api.updatePreset(presetName, currentName.trim(), mods);
      alert("프리셋이 저장되었습니다.");
    } catch (err) {
      console.error("프리셋 저장 실패:", err);
      alert("프리셋 저장 실패");
    } finally {
      setSaving(false);
    }
  };

  const handleApply = async () => {
    if (!smapiPath) {
      alert("SMAPI 경로를 먼저 저장해주세요.");
      return;
    }
    setApplying(true);
    try {
      await window.api.applyMods(smapiPath, mods);
      alert("모드가 적용되었습니다!");
    } catch (err) {
      console.error("모드 적용 실패:", err);
      alert("모드 적용 실패");
    } finally {
      setApplying(false);
    }
  };

  if (!presetName) {
    return <Message>프리셋을 선택하세요.</Message>;
  }

  const { total, checked } = countMods(mods);
  const renderTree = (
    tree: ModStates | Record<string, ModStates>,
    parentPath = ""
  ): ReactElement[] => {
    console.log(tree);
    const seen = new Set<string>();
    return Object.entries(tree).map(([name, node]) => {
      const fullPath = parentPath ? `${parentPath}/${name}` : name;
      const isDuplicate = node.uniqueId ? seen.has(node.uniqueId) : false;
      if (isDuplicate) seen.add(node.uniqueId!);
      // folder
      const folderState = getFolderChecked(node);
      const open = expanded[fullPath] ?? false;
      return (
        <ModListBox>
          {node.uniqueId ? (
            <ModItem key={fullPath} $duplicate={isDuplicate}>
              <label className="ell">
                <HiddenCheckbox
                  type="checkbox"
                  checked={!!node.enabled}
                  onChange={() => toggleMod(fullPath)}
                />
                <CustomCheckbox />
                {name}
              </label>
            </ModItem>
          ) : (
            <ModItem key={fullPath} $duplicate={isDuplicate}>
              <div style={{ display: "flex" }}>
                <span onClick={() => toggleExpand(fullPath)}>
                  {open ? "▼" : "▶"}
                </span>
                <label className="ell">
                  <HiddenCheckbox
                    type="checkbox"
                    checked={folderState}
                    onChange={() => toggleMod(fullPath)}
                  />
                  <CustomCheckbox />
                  {name}
                </label>
              </div>
              {open && (
                <ChildContainer>
                  {renderTree(node as ModStates, fullPath)}
                </ChildContainer>
              )}
            </ModItem>
          )}
        </ModListBox>
      );
    });
  };

  return (
    <Container>
      <Header style={{ position: "sticky", top: "0px", background: "#fff" }}>
        <PresetNameInput
          value={currentName}
          onChange={(e) => setCurrentName(e.target.value)}
          autoFocus
        />

        <Counter>
          {checked} / {total}
        </Counter>

        <ButtonContainer>
          <Button onClick={handleSavePreset} disabled={saving}>
            {saving ? "저장 중..." : "프리셋 저장"}
          </Button>
          <Button onClick={handleApply} disabled={applying}>
            {applying ? "적용 중..." : "모드 적용"}
          </Button>
        </ButtonContainer>
      </Header>

      <TreeContainer>{renderTree(mods)}</TreeContainer>
    </Container>
  );
};

function getFolderChecked(node: Record<string, any>): boolean {
  // leaf라면 그냥 enabled 값만 반환
  if (node.uniqueId) {
    return !!node.enabled;
  }

  // folder라면 하위 항목들을 확인
  const children = Object.values(node) as any[];

  if (children.length === 0) return false;

  // 하위 노드들의 상태 재귀 확인
  const states = children.map((child) => getFolderChecked(child));

  return states.length > 0 && states.every(Boolean);
}

function getNodeByPath(
  tree: Record<string, any>,
  path: string
): ModNode | null {
  const parts = path.split("/");
  let node: any = tree;
  for (const part of parts) {
    node = node?.[part];
    if (!node) return null;
  }
  return node;
}

function countMods(tree: Record<string, any>): {
  total: number;
  checked: number;
} {
  let total = 0;
  let checked = 0;

  const traverse = (node: any) => {
    if (node.uniqueId) {
      total += 1;
      if (node.enabled) checked += 1;
    } else {
      Object.values(node).forEach(traverse);
    }
  };

  Object.values(tree).forEach(traverse);

  return { total, checked };
}

export default ModList;

const TreeContainer = styled.div`
  line-height: 1.6;
`;

const ChildContainer = styled.div`
  margin-top: 4px;
  padding-left: 20px;
  transition: max-height 0.3s ease, opacity 0.3s ease;
  overflow: hidden;

  &.show {
    display: block;
    max-height: 1000px;
    opacity: 1;
  }

  &.hide {
    display: block;
    max-height: 0;
    opacity: 0;
  }
`;
const Container = styled.div`
  margin-top: 16px;
  padding: 12px;
  border: 2px solid #3f0f08;
  background: #fff;
`;
const PresetNameInput = styled.input`
  display: block;
  margin: 0;
  width: 80%;
`;

const Counter = styled.p`
  width: fit-content;
  margin: auto;
  margin-top: 8px;
`;

const Message = styled.p`
  padding: 12px;
  color: #555;
`;

const ModListBox = styled.ul`
  list-style: none;
`;

const ModItem = styled.li<{ $duplicate: boolean }>`
  margin-bottom: 4px;
  color: ${({ $duplicate }) => ($duplicate ? "red" : "inherit")};
  font-weight: ${({ $duplicate }) => ($duplicate ? "bold" : "normal")};
  cursor: ${({ $duplicate }) => ($duplicate ? "help" : "default")};
`;

const HiddenCheckbox = styled.input`
  clip: rect(1px, 1px, 1px, 1px);
  clip-path: inset(50%);
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;

  &:checked + span {
    background: url("/junimo.jpg") no-repeat center;
    background-size: contain;
  }
`;

const CustomCheckbox = styled.span`
  display: inline-block;
  width: 24px;
  height: 24px;
  margin: 0px 4px;
  border-radius: 2px;
  vertical-align: middle;
`;
const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;
`;
