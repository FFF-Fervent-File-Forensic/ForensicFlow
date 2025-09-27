import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

import Login from "./pages/login/Login";
import Signup from "./pages/login/Signup";
import Main from "./pages/Main";
import Analyze from "./pages/Analyze";
import Analyzeinput from "./pages/AnalysisInputForm";
import ReportPage from "./pages/ReportPage";
import DataRegister from "./pages/DataRegister";
import DataTransfer from "./pages/DataTransfer";
import { EvidenceProvider } from "./contexts/EvidenceContext";
import Header from "./components/Header";

// 헤더가 필요한 페이지들을 위한 레이아웃 컴포넌트
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
          </Route>
        </Routes>
      </BrowserRouter>
    </EvidenceProvider>
  );
}

export default App;
