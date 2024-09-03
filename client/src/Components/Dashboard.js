// src/components/Dashboard.js
import React, { useState } from 'react';
import { Chart as ChartJS, BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Calendar } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import 'react-circular-progressbar/dist/styles.css';
import './dashboard.css'; // Import the CSS file for dashboard styling
import ExcelChatBot from './ExcelChatBot'; // Import the ChatBot component

// Register the required components for Chart.js
ChartJS.register(
    BarElement,
    ArcElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend
);

const Dashboard = () => {
    const [date, setDate] = useState(new Date());

    // Sample data for charts
    const barChartData = {
        labels: ['Curriculum Development', 'Delivery Hours', 'Meetings', 'Workshops'],
        datasets: [
            {
                label: 'Total Hours',
                data: [120, 200, 80, 150],
                backgroundColor: ['#ed7a2a', '#f7b329', '#049ebf', '#e1262d'],
                borderWidth: 1,
            },
        ],
    };

    const doughnutChartData = {
        labels: ['Government Funding', 'Private Funding'],
        datasets: [
            {
                data: [70, 30],
                backgroundColor: ['#049ebf', '#ed7a2a'],
            },
        ],
    };

    // Funding data as info boxes
    const fundingData = [
        { name: 'Foundation Funding - NSERC', color: '#ed7a2a' },
        { name: 'Private Donors', color: '#f7b329' },
        { name: 'Government Grants - STEAM Program', color: '#049ebf' },
        { name: 'Corporate Sponsorships', color: '#e1262d' },  // Added new funding source
    ];

    const currentProjects = [
        { title: 'Project A: Curriculum Development', description: 'Focusing on creating new modules for STEM subjects' },
        { title: 'Project B: Workshop Coordination', description: 'Organizing community workshops for skills development' },
        { title: 'Project C: Community Outreach', description: 'Engaging with local communities to raise awareness' },
        { title: 'Project D: Resource Allocation', description: 'Ensuring efficient allocation of educational resources' }
    ];

    const onCalendarChange = (date) => {
        setDate(date);
    };

    return (
        <div className="dashboard">
            {/* Sidebar */}
            <div className="sidebar">
                <div className="sidebar-brand">Ulnooweg</div>
                <ul className="sidebar-nav">
                    <li>Dashboard</li>
                    <li>Community Info</li>
                    <li>Funding Streams</li>
                    <li>Calendar</li>
                    <li>Settings</li>
                </ul>
            </div>

            {/* Main Content */}
            <div className="dashboard-content">
                {/* Funding Streams and Doughnut Chart */}
                <div className="top-section">
                    <div className="funding-streams">
                        {fundingData.map((funding, index) => (
                            <div className="funding-info-box" key={index} style={{ backgroundColor: funding.color }}>
                                <h4>{funding.name}</h4>
                            </div>
                        ))}
                    </div>
                    <div className="chart-container">
                        <h3>Funding Breakdown</h3>
                        <Doughnut data={doughnutChartData} />
                    </div>
                </div>

                {/* Metrics Section */}
                <div className="metrics-section">
                    <div className="chart-container">
                        <h3>Total Hours Overview</h3>
                        <Bar data={barChartData} />
                    </div>
                    <div className="project-list">
                        <h3>Current Projects</h3>
                        <ul>
                            {currentProjects.map((project, index) => (
                                <li key={index}>
                                    <h4 className="project-title">{project.title}</h4>
                                    <p className="project-description">{project.description}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Booking Calendar Section */}
                <div className="calendar-section">
                    <h3>Booking Calendar</h3>
                    <Calendar onChange={onCalendarChange} value={date} />
                </div>
            </div>

            {/* Excel Chatbot Component */}
            <ExcelChatBot />
        </div>
    );
};

export default Dashboard;
