import { BrowserRouter, Routes, Route } from "react-router-dom";
import Main from "./pages/Main";
import Analyze from "./pages/analyze";
import Analyzeinput from "./pages/AnalysisInputForm";
import ReportPage from "./pages/ReportPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/analyze" element={<Analyze/>}/>
        <Route path="/Analyzeinput" element={<Analyzeinput/>}/>
        <Route path="/ReportPage" element={<ReportPage/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
