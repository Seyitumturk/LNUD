import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaRobot } from 'react-icons/fa'; // Add this import for the Pipinami icon

function Sidebar({ isCollapsed, toggleSidebar }) {
    // ... existing code ...

    return (
        <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            {/* ... existing sidebar content ... */}
            
            {/* Move this NavLink to the bottom, just above the sidebar-fact div */}
            <NavLink to="/chat" className="sidebar-item pipinami-link">
                <FaRobot />
                <span>Pipinami</span>
            </NavLink>

            <div className="sidebar-fact">
                {/* ... existing "Did You Know" section ... */}
            </div>

            {/* ... existing sidebar toggle button ... */}
        </div>
    );
}

export default Sidebar;