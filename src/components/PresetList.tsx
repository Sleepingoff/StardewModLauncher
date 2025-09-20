import { useEffect, useState } from "react";
import styled from "styled-components";
import StyledBox from "./StyledBox";
import { Button } from "./Button";

interface Props {
  onSelectPreset: (name: string) => void;
}
const PresetList = ({ onSelectPreset }: Props) => {
  const [presets, setPresets] = useState<string[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string>("");
  const [presetName, setPresetName] = useState("");

  // 프리셋 목록 불러오기
  useEffect(() => {
    async function fetchPresets() {
      try {
        const list = await window.api.getPresetLists();
        setPresets(list);
      } catch (err) {
        console.error("프리셋 목록 불러오기 실패:", err);
      }
    }
    fetchPresets();
  }, []);

  const handleCreate = async () => {
    if (!presetName.trim()) return;
    try {
      await window.api.createPreset(presetName, {});
      setPresetName("");
      const list = await window.api.getPresetLists();
      setPresets(list);
    } catch (err) {
      console.error("프리셋 생성 실패:", err);
    }
  };

  const handleDelete = async (name: string) => {
    if (!confirm(`"${name}" 프리셋을 삭제하시겠습니까?`)) return;
    try {
      await window.api.deletePreset(name);
      const list = await window.api.getPresetLists();
      setPresets(list);
      if (selectedPreset === name) setSelectedPreset("");
    } catch (err) {
      console.error("프리셋 삭제 실패:", err);
    }
  };

  return (
    <StyledBox>
      <Title>프리셋 관리</Title>
      <PresetUl>
        {presets.map((name) => (
          <PresetLi
            key={name}
            $active={selectedPreset === name}
            onClick={() => onSelectPreset(name)}
          >
            <span>{name}</span>
            <DeleteBtn
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(name);
              }}
            >
              삭제
            </DeleteBtn>
          </PresetLi>
        ))}
      </PresetUl>

      <InputRow>
        <PresetInput
          type="text"
          value={presetName}
          onChange={(e) => setPresetName(e.target.value)}
          placeholder="새 프리셋 이름 입력"
        />
        <Button onClick={handleCreate}>프리셋 생성</Button>
      </InputRow>
    </StyledBox>
  );
};

export default PresetList;

const Title = styled.h2`
  margin: 8px 0;
  font-size: 18px;
  font-weight: bold;
`;

const PresetUl = styled.ul`
  padding: 8px;
  max-height: 200px;
  overflow-y: auto;
`;

const PresetLi = styled.li<{ $active: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 2px solid ${({ $active }) => ($active ? "#3f0f08" : "#fff")};
  border-radius: 4px;
  margin-bottom: 8px;
  padding: 4px 8px;
  cursor: pointer;

  &:hover {
    font-weight: bold;
    border-color: #3f0f08;
  }
`;

const DeleteBtn = styled.button`
  min-width: 60px;
  background: #df650e;
  color: white;
  border: none;
  border-radius: 2px;
  padding: 2px 6px;
  cursor: pointer;

  &:hover {
    background: #b94700;
  }
`;

const InputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
`;

const PresetInput = styled.input`
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #357abd;
  border-radius: 16px;
`;
