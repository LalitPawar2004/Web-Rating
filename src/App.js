import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Admin from './pages/Admin';
import StoreList from './pages/StoreList';
import StoreOwner from './pages/StoreOwner';
import ChangePassword from "./pages/ChangePassword";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/stores" element={<StoreList />} />
        <Route path="/store-owner" element={<StoreOwner />} />
        <Route path="/change-password" element={<ChangePassword />} />
        {/* Redirect any unknown route to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
