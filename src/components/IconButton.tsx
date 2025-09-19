import { ButtonHTMLAttributes } from "react";
import styled from "styled-components";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {}

const IconButton = ({ children, ...props }: Props) => {
  return <StyledIconButton {...props}>{children}</StyledIconButton>;
};
export default IconButton;

const StyledIconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 40px; /* 아이콘 버튼 크기 (조절 가능) */
  height: 40px;
  border-radius: 50%;

  background-color: transparent;
  border: none;
  cursor: pointer;

  transition: box-shadow 0.2s ease, transform 0.2s ease;

  &:hover {
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.3); /* 외곽선처럼 보이게 */
    transform: scale(1.05); /* 살짝 커지는 효과 */
  }

  &:active {
    transform: scale(0.95); /* 클릭 시 살짝 줄어듦 */
  }

  & > img {
    width: 100%;
    height: 100%;
  }
`;
