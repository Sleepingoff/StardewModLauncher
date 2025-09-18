import styled from "styled-components";

export const Button = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.panel};
  border: 2px solid ${({ theme }) => theme.colors.border};

  &:hover {
    background: ${({ theme }) => theme.colors.accent};
  }
`;
