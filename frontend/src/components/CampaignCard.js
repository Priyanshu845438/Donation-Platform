import { useNavigate } from 'react-router-dom';

const CampaignCard = ({ campaign }) => {
  const navigate = useNavigate();

  const handleDonateClick = () => {
    navigate(`/campaign/${campaign._id}`); // Redirect to campaign details page
  };

  return (
    <div className="campaign-card">
      <h3>{campaign.title}</h3>
      <p>{campaign.description}</p>
      <p>Goal: {campaign.goalAmount} | Current Amount: {campaign.currentAmount}</p>
      <button onClick={handleDonateClick}>Donate</button>
    </div>
  );
};

export default CampaignCard;
