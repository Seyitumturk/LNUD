import React, { useState, useEffect } from 'react';
import {
    Grid,
    Card,
    CardContent,
    Typography,
    Tooltip,
    Box,
    Divider,
    TextField,
    Button,
    IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import * as echarts from 'echarts'; // Import ECharts
import './inventorycheck.css'; // Import the new CSS file

// Categorize inventory items with color coding
const categorizedItems = {
    "Dash Items": {
        color: '#ffeb3b',  // Yellow
        items: [
            { itemId: 'Elsapet - Elizabeth', itemName: 'Dash - Elsapet - 0001H' },
            { itemId: 'Jakej – Lobster', itemName: 'Dash - Jakej - 0002H' },
            { itemId: 'Kitpu – Eagle', itemName: 'Dash - Kitpu - 0003H' },
            { itemId: 'Klitaw – Raspberry', itemName: 'Dash - Klitaw - 0004H' },
            { itemId: 'Ma’kit – Margaret', itemName: "Dash - Ma'kit - 0005H" },
            { itemId: 'Mali – Mary', itemName: 'Dash - Mali - 0006H' },
            { itemId: 'Mattio – Matthew', itemName: 'Dash - Mattio - 0007H' },
            { itemId: 'Mise’l – Michael', itemName: "Dash - Mise'l - 0008H" },
            { itemId: 'Muin – Bear', itemName: 'Dash - Muin - 0009H' },
            { itemId: 'Plamu – Salmon', itemName: 'Dash - Plamu - 00010H' },
            { itemId: 'Qalipu – Caribou', itemName: 'Dash - Qalipu - 00011H' },
            { itemId: 'Sipu – River', itemName: 'Dash - Sipu - 00012H' },
            { itemId: 'Mimike’j – Butterfly', itemName: "Dash - Mimike'j - 00013H" },
            { itemId: 'Tia’m – Moose', itemName: "Dash - Tia'm - 00014H" },
            { itemId: 'Tuma – Thomas', itemName: 'Dash - Tuma - 00015H' },
            { itemId: 'Waspu – Seal', itemName: 'Dash - Waspu - 00016H' },
        ],
    },
    "Tablet Items": {
        color: '#03a9f4',  // Light Blue
        items: [
            { itemId: 'Elsapet - Elizabeth', itemName: 'Tablet - Elsapet - 00020H' },
            { itemId: 'Jakej – Lobster', itemName: 'Tablet - Jakej - 00021H' },
            { itemId: 'Kitpu – Eagle', itemName: 'Tablet - Kitpu - 00022H' },
            { itemId: 'Klitaw – Raspberry', itemName: 'Tablet - Klitaw - 00023H' },
            { itemId: 'Ma’kit – Margaret', itemName: "Tablet - Ma'kit - 00024H" },
            { itemId: 'Mali – Mary', itemName: 'Tablet - Mali - 00025H' },
            { itemId: 'Mattio – Matthew', itemName: 'Tablet - Mattio - 00026H' },
            { itemId: 'Mise’l – Michael', itemName: "Tablet - Mise'l - 00027H" },
            { itemId: 'Muin – Bear', itemName: 'Tablet - Muin - 00028H' },
            { itemId: 'Plamu – Salmon', itemName: 'Tablet - Plamu - 00029H' },
            { itemId: 'Qalipu – Caribou', itemName: 'Tablet- Qalipu - 00030H' },
            { itemId: 'Sipu – River', itemName: 'Tablet - Sipu - 00031H' },
            { itemId: 'Mimike’j – Butterfly', itemName: "Tablet - Mimike'j - 00032H" },
            { itemId: 'Tia’m – Moose', itemName: "Tablet - Tia'm - 00033H" },
            { itemId: 'Tuma – Thomas', itemName: 'Tablet - Tuma - 00034H' },
            { itemId: 'Waspu – Seal', itemName: 'Tablet - Waspu - 00035H' },
        ],
    },
    "Robotic Arms": {
        color: '#8bc34a',  // Light Green
        items: [
            { itemId: 'Robotic Arm', itemName: 'RA - 00040H' },
            { itemId: 'Robotic Arm', itemName: 'RA - 00041H' },
            { itemId: 'Robotic Arm', itemName: 'RA - 00042H' },
            { itemId: 'Robotic Arm', itemName: 'RA - 00043H' },
            { itemId: 'Robotic Arm', itemName: 'RA - 00044H' },
            { itemId: 'Robotic Arm', itemName: 'RA - 00045H' },
            { itemId: 'Robotic Arm', itemName: 'RA - 00046H' },
            { itemId: 'Robotic Arm', itemName: 'RA - 00047H' },
            { itemId: 'Robotic Arm', itemName: 'RA - 00048H' },
            { itemId: 'Robotic Arm', itemName: 'RA - 00049H' },
            { itemId: 'Robotic Arm', itemName: 'RA - 00050H' },
            { itemId: 'Robotic Arm', itemName: 'RA - 00051H' },
            { itemId: 'Robotic Arm', itemName: 'RA - 00052H' },
            { itemId: 'Robotic Arm', itemName: 'RA - 00053H' },
            { itemId: 'Robotic Arm', itemName: 'RA - 00054H' },
            { itemId: 'Robotic Arm', itemName: 'RA - 00055H' },
            { itemId: 'Robotic Arm', itemName: 'RA - 00056H' },
            { itemId: 'Robotic Arm', itemName: 'RA - 00057H' },
            { itemId: 'Robotic Arm', itemName: 'RA - 00058H' },
            { itemId: 'Robotic Arm', itemName: 'RA - 00059H' },
        ],
    },
    "VR Headsets": {
        color: '#e91e63',  // Pink
        items: [
            { itemId: 'VR headset', itemName: 'VR Headset - 00062' },
            { itemId: 'VR Headset', itemName: 'VR Headset - 00063' },
            { itemId: 'VR Headset', itemName: 'VR Headset - 00064' },
            { itemId: 'VR Headset', itemName: 'VR Headset - 00065' },
            { itemId: 'VR Headset', itemName: 'VR Headset - 000666' },
            { itemId: 'VR Headset', itemName: 'VR Headset - 00067' },
            { itemId: 'VR Headset', itemName: 'VR Headset - 00068' },
            { itemId: 'VR Headset', itemName: 'VR Headset - 0069' },
            { itemId: 'VR Headset', itemName: 'VR Headset - 00070' },
            { itemId: 'VR Headset', itemName: 'VR Headset - 00071' },
            { itemId: 'VR Headset', itemName: 'VR Headset - 0072' },
        ],
    },
    "Other Equipment": {
        color: '#ff5722',  // Deep Orange
        items: [
            { itemId: 'Alpha ubitech Robots', itemName: 'Robot - 00017H' },
            { itemId: 'Alpha ubitech Robots', itemName: 'Robot - 00018H' },
            { itemId: 'Mbot', itemName: 'MBot - 00019H' },
            { itemId: 'Blue Bot', itemName: 'Blue Bot - 00036H' },
            { itemId: 'Blue Bot', itemName: 'Blue Bot - 00037H' },
            { itemId: 'Blue', itemName: 'Blue Bot - 00038H' },
            { itemId: 'Jimu buzzbot and muttbox kit (complete)', itemName: 'Jimu buzzbot - 00039H' },
            { itemId: 'Dash Launcher', itemName: 'Dash Launcher - 00040H' },
            { itemId: 'Dash Launcher', itemName: 'Dash Launcher - 00041H' },
            { itemId: 'Dash and Dot Challenge Cards', itemName: 'D & D challenge - 00046H' },
            { itemId: 'Dot Wonderpak', itemName: 'Wonderpak - 00055H' },
            { itemId: 'Wonder Workshop Building Brick Connectors', itemName: 'Brick Connect - 00063H' },
            { itemId: 'Snap Circuit', itemName: 'Snap - 00072H' },
            { itemId: 'Wagon 1', itemName: 'Wagon 1 - 00060H' },
            { itemId: 'Wagon 2', itemName: 'Wagon 2 - 00061H' },
            { itemId: 'Alpha ubitech Robots', itemName: 'Robot - 00017H' },
            { itemId: 'Alpha ubitech Robots', itemName: 'Robot - 00018H' },
            { itemId: 'Mbot', itemName: 'MBot - 00019H' },
            { itemId: 'Blue Bot', itemName: 'Blue Bot - 00036H' },
            { itemId: 'Nikon Camera', itemName: 'Camera - 00116H' },
            { itemId: 'Osmo Genius Kit', itemName: 'Osmo - 00120H' },
            { itemId: 'Micro:bit', itemName: 'Micro:bit - 00130H' },
            { itemId: 'Rode microphone', itemName: 'Mic - 00150H' },
            { itemId: 'Dji Ronin 4D Camera', itemName: '4D Camera - 00153H' },
            { itemId: 'Dji Dl 24 MM F2.8 LS ASPH Lens', itemName: 'ASPH lens - 00154H' },
            { itemId: 'Knex Education Building Solution', itemName: 'Knex Ed - 00111H' }
        ],
    }
};


const InventoryCheck = () => {
    const [checkoutItem, setCheckoutItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [isModalOpen, setModalOpen] = useState(false);
    const [searchExpanded, setSearchExpanded] = useState(false);

    useEffect(() => {
        renderCharts();
    }, []);

    const renderCharts = () => {
        // Prepare chart data
        const chartData = Object.entries(categorizedItems).map(([category, { color, items }]) => ({
            name: category,
            value: items.length,
        }));

        // Bar Chart
        const barChart = echarts.init(document.getElementById('barChart'), 'dark');
        barChart.setOption({
            tooltip: {},
            xAxis: {
                type: 'category',
                data: chartData.map((item) => item.name),
                axisLabel: { color: '#ccc' },
            },
            yAxis: {
                type: 'value',
                axisLabel: { color: '#ccc' },
            },
            series: [
                {
                    data: chartData.map((item) => item.value),
                    type: 'bar',
                    itemStyle: {
                        color: '#049ebf', // Use your brand blue color
                    },
                },
            ],
        });

        // Pie Chart
        const pieChart = echarts.init(document.getElementById('pieChart'), 'dark');
        pieChart.setOption({
            tooltip: { trigger: 'item' },
            legend: { orient: 'vertical', left: 'left', textStyle: { color: '#ccc' } },
            series: [
                {
                    name: 'Inventory Distribution',
                    type: 'pie',
                    radius: '50%',
                    data: chartData,
                    itemStyle: {
                        borderRadius: 10,
                        borderColor: '#333',
                        borderWidth: 2,
                    },
                    label: {
                        color: '#ccc',
                    },
                },
            ],
        });
    };

    const handleItemClick = (item) => {
        setCheckoutItem(item);
        document.querySelector('.checkout-section').style.display = 'block';
    };

    const handleCheckoutButtonClick = () => {
        setModalOpen(true);
    };

    const handleModalClose = () => {
        setModalOpen(false);
    };

    const filteredItems = Object.entries(categorizedItems).map(([category, { color, items }]) => ({
        category,
        color,
        items: items.filter((item) =>
            item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (filterCategory === '' || filterCategory === category)
        ),
    }));

    return (
        <Box className="inventory-container" style={{ backgroundColor: '#1e1e1e' }}>
            {/* Title */}
            <Typography variant="h4" gutterBottom align="center" style={{ color: '#f7b329' }}>
                Inventory Management
            </Typography>

            {/* Data Visualization - Total Assets */}
            <Box className="data-visualization">
                {/* Bar Chart for Totals */}
                <div id="barChart" style={{ width: '500px', height: '300px' }}></div>

                {/* Pie Chart for Category Distribution */}
                <div id="pieChart" style={{ width: '400px', height: '400px' }}></div>
            </Box>

            {/* Search Bar and Filter Options */}
            <Box className="search-filter-container">
                <TextField
                    label="Search Items"
                    variant="standard"
                    fullWidth
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setSearchExpanded(true)}
                    onBlur={() => setSearchExpanded(false)}
                    className={`search-input ${searchExpanded ? 'expanded' : ''}`}
                    InputProps={{ style: { color: '#fff' } }}
                    InputLabelProps={{ style: { color: '#ccc' } }}
                />
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="filter-dropdown"
                    style={{ color: '#fff', backgroundColor: '#333', borderColor: '#049ebf' }}
                >
                    <option value="">All Categories</option>
                    {Object.entries(categorizedItems).map(([category, { color }], idx) => (
                        <option value={category} key={idx}>
                            <span className="color-circle" style={{ backgroundColor: color }}></span>
                            {category}
                        </option>
                    ))}
                </select>
                <Button
                    variant="contained"
                    style={{ backgroundColor: '#ed7a2a', color: '#fff', minWidth: '200px' }}
                    onClick={handleCheckoutButtonClick}
                >
                    Checkout Items
                </Button>
            </Box>

            {/* Inventory List */}
            <Box>
                {filteredItems.map(({ category, color, items }, idx) => (
                    <Box key={idx} className="inventory-category">
                        <Typography variant="h5" gutterBottom style={{ color: '#f7b329' }}>
                            {category}
                        </Typography>
                        <Divider sx={{ marginBottom: '20px', borderColor: '#444' }} />
                        <Grid container spacing={3} className="inventory-grid">
                            {items.map((item, index) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                                    <Tooltip
                                        title={
                                            <>
                                                <Typography><strong>Item ID:</strong> {item.itemId}</Typography>
                                                <Typography><strong>Location:</strong> 4th floor storage room</Typography>
                                            </>
                                        }
                                        arrow
                                        placement="top"
                                    >
                                        <Card
                                            className="inventory-card"
                                            sx={{
                                                backgroundColor: color,
                                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                                                transition: 'transform 0.3s, box-shadow 0.3s',
                                                borderRadius: '8px',
                                            }}
                                            onClick={() => handleItemClick(item)}
                                        >
                                            <CardContent>
                                                <Typography variant="h6" gutterBottom style={{ color: '#333' }}>
                                                    {item.itemName}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Tooltip>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                ))}
            </Box>

            {/* Checkout Section */}
            <Box className="checkout-section">
                {checkoutItem ? (
                    <>
                        <Typography variant="h6" gutterBottom>Checkout Item: {checkoutItem.itemName}</Typography>
                        <TextField label="Reason for Use" variant="outlined" fullWidth margin="normal" />
                        <TextField label="Estimated Use Time" variant="outlined" fullWidth margin="normal" />
                        <TextField label="Your Name" variant="outlined" fullWidth margin="normal" />
                        <Button variant="contained" color="primary" fullWidth>Submit</Button>
                    </>
                ) : (
                    <Typography variant="body1">Click an item to check out.</Typography>
                )}
            </Box>

            {/* Checkout Modal */}
            {isModalOpen && (
                <Box className="modal">
                    <Box className="modal-header">
                        <Typography variant="h6">Checkout Items</Typography>
                        <IconButton onClick={handleModalClose}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    <Box className="modal-body">
                        <TextField
                            label="Search Items to Checkout"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                        />
                        <Button variant="contained" color="primary" fullWidth onClick={handleModalClose}>
                            Checkout Selected Items
                        </Button>
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default InventoryCheck;