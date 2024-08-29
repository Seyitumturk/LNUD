// client/src/Components/Dashboard.js
import React, { useState } from 'react';
import { Chart as ChartJS, BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { Calendar } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import 'react-circular-progressbar/dist/styles.css';
import './dashboard.css'; // Import the CSS file for dashboard styling

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

    // Funding data with progress
    const fundingData = [
        { name: 'Foundation Funding - NSERC', percentage: 75, color: '#ed7a2a' },
        { name: 'Private Donors', percentage: 50, color: '#f7b329' },
        { name: 'Government Grants - STEAM Program', percentage: 90, color: '#049ebf' },
    ];

    const onCalendarChange = (date) => {
        setDate(date);
        // Function to handle booking and send email (can be implemented later)
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
                {/* Funding Streams with Circular Progress */}
                <div className="funding-streams">
                    {fundingData.map((funding, index) => (
                        <div className="funding-box" key={index}>
                            <CircularProgressbar
                                value={funding.percentage}
                                text={`${funding.percentage}%`}
                                styles={buildStyles({
                                    textColor: '#fff',
                                    pathColor: funding.color,
                                    trailColor: '#333',
                                })}
                            />
                            <h4>{funding.name}</h4>
                        </div>
                    ))}
                </div>

                {/* Metrics Section */}
                <div className="metrics-section">
                    <div className="chart-container">
                        <h3>Total Hours Overview</h3>
                        <Bar data={barChartData} />
                    </div>
                    <div className="chart-container">
                        <h3>Funding Breakdown</h3>
                        <Doughnut data={doughnutChartData} />
                    </div>
                </div>

                {/* Booking Calendar Section at the Bottom */}
                <div className="calendar-section">
                    <h3>Booking Calendar</h3>
                    <Calendar onChange={onCalendarChange} value={date} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
