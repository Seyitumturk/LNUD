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
import ExcelChatBot from './Components/pipinami/ExcelChatBot'; // Import the ExcelChatBot component
import Sidebar from './Components/layout/Sidebar'; // Add this import
import './Components/pipinami/chat.css'; // Import the new CSS file

function App() {
    return (
        <div className="App">
            <Router>
                <div className="app-container">
                    <Sidebar />
                    <div className="main-content">
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
                    </div>
                </div>
            </Router>
        </div>
    );
}

export default App;
