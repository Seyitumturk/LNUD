import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Components/Login';
import Register from './Components/Register';
import Dashboard from './Components/Dashboard';
import ProtectedRoute from './Components/ProtectedRoute';
import InventoryCheck from './Components/InventoryCheck';
import BarcodeSheet from './Components/Barcode'; // Import BarcodeSheet component
import LMS from './Components/LMS';

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
                <Route
                    path="/lms"
                    element={
                        <ProtectedRoute>
                            <LMS />
                        </ProtectedRoute>
                    }
                />
                {/* Route for the Barcode Page */}
                <Route
                    path="/barcode"
                    element={
                        <ProtectedRoute>
                            <BarcodeSheet />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;
