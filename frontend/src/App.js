import { BrowserRouter, Routes, Route } from "react-router-dom";
import Main from "./pages/Main";
import DataRegister from "./pages/DataRegister";
import DataTransfer from "./pages/DataTransfer";
import { EvidenceProvider } from "./contexts/EvidenceContext";

function App() {
  return (
    <EvidenceProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/register" element={<DataRegister/>}/>
          <Route path="/transfer" element={<DataTransfer/>}/>
        </Routes>
      </BrowserRouter>
    </EvidenceProvider>
  );
}

export default App;
