
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';
import { apiFetch } from '../utils/api';
import Button from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';

const CreateCampaign: React.FC = () => {
    const { addToast } = useToast();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        goal: '',
        endDate: '',
        category: 'other',
        imageUrl: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const submissionData = {
            ...formData,
            goal: Number(formData.goal)
        };

        try {
            await apiFetch('/campaigns', {
                method: 'POST',
                body: submissionData
            });
            addToast('Campaign created successfully! It is now pending review.', 'success');
            navigate(`/dashboard/${user?.role}`);
        } catch (err: any) {
            addToast(err.message || 'Failed to create campaign.', 'error');
            setIsLoading(false);
        }
    };

    const inputStyles = "block w-full px-3 py-2 bg-background border border-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm";
    const CATEGORIES = ['education', 'healthcare', 'environment', 'poverty', 'disaster-relief', 'animal-welfare', 'other'];

    return (
        <div className="space-y-8 max-w-4xl mx-auto animate-fade-in">
             <div>
                <h1 className="text-3xl font-bold font-display text-text-primary">Create a New Campaign</h1>
                <p className="mt-2 text-lg text-text-secondary">Fill out the details below to launch your fundraising campaign.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-surface p-8 rounded-xl shadow-sm border border-border space-y-6">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-text-secondary mb-1">Campaign Title</label>
                    <input id="title" name="title" type="text" required value={formData.title} onChange={handleChange} className={inputStyles} />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-text-secondary mb-1">Description</label>
                    <textarea id="description" name="description" rows={5} required value={formData.description} onChange={handleChange} className={inputStyles}></textarea>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="goal" className="block text-sm font-medium text-text-secondary mb-1">Fundraising Goal ($)</label>
                        <input id="goal" name="goal" type="number" required value={formData.goal} onChange={handleChange} className={inputStyles} placeholder="e.g., 5000" />
                    </div>
                     <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-text-secondary mb-1">End Date</label>
                        <input id="endDate" name="endDate" type="date" value={formData.endDate} onChange={handleChange} className={inputStyles} />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-text-secondary mb-1">Category</label>
                        <select id="category" name="category" required value={formData.category} onChange={handleChange} className={`${inputStyles} cursor-pointer`}>
                            {CATEGORIES.map(cat => <option key={cat} value={cat} className="capitalize">{cat.replace('-', ' ')}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="imageUrl" className="block text-sm font-medium text-text-secondary mb-1">Image URL</label>
                        <input id="imageUrl" name="imageUrl" type="url" required value={formData.imageUrl} onChange={handleChange} className={inputStyles} placeholder="https://example.com/image.jpg" />
                    </div>
                </div>
                 <div className="text-right pt-4 border-t border-border">
                    <Button type="submit" variant="primary" size="lg" disabled={isLoading}>
                        {isLoading ? "Submitting..." : "Submit for Review"}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default CreateCampaign;
