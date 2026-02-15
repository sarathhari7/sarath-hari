import { Routes, Route, Navigate } from "react-router-dom";

import AdminLayout from "layouts/admin";
import { Toaster } from "components/ui/sonner";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="admin/*" element={<AdminLayout />} />
        <Route path="/" element={<Navigate to="/admin" replace />} />
      </Routes>
      <Toaster />
    </>
  );
};

export default App;
