
import React, { useEffect } from 'react';
import { publicAPI } from '../services/api.ts';

const DynamicThemeLoader: React.FC = () => {
    useEffect(() => {
        const applyTheme = (settings: any) => {
            const theme = settings?.appearance || {};
            const colors = theme.colors || {};
            const fonts = theme.fonts || {};

            let cssVariables = ':root {\n';

            // Colors
            if (colors.light) {
                Object.entries(colors.light).forEach(([key, value]) => {
                    cssVariables += `  --color-${key}: ${value};\n`;
                });
            }
             if (colors.dark) {
                Object.entries(colors.dark).forEach(([key, value]) => {
                    // Assuming dark color keys match light ones but with a 'dark' prefix in the var name
                    if (key.startsWith('bg-')) {
                         cssVariables += `  --color-bg-dark-${key.substring(3)}: ${value};\n`;
                    } else if (key.startsWith('text-')) {
                         cssVariables += `  --color-text-dark-${key.substring(5)}: ${value};\n`;
                    } else if(key === 'border') {
                         cssVariables += `  --color-border-dark: ${value};\n`;
                    }
                });
            }

            // Fonts
            if (fonts.sans) cssVariables += `  --font-sans: '${fonts.sans}';\n`;
            if (fonts.serif) cssVariables += `  --font-serif: '${fonts.serif}';\n`;

            cssVariables += '}';

            const styleElement = document.getElementById('dynamic-theme-styles');
            if (styleElement) {
                styleElement.innerHTML = cssVariables;
            }

            // Load Google Fonts
            if (fonts.sans || fonts.serif) {
                const fontFamilies = [fonts.sans, fonts.serif].filter(Boolean);
                const fontUrl = `https://fonts.googleapis.com/css2?${fontFamilies.map(f => `family=${f.replace(/ /g, '+')}:wght@300;400;500;600;700;900`).join('&')}&display=swap`;
                
                const fontLink = document.getElementById('dynamic-google-fonts') as HTMLLinkElement;
                if(fontLink && fontLink.href !== fontUrl) {
                    fontLink.href = fontUrl;
                }
            }
        };

        const fetchAndApplyTheme = async () => {
            try {
                const response = await publicAPI.getSettings();
                if (response.data) {
                    applyTheme(response.data);
                }
            } catch (error) {
                // Silently fail, default theme will be used.
                // console.error("Could not load dynamic theme:", error);
            }
        };

        fetchAndApplyTheme();
    }, []);

    return null; // This component does not render anything
};

export default DynamicThemeLoader;