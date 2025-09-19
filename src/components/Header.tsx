import { HTMLAttributes } from "react";
import styled from "styled-components";

interface Props extends HTMLAttributes<HTMLHeadElement> {}

const Header = ({ children, ...props }: Props) => {
  return <StyledHeader {...props}>{children}</StyledHeader>;
};

export default Header;

const StyledHeader = styled.header`
  margin: auto;
  width: fit-content;
  padding: 8px;
`;
