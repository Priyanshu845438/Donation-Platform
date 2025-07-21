
export const THEME_PRESETS = [
    {
        name: 'Oceanic Blue (Default)',
        id: 'oceanic-blue',
        colors: {
            light: {
                primary: '#003f5c',
                secondary: '#2f4b7c',
                accent: '#ffa600',
                'bg-primary': '#ffffff',
                'bg-secondary': '#f7f7f7',
                'text-primary': '#2d3748',
                'text-secondary': '#4a5568',
                'text-headings': '#003f5c',
                'text-on-accent': '#ffffff',
                border: '#e2e8f0',
            },
            dark: {
                primary: '#2f4b7c',
                accent: '#ffa600',
                'bg-primary': '#1a202c',
                'bg-secondary': '#2d3748',
                'text-primary': '#f7fafc',
                'text-secondary': '#a0aec0',
                'text-headings': '#ffffff',
                border: '#4a5568',
            },
        },
    },
    {
        name: 'Sunrise Gold',
        id: 'sunrise-gold',
        colors: {
            light: {
                primary: '#D9534F', // Coral Red
                secondary: '#F0AD4E', // Sunglow Yellow
                accent: '#5CB85C', // Emerald Green
                'bg-primary': '#FDFBF7',
                'bg-secondary': '#F9F4EB',
                'text-primary': '#5A5A5A',
                'text-secondary': '#7A7A7A',
                'text-headings': '#3D3D3D',
                'text-on-accent': '#ffffff',
                border: '#EAE0D5',
            },
            dark: {
                primary: '#E57373', // Lighter Coral for dark mode
                accent: '#66BB6A', // Lighter Green
                'bg-primary': '#2C2A2A',
                'bg-secondary': '#3D3B3B',
                'text-primary': '#EAEAEA',
                'text-secondary': '#BDBDBD',
                'text-headings': '#FFFFFF',
                border: '#5A5A5A',
            },
        },
    },
    {
        name: 'Forest Emerald',
        id: 'forest-emerald',
        colors: {
            light: {
                primary: '#2E7D32', // Dark Green
                secondary: '#004D40', // Teal
                accent: '#FFC107', // Amber
                'bg-primary': '#F5F7F5',
                'bg-secondary': '#E8F5E9',
                'text-primary': '#37474F',
                'text-secondary': '#546E7A',
                'text-headings': '#263238',
                'text-on-accent': '#212121',
                border: '#D0DDD0',
            },
            dark: {
                primary: '#4CAF50', // Brighter Green
                accent: '#FFCA28', // Brighter Amber
                'bg-primary': '#1B2A1B',
                'bg-secondary': '#2A3C2A',
                'text-primary': '#CFD8DC',
                'text-secondary': '#90A4AE',
                'text-headings': '#FFFFFF',
                border: '#455A64',
            },
        },
    },
    {
        name: 'Minimalist Charcoal',
        id: 'minimalist-charcoal',
        colors: {
            light: {
                primary: '#343A40', // Charcoal
                secondary: '#6C757D', // Gray
                accent: '#007BFF', // Bright Blue
                'bg-primary': '#FFFFFF',
                'bg-secondary': '#F8F9FA',
                'text-primary': '#212529',
                'text-secondary': '#6C757D',
                'text-headings': '#212529',
                'text-on-accent': '#FFFFFF',
                border: '#DEE2E6',
            },
            dark: {
                primary: '#ADB5BD', // Light Gray
                accent: '#3DA9FC', // Lighter Blue
                'bg-primary': '#121212',
                'bg-secondary': '#1E1E1E',
                'text-primary': '#E8E8E8',
                'text-secondary': '#A0A0A0',
                'text-headings': '#FFFFFF',
                border: '#444444',
            },
        },
    },
];

export const FONT_PAIRINGS = [
    { sans: 'Poppins', serif: 'Merriweather', name: 'Poppins & Merriweather (Default)' },
    { sans: 'Lato', serif: 'Lora', name: 'Lato & Lora' },
    { sans: 'Montserrat', serif: 'Playfair Display', name: 'Montserrat & Playfair Display' },
    { sans: 'Roboto', serif: 'Roboto Slab', name: 'Roboto & Roboto Slab' },
    { sans: 'Open Sans', serif: 'PT Serif', name: 'Open Sans & PT Serif' },
    { sans: 'Nunito Sans', serif: 'Bitter', name: 'Nunito Sans & Bitter' },
];