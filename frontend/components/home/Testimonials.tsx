
import React from 'react';
import { MOCK_TESTIMONIALS } from '../../utils/constants';
import Card from '../common/Card';

const TestimonialCard: React.FC<{ testimonial: typeof MOCK_TESTIMONIALS[0] }> = ({ testimonial }) => (
    <Card className="flex flex-col h-full">
        <div className="p-8 flex-grow flex flex-col">
            <ion-icon name="chatbox-ellipses-outline" className="text-4xl text-primary/30 mb-4"></ion-icon>
            <p className="text-text-secondary italic flex-grow">"{testimonial.quote}"</p>
            <div className="mt-6 pt-6 border-t border-border flex items-center">
                <img src={testimonial.avatar} alt={testimonial.author} className="w-12 h-12 rounded-full object-cover shadow-sm border-2 border-primary/50" />
                <div className="ml-4">
                    <h4 className="font-bold text-text-primary">{testimonial.author}</h4>
                    <p className="text-primary text-sm font-medium">{testimonial.role}</p>
                </div>
            </div>
        </div>
    </Card>
);


const Testimonials: React.FC = () => {
    return (
        <div className="bg-background py-16 sm:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                 <h2 className="text-3xl font-bold font-display text-text-primary sm:text-4xl">Trusted by a Global Community</h2>
                <p className="mt-4 text-lg text-text-secondary max-w-3xl mx-auto">
                    Hear from the people who power our mission. Their stories are a testament to the collective impact we create together.
                </p>
            </div>
            <div className="mt-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {MOCK_TESTIMONIALS.slice(0, 3).map((testimonial, index) => (
                        <div key={index} className="animate-slide-in-up" style={{animationDelay: `${index * 100}ms`}}>
                            <TestimonialCard testimonial={testimonial} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Testimonials;