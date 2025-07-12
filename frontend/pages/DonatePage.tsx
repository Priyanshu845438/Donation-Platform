
import React, { useState, useEffect } from 'react';
import SectionWrapper from '../components/SectionWrapper.tsx';
import { getPublicCampaigns } from '../services/api.ts';
import type { Campaign } from '../types.ts';
import Button from '../components/Button.tsx';
import { FiCreditCard } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';

const DonatePage: React.FC = () => {
  const [amount, setAmount] = useState(1000);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [claim80G, setClaim80G] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const location = useLocation();

  useEffect(() => {
    const fetchCampaigns = async () => {
        const allCampaigns = await getPublicCampaigns();
        const activeCampaigns = allCampaigns.filter(c => c.status === 'active');
        setCampaigns(activeCampaigns);
        
        // Check for campaign ID from URL query params
        const queryParams = new URLSearchParams(location.search);
        const campaignIdFromQuery = queryParams.get('campaign');
        
        if (campaignIdFromQuery && activeCampaigns.some(c => c._id === campaignIdFromQuery)) {
            setSelectedCampaign(campaignIdFromQuery);
        } else if (activeCampaigns.length > 0) {
            setSelectedCampaign(activeCampaigns[0]._id);
        }
    };
    fetchCampaigns();
  }, [location.search]);

  const handleAmountClick = (value: number) => {
    setAmount(value);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomAmount(value);
    if (!isNaN(parseInt(value))) {
        setAmount(parseInt(value));
    }
  };
  
  const handleDonationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would call a payment gateway API
    alert(`Thank you for your donation of ₹${amount} to ${campaigns.find(c => c._id === selectedCampaign)?.title || 'the General Fund'}!`);
  };

  const platformFee = Math.round(amount * 0.05);
  const gstOnFee = Math.round(platformFee * 0.18);
  const totalDeduction = platformFee + gstOnFee;
  const amountToNgo = amount - totalDeduction;

  return (
    <div className="bg-warm-gray font-sans min-h-screen py-16">
      <SectionWrapper className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-navy-blue font-serif">Make a Donation</h1>
          <p className="mt-4 text-lg text-warm-gray-600">Your contribution can change lives. Thank you for your generosity.</p>
        </div>

        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="p-8 md:p-12">
            <form onSubmit={handleDonationSubmit}>
              <div className="space-y-8">
                {/* Campaign Selection */}
                <div>
                  <label htmlFor="campaign" className="block text-lg font-semibold text-navy-blue mb-2">1. Choose a Campaign</label>
                  <select
                    id="campaign"
                    name="campaign"
                    value={selectedCampaign}
                    onChange={(e) => setSelectedCampaign(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-warm-gray-300 focus:outline-none focus:ring-sky-blue focus:border-sky-blue sm:text-sm rounded-md shadow-sm"
                  >
                    {campaigns.length === 0 && <option>Loading campaigns...</option>}
                    {campaigns.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                    <option value="general">Donate to General Fund</option>
                  </select>
                </div>
                
                {/* Donation Amount */}
                <div>
                  <label className="block text-lg font-semibold text-navy-blue mb-2">2. Select an Amount (INR)</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[500, 1000, 2500, 5000].map(val => (
                      <button type="button" key={val} onClick={() => handleAmountClick(val)} className={`p-4 rounded-md text-center font-bold border-2 transition-colors ${amount === val && customAmount === '' ? 'bg-sky-blue/20 border-sky-blue text-sky-blue' : 'bg-warm-gray-100 border-transparent hover:border-sky-blue'}`}>
                        ₹{val.toLocaleString()}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    placeholder="Or enter a custom amount"
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                    className="mt-4 w-full px-4 py-3 text-base border-warm-gray-300 focus:outline-none focus:ring-sky-blue focus:border-sky-blue sm:text-sm rounded-md shadow-sm"
                  />
                </div>

                {/* Personal Information */}
                <div>
                   <label className="block text-lg font-semibold text-navy-blue mb-2">3. Your Information</label>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <input type="text" placeholder="Full Name" required className="px-4 py-3 text-base border-warm-gray-300 rounded-md shadow-sm focus:ring-sky-blue focus:border-sky-blue" />
                       <input type="email" placeholder="Email Address" required className="px-4 py-3 text-base border-warm-gray-300 rounded-md shadow-sm focus:ring-sky-blue focus:border-sky-blue" />
                       <input type="tel" placeholder="Phone Number" className="px-4 py-3 text-base border-warm-gray-300 rounded-md shadow-sm focus:ring-sky-blue focus:border-sky-blue" />
                       <div className="flex items-center space-x-2 bg-warm-gray-100 p-3 rounded-md">
                           <input id="claim80g" name="claim80g" type="checkbox" checked={claim80G} onChange={(e) => setClaim80G(e.target.checked)} className="h-4 w-4 text-sky-blue focus:ring-sky-blue border-warm-gray-300 rounded" />
                           <label htmlFor="claim80g" className="text-sm text-warm-gray-700">I want to claim 80G tax benefit (requires PAN).</label>
                       </div>
                       {claim80G && <input type="text" placeholder="PAN Number" required className="md:col-span-2 px-4 py-3 text-base border-warm-gray-300 rounded-md shadow-sm focus:ring-sky-blue focus:border-sky-blue" />}
                   </div>
                </div>

                {/* Fee Breakdown */}
                <div className="bg-warm-gray-100 p-4 rounded-lg">
                  <h4 className="font-semibold text-navy-blue">Transparent Fee Breakdown</h4>
                  <div className="text-sm text-warm-gray-700 mt-2 space-y-1">
                      <div className="flex justify-between"><span>Donation Amount:</span> <span>₹{amount.toLocaleString()}</span></div>
                      <div className="flex justify-between border-b pb-1"><span>Platform Fee (5%):</span> <span>- ₹{platformFee.toLocaleString()}</span></div>
                      <div className="flex justify-between text-xs text-warm-gray-500"><span>GST on Fee (18%):</span> <span>- ₹{gstOnFee.toLocaleString()}</span></div>
                      <div className="flex justify-between font-bold text-navy-blue pt-1"><span>Amount reaching the NGO:</span> <span>₹{amountToNgo.toLocaleString()}</span></div>
                  </div>
                </div>
                
                {/* Submit */}
                <div className="text-center">
                    <Button type="submit" className="w-full md:w-auto text-lg">
                        <FiCreditCard className="mr-2" /> Proceed to Payment
                    </Button>
                    <p className="text-xs text-warm-gray-500 mt-4">Secure payment powered by Razorpay, Stripe, Paytm.</p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
};

export default DonatePage;
