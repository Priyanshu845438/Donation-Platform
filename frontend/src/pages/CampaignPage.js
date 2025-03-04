import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Container, Typography, Button, Card, CardContent, LinearProgress, CircularProgress, TextField } from '@mui/material';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/CampaignPage.css'; // Importing CSS
import { openPaymentGateway } from "../utils/payment";

const CampaignPage = () => {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [donorDetails, setDonorDetails] = useState({
    donorName: '',
    donorEmail: '',
    donorPhone: '',
    amount: ''
  });

  useEffect(() => {
    axios.get(`http://localhost:5000/api/campaign/${id}`)
      .then(response => {
        setCampaign(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching campaign:', error);
        setError("Failed to load campaign details.");
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <Container className="loading-container">
        <CircularProgress />
        <Typography variant="h6">Loading campaign details...</Typography>
      </Container>
    );
  }

  if (error || !campaign) {
    return (
      <Container className="error-container">
        <Typography variant="h5" color="error">{error || "No campaign found."}</Typography>
      </Container>
    );
  }

  const progress = (campaign.raisedAmount / campaign.goalAmount) * 100;

  const handleChange = (e) => {
    setDonorDetails({ ...donorDetails, [e.target.name]: e.target.value });
  };

  const handleDonate = () => {
    if (!donorDetails.donorName || !donorDetails.donorEmail || !donorDetails.donorPhone || !donorDetails.amount) {
      alert("Please fill all fields before proceeding to payment.");
      return;
    }
    openPaymentGateway(id, donorDetails.amount, donorDetails.donorName, donorDetails.donorEmail, donorDetails.donorPhone);
  };

  return (
    <>
      <Header />
      <Container className="campaign-container">
        <Card className="campaign-card">
          <CardContent className="campaign-content">
            {campaign.images?.length > 0 && (
              <img 
                src={`http://localhost:5000${campaign.images[0]}`} 
                alt={campaign.title} 
                className="campaign-image"
                onError={(e) => e.target.style.display = 'none'}
              />
            )}
            <div className="campaign-details">
              <Typography variant="h4">{campaign.title}</Typography>
              <Typography variant="body1">{campaign.description}</Typography>
              <Typography variant="h6">Goal: ${campaign.goalAmount}</Typography>
              <Typography variant="h6">Raised: ${campaign.raisedAmount}</Typography>
              <LinearProgress variant="determinate" value={progress} className="progress-bar" />
              
              {/* Donation Form */}
              <TextField fullWidth label="Full Name" name="donorName" value={donorDetails.donorName} onChange={handleChange} margin="normal" required />
              <TextField fullWidth label="Email" name="donorEmail" value={donorDetails.donorEmail} onChange={handleChange} margin="normal" required />
              <TextField fullWidth label="Phone Number" name="donorPhone" value={donorDetails.donorPhone} onChange={handleChange} margin="normal" required />
              <TextField fullWidth label="Amount (in USD)" name="amount" type="number" value={donorDetails.amount} onChange={handleChange} margin="normal" required />
              
              <Button onClick={handleDonate} className="donate-button" variant="contained" color="primary">Make a Donation</Button>
            </div>
          </CardContent>
        </Card>
      </Container>
      <Footer />
    </>
  );
};

export default CampaignPage;
