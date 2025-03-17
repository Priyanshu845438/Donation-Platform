import { useState, useEffect } from "react";

const CampaignManagement = () => {
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    // Fetch campaigns from backend (example API call)
    fetch("/api/campaigns")
      .then((res) => res.json())
      .then((data) => setCampaigns(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Manage Campaigns</h2>
      <button className="mb-4 bg-blue-500 text-white p-2 rounded">
        Create New Campaign
      </button>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="px-4 py-2">Campaign Name</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((campaign) => (
            <tr key={campaign.id}>
              <td className="px-4 py-2">{campaign.name}</td>
              <td className="px-4 py-2">{campaign.status}</td>
              <td className="px-4 py-2">
                <button className="mr-2 bg-green-500 text-white p-2 rounded">
                  Edit
                </button>
                <button className="bg-red-500 text-white p-2 rounded">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CampaignManagement;
