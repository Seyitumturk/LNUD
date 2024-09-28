import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './FundingList.css'; // Import the CSS file for styling

const DatasetList = () => {
    const [datasets, setDatasets] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDatasets = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/datasets'); // Adjust the URL as needed
                setDatasets(response.data);
            } catch (error) {
                console.error('Error fetching datasets:', error);
                setError('Unable to fetch datasets. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchDatasets();
    }, []);

    return (
        <div className="dataset-container">
            <h1 className="dataset-main-title">Explore Available Datasets</h1>
            {loading ? (
                <p className="loading-message">Loading datasets...</p>
            ) : error ? (
                <p className="error-message">{error}</p>
            ) : (
                <div className="dataset-grid">
                    {datasets.length > 0 ? (
                        datasets.map((dataset, index) => (
                            <div key={index} className="dataset-card">
                                <h2 className="dataset-title">{dataset}</h2>
                            </div>
                        ))
                    ) : (
                        <p className="no-dataset-message">No datasets available at this moment.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default DatasetList;
