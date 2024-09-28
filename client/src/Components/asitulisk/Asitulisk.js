import React from 'react';
import './Asitulisk.css'; // Make sure this CSS file is linked

const Asitulisk = () => {
    return (
        <div style={{ height: '100vh', width: '100%' }}>
            <iframe
                title="EO Browser"
                src="https://apps.sentinel-hub.com/eo-browser/?lat=44.46538&lng=-64.61948&zoom=15&datasource=Sentinel-2&layers=Sentinel-2-L2A&time=2024-09-24"
                style={{ height: '100%', width: '100%', border: 'none' }}
            />
        </div>
    );
};

export default Asitulisk;
