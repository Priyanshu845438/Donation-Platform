import React, { useEffect, useState } from 'react';
import { Button } from '@mui/material';
import axios from 'axios';

const AdminDashboardPage = () => {
  const [report, setReport] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/reports', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setReport(response.data);
      } catch (error) {
        console.error("Error fetching report: ", error);
      }
    };
    fetchReport();
  }, []);

  return (
    <div>
      <h2>Admin Dashboard</h2>
      {report ? (
        <div>
          <p>Total Donations: {report.totalDonations}</p>
          <p>Total Campaigns: {report.totalCampaigns}</p>
          {/* You can show more details here */}
        </div>
      ) : (
        <p>Loading...</p>
      )}
      <Button variant="contained" color="primary">Manage Users</Button>
    </div>
  );
};

export default AdminDashboardPage;
