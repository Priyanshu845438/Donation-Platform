import React from 'react';
import { Campaign } from '../types';

export const API_BASE_URL = 'http://localhost:5000/api';

export const NAV_LINKS = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Campaigns', path: '/campaigns' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Reports', path: '/reports' },
    { name: 'Contact', path: '/contact' },
];

export const MOCK_CAMPAIGNS: Campaign[] = [
    { id: '1', title: 'Education for All', description: 'Providing books and supplies for underprivileged children.', imageUrl: 'https://picsum.photos/seed/education/600/400', goal: 10000, raised: 7500 },
    { id: '2', title: 'Clean Water Initiative', description: 'Building wells in remote villages to provide access to clean drinking water.', imageUrl: 'https://picsum.photos/seed/water/600/400', goal: 15000, raised: 12300 },
    { id: '3', title: 'Healthcare Support', description: 'Funding mobile clinics to offer medical care in rural areas.', imageUrl: 'https://picsum.photos/seed/health/600/400', goal: 20000, raised: 9800 },
    { id: '4', title: 'Animal Shelter Aid', description: 'Support our local animal shelter with food, and medical supplies.', imageUrl: 'https://picsum.photos/seed/animals/600/400', goal: 5000, raised: 4500 },
];

export const MOCK_TESTIMONIALS = [
    { 
        quote: "This platform made it so easy to contribute to a cause I care about. The transparency is amazing!", 
        author: "Alex Johnson", 
        role: "Donor",
        avatar: "https://i.pravatar.cc/150?u=alex"
    },
    { 
        quote: "As an NGO, CharityPlus has amplified our reach and helped us connect with donors who share our vision.", 
        author: "Maria Garcia", 
        role: "NGO Director",
        avatar: "https://i.pravatar.cc/150?u=maria"
    },
    { 
        quote: "Our company's CSR initiatives are now streamlined and more impactful thanks to this platform.", 
        author: "David Chen", 
        role: "Corporate Partner",
        avatar: "https://i.pravatar.cc/150?u=david"
    },
    { 
        quote: "A truly wonderful experience. Seeing the direct impact of my donation was heartwarming.", 
        author: "Sarah Lee", 
        role: "Donor",
        avatar: "https://i.pravatar.cc/150?u=sarah"
    },
    {
        quote: "The reporting tools are fantastic. We can easily track our impact and share it with our stakeholders.",
        author: "Emily White",
        role: "Foundation Manager",
        avatar: "https://i.pravatar.cc/150?u=emily"
    },
    {
        quote: "CharityPlus is a game-changer for small NGOs like ours. It gives us a voice and a platform to reach a wider audience.",
        author: "Samuel Green",
        role: "Founder, Green Earth Initiative",
        avatar: "https://i.pravatar.cc/150?u=samuel"
    }
];

export const MOCK_GALLERY_IMAGES = [
    'https://picsum.photos/seed/gallery1/800/600',
    'https://picsum.photos/seed/gallery2/600/800',
    'https://picsum.photos/seed/gallery3/800/800',
    'https://picsum.photos/seed/gallery4/600/400',
    'https://picsum.photos/seed/gallery5/400/600',
    'https://picsum.photos/seed/gallery6/800/500',
    'https://picsum.photos/seed/gallery7/500/800',
    'https://picsum.photos/seed/gallery8/700/700',
];