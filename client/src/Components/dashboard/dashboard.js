import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, LineElement, BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend, PointElement } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import 'react-calendar/dist/Calendar.css';
import 'react-circular-progressbar/dist/styles.css';
import './dashboard.css'; // Import the CSS file for dashboard styling
import ExcelChatBot from '../pipinami/ExcelChatBot'; // Import the ChatBot component
import Sidebar from '../layout/Sidebar'; // Import the new Sidebar component

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
        <div className="dashboard" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Sidebar /> {/* Use the new Sidebar component */}

            {/* Main Content */}
            <div className="dashboard-content gradient-bg" style={{ flex: 1, overflowY: 'auto', padding: '20px 40px' }}> {/* Increased left padding */}
                {/* Four Equal Blocks */}
                <div className="grid-container" style={{ minHeight: 'fit-content', marginLeft: '20px' }}> {/* Added left margin */}
                    {/* New UEC Metrics Overview */}
                    <div className="grid-block glass-card" style={{ gridColumn: '1 / -1', marginBottom: '20px' }}>
                        <h3 className="block-title" style={{ textAlign: 'left', backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '10px', borderRadius: '8px' }}>UEC Impact Overview</h3>
                        <div className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
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

                    {/* Block 1: Line Graph (Total Hours Overview) */}
                    <div className="grid-block glass-card" style={{ height: '700px' }}>
                        <h3 className="block-title" style={{ textAlign: 'left', backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '10px', borderRadius: '8px' }}>Total Hours Overview</h3>
                        <div className="chart-container center-content" style={{ height: 'calc(100% - 50px)' }}>
                            <Line data={lineChartData} options={lineChartOptions} />
                        </div>
                    </div>

                    {/* Block 2: Funding Streams with Scrollable Container */}
                    <div className="grid-block glass-card" style={{ height: '700px' }}>
                        <h3 className="block-title" style={{ textAlign: 'left', backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '10px', borderRadius: '8px' }}>Funding Streams</h3>
                        <div className="funding-streams-container" style={{ height: 'calc(100% - 50px)', overflowY: 'auto' }}>
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

                    {/* Block 3: Doughnut Chart (Funding Breakdown) */}
                    <div className="grid-block glass-card" style={{ height: '700px' }}>
                        <h3 className="block-title" style={{ textAlign: 'left', backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '10px', borderRadius: '8px' }}>Funding Breakdown</h3>
                        <div className="doughnut-chart-wrapper" style={{ display: 'flex', alignItems: 'center', height: 'calc(100% - 50px)' }}>
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

                    {/* Block 4: News Section (Modern Data-Driven) */}
                    <div className="grid-block glass-card" style={{ height: '700px' }}>
                        <h3 className="block-title" style={{ textAlign: 'left', backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '10px', borderRadius: '8px' }}>News from Communities</h3>
                        <div className="news-section-scrollable" style={{ height: 'calc(100% - 50px)', overflowY: 'auto' }}>
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
                onClick={toggleChatbot} // Opens the chat modal directly
            >
                Pipanimi – Ask me
            </button>

            {/* Modern Chat Modal */}
            {isChatOpen && (
                <div className="chat-modal">
                    <div className="chat-modal-content">
                        {/* Close button functionality is retained but styled for modern UI */}
                        <ExcelChatBot isOpen={isChatOpen} toggleChatbot={toggleChatbot} /> {/* Modern chat UI component */}
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
