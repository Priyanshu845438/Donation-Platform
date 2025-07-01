import React, { useState, useEffect, useCallback } from 'react';
import Button from '../common/Button';
import { Link } from 'react-router-dom';

const slides = [
    {
        imageUrl: 'https://picsum.photos/seed/empower/1920/1080',
        title: 'Empower Change, One Action at a Time',
        subtitle: 'Join a global movement dedicated to making a tangible impact on the world\'s most pressing issues.',
        buttonText: 'Explore Campaigns'
    },
    {
        imageUrl: 'https://picsum.photos/seed/hope/1920/1080',
        title: 'Your Contribution Creates Futures',
        subtitle: 'From local communities to global initiatives, every act of kindness builds a ripple of hope.',
        buttonText: 'Donate Now'
    },
    {
        imageUrl: 'https://picsum.photos/seed/community/1920/1080',
        title: 'Transparency You Can See',
        subtitle: 'Follow your donation\'s journey and witness the real-world difference you are making.',
        buttonText: 'Learn More'
    }
];

const SLIDE_DURATION = 7000; // 7 seconds

const HeroSlider: React.FC = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const nextSlide = useCallback(() => {
        if (!isPaused) {
            setCurrentSlide(prev => (prev === slides.length - 1 ? 0 : prev + 1));
        }
    }, [isPaused]);

    const prevSlide = () => {
        setCurrentSlide(prev => (prev === 0 ? slides.length - 1 : prev - 1));
    };
    
    const goToSlide = (index: number) => {
        setCurrentSlide(index);
    };

    useEffect(() => {
        const slideInterval = setInterval(nextSlide, SLIDE_DURATION);
        return () => clearInterval(slideInterval);
    }, [nextSlide]);

    const activeSlide = slides[currentSlide];

    return (
        <div 
            className="relative w-full h-[calc(100vh-80px)] overflow-hidden bg-background text-copy"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Background Image & Overlay */}
            <div key={currentSlide} className="absolute inset-0">
                <img 
                    src={activeSlide.imageUrl} 
                    alt={activeSlide.title} 
                    className="w-full h-full object-cover animate-ken-burns" 
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/70 via-secondary/40 to-background/80 mix-blend-multiply"></div>
                <div className="absolute inset-0 bg-background/50"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
                <div className="max-w-4xl">
                    <div className="overflow-hidden">
                        <h1 
                            key={`title-${currentSlide}`}
                            className="text-4xl md:text-7xl font-black tracking-tighter text-white drop-shadow-2xl animate-reveal-up"
                        >
                            {activeSlide.title}
                        </h1>
                    </div>
                    <div className="overflow-hidden mt-6">
                        <p 
                            key={`subtitle-${currentSlide}`}
                            className="text-lg md:text-xl max-w-3xl mx-auto text-white/80 drop-shadow-lg animate-reveal-up"
                            style={{ animationDelay: '0.2s' }}
                        >
                            {activeSlide.subtitle}
                        </p>
                    </div>
                    <div className="overflow-hidden mt-10">
                        <div key={`button-${currentSlide}`} className="animate-reveal-up" style={{ animationDelay: '0.4s' }}>
                            <Link to="/campaigns">
                                <Button size="lg" variant="primary">
                                    {activeSlide.buttonText}
                                    <ion-icon name="arrow-forward-outline" className="ml-2"></ion-icon>
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Arrows */}
            <button onClick={prevSlide} aria-label="Previous slide" className="absolute top-1/2 left-4 md:left-8 -translate-y-1/2 text-white bg-black/10 backdrop-blur-sm p-3 rounded-full hover:bg-black/30 transition-all duration-300 hover:scale-110 z-20">
                <ion-icon name="chevron-back-outline" className="text-3xl"></ion-icon>
            </button>
            <button onClick={() => nextSlide()} aria-label="Next slide" className="absolute top-1/2 right-4 md:right-8 -translate-y-1/2 text-white bg-black/10 backdrop-blur-sm p-3 rounded-full hover:bg-black/30 transition-all duration-300 hover:scale-110 z-20">
                <ion-icon name="chevron-forward-outline" className="text-3xl"></ion-icon>
            </button>
            
            {/* Progress Bar Indicators */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className="w-16 h-1.5 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm"
                        aria-label={`Go to slide ${index + 1}`}
                    >
                        {index === currentSlide && (
                            <div 
                                key={currentSlide + (isPaused ? '-paused' : '')}
                                className="h-full bg-gradient-to-r from-primary to-secondary"
                                style={{
                                    animation: `progress-fill ${SLIDE_DURATION / 1000}s linear forwards`,
                                    animationPlayState: isPaused ? 'paused' : 'running'
                                }}
                            ></div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default HeroSlider;