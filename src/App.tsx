import { ThemeProvider } from "styled-components";
import { GlobalStyle } from "./styles/global";
import { theme } from "./styles/theme";
import Sidebar from "./components/Sidbar";
import Main from "./components/Main";
import Header from "./components/Header";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Sidebar />
      <Header>
        <h1>Stardew Mod Launcher</h1>
      </Header>

      <Main />
    </ThemeProvider>
  );
}

export default App;
