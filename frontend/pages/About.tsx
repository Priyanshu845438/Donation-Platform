
import React from 'react';

const About: React.FC = () => {
    return (
        <>
            <div className="bg-surface">
                <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight text-copy sm:text-5xl lg:text-6xl animate-fade-in-down">Our Mission</h1>
                    <p className="mt-6 max-w-3xl mx-auto text-xl text-copy-muted animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                        To empower individuals and organizations to create a positive and lasting impact through accessible, transparent, and effective charitable giving.
                    </p>
                </div>
            </div>

            <div className="py-16 sm:py-24 bg-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
                        <div>
                            <h2 className="text-3xl font-extrabold text-copy sm:text-4xl">Our Story</h2>
                            <p className="mt-4 text-lg text-copy-muted">
                                CharityPlus was born from a desire to bridge the gap between those who want to help and the causes that need their support. We saw a world full of generosity but hindered by a lack of trust and transparency in the giving process.
                            </p>
                            <p className="mt-4 text-lg text-copy-muted">
                                We set out to build a platform that leverages technology to not only facilitate donations but also to build a community founded on trust. By providing clear impact reporting, vetting every partner organization, and creating a seamless user experience, we are revolutionizing the way people give.
                            </p>
                        </div>
                        <div className="mt-10 lg:mt-0">
                             <img className="rounded-lg shadow-xl" src="https://picsum.photos/seed/story/1200/900" alt="Our Story" />
                        </div>
                    </div>
                </div>
            </div>
            
             <div className="py-16 sm:py-24 bg-surface">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                         <h2 className="text-3xl font-extrabold text-copy sm:text-4xl">Our Core Values</h2>
                         <p className="mt-4 text-lg text-copy-muted">The principles that guide every decision we make.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-10 text-center">
                        <div className="p-6">
                            <div className="flex items-center justify-center h-16 w-16 mx-auto bg-primary/10 text-primary-light rounded-full">
                                <ion-icon name="eye-outline" className="text-4xl"></ion-icon>
                            </div>
                            <h3 className="mt-6 text-xl font-bold text-copy">Transparency</h3>
                            <p className="mt-2 text-copy-muted">We believe in complete openness. You'll always know where your money goes and the impact it has.</p>
                        </div>
                         <div className="p-6">
                            <div className="flex items-center justify-center h-16 w-16 mx-auto bg-primary/10 text-primary-light rounded-full">
                                <ion-icon name="heart-half-outline" className="text-4xl"></ion-icon>
                            </div>
                            <h3 className="mt-6 text-xl font-bold text-copy">Empathy</h3>
                            <p className="mt-2 text-copy-muted">We approach our work with compassion, seeking to understand the needs of both our partners and donors.</p>
                        </div>
                         <div className="p-6">
                            <div className="flex items-center justify-center h-16 w-16 mx-auto bg-primary/10 text-primary-light rounded-full">
                                <ion-icon name="rocket-outline" className="text-4xl"></ion-icon>
                            </div>
                            <h3 className="mt-6 text-xl font-bold text-copy">Innovation</h3>
                            <p className="mt-2 text-copy-muted">We constantly seek better ways to connect people and scale impact through technology and creative solutions.</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default About;