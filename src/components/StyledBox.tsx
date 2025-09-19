import { HTMLAttributes, ReactNode } from "react";
import styled from "styled-components";

interface StyledBoxProps extends HTMLAttributes<HTMLDivElement> {}

const StyledBox = ({ children, ...props }: StyledBoxProps) => {
  return (
    <Box>
      {/* Y축 border */}
      <BorderY>
        <BorderYContainer>
          <Dashed color="#96473a" />
          <Dashed color="#96473a" />
        </BorderYContainer>
      </BorderY>

      <BoxInner>
        {/* X축 border (왼쪽) */}
        <BorderX>
          <Shadow />
          <BorderXContainer>
            <Dashed color="#ffbe65" className="dashed" />
            <Dashed color="#ffbe65" className="dashed" />
          </BorderXContainer>
        </BorderX>

        {/* 콘텐츠 영역 */}
        <BoxContent {...props}>{children}</BoxContent>

        {/* X축 border (오른쪽) */}
        <BorderX>
          <Shadow />
          <BorderXContainer>
            <DashedX color="#ffbe65" />
            <DashedX color="#ffbe65" />
          </BorderXContainer>
        </BorderX>
      </BoxInner>

      {/* Y축 border (아래쪽) */}
      <BorderY>
        <BorderYContainer>
          <Dashed color="#96473a" />
          <Dashed color="#96473a" />
        </BorderYContainer>
      </BorderY>
    </Box>
  );
};

export default StyledBox;

/* 전체 박스 */
const Box = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 20px;
  min-height: 20px;
  align-items: flex-start;
  background: #ffd284;
`;

const BoxInner = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: stretch;
`;

const BoxContent = styled.div`
  width: 100%;
  margin: auto;
  padding: 16px;
`;

/* Y축 border */
const BorderY = styled.div`
  display: flex;
  width: 100%;
  height: 16px;
  justify-content: space-between;
  align-items: center;
  border-radius: 2px;
  border: 2px solid #3f0f08;
  background: #e27a3e;
  flex-shrink: 0;
`;

const BorderYContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px;

  :first-child {
    max-width: 40%;
  }
`;

/* X축 border */
const BorderX = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 16px;
  flex-shrink: 0;
  border-radius: 2px;
  border: 2px solid #3f0f08;
  background: #e27a3e;
`;

const Shadow = styled.div`
  width: 100%;
  height: 6px;
  background: #96473a;
`;

const BorderXContainer = styled.div`
  position: absolute;
  right: 50%;
  display: flex;
  flex-direction: column;
  height: 100%;
  align-items: center;
  justify-content: space-around;

  & :nth-child(1) {
    height: 40%;
  }
  & :nth-child(2) {
    height: 24%;
  }
`;

/* 공통 dashed 선 */
const Dashed = styled.div<{ color?: string }>`
  flex-shrink: 1;
  border: 1px dashed ${({ color }) => color || "#000"};
  width: 100%;
  height: fit-content;
`;

const DashedX = styled(Dashed)`
  width: fit-content;
`;
