import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import POSPage from "./pages/POSPage";

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Navigate to="/pos" replace />} />
        <Route path="/pos" element={<POSPage />} />
      </Routes>
    </>
  );
}

export default App;
