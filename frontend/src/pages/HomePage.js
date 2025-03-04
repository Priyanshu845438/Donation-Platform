import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Box, Typography, Card, CardContent, CardMedia } from '@mui/material';
import { FormatQuote } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import bannerImage from '../assets/banner-image.jpg';
import aboutImage from '../assets/about-image.jpg';
import defaultImage from '../assets/banner-image.jpg'; // Ensure you have a proper default image
import '../styles/HomePage.css';
import ProgressStats from '../components/ProgressStats'; // Import progress stats component

const HomePage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const navigate = useNavigate();

  // Fetch latest 4 campaigns
  useEffect(() => {
    axios.get("http://localhost:5000/api/campaign/campaigns")
      .then(response => {
        console.log("Campaigns data:", response.data);
        setCampaigns(response.data?.campaigns?.slice(0, 4) || []);
      })
      .catch(error => console.error("Error fetching campaigns:", error));
  }, []);

  // Open Donate Dialog
  const handleDonateClick = (campaign) => {
    navigate(`/campaign/${campaign._id}`); // Navigate to the campaign details page
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-banner" style={{ backgroundImage: `url(${bannerImage})` }}>
        <Box className="hero-content">
          <Typography variant="h2" component="h1" className="hero-title">
            Welcome to Donation Platform
          </Typography>
          <Typography variant="body1" className="hero-description">
            Your platform to make a difference. Donate now and help change lives!
          </Typography>
          <Box className="hero-buttons">
            <Button variant="contained" color="primary" className="hero-btn primary-btn" onClick={() => navigate('/donate')}>
              Donate Now
            </Button>
            <Button variant="outlined" color="primary" className="hero-btn secondary-btn" onClick={() => navigate('/learn-more')}>
              Learn More
            </Button>
          </Box>
        </Box>
      </section>

      {/* Progress Stats Section */}
      <ProgressStats />

      {/* About Section */}
      <section className="about-section">
        <div className="about-container">
          <div className="about-image">
            <img src={aboutImage} alt="About Us" />
          </div>
          <div className="about-text">
            <Typography variant="h4" component="h2" className="about-title">
              About Us
            </Typography>
            <Typography variant="body1" className="about-description">
              We are dedicated to making a difference in the world by helping individuals and communities in need. Our 
              platform allows people to contribute to various causes and create lasting change. Through our secure and 
              transparent system, donors can support initiatives that align with their values. Every contribution, big or small, 
              helps bring hope and resources to those who need them most. Together, we can build a brighter future and uplift lives.
            </Typography>
            <Button variant="contained" color="primary" onClick={() => navigate('/about')} className="read-more-btn">
              Read More
            </Button>
          </div>
        </div>
      </section>

      {/* Campaigns Section */}
      <section className="donation-campaigns-list">
        <Typography variant="h4" component="h2" className="donation-campaigns-heading">
          Our Latest Campaigns
        </Typography>
        <div className="donation-campaigns">
          {campaigns.map((campaign) => (
            <Card key={campaign._id} className="donation-campaign-card" sx={{ maxWidth: 345, marginBottom: 2 }}>
              <CardMedia
                component="img"
                alt={campaign.title}
                height="140"
                image={campaign.images?.length > 0 
                  ? `http://localhost:5000${campaign.images[0]}` 
                  : defaultImage}
                title={campaign.title}
              />
              <CardContent>
                <Typography variant="h5">{campaign.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {campaign.description}
                </Typography>
                <Typography variant="body1" color="primary" sx={{ marginTop: 1 }}>
                  Goal: ${campaign.goalAmount} | Raised: ${campaign.currentAmount}
                </Typography>
                {campaign.ngo && (
                  <Typography variant="body2" color="text.secondary">
                    NGO: {campaign.ngo.name} - {campaign.ngo.email}
                  </Typography>
                )}
                <Button
                  variant="contained"
                  color="secondary"
                  sx={{ backgroundColor: "#DF1C1C", "&:hover": { backgroundColor: "#B30000" }, marginTop: 2 }}
                  fullWidth
                  onClick={() => handleDonateClick(campaign)}
                  className="donation-btn"
                >
                  Donate
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Campaigns Button - Moved Inside Campaigns Section */}
        <Button 
          variant="contained" 
          color="primary" 
          className="campaign-btn" 
          onClick={() => navigate('/campaigns')}
          sx={{ marginTop: 3 }}
        >
          View All Campaigns
        </Button>
      </section>

      {/* Quote Section */}
      <section className="quote-section">
        <FormatQuote className="quote-icon" />
        <div className="quote-content">
          "The best way to find yourself is to lose yourself in the service of others."
          <div className="quote-author">- Mahatma Gandhi</div>
        </div>
        <FormatQuote className="quote-icon right" />
      </section>
    </div>
  );
};

export default HomePage;
