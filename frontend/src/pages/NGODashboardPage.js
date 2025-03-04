import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const NGODashboardPage = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [donations, setDonations] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboardData = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }

            try {
                const response = await axios.get("http://localhost:5000/api/ngo/dashboard", {
                    headers: {
                        Authorization: token
                    }
                });
                setCampaigns(response.data.campaigns);
                setDonations(response.data.donations);
            } catch (error) {
                setError("Error fetching data");
            }
        };

        fetchDashboardData();
    }, [navigate]);

    return (
        <div className="dashboard-container">
            <h2>NGO Dashboard</h2>

            {error && <div className="error-message">{error}</div>}

            <div className="section">
                <h3>Your Campaigns</h3>
                <ul>
                    {campaigns.length > 0 ? (
                        campaigns.map((campaign) => (
                            <li key={campaign._id}>
                                {campaign.name} - {campaign.status}
                            </li>
                        ))
                    ) : (
                        <li>No campaigns available</li>
                    )}
                </ul>
            </div>

            <div className="section">
                <h3>Your Donations</h3>
                <ul>
                    {donations.length > 0 ? (
                        donations.map((donation) => (
                            <li key={donation._id}>
                                Donor: {donation.donorName} - Amount: {donation.amount}
                            </li>
                        ))
                    ) : (
                        <li>No donations received</li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default NGODashboardPage;
