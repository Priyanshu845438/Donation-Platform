import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, LinearProgress } from '@mui/material';
import { MonetizationOn, Business, Store } from '@mui/icons-material';
import '../styles/HomePage.css'; // Add styles if needed

const ProgressStats = () => {
  const [stats, setStats] = useState({
    totalReceived: 0,
    totalCampaigns: 0,
    totalNGOs: 0,
    totalCompanies: 0
  });

  useEffect(() => {
    axios.get('http://localhost:5000/api/stats')
      .then(response => setStats(response.data))
      .catch(error => console.error("Error fetching stats:", error));
  }, []);

  const progressBar = (value) => (
    <LinearProgress variant="determinate" value={Math.min(value, 100)} className="progress-bar" />
  );

  return (
    <Box className="stats-container">
      <div className="stat-card">
        <MonetizationOn className="stat-icon money" />
        <Typography variant="h6">Total Received Donation</Typography>
        <Typography variant="h4">₹{stats.totalReceived}</Typography>
        {progressBar(stats.totalReceived / 1000)}
      </div>

      <div className="stat-card">
        <Business className="stat-icon partnership" />
        <Typography variant="h6">Total Campaigns</Typography>
        <Typography variant="h4">{stats.totalCampaigns}</Typography>
        {progressBar(stats.totalCampaigns * 10)}
      </div>

      <div className="stat-card">
        <Store className="stat-icon company" />
        <Typography variant="h6">Total NGOs</Typography>
        <Typography variant="h4">{stats.totalNGOs}</Typography>
        {progressBar(stats.totalNGOs * 10)}
      </div>

      <div className="stat-card">
        <Store className="stat-icon company" />
        <Typography variant="h6">Total Companies</Typography>
        <Typography variant="h4">{stats.totalCompanies}</Typography>
        {progressBar(stats.totalCompanies * 10)}
      </div>
    </Box>
  );
};

export default ProgressStats;
