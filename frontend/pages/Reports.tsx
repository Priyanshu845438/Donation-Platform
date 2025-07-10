
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const barData = [
    { name: 'Education', Donations: 4000 },
    { name: 'Healthcare', Donations: 3000 },
    { name: 'Water', Donations: 2000 },
    { name: 'Animals', Donations: 2780 },
    { name: 'Environment', Donations: 1890 },
    { name: 'Disaster Relief', Donations: 2390 },
];

const pieData = [
    { name: 'Individual Donors', value: 400 },
    { name: 'Corporate Partners', value: 300 },
    { name: 'Grants', value: 300 },
    { name: 'Fundraising Events', value: 200 },
];

const COLORS = ['#0d6efd', '#198754', '#20c997', '#ffc107'];

const Reports: React.FC = () => {
    return (
        <div className="bg-background">
            <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold font-display text-text-primary sm:text-5xl">Platform Reports</h1>
                    <p className="mt-4 max-w-2xl mx-auto text-xl text-text-secondary">
                        Visualizing our collective impact and financial transparency. (Sample Data)
                    </p>
                </div>
                
                <div className="mt-16 grid md:grid-cols-2 gap-12">
                    <div className="bg-surface p-6 rounded-lg shadow-md border border-border">
                        <h3 className="text-xl font-bold font-display mb-6 text-center text-text-primary">Donations by Category</h3>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <BarChart data={barData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.4} />
                                    <XAxis dataKey="name" tick={{ fill: '#6c757d' }} />
                                    <YAxis tick={{ fill: '#6c757d' }}/>
                                    <Tooltip
                                        cursor={{ fill: 'rgba(13, 110, 253, 0.1)' }}
                                        contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #dee2e6', color: '#212529' }}
                                    />
                                    <Legend wrapperStyle={{ color: '#212529' }} />
                                    <Bar dataKey="Donations" fill="#0d6efd" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="bg-surface p-6 rounded-lg shadow-md border border-border">
                        <h3 className="text-xl font-bold font-display mb-6 text-center text-text-primary">Funding Sources</h3>
                         <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={110}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #dee2e6', color: '#212529' }}
                                     />
                                    <Legend wrapperStyle={{ color: '#212529' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;