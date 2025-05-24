import { BrowserRouter, Routes, Route } from "react-router-dom";
import Main from "./pages/Main";
import Analyze from "./pages/analyze";
import Analyzeinput from "./pages/AnalysisInputForm";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/analyze" element={<Analyze/>}/>
        <Route path="/Analyzeinput" element={<Analyzeinput/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
