import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaBook, FaBoxes, FaComments, FaMapMarkedAlt, FaTools, FaLanguage, FaChevronLeft, FaChevronRight, FaTree } from 'react-icons/fa';
import './sidebar.css';

const Sidebar = () => {
    const location = useLocation();
    const [activeItem, setActiveItem] = useState('');
    const [fact, setFact] = useState('');
    const [isCollapsed, setIsCollapsed] = useState(false);

    const mikmaqFacts = [
        "The Mi'kmaq people have inhabited the areas of Canada's Atlantic Provinces for over 11,000 years.",
        "The Mi'kmaq language is part of the Algonquian language family.",
        "Traditional Mi'kmaq territory is known as Mi'kma'ki, which includes parts of the Atlantic provinces and the Gaspé Peninsula.",
        "The Mi'kmaq were among the first indigenous peoples to encounter European explorers in North America.",
        "The Mi'kmaq have a rich tradition of storytelling, passing down their history and culture orally.",
    ];

    useEffect(() => {
        setActiveItem(location.pathname);
        const randomFact = mikmaqFacts[Math.floor(Math.random() * mikmaqFacts.length)];
        setFact(randomFact);
        // Don't change the collapsed state when a link is clicked
    }, [location]);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    const sidebarItems = [
        { path: '/', icon: FaHome, label: 'Dashboard' },
        { path: '/lms', icon: FaBook, label: 'ALP' },
        { path: '/inventory', icon: FaBoxes, label: 'Inventory' },
        { path: '/pipinami', icon: FaComments, label: 'Pipinami' }, // Changed from 'AI Chat' to 'Pipinami'
        { path: '/community-map', icon: FaMapMarkedAlt, label: 'Community Map' },
        { path: '/makerspaces', icon: FaTools, label: 'Makerspaces' },
        { path: '/language', icon: FaLanguage, label: 'Language' },
        { path: '/asitulisk', icon: FaTree, label: 'Asitulisk' }, // New item
    ];

    return (
        <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-logo">
                <div className="sidebar-logo-container">
                    <img src="/logo.png" alt="Logo" />
                </div>
                <h2>LNUD V.0.1</h2>
            </div>
            <nav className="sidebar-nav">
                {sidebarItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`sidebar-item ${activeItem === item.path ? 'active' : ''}`}
                        aria-label={item.label}
                    >
                        <item.icon />
                        {!isCollapsed && <span>{item.label}</span>}
                    </Link>
                ))}
            </nav>
            {!isCollapsed && (
                <div className="sidebar-fact">
                    <h3>Did you know?</h3>
                    <p>{fact}</p>
                </div>
            )}
            <button className="sidebar-toggle" onClick={toggleSidebar}>
                {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
            </button>
        </div>
    );
};

export default Sidebar;