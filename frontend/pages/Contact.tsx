
import React, { useState } from 'react';
import Button from '../components/common/Button';
import { useToast } from '../components/ui/Toast';

const Contact: React.FC = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addToast } = useToast();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            console.log('Form submitted:', formData);
            addToast('Your message has been sent!', 'success');
            setFormData({ name: '', email: '', message: '' });
            setIsSubmitting(false);
        }, 1500);
    };

    return (
        <div className="bg-background">
            <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold text-copy sm:text-5xl">Get in Touch</h1>
                    <p className="mt-4 max-w-2xl mx-auto text-xl text-copy-muted">
                        We'd love to hear from you. Whether you have a question, feedback, or a partnership inquiry, please reach out.
                    </p>
                </div>

                <div className="mt-16 lg:grid lg:grid-cols-2 lg:gap-8">
                    {/* Contact Form */}
                    <div className="p-8 bg-surface rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold text-copy mb-6">Send us a message</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-copy-muted">Full Name</label>
                                <input type="text" name="name" id="name" required value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-background border border-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                            </div>
                             <div>
                                <label htmlFor="email" className="block text-sm font-medium text-copy-muted">Email Address</label>
                                <input type="email" name="email" id="email" required value={formData.email} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-background border border-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                            </div>
                             <div>
                                <label htmlFor="message" className="block text-sm font-medium text-copy-muted">Message</label>
                                <textarea name="message" id="message" rows={4} required value={formData.message} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-background border border-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"></textarea>
                            </div>
                            <div>
                                <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting ? 'Sending...' : 'Send Message'}
                                </Button>
                            </div>
                        </form>
                    </div>

                    {/* Contact Info & Map */}
                    <div className="mt-12 lg:mt-0">
                         <h2 className="text-2xl font-bold text-copy mb-6">Contact Information</h2>
                         <div className="space-y-4 text-lg text-copy-muted">
                            <p className="flex items-center"><ion-icon name="location-outline" className="mr-3 text-2xl text-primary-light"></ion-icon> 123 Charity Lane, Hope City, 12345</p>
                            <p className="flex items-center"><ion-icon name="mail-outline" className="mr-3 text-2xl text-primary-light"></ion-icon> contact@charityplus.com</p>
                            <p className="flex items-center"><ion-icon name="call-outline" className="mr-3 text-2xl text-primary-light"></ion-icon> +1 (555) 123-4567</p>
                         </div>
                         <div className="mt-8 h-80 rounded-lg overflow-hidden shadow-lg">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.085819586144!2d-122.41941548468155!3d37.77492957975871!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8085808c1e8433c3%3A0x1c3132e1b12b5f6a!2sSan%20Francisco%20City%20Hall!5e0!3m2!1sen!2sus!4v1626359148536!5m2!1sen!2sus&style=feature:all|element:all|saturation:-100|lightness:-10"
                                width="100%"
                                height="100%"
                                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
                                allowFullScreen={true}
                                loading="lazy"
                                title="Contact Location"
                            ></iframe>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
