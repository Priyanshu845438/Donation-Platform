
import React, { useState, useEffect } from 'react';
import { ngoAPI } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';
import { FiLoader, FiUserPlus, FiUsers, FiClipboard } from 'react-icons/fi';

interface VolunteeringData {
    volunteers: Array<any>;
    opportunities: Array<any>;
    applications: Array<any>;
}

const NgoVolunteeringPage: React.FC = () => {
    const [data, setData] = useState<VolunteeringData | null>(null);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    useEffect(() => {
        fetchVolunteeringData();
    }, []);

    const fetchVolunteeringData = async () => {
        try {
            const response = await ngoAPI.getVolunteering();
            setData(response.data);
        } catch (error: any) {
            addToast(error.message || 'Failed to load volunteering data', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <FiLoader className="animate-spin h-8 w-8 text-brand-gold" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Volunteer Management</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-brand-dark-200 p-6 rounded-lg shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                            <FiUsers className="text-blue-500" size={24} />
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-gray-800 dark:text-white">
                                {data?.volunteers.length || 0}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                Active Volunteers
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-brand-dark-200 p-6 rounded-lg shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                            <FiClipboard className="text-green-500" size={24} />
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-gray-800 dark:text-white">
                                {data?.opportunities.length || 0}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                Open Opportunities
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-brand-dark-200 p-6 rounded-lg shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                            <FiUserPlus className="text-purple-500" size={24} />
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-gray-800 dark:text-white">
                                {data?.applications.length || 0}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                Pending Applications
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-brand-dark-200 p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-4">Volunteer Management</h2>
                <div className="text-center py-8">
                    <FiUserPlus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                        Volunteer management system will be available soon.
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                        You'll be able to post opportunities, manage applications, and coordinate with volunteers.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default NgoVolunteeringPage;
