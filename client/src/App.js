import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Components/auth/Login';
import Register from './Components/auth/Register';
import Dashboard from './Components/dashboard/dashboard'; // Updated casing
import ProtectedRoute from './Components/auth/ProtectedRoute';
import InventoryCheck from './Components/inventory/InventoryCheck'; // Updated path
import BarcodeSheet from './Components/inventory/Barcode';
import LMS from './Components/lms/LMS';
// import ExcelChatbot from './Components/pipinami/ExcelChatbot'; // Add this import

function App() {
    return (
        <div className="App" style={{ backgroundColor: '#1e1e1e', minHeight: '100vh' }}>
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
        </div>
    );
}

export default App;
