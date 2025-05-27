import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/login/Login";
import Signup from "./pages/login/Signup";
import Main from "./pages/main/Main";
import Analyze from "./pages/analyze";
import Analyzeinput from "./pages/AnalysisInputForm";
import ReportPage from "./pages/ReportPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/main" element={<Main />} />
        <Route path="/analyze" element={<Analyze/>}/>
        <Route path="/Analyzeinput" element={<Analyzeinput/>}/>
        <Route path="/ReportPage" element={<ReportPage/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
