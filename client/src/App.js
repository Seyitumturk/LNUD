import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Components/auth/Login';
import Register from './Components/auth/Register';
import Dashboard from './Components/dashboard/dashboard';
import ProtectedRoute from './Components/auth/ProtectedRoute';
import InventoryCheck from './Components/inventory/InventoryCheck';
import BarcodeSheet from './Components/inventory/Barcode';
import LMS from './Components/lms/LMS';
import ExcelChatBot from './Components/pipinami/ExcelChatBot';
import Sidebar from './Components/layout/Sidebar';
import './Components/pipinami/chat.css';
import { SidebarProvider } from './context/SidebarContext';
import Course from './Components/lms/Course';
import FundingList from './Components/funder/Funder';
import Asitulisk from './Components/asitulisk/Asitulisk'; // Import the new Asitulisk component

function App() {
    return (
        <SidebarProvider>
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
                            <Route
                                path="/barcode"
                                element={
                                    <ProtectedRoute>
                                        <BarcodeSheet />
                                    </ProtectedRoute>
                                }
                            />
                            <Route path="/course/:slug" element={<Course />} />
                            {/* Add a new route for the Funding page */}
                            <Route
                                path="/funding"
                                element={
                                    <ProtectedRoute>
                                        <FundingList />
                                    </ProtectedRoute>
                                }
                            />
                            {/* New Route for Asitulisk */}
                            <Route
                                path="/asitulisk"
                                element={
                                    <ProtectedRoute>
                                        <Asitulisk />
                                    </ProtectedRoute>
                                }
                            />
                        </Routes>
                    </div>
                </div>
            </Router>
        </SidebarProvider>
    );
}

export default App;
