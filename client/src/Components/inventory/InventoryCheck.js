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
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import * as echarts from 'echarts'; // Import ECharts
import './inventorycheck.css'; // Import the new CSS file
import { Link } from 'react-router-dom';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import Sidebar from '../layout/Sidebar'; // Import the Sidebar component
import ExcelChatBot from '../pipinami/ExcelChatBot'; // Import the ChatBot component
import { useSidebar } from '../../context/SidebarContext'; // Import the sidebar context

// Categorize inventory items with color coding
const categorizedItems = {
  "Dash Items": {
    color: '#ffeb3b',  // Yellow
    items: [
      { itemId: 'Elsapet - Elizabeth', itemName: 'Dash - Elsapet - 0001H' },
      { itemId: 'Jakej – Lobster', itemName: 'Dash - Jakej - 0002H' },
      { itemId: 'Kitpu – Eagle', itemName: 'Dash - Kitpu - 0003H' },
      { itemId: 'Klitaw – Raspberry', itemName: 'Dash - Klitaw - 0004H' },
      { itemId: 'Ma\'kit – Margaret', itemName: "Dash - Ma\'kit - 0005H" },
      { itemId: 'Mali – Mary', itemName: 'Dash - Mali - 0006H' },
      { itemId: 'Mattio – Matthew', itemName: 'Dash - Mattio - 0007H' },
      { itemId: 'Mise\'l – Michael', itemName: "Dash - Mise\'l - 0008H" },
      { itemId: 'Muin – Bear', itemName: 'Dash - Muin - 0009H' },
      { itemId: 'Plamu – Salmon', itemName: 'Dash - Plamu - 00010H' },
      { itemId: 'Qalipu – Caribou', itemName: 'Dash - Qalipu - 00011H' },
      { itemId: 'Sipu – River', itemName: 'Dash - Sipu - 00012H' },
      { itemId: 'Mimike\'j – Butterfly', itemName: "Dash - Mimike\'j - 00013H" },
      { itemId: 'Tia\'m – Moose', itemName: "Dash - Tia\'m - 00014H" },
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
      { itemId: 'Ma\'kit – Margaret', itemName: "Tablet - Ma\'kit - 00024H" },
      { itemId: 'Mali – Mary', itemName: 'Tablet - Mali - 00025H' },
      { itemId: 'Mattio – Matthew', itemName: 'Tablet - Mattio - 00026H' },
      { itemId: 'Mise\'l – Michael', itemName: "Tablet - Mise\'l - 00027H" },
      { itemId: 'Muin – Bear', itemName: 'Tablet - Muin - 00028H' },
      { itemId: 'Plamu – Salmon', itemName: 'Tablet - Plamu - 00029H' },
      { itemId: 'Qalipu – Caribou', itemName: 'Tablet- Qalipu - 00030H' },
      { itemId: 'Sipu – River', itemName: 'Tablet - Sipu - 00031H' },
      { itemId: 'Mimike\'j – Butterfly', itemName: "Tablet - Mimike\'j - 00032H" },
      { itemId: 'Tia\'m – Moose', itemName: "Tablet - Tia\'m - 00033H" },
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
  const [checkedOutItems, setCheckedOutItems] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false); // State to manage the chatbot modal
  const toggleChatbot = () => setIsChatOpen(!isChatOpen); // Toggling function for the chatbot
  const { isCollapsed } = useSidebar(); // Use the sidebar context

  useEffect(() => {
    // Initialize ECharts instances
    const lineChart = echarts.init(document.getElementById('lineChart'), 'dark');
    const pieChart = echarts.init(document.getElementById('pieChart'), 'dark');

    // Render charts
    renderCharts(lineChart, pieChart);

    // Handle window resize for responsiveness
    const handleResize = () => {
      lineChart.resize();
      pieChart.resize();
    };

    window.addEventListener('resize', handleResize);

    // Clean up the resize listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const renderCharts = (lineChart, pieChart) => {
    // Example data for each category with monthly checkout counts
    const lineChartData = {
      "Dash Items": [5, 8, 10, 15, 20, 16, 25, 30, 40, 38, 45, 50],  // Example data; replace with real historical data
      "Tablet Items": [2, 5, 8, 10, 18, 22, 27, 25, 30, 28, 35, 40], // Example data
      "Robotic Arms": [1, 2, 3, 4, 5, 10, 12, 14, 16, 18, 20, 25],   // Example data
      "VR Headsets": [4, 6, 8, 12, 15, 14, 20, 22, 28, 32, 30, 35],  // Example data
      "Other Equipment": [6, 9, 12, 15, 18, 20, 25, 28, 35, 40, 45, 48] // Example data
    };

    const lineChartSeries = Object.entries(lineChartData).map(([category, data]) => ({
      name: category,
      type: 'line',
      smooth: true, // Smooth lines for better visual appeal
      data,
      itemStyle: {
        color: getCategoryColor(category), // Custom function to determine color per category
      },
      areaStyle: { // Optional: Add area below the line for emphasis
        opacity: 0.1,
      },
    }));


    // Configure and set options for the line chart
    lineChart.setOption({


      tooltip: {
        trigger: 'axis',
        formatter: function (params) {
          let tooltipText = `<strong>${params[0].axisValue}</strong><br/>`;
          params.forEach(param => {
            tooltipText += `${param.marker} ${param.seriesName}: ${param.data} times checked out<br/>`;
          });
          return tooltipText;
        }
      },
      legend: {
        data: Object.keys(lineChartData),
        textStyle: { color: '#ccc' },
        top: '5%',
      },
      grid: { left: '3%', right: '3%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], // Example months
        axisLabel: { color: '#ccc' },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#ccc' },
      },
      series: lineChartSeries,
    });

    // Example data for pie chart with category distribution
    const chartData = Object.entries(categorizedItems).map(([category, { color, items }]) => ({
      name: category,
      value: items.length,
    }));

    // Configure and set options for the pie chart
    pieChart.setOption({

      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} items ({d}%)',  // Show category name, item count, and percentage
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        textStyle: { color: '#ccc' }
      },
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
            show: true,
            formatter: '{b}: {c} items',  // Show category name and item count
            color: '#ccc',
          },
        },
      ],
    });

  };


  // Function to determine color per category for the line chart
  const getCategoryColor = (category) => {
    switch (category) {
      case 'Dash Items':
        return '#ffeb3b'; // Yellow
      case 'Tablet Items':
        return '#03a9f4'; // Light Blue
      case 'Robotic Arms':
        return '#8bc34a'; // Light Green
      case 'VR Headsets':
        return '#e91e63'; // Pink
      case 'Other Equipment':
        return '#ff5722'; // Deep Orange
      default:
        return '#ccc'; // Default color
    }
  };


  const handleItemClick = (item, event) => {
    setCheckoutItem(item);
    const checkoutSection = document.querySelector('.checkout-section');

    // Get the position of the clicked element
    const rect = event.currentTarget.getBoundingClientRect();
    const modalHeight = checkoutSection.offsetHeight; // Get the modal height

    // Calculate the top position to ensure the modal is fully visible
    let topPosition = rect.top + window.scrollY;
    if (topPosition + modalHeight > window.innerHeight + window.scrollY) {
      topPosition = window.innerHeight + window.scrollY - modalHeight - 20; // Adjust to be above the bottom
    }

    // Set modal position
    checkoutSection.style.display = 'block';
    checkoutSection.style.top = `${topPosition}px`;  // Adjusted Y position
    checkoutSection.style.left = `${rect.right + 10}px`;  // Place it 10px to the right of the item
  };


  const handleCheckoutButtonClick = () => {
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    const checkoutSection = document.querySelector('.checkout-section');
    checkoutSection.style.display = 'none';  // Hide the modal
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
    <Box className="inventory-wrapper" sx={{ display: 'flex', width: '100%', backgroundColor: '#1e1e1e' }}>
      <Sidebar />
      <Box className={`inventory-container ${isCollapsed ? 'sidebar-collapsed' : ''}`} sx={{ flexGrow: 1 }}>
        <Box className="inventory-content" sx={{ 
          width: '100%', 
          padding: '20px',
          marginLeft: isCollapsed ? '70px' : '270px', // Adjust these values based on your sidebar widths
          transition: 'margin-left 0.3s ease-in-out'
        }}>
          {/* Data Visualization - Line Chart for Most Checked-Out Items */}
          <Box className="chart-wrapper line-chart-wrapper" style={{ marginTop: '20px' }}>
            {/* Background div for Line Chart */}
            <Box className="glassmorphism-bg" style={{ padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
              <Typography variant="h5" align="center" style={{ color: '#fff', marginBottom: '20px' }}>
                Checked-Out Items Over Time
              </Typography>

              <div id="lineChart" style={{ width: '100%', height: '400px', borderRadius: '18px', overflow: 'hidden' }}></div>
            </Box>
          </Box>

          {/* Data Visualization - Pie Chart and Latest Checked-Out Items */}
          <Box className="chart-wrapper" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
            {/* Pie Chart for Category Distribution */}
            <Box className="glassmorphism-bg" style={{ width: '48%', height: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', borderRadius: '12px' }}>
              {/* Title for Pie Chart with margin bottom, aligned above */}
              <Typography variant="h5" align="center" style={{ color: '#fff', marginBottom: '20px' }}>
                Inventory Distribution by Category
              </Typography>
              <div id="pieChart" style={{ width: '100%', height: '400px', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#1e1e1e' }}></div>
              {/* Total number of items */}
              <Typography variant="body1" align="right" style={{ color: '#fff', marginTop: '10px', alignSelf: 'flex-end' }}>
                Total Items: {Object.values(categorizedItems).reduce((sum, { items }) => sum + items.length, 0)}
              </Typography>
            </Box>
            {/* Latest Checked-Out Items Section */}
            <Box className="glassmorphism-bg" style={{ width: '48%', padding: '20px', borderRadius: '12px', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', maxHeight: '600px', overflow: 'hidden' }}>
              <Typography variant="h5" style={{ color: '#ccc', marginBottom: '20px', paddingLeft: '10px' }}>Latest Checked-Out Items</Typography>
              <Box style={{ overflowY: 'scroll', height: '100%', paddingRight: '10px' }}>
                {[...Array(20)].map((_, index) => (
                  <Box key={index} className="glassmorphism-bg" style={{
                    padding: '20px',
                    borderRadius: '10px',
                    marginBottom: '15px',
                    backgroundColor: 'rgba(30, 30, 30, 0.7)',
                    backdropFilter: 'blur(10px)',
                    animation: `fadeInOut ${5 + index % 5}s infinite`,
                    transition: 'all 0.3s ease'
                  }}>
                    <Box display="flex" alignItems="flex-start">
                      <Avatar alt={`User ${index + 1}`} src={`https://i.pravatar.cc/150?img=${index + 10}`} style={{ width: '70px', height: '70px', marginRight: '25px' }} />
                      <Box flexGrow={1} display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="body1" style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '5px' }}>
                            {`${['Dash - Elsapet', 'Tablet - Jakej', 'VR Headset', 'Robotic Arm', 'Mbot', 'Osmo Genius Kit', 'Blue Bot', 'Micro:bit'][index % 8]} checked out`}
                          </Typography>
                          <Typography variant="body2" style={{ color: '#ccc', marginBottom: '3px' }}>
                            {`by ${['Ada Lovelace', 'Alan Turing', 'Grace Hopper', 'Linus Torvalds', 'Tim Berners-Lee', 'Guido van Rossum', 'Margaret Hamilton', 'Vint Cerf'][index % 8]}`}
                          </Typography>
                          <Typography variant="body2" style={{ color: '#aaa' }}>
                            {new Date(Date.now() - index * 900000).toLocaleString()}
                          </Typography>
                        </Box>
                        <Box display="flex" flexDirection="column" alignItems="flex-end">
                          <Box style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '8px 12px', borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '10px' }}>
                            <Typography variant="body2" style={{ color: '#4CAF50', marginBottom: '3px' }}>
                              Est. return
                            </Typography>
                            <Typography variant="body2" style={{ color: '#fff' }}>
                              {new Date(Date.now() + (index + 1) * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Typography>
                          </Box>
                          <Button
                            variant="outlined"
                            size="small"
                            style={{
                              color: '#ed7a2a',
                              borderColor: '#ed7a2a',
                              borderRadius: '20px',
                              padding: '5px 10px',
                              fontSize: '0.7rem'
                            }}
                          >
                            Request Early Return
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          {/* Search Bar and Filter Options */}
          <Box className="search-filter-container" style={{ marginTop: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
            <TextField
              label="Search Items"
              variant="standard"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setSearchExpanded(true)}
              onBlur={() => setSearchExpanded(false)}
              className={`search-input ${searchExpanded ? 'expanded' : ''}`}
              sx={{
                input: { color: '#fff', paddingLeft: '20px' },
                '& .MuiInputLabel-root': { color: '#ccc', marginLeft: '10px' },
                '& .MuiInputLabel-shrink': { transform: 'translate(0, -1.5px) scale(0.75)' }
              }}
            />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="filter-dropdown"
              style={{ color: '#fff', backgroundColor: '#333', borderColor: '#049ebf', marginLeft: '10px', padding: '10px' }}
            >
              <option value="">All Categories</option>
              {Object.entries(categorizedItems).map(([category, { color }], idx) => (
                <option value={category} key={idx}>
                  {category}
                </option>
              ))}
            </select>
          </Box>

          {/* Buttons under the search bar */}
          <Box display="flex" justifyContent="flex-start" alignItems="center" mb={3}>
            <Button
              variant="contained"
              style={{
                backgroundColor: '#ed7a2a',
                color: '#fff',
                marginRight: '20px',
                padding: '12px 48px',
                borderRadius: '20px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap',
              }}
              onClick={handleCheckoutButtonClick}
            >
              Checkout Items
            </Button>
            <Button
              component={Link}
              to="/barcode"
              variant="contained"
              startIcon={<QrCodeScannerIcon />}
              style={{
                backgroundColor: '#049ebf',
                color: '#fff',
                padding: '10px 20px',
                borderRadius: '20px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
              }}
            >
              Generate Barcodes
            </Button>
          </Box>

          {/* Title */}
          <Typography variant="h4" gutterBottom align="left" style={{ color: '#f7b329', marginBottom: '20px' }}>
            Inventory Management
          </Typography>

          {/* Inventory List */}
          <Box>
            {filteredItems.map(({ category, color, items }, idx) => (
              <Box key={idx} className="inventory-category" style={{ marginBottom: '30px' }}>
                <Typography variant="h5" gutterBottom style={{ color: '#f7b329', textAlign: 'left' }}>
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
                          onClick={(event) => handleItemClick(item, event)}
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
                <Typography variant="h6" gutterBottom style={{ color: '#ed7a2a' }}>Checkout Item: {checkoutItem.itemName}</Typography>
                <TextField
                  label="Reason for Use"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  InputProps={{
                    style: {
                      backgroundColor: '#333', // Dark background for input field
                      color: '#fff', // White text
                    },
                  }}
                  InputLabelProps={{
                    style: { color: '#ccc' }, // Lighter color for label
                  }}
                />
                <TextField
                  label="Estimated Use Time"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  InputProps={{
                    style: {
                      backgroundColor: '#333', // Dark background for input field
                      color: '#fff', // White text
                    },
                  }}
                  InputLabelProps={{
                    style: { color: '#ccc' }, // Lighter color for label
                  }}
                />
                <TextField
                  label="Your Name"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  InputProps={{
                    style: {
                      backgroundColor: '#333', // Dark background for input field
                      color: '#fff', // White text
                    },
                  }}
                  InputLabelProps={{
                    style: { color: '#ccc' }, // Lighter color for label
                  }}
                />
                <Button variant="contained" color="primary" fullWidth style={{ marginTop: '20px', backgroundColor: '#ed7a2a' }}>
                  Submit
                </Button>
              </>
            ) : (
              <Typography variant="body1" style={{ color: '#fff' }}>Click an item to check out.</Typography>
            )}
          </Box>

          {/* Checkout Modal */}
          {isModalOpen && (
            <Box className="modal">
              <Box className="modal-header">
                <Typography variant="h6">Checkout Items</Typography>
                <IconButton className="icon-button" onClick={handleModalClose}>
                  <CloseIcon />
                </IconButton>
              </Box>
              <Box className="modal-body">
                <TextField
                  label="Search Items to Checkout"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  InputProps={{ style: { backgroundColor: '#333', color: '#fff' } }} // Ensure consistent styling
                  InputLabelProps={{ style: { color: '#ccc' } }}
                />
                <Button variant="contained" color="primary" fullWidth onClick={handleModalClose}>
                  Checkout Selected Items
                </Button>
              </Box>
            </Box>
          )}

          {/* Solid Color Chat Button at the Bottom-Right Corner */}
          <button
            className="solid-chat-button glass-chat-button"
            onClick={toggleChatbot}
          >
            Pipanimi – Ask me
          </button>

          {/* Modern Chat Modal */}
          {isChatOpen && (
            <div className="chat-modal">
              <div className="chat-modal-content">
                <ExcelChatBot isOpen={isChatOpen} toggleChatbot={toggleChatbot} />
              </div>
            </div>
          )}
        </Box>
      </Box>
    </Box>
  );


};

export default InventoryCheck;