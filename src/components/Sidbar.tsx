import { useState } from "react";
import Img from "./Img";
import StyledBox from "./StyledBox";
import IconButton from "./IconButton";
import styled from "styled-components";
import Header from "./Header";
import { Button } from "./Button";
import Tooltip from "./Tooltip";

const Sidebar = () => {
  //todo:padding 주기
  const [open, setOpen] = useState(false);
  const handleToggleSidebar = () => {
    setOpen((prev) => !prev);
  };

  const handleClickOpenMyFolder = async () => {
    try {
      await window.api.openMyModsFolder();
    } catch (err) {
      alert("모드 폴더를 열 수 없습니다.");
    }
  };
  return (
    <StyledSection>
      <section className={`${open ? "open" : ""}`}>
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
                  Window: C:\Program Files (x86)\Steam\steamapps\common\Stardew
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
            onClick={handleClickOpenMyFolder}
          >
            내 모드 폴더 열기
          </Button>
        </main>
      </section>

      <IconButton
        onClick={handleToggleSidebar}
        style={{ position: "absolute", top: "16px", left: "16px" }}
      >
        <Img src="/Stardrop.png" alt="toggle sidebar" />
      </IconButton>
    </StyledSection>
  );
};

export default Sidebar;

const StyledSection = styled.section`
  background-color: ${({ theme }) => theme.colors.background};
  width: fit-content;
  height: fit-content;
  position: relative;
  z-index: 10;

  & > section {
    padding: 4px;
    width: fit-content;
    min-width: 90vw;
    height: 100vh;
    border-top-right-radius: 16px;
    border-bottom-right-radius: 16px;

    box-shadow: 4px 4px 4px 2px rgba(0, 0, 0, 0.3); /* 외곽선처럼 보이게 */
    position: fixed;
    top: 0;
    left: -100%; /* 처음에는 화면 밖 */
    background: #fff;
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.2);
    transition: left 0.3s ease-in-out;
  }

  & > section.open {
    left: 0;
  }
`;
