import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, LineElement, BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend, PointElement } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import 'react-calendar/dist/Calendar.css';
import 'react-circular-progressbar/dist/styles.css';
import './dashboard.css'; // Import the CSS file for dashboard styling
import ExcelChatBot from '../pipinami/ExcelChatBot'; // Import the ChatBot component
import Sidebar from '../layout/Sidebar'; // Import the new Sidebar component
import { useSidebar } from '../../context/SidebarContext'; // Make sure to import useSidebar

// Register the required components for Chart.js
ChartJS.register(
    LineElement,
    BarElement,
    ArcElement,
    PointElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend
);

const Dashboard = () => {
    const { isCollapsed } = useSidebar(); // Use the sidebar context
    const [isChatOpen, setIsChatOpen] = useState(false); // State to manage the chatbot modal
    const toggleChatbot = () => setIsChatOpen(!isChatOpen); // Toggling function for the chatbot

    // Sample data for the new line chart
    const lineChartData = {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August'],
        datasets: [
            {
                label: 'Curriculum Development',
                data: [120, 150, 180, 220, 200, 250, 270, 300],
                borderColor: '#ed7a2a',
                fill: false,
                tension: 0.4,
            },
            {
                label: 'Delivery Hours',
                data: [180, 220, 200, 260, 300, 320, 330, 340],
                borderColor: '#f7b329',
                fill: false,
                tension: 0.4,
            },
            {
                label: 'Meetings',
                data: [80, 90, 100, 120, 150, 170, 180, 200],
                borderColor: '#049ebf',
                fill: false,
                tension: 0.4,
            },
            {
                label: 'Workshops',
                data: [150, 170, 160, 180, 200, 230, 260, 280],
                borderColor: '#e1262d',
                fill: false,
                tension: 0.4,
            },
        ],
    };

    // Options for a modern-looking line chart
    const lineChartOptions = {
        responsive: true,
        maintainAspectRatio: false, // Allows the chart to resize freely
        plugins: {
            legend: {
                display: false, // Remove the default legend
            },
            tooltip: {
                mode: 'index',
                intersect: false,
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
            },
            y: {
                beginAtZero: true,
                grid: {
                    display: true,
                    color: 'rgba(255, 255, 255, 0.1)',
                },
            },
        },
        layout: {
            padding: 0, // Minimize padding around the chart for maximum space
        },
    };

    // Updated funding data with new streams, logos, and visual progress indicators
    const fundingData = [
        {
            name: 'ISEDC',
            color: '#049ebf',
            logo: '/Canada.png', // Path to logo in public folder
            amount: 85, // Example funding amount
            progress: 75, // Overall progress for the funding stream
            requirements: [
                { text: 'Funding for innovation and economic development', progress: 85 },
                { text: 'Projects must align with national policy priorities', progress: 45 },
                { text: 'Annual audits and reviews required', progress: 60 }
            ]
        },
        {
            name: 'Whole Foods Foundation',
            color: '#ed7a2a',
            logo: '/wholefoods-logo.png', // Path to logo in public folder
            amount: 80, // Example funding amount
            progress: 60, // Overall progress for the funding stream
            requirements: [
                { text: 'Focus on sustainable agriculture and food education', progress: 80 },
                { text: 'Annual grant renewal based on impact reports', progress: 60 },
                { text: 'Community engagement events required', progress: 40 }
            ]
        },
        {
            name: 'NSERC',
            color: '#f7b329',
            logo: '/nserc-logo.png', // Path to logo in public folder
            amount: 90, // Example funding amount
            progress: 70, // Overall progress for the funding stream
            requirements: [
                { text: 'Research-based funding for STEM projects', progress: 90 },
                { text: 'Progress reports bi-annually', progress: 50 },
                { text: 'Collaboration with accredited institutions required', progress: 70 }
            ]
        },
        {
            name: 'UNB via TD',
            color: '#e1262d',
            logo: '/TD.png', // Path to logo in public folder
            amount: 65, // Example funding amount
            progress: 65, // Overall progress for the funding stream
            requirements: [
                { text: 'Partnerships with local educational bodies', progress: 65 },
                { text: 'Focus on community development initiatives', progress: 75 },
                { text: 'Quarterly impact assessments', progress: 55 }
            ]
        },
        {
            name: 'UEC',
            color: '#3cb44b',
            logo: '/logo.png', // Path to logo in public folder
            amount: 70, // Example funding amount
            progress: 67, // Overall progress for the funding stream
            requirements: [
                { text: 'Support for cultural and educational programs', progress: 70 },
                { text: 'Bi-annual performance reviews', progress: 50 },
                { text: 'Reports on usage of funds and outcomes', progress: 80 }
            ]
        }
    ];

    // Updated doughnut chart data to include funding streams with percentage labels
    const doughnutChartData = {
        labels: fundingData.map(f => f.name === 'Whole Foods Foundation' ? 'HFF' : f.name), // Using the funding names as labels, with 'Whole Foods Foundation' changed to 'HFF'
        datasets: [
            {
                data: fundingData.map(f => f.amount), // Using the funding amounts as data
                backgroundColor: fundingData.map(f => f.color), // Using the funding colors
            },
        ],
    };

    const doughnutChartOptions = {
        responsive: true,
        maintainAspectRatio: false, // Allows the chart to resize freely
        aspectRatio: 1, // Adjust this to control the size of the chart; a value close to 1 makes it larger
        plugins: {
            legend: {
                display: false, // Remove the default legend to use a custom one
            },
            tooltip: {
                callbacks: {
                    label: function (tooltipItem) {
                        const data = tooltipItem.raw;
                        const total = doughnutChartData.datasets[0].data.reduce((a, b) => a + b, 0);
                        const percentage = ((data / total) * 100).toFixed(2);
                        return `${tooltipItem.label}: ${data} (${percentage}%)`;
                    },
                },
            },
        },
        layout: {
            padding: 0, // Minimize padding around the chart for maximum space
        },
    };

    const currentProjects = [
        { title: 'Community Event in Wagmatcook Elder Center - Waltes Game Play: Cultural Workshop', description: 'Join us for a cultural workshop on traditional practices' },
        { title: 'News B: Funding Received', description: 'New funding received for community development projects' },
        { title: 'Event C: Volunteer Program', description: 'Looking for volunteers for our upcoming events' },
        { title: 'Update D: New Partnership', description: 'Announcing a new partnership with local schools' }
    ];

    // New data for UEC-specific metrics
    const uecMetrics = {
        youthServed: 1500,
        communitiesReached: 25,
        educationHours: 5000,
        digitalSkillsParticipants: 800,
        culturalWorkshops: 50,
        educationalPartnerships: 15,
        stemWorkshops: 30,
        entrepreneursSupported: 100
    };

    return (
        <div className="dashboard-wrapper" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            <Sidebar />
            <div className={`dashboard-content ${isCollapsed ? 'sidebar-collapsed' : ''}`} style={{
                flex: 1,
                overflowY: 'auto',
                overflowX: 'hidden',
                padding: '20px',
                transition: 'margin-left 0.3s ease, width 0.3s ease',
                marginLeft: isCollapsed ? '64px' : '220px',
                width: `calc(100% - ${isCollapsed ? '64px' : '220px'})`,
            }}>
                <div className="grid-container" style={{
                    minHeight: 'fit-content',
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gap: '20px',
                    width: '100%',
                }}>
                    {/* UEC Metrics Overview */}
                    <div className="grid-block glass-card" style={{ gridColumn: '1 / -1' }}>
                        <h3 className="block-title">UEC Impact Overview</h3>
                        <div className="metrics-grid" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '15px'
                        }}>
                            <MetricCard title="Youth Served" value={uecMetrics.youthServed} />
                            <MetricCard title="Communities Reached" value={uecMetrics.communitiesReached} />
                            <MetricCard title="Education Hours" value={uecMetrics.educationHours} />
                            <MetricCard title="Digital Skills Participants" value={uecMetrics.digitalSkillsParticipants} />
                            <MetricCard title="Cultural Workshops" value={uecMetrics.culturalWorkshops} />
                            <MetricCard title="Educational Partnerships" value={uecMetrics.educationalPartnerships} />
                            <MetricCard title="STEM Workshops" value={uecMetrics.stemWorkshops} />
                            <MetricCard title="Entrepreneurs Supported" value={uecMetrics.entrepreneursSupported} />
                        </div>
                    </div>

                    {/* Line Graph */}
                    <div className="grid-block glass-card">
                        <h3 className="block-title">Total Hours Overview</h3>
                        <div className="chart-container" style={{ height: '600px', width: '100%' }}>
                            <Line data={lineChartData} options={{
                                ...lineChartOptions,
                                responsive: true,
                                maintainAspectRatio: false,
                            }} />
                        </div>
                    </div>

                    {/* Funding Streams */}
                    <div className="grid-block glass-card">
                        <h3 className="block-title">Funding Streams</h3>
                        <div className="funding-streams-container" style={{ height: '600px', overflowY: 'auto' }}>
                            {fundingData.map((funding, index) => (
                                <div key={index} className="funding-stream-card" style={{ backgroundColor: funding.color }}>
                                    <div className="funding-header">
                                        <img src={funding.logo} alt={`${funding.name} logo`} className="funding-logo" />
                                        <h3>{funding.name}</h3>
                                    </div>
                                    <p>Amount: ${funding.amount}k</p>
                                    <div className="progress-bar-container">
                                        <div className="progress-bar" style={{ width: `${funding.progress}%`, backgroundColor: 'rgba(255, 255, 255, 0.3)' }}></div>
                                    </div>
                                    <div className="requirements-list">
                                        {funding.requirements.map((req, reqIndex) => (
                                            <div key={reqIndex} className="requirement-item">
                                                <span>{req.text}</span>
                                                <div className="requirement-progress-bar">
                                                    <div className="requirement-progress" style={{ width: `${req.progress}%`, backgroundColor: 'rgba(255, 255, 255, 0.5)' }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Doughnut Chart */}
                    <div className="grid-block glass-card">
                        <h3 className="block-title">Funding Breakdown</h3>
                        <div className="doughnut-chart-wrapper" style={{ height: '600px' }}>
                            <div className="doughnut-chart-legend" style={{
                                flex: '0 0 30%',
                                padding: '10px',
                                textAlign: 'left'
                            }}>
                                {doughnutChartData.labels.map((label, index) => (
                                    <div key={index} className="legend-item" style={{ margin: '5px 0' }}>
                                        <span className="legend-text" style={{ fontSize: '0.8em', display: 'flex', alignItems: 'center' }}>
                                            <span
                                                className="legend-color"
                                                style={{
                                                    backgroundColor: doughnutChartData.datasets[0].backgroundColor[index],
                                                    display: 'inline-block',
                                                    width: '8px',
                                                    height: '8px',
                                                    marginRight: '5px',
                                                    borderRadius: '50%'
                                                }}
                                            ></span>
                                            {label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="chart-container" style={{ flex: '1', position: 'relative', height: '100%' }}>
                                <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
                            </div>
                        </div>
                    </div>

                    {/* News Section */}
                    <div className="grid-block glass-card">
                        <h3 className="block-title">News from Communities</h3>
                        <div className="news-section-scrollable" style={{ height: '600px', overflowY: 'auto' }}>
                            <div className="news-section">
                                {currentProjects.map((project, index) => (
                                    <div key={index} className="news-item">
                                        <div className="news-header">
                                            <h4>{project.title}</h4>
                                            <p>{project.description}</p>
                                        </div>
                                        <div className="news-details">
                                            <span>Impact Score: {Math.floor(Math.random() * 100)}</span>
                                            <span>Date: {new Date().toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Solid Color Chat Button at the Bottom-Right Corner */}
            <button
                className="solid-chat-button glass-chat-button"
                onClick={toggleChatbot}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    zIndex: 1000
                }}
            >
                Pipanimi – Ask me
            </button>

            {/* Modern Chat Modal */}
            {isChatOpen && (
                <div className="chat-modal" style={{
                    position: 'fixed',
                    bottom: '20px', // Align to the bottom
                    right: '20px', // Align to the right
                    width: 'auto',
                    height: 'auto',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'flex-end',
                    zIndex: 1001, // Keep above other elements
                    backgroundColor: 'transparent', // Set background to transparent
                    border: 'none',
                    boxShadow: 'none',
                }}>
                    <div className="chat-modal-content" style={{
                        backgroundColor: '#1e1e1e',
                        borderRadius: '10px',
                        padding: '20px',
                        width: '80%',
                        maxWidth: '600px',
                        maxHeight: '80vh',
                        overflowY: 'auto'
                    }}>
                        <ExcelChatBot isOpen={isChatOpen} toggleChatbot={toggleChatbot} />
                    </div>
                </div>
            )}
        </div>
    );
};

// New component for individual metric cards with even smoother counting animation
const MetricCard = ({ title, value }) => {
    const [count, setCount] = useState(0);
    const duration = 2500; // Increased duration for a more pronounced effect
    const steps = 200; // Further increased number of steps for smoother animation

    useEffect(() => {
        let start = 0;
        const timer = setInterval(() => {
            // Using a more pronounced easeInOutQuart easing function for an enhanced bell curve effect
            const progress = start / steps;
            const easeValue = progress < 0.5
                ? 8 * progress * progress * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 4) / 2;

            const currentCount = Math.floor(easeValue * value);
            setCount(currentCount);

            if (start >= steps) {
                clearInterval(timer);
                setCount(value);
            }
            start++;
        }, duration / steps);

        return () => clearInterval(timer);
    }, [value]);

    return (
        <div className="metric-card" style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            padding: '15px',
            borderRadius: '8px',
            textAlign: 'left',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 6px rgba(237, 122, 42, 0.3), 0 1px 3px rgba(4, 158, 191, 0.2)',
            transition: 'all 0.3s ease'
        }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '1em', color: '#ffffff' }}>{title}</h4>
            <p style={{
                margin: 0,
                fontSize: '1.5em',
                fontWeight: 'bold',
                color: 'var(--orange)',
                backgroundColor: 'rgba(247, 179, 41, 0.2)',
                display: 'inline-block',
                padding: '5px 10px',
                borderRadius: '4px'
            }}>
                {count.toLocaleString()}
            </p>
        </div>
    );
};

export default Dashboard;
