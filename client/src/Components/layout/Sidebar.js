import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaBoxes, FaMapMarkedAlt, FaTools, FaLanguage, FaChevronLeft, FaChevronRight, FaTree, FaVideo, FaDollarSign } from 'react-icons/fa';
import { MdOutlineSchool } from 'react-icons/md';
import { useSidebar } from '../../context/SidebarContext';
import './sidebar.css';

const Sidebar = ({ onWidthChange }) => {
    const location = useLocation();
    const [activeItem, setActiveItem] = useState('');
    const [factIndex, setFactIndex] = useState(0);
    const { isCollapsed, toggleSidebar } = useSidebar();
    const [showFact, setShowFact] = useState(!isCollapsed);
    const [factOpacity, setFactOpacity] = useState(0);

    const mikmaqFacts = [
        "The Mi'kmaq people have inhabited the areas of Canada's Atlantic Provinces for over 11,000 years.",
        "The Mi'kmaq language is part of the Algonquian language family.",
        "Traditional Mi'kmaq territory is known as Mi'kma'ki, which includes parts of the Atlantic provinces and the Gaspé Peninsula.",
        "The Mi'kmaq were among the first indigenous peoples to encounter European explorers in North America.",
        "The Mi'kmaq have a rich tradition of storytelling, passing down their history and culture orally.",
    ];

    useEffect(() => {
        setActiveItem(location.pathname);
    }, [location]);

    useEffect(() => {
        let timer;
        let fadeTimer;
        let loopTimer;

        if (!isCollapsed) {
            timer = setTimeout(() => {
                setShowFact(true);
                fadeTimer = setInterval(() => {
                    setFactOpacity(prevOpacity => {
                        if (prevOpacity >= 1) {
                            clearInterval(fadeTimer);
                            return 1;
                        }
                        return prevOpacity + 0.1;
                    });
                }, 50);

                loopTimer = setInterval(() => {
                    setFactOpacity(0);
                    setTimeout(() => {
                        setFactIndex(prevIndex => (prevIndex + 1) % mikmaqFacts.length);
                        setFactOpacity(1);
                    }, 500);
                }, 10000);
            }, 500);
        } else {
            setShowFact(false);
            setFactOpacity(0);
        }

        return () => {
            clearTimeout(timer);
            if (fadeTimer) clearInterval(fadeTimer);
            if (loopTimer) clearInterval(loopTimer);
        };
    }, [isCollapsed]);

    useEffect(() => {
        if (onWidthChange && typeof onWidthChange === 'function') {
            onWidthChange(isCollapsed ? 70 : 250);
        }
    }, [isCollapsed, onWidthChange]);

    const sidebarItems = [
        { path: '/', icon: FaHome, label: 'Dashboard' },
        { path: '/lms', icon: MdOutlineSchool, label: 'ALP' },
        { path: '/inventory', icon: FaBoxes, label: 'Inventory' },
        { path: '/community-map', icon: FaMapMarkedAlt, label: 'Maps' },
        { path: '/makerspaces', icon: FaTools, label: 'Makerspaces' },
        { path: '/language', icon: FaLanguage, label: 'Language' },
        { path: '/asitulisk', icon: FaTree, label: 'Asitulisk' }, // New Sidebar Item for Asitulisk
        { path: '/community-zoom', icon: FaVideo, label: 'Zoom Line' },
        { path: '/funding', icon: FaDollarSign, label: 'Funding' },
    ];

    return (
        <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`} style={{ width: isCollapsed ? '70px' : '250px', borderBottomRightRadius: '0' }}>
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

            {!isCollapsed && showFact && (
                <div className="sidebar-fact" style={{ opacity: factOpacity, transition: 'opacity 0.5s ease-in-out' }}>
                    <h3 style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.2)', paddingBottom: '10px', marginBottom: '10px' }}>Did you know?</h3>
                    <p>{mikmaqFacts[factIndex]}</p>
                </div>
            )}
            <button className="sidebar-toggle" onClick={toggleSidebar}>
                {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
            </button>
        </div>
    );
};

export default Sidebar;
