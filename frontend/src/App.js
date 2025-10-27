import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Analyze from "./pages/Analyze";
import Recommendations from "./pages/Recommendations";
import Navbar from "./components/Navbar";
import { Toaster } from "./components/ui/sonner";
import "@/App.css";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analyze" element={<Analyze />} />
          <Route path="/recommendations" element={<Recommendations />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;