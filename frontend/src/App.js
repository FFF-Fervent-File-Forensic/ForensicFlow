import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

import Login from "./pages/login/Login";
import Signup from "./pages/login/Signup";
import Main from "./pages/Main";
import Analyze from "./pages/Analyze";
import Analyzeinput from "./pages/AnalysisInputForm";
import ReportPage from "./pages/ReportPage";
import DataRegister from "./pages/DataRegister";
import DataTransfer from "./pages/DataTransfer";
import CaseAdmin from "./pages/CaseAdmin";
import CaseInfo from "./pages/CaseInfo";
import { EvidenceProvider } from "./contexts/EvidenceContext";
import Header from "./components/Header";

function Layout() {
  return (
    <div>
      <Header />
      <Outlet />
    </div>
  );
}

function App() {
  return (
    <EvidenceProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/main" element={<Main />} />

          <Route element={<Layout />}>
            <Route path="/analyze" element={<Analyze />} />
            <Route path="/analyzeinput" element={<Analyzeinput />} />
            <Route path="/reportPage" element={<ReportPage />} />
            <Route path="/register" element={<DataRegister />} />
            <Route path="/transfer" element={<DataTransfer />} />
            <Route path="/admin" element={<CaseAdmin />} />
            <Route path="/caseinfo" element={<CaseInfo />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </EvidenceProvider>
  );
}

export default App;
