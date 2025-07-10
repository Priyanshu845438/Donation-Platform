import React, { useState, useEffect, useCallback } from 'react';
import Button from '../common/Button';
import { Link } from 'react-router-dom';

const slides = [
    {
        title: 'Empower Change, One Action at a Time',
        subtitle: 'Join a global movement dedicated to making a tangible impact on the world\'s most pressing issues.',
        buttonText: 'Explore Campaigns'
    },
    {
        title: 'Your Contribution Creates Futures',
        subtitle: 'From local communities to global initiatives, every act of kindness builds a ripple of hope.',
        buttonText: 'Donate Now'
    },
    {
        title: 'Transparency You Can Trust',
        subtitle: 'Follow your donation\'s journey and witness the real-world difference you are making.',
        buttonText: 'Learn More'
    }
];

const SLIDE_DURATION = 7000; // 7 seconds

const HeroSlider: React.FC = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const nextSlide = useCallback(() => {
        setCurrentSlide(prev => (prev === slides.length - 1 ? 0 : prev + 1));
    }, []);

    useEffect(() => {
        const slideInterval = setInterval(nextSlide, SLIDE_DURATION);
        return () => clearInterval(slideInterval);
    }, [nextSlide]);

    const activeSlide = slides[currentSlide];

    return (
        <div 
            className="relative w-full h-screen overflow-hidden text-white"
        >
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 overflow-hidden">
                     <img 
                        src="https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=2070&auto=format&fit=crop"
                        alt="Charitable work"
                        className="w-full h-full object-cover animate-slow-zoom"
                    />
                </div>
                <div className="absolute inset-0 bg-black/50"></div>
            </div>


            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
                <div className="max-w-4xl">
                    <div className="overflow-hidden">
                        <h1 
                            key={`title-${currentSlide}`}
                            className="text-4xl md:text-7xl font-bold font-display tracking-tight drop-shadow-lg animate-slide-in-down"
                        >
                            {activeSlide.title}
                        </h1>
                    </div>
                    <div className="overflow-hidden mt-6">
                        <p 
                            key={`subtitle-${currentSlide}`}
                            className="text-lg md:text-xl max-w-3xl mx-auto text-white/90 drop-shadow-md animate-slide-in-up"
                            style={{ animationDelay: '0.2s' }}
                        >
                            {activeSlide.subtitle}
                        </p>
                    </div>
                    <div className="overflow-hidden mt-10">
                        <div key={`button-${currentSlide}`} className="animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
                            <Link to="/campaigns">
                                <Button size="lg" variant="accent">
                                    {activeSlide.buttonText}
                                    <ion-icon name="arrow-forward-outline" className="ml-2"></ion-icon>
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Bar Indicators */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
                {slides.map((_, index) => (
                    <div
                        key={index}
                        className="w-20 h-1 bg-white/20 rounded-full overflow-hidden cursor-pointer"
                        onClick={() => setCurrentSlide(index)}
                    >
                        {index === currentSlide && (
                            <div 
                                key={currentSlide}
                                className="h-full bg-accent"
                                style={{
                                    animation: `progress-fill ${SLIDE_DURATION / 1000}s linear forwards`,
                                }}
                            ></div>
                        )}
                         {index !== currentSlide && <div className="h-full bg-transparent"></div>}
                    </div>
                ))}
            </div>
             <style>{`
                @keyframes progress-fill {
                    from { width: 0%; }
                    to { width: 100%; }
                }
            `}</style>
        </div>
    );
};

export default HeroSlider;