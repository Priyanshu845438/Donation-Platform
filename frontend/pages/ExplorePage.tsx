
import React, { useState, useEffect, useMemo } from 'react';
import CampaignCard from '../components/CampaignCard.tsx';
import SectionWrapper from '../components/SectionWrapper.tsx';
import { getPublicCampaigns } from '../services/api.ts';
import type { Campaign } from '../types.ts';
import { GoogleGenAI } from '@google/genai';
import { FiSearch, FiLoader, FiX } from 'react-icons/fi';
import Button from '../components/Button.tsx';
import { useToast } from '../context/ToastContext.tsx';

const ExplorePage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: 'All',
    location: 'All',
    status: 'All',
  });
  // New state for AI search
  const [aiSearchQuery, setAiSearchQuery] = useState('');
  const [currentAiQuery, setCurrentAiQuery] = useState('');
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiFilteredIds, setAiFilteredIds] = useState<string[] | null>(null);
  const [ai, setAi] = useState<GoogleGenAI | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    // Initialize GoogleGenAI client
    try {
        if (process.env.API_KEY) {
            setAi(new GoogleGenAI({ apiKey: process.env.API_KEY }));
        }
    } catch(e) {
        console.error("Failed to initialize GoogleGenAI", e);
    }
  }, []);


  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const data = await getPublicCampaigns();
        setCampaigns(data);
      } catch (error) {
        console.error("Failed to fetch campaigns:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleAiSearch = async () => {
    if (!aiSearchQuery.trim() || !ai) return;

    setIsAiSearching(true);
    setCurrentAiQuery(aiSearchQuery);
    setAiFilteredIds(null);

    try {
        const simplifiedCampaigns = campaigns.map(c => ({
            id: c.id,
            title: c.title,
            description: c.description,
            category: c.category,
            location: c.location
        }));

        const prompt = `You are an intelligent search assistant for a charity donation platform. Given a user's query and a list of available campaigns, your task is to identify and return only the IDs of the campaigns that are most relevant to the user's request.

User Query: "${aiSearchQuery}"

Here is the list of available campaigns in JSON format:
${JSON.stringify(simplifiedCampaigns)}

Analyze the user's query and the campaign details (title, description, category, location). Return a JSON array of strings, where each string is the ID of a relevant campaign. For example: ["campaign_id_1", "campaign_id_3"]. If no campaigns are relevant, return an empty array []. Do not return any other text, explanation, or formatting.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        const resultText = response.text.trim();
        const jsonString = resultText.replace(/^```json\s*|```$/g, '');
        const ids = JSON.parse(jsonString);
        setAiFilteredIds(ids);

    } catch (error) {
        console.error("AI search failed:", error);
        addToast("AI search failed. Please try a different query.", "error");
        setAiFilteredIds([]); // Show no results on error
    } finally {
        setIsAiSearching(false);
    }
  };

  const clearAiSearch = () => {
      setAiSearchQuery('');
      setCurrentAiQuery('');
      setAiFilteredIds(null);
  };

  const filteredCampaigns = useMemo(() => {
    let baseCampaigns = campaigns;
    if (aiFilteredIds !== null) {
        const idSet = new Set(aiFilteredIds);
        baseCampaigns = campaigns.filter(c => idSet.has(c.id));
    }

    return baseCampaigns.filter(campaign => {
      const categoryMatch = filters.category === 'All' || campaign.category === filters.category;
      const locationMatch = filters.location === 'All' || campaign.location === filters.location;
      const statusMatch = filters.status === 'All' || (filters.status === 'Urgent' && campaign.urgent) || campaign.status === filters.status.toLowerCase();
      return categoryMatch && locationMatch && statusMatch;
    });
  }, [campaigns, filters, aiFilteredIds]);

  const locations = useMemo(() => ['All', ...new Set(campaigns.map(c => c.location).filter(Boolean))], [campaigns]);
  const categories = useMemo(() => ['All', ...new Set(campaigns.map(c => c.category).filter(Boolean))], [campaigns]);

  return (
    <div className="bg-warm-gray dark:bg-brand-dark-200 font-sans min-h-screen">
      <div className="bg-white dark:bg-brand-dark shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-extrabold text-navy-blue dark:text-white font-serif">Explore Campaigns</h1>
          <p className="mt-2 text-lg text-warm-gray-600 dark:text-gray-400">Find a cause that resonates with you and make a difference today.</p>

          <SectionWrapper className="mt-8">
            <div className="bg-brand-gold/10 dark:bg-brand-gold/20 p-4 rounded-lg border border-brand-gold/30">
                <label htmlFor="ai-search" className="block text-sm font-semibold text-brand-deep-blue dark:text-brand-gold mb-2">Smart Search (Powered by AI)</label>
                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-grow">
                        <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"/>
                        <input
                            id="ai-search"
                            type="text"
                            value={aiSearchQuery}
                            onChange={(e) => setAiSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !isAiSearching && handleAiSearch()}
                            placeholder="e.g., 'help children get school supplies'"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold"
                            disabled={!ai || isAiSearching}
                        />
                    </div>
                    <Button onClick={handleAiSearch} disabled={!ai || !aiSearchQuery.trim() || isAiSearching} className="py-3">
                        {isAiSearching ? <FiLoader className="animate-spin mr-2"/> : <FiSearch className="mr-2"/>}
                        {isAiSearching ? 'Searching...' : 'Search with AI'}
                    </Button>
                </div>
                 {!ai && <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">Smart Search is unavailable. API key might be missing.</p>}
            </div>
          </SectionWrapper>

          {/* Filters */}
          <SectionWrapper className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg bg-warm-gray-100 dark:bg-brand-dark-200 border border-gray-200 dark:border-gray-700">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-warm-gray-700 dark:text-gray-300">Category</label>
                <select id="category" name="category" onChange={handleFilterChange} value={filters.category} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:bg-brand-dark dark:border-gray-600 focus:outline-none focus:ring-sky-blue focus:border-sky-blue sm:text-sm rounded-md">
                  {categories.map(cat => <option key={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-warm-gray-700 dark:text-gray-300">Location</label>
                <select id="location" name="location" onChange={handleFilterChange} value={filters.location} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:bg-brand-dark dark:border-gray-600 focus:outline-none focus:ring-sky-blue focus:border-sky-blue sm:text-sm rounded-md">
                  {locations.map(loc => <option key={loc}>{loc}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-warm-gray-700 dark:text-gray-300">Status</label>
                <select id="status" name="status" onChange={handleFilterChange} value={filters.status} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:bg-brand-dark dark:border-gray-600 focus:outline-none focus:ring-sky-blue focus:border-sky-blue sm:text-sm rounded-md">
                  <option>All</option>
                  <option>Active</option>
                  <option>Completed</option>
                  <option>Urgent</option>
                </select>
              </div>
            </div>
          </SectionWrapper>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <SectionWrapper>
            {aiFilteredIds !== null && (
                <div className="mb-6 bg-gray-100 dark:bg-brand-dark p-3 rounded-md flex justify-between items-center">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        Showing <strong>{filteredCampaigns.length}</strong> AI-powered results for "{currentAiQuery}".
                    </p>
                    <button onClick={clearAiSearch} className="flex items-center gap-1 text-sm text-red-500 hover:underline">
                        <FiX size={16}/> Clear
                    </button>
                </div>
            )}
            {loading ? (
                 <div className="text-center py-16">
                    <h2 className="text-xl font-semibold text-navy-blue dark:text-white">Loading Campaigns...</h2>
                 </div>
            ) : filteredCampaigns.length > 0 ? (
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {filteredCampaigns.map(campaign => (
                        <CampaignCard key={campaign.id} campaign={campaign} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <h2 className="text-xl font-semibold text-navy-blue dark:text-white">No Campaigns Found</h2>
                    <p className="mt-2 text-warm-gray-600 dark:text-gray-400">
                        {aiFilteredIds !== null ? "Our AI couldn't find a match for your query. Try searching for something else." : "Try adjusting your filters or check back later!"}
                    </p>
                </div>
            )}
        </SectionWrapper>
      </div>
    </div>
  );
};

export default ExplorePage;
