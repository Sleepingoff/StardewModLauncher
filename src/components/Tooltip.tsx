import styled from "styled-components";
import IconButton from "./IconButton";
import { HTMLAttributes, useState } from "react";

interface Props extends HTMLAttributes<HTMLElement> {}

const Tooltip = ({ children, ...props }: Props) => {
  const [open, setOpen] = useState(false);
  return (
    <StyledDiv
      onMouseOver={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <IconButton>?</IconButton>
      {open && <StyledTipBox {...props}>{children}</StyledTipBox>}
    </StyledDiv>
  );
};

export default Tooltip;

const StyledDiv = styled.div`
  position: relative;
`;

const StyledTipBox = styled.div`
  position: absolute;
  background-color: ${({ theme }) => theme.colors.background};
  padding: 16px;
`;
