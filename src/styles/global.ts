import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  html, body {
    margin: 0;
    padding: 4px;
    box-sizing: border-box;
    font-family: sans-serif;
    background: ${({ theme }) => theme.colors.background};
  }

  h1 {
    margin: 8px;
    font-size: 24px;
  }

  h2 {
    margin: 8px;
  }

  p {
    font-size: small;
    display: flex;
  }

  input {
    border-radius: 16px;
    padding: 8px 16px;
    border: 1px solid ${({ theme }) => theme.colors.primary};
  }

  button {
    display: inline-block;
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
  }
`;
