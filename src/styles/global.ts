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
    margin: 0 8px;
    border-radius: 16px;
    padding: 8px 16px;
    border: 1px solid ${({ theme }) => theme.colors.primary};
    width: 60%;
  }

    input[type="checkbox"] {
      clip: rect(1px, 1px, 1px, 1px);
      clip-path: inset(50%);
      width: 1px;
      height: 1px;
      margin: -1px;
      overflow: hidden;
      padding: 0;
      position: absolute;
    }

    input[type="checkbox"]+span {
      display: inline-block;
      width: 24px;
      height: 24px;
      padding: 2px;
      margin: 0px 4px;
      border-radius: 2px;
      vertical-align: middle;
    }

    input:checked+span {
      background: url(./assets/junimo.jpg) no-repeat center bottom;
      background-size: cover;
    }
`;
