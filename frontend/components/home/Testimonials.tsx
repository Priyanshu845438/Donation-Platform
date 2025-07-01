import React from 'react';
import { MOCK_TESTIMONIALS } from '../../utils/constants';

const TestimonialCard: React.FC<{ testimonial: typeof MOCK_TESTIMONIALS[0] }> = ({ testimonial }) => (
    <div className="flex-shrink-0 w-full sm:w-1/2 lg:w-[30%] xl:w-1/4 p-4">
        <div className="flex flex-col h-full bg-surface p-8 rounded-2xl shadow-lg border border-border/50 relative overflow-hidden transition-all duration-300 hover:border-primary/50 hover:-translate-y-1">
            <ion-icon name="chatbox-ellipses-outline" className="absolute -top-4 -right-4 text-9xl text-primary/10 rotate-12"></ion-icon>
            <div className="relative z-10 flex-grow">
                 <p className="text-lg text-copy-muted italic">"{testimonial.quote}"</p>
            </div>
            <div className="relative z-10 mt-6 pt-6 border-t border-border/50 flex items-center">
                <img src={testimonial.avatar} alt={testimonial.author} className="w-14 h-14 rounded-full object-cover shadow-md border-2 border-primary/50" />
                <div className="ml-4">
                    <h4 className="font-bold text-copy text-lg">{testimonial.author}</h4>
                    <p className="text-primary-light text-sm">{testimonial.role}</p>
                </div>
            </div>
        </div>
    </div>
);


const Testimonials: React.FC = () => {
    // Duplicate testimonials for a seamless loop
    const extendedTestimonials = [...MOCK_TESTIMONIALS, ...MOCK_TESTIMONIALS, ...MOCK_TESTIMONIALS, ...MOCK_TESTIMONIALS];

    return (
        <div className="bg-background py-16 sm:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                 <h2 className="text-3xl font-extrabold text-copy sm:text-4xl">Trusted by a Global Community</h2>
                <p className="mt-4 text-lg text-copy-muted max-w-3xl mx-auto">
                    Hear from the people who power our mission. Their stories are a testament to the collective impact we create together.
                </p>
            </div>
            <div className="mt-12 relative w-full overflow-hidden group">
                 {/* Gradient Fades */}
                <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"></div>
                <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"></div>
                
                <div className="flex animate-scroll-left [animation-play-state:running] group-hover:[animation-play-state:paused]">
                    {extendedTestimonials.map((testimonial, index) => (
                        <TestimonialCard key={index} testimonial={testimonial} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Testimonials;