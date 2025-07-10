
import React from 'react';

export const API_BASE_URL = 'http://localhost:5000/api';

export const NAV_LINKS = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Campaigns', path: '/campaigns' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Reports', path: '/reports' },
    { name: 'Contact', path: '/contact' },
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
