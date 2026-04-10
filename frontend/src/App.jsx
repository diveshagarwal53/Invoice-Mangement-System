import { useState } from "react";

import { BrowserRouter, Route, Routes } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ProtectedRoute from "./pages/ProtectedRoute";
import Client from "./pages/Client";
import Invoice from "./pages/Invoice";
import Dashboard from "./pages/Dashboard";

function App() {
  const [count, setCount] = useState(0);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/client" element={<Client />} />
          <Route path="/clients/:clientId/invoices" element={<Invoice />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
