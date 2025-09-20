import { useState } from "react";
import { Button } from "./Button";
import ModList from "./ModList";
import PresetList from "./PresetList";
import StyledBox from "./StyledBox";

const Main = () => {
  const [selectedPreset, setSelectedPreset] = useState<string>("");
  return (
    <main>
      {!selectedPreset ? (
        <PresetList onSelectPreset={(name) => setSelectedPreset(name)} />
      ) : (
        <StyledBox>
          <Button onClick={() => setSelectedPreset("")}>← 프리셋 목록</Button>
          <ModList presetName={selectedPreset} />
        </StyledBox>
      )}
    </main>
  );
};

export default Main;
