import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import AttendancePage from "./pages/AttendancePage";
import AdminDashboard from "./pages/AdminDashboard";
import StudentPage from "./pages/StudentPage"; // ← NEW IMPORT

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        {/* Admin Dashboard */}
        <Route path="/dashboard" element={<AdminDashboard />} />
        {/* Students Page */}
        <Route path="/students" element={<StudentPage />} /> {/* ← NEW ROUTE */}
        {/* Batches / Attendance */}
        <Route path="/attendance" element={<AttendancePage />} />
      </Routes>
    </BrowserRouter>
  );
}
