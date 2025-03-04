import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/CompanyDashboardPage.css";

const CompanyDashboardPage = () => {
  const [companyData, setCompanyData] = useState(null);

  // Fetch company data when the page loads
  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/company/dashboard", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setCompanyData(response.data);
      } catch (error) {
        console.error("Error fetching company data:", error);
      }
    };

    fetchCompanyData();
  }, []);

  return (
    <div className="company-dashboard-container">
      <h2>Welcome to Company Dashboard</h2>
      {companyData ? (
        <div className="company-info">
          <h3>Company Information</h3>
          <p><strong>Name:</strong> {companyData.name}</p>
          <p><strong>Email:</strong> {companyData.email}</p>
          <p><strong>Campaigns:</strong> {companyData.campaigns.length}</p>
          {/* Render additional company data */}
        </div>
      ) : (
        <p>Loading company data...</p>
      )}
    </div>
  );
};

export default CompanyDashboardPage;
