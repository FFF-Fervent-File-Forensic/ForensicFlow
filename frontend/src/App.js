import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/login/Login";
import Signup from "./pages/login/Signup";
import Main from "./pages/main/Main";
import Analyze from "./pages/analyze";
import Analyzeinput from "./pages/AnalysisInputForm";
import ReportPage from "./pages/ReportPage";
import DataRegister from "./pages/DataRegister";
import DataTransfer from "./pages/DataTransfer";
import { EvidenceProvider } from "./contexts/EvidenceContext";

function App() {
  return (
    <EvidenceProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/main" element={<Main />} />
          <Route path="/analyze" element={<Analyze />} />
          <Route path="/Analyzeinput" element={<Analyzeinput />} />
          <Route path="/ReportPage" element={<ReportPage />} />
          <Route path="/register" element={<DataRegister />} />
          <Route path="/transfer" element={<DataTransfer />} />
        </Routes>
      </BrowserRouter>
    </EvidenceProvider>

  );
}

export default App;
