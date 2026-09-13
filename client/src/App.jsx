import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";
import Groups from "./pages/Groups";
import GroupDetails from "./pages/GroupDetails";
import ExpenseDetails from "./pages/ExpenseDetails";

function Notifications() {
  return <h1 className="text-2xl font-semibold">Notifications</h1>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/groups" element={<Groups />} />

          <Route
            path="/groups/:groupId"
            element={<GroupDetails />}
          />

          <Route
            path="/groups/:groupId/expenses/:expenseId"
            element={<ExpenseDetails />}
          />

          <Route path="/notifications" element={<Notifications />} />
        </Route>

        {/* Unknown route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;