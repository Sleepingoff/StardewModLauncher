import { useState } from "react";
import Img from "./Img";
import StyledBox from "./StyledBox";
import IconButton from "./IconButton";
import styled from "styled-components";
import Header from "./Header";
import { Button } from "./Button";
import Tooltip from "./Tooltip";

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const handleToggleSidebar = () => {
    setOpen((prev) => !prev);
  };
  return (
    <StyledSection>
      <IconButton
        onClick={handleToggleSidebar}
        style={{ position: "absolute", top: "16px", left: "16px" }}
      >
        <Img src="/Stardrop.png" alt="toggle sidebar" />
      </IconButton>
      {open && (
        <section>
          <Header>
            <h2>User Settings</h2>
          </Header>
          <main>
            <StyledBox>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <label htmlFor="smapiPath">SMAPI 경로:</label>
                <input
                  type="text"
                  id="smapiPath"
                  placeholder="스마피 경로를 입력해주세요"
                />
                <Tooltip style={{ top: "100%", right: "50%", width: "50vw" }}>
                  <p>
                    MacOS: /Users/mac/Library/Application
                    Support/Steam/steamapps/common/Stardew
                    Valley/Contents/MacOS/StardewModdingAPI
                  </p>
                  <p>
                    Window: C:\Program Files
                    (x86)\Steam\steamapps\common\Stardew
                    Valley\StardewModdingAPI
                  </p>
                </Tooltip>
              </div>
              <Button
                style={{
                  marginLeft: "auto",
                }}
              >
                경로 저장하기
              </Button>
            </StyledBox>

            <Button
              style={{
                margin: "auto",
                marginTop: "16px",
                width: "80vw",
              }}
            >
              내 모드 폴더 열기
            </Button>
          </main>
        </section>
      )}
    </StyledSection>
  );
};

export default Sidebar;

const StyledSection = styled.section`
  background-color: ${({ theme }) => theme.colors.background};
  width: fit-content;
  height: fit-content;
  position: relative;

  & > section {
    width: fit-content;
    min-width: 90vw;
    height: 100vh;
  }
`;
