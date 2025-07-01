
import React from 'react';
import { MOCK_GALLERY_IMAGES } from '../utils/constants';

const Gallery: React.FC = () => {
    return (
        <div className="bg-background">
            <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold text-copy sm:text-5xl">Our Gallery</h1>
                    <p className="mt-4 max-w-2xl mx-auto text-xl text-copy-muted">
                        A glimpse into the moments of hope and change made possible by our community.
                    </p>
                </div>

                <div className="mt-12 columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                    {MOCK_GALLERY_IMAGES.map((src, index) => (
                        <div key={index} className="overflow-hidden rounded-lg shadow-lg break-inside-avoid group">
                            <img
                                src={src}
                                alt={`Gallery image ${index + 1}`}
                                className="w-full h-auto object-cover transform group-hover:scale-105 group-hover:opacity-90 transition-all duration-300"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Gallery;
