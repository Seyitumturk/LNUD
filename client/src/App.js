import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Components/Login'; // Updated path
import Register from './Components/Register'; // Updated path
import Dashboard from './Components/Dashboard'; // Updated path
import ProtectedRoute from './Components/ProtectedRoute'; // Updated path
import InventoryCheck from './Components/InventoryCheck'; // Import InventoryCheck component

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                {/* Route for the Inventory Check Page */}
                <Route
                    path="/inventory"
                    element={
                        <ProtectedRoute>
                            <InventoryCheck />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;
