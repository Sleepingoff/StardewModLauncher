import styled from "styled-components";

export const Button = styled.button`
  display: block;
  margin: 4px;
  min-width: 160px;
  border-radius: 2px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  background: linear-gradient(
    230deg,
    ${({ theme }) => theme.colors.secondary} 20%,
    ${({ theme }) => theme.colors.primary} 70%,
    ${({ theme }) => theme.colors.accent} 90%
  );
  cursor: pointer;
  padding: 4px;

  &:hover {
    background: ${({ theme }) => theme.colors.accent};
  }
`;
