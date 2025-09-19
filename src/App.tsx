import { ThemeProvider } from "styled-components";
import { GlobalStyle } from "./styles/global";
import { theme } from "./styles/theme";
import Sidebar from "./components/Sidbar";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Sidebar />
    </ThemeProvider>
  );
}

export default App;
