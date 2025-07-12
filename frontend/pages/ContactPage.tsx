import React from 'react';
import SectionWrapper from '../components/SectionWrapper.tsx';
import Button from '../components/Button.tsx';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const ContactPage: React.FC = () => {
  return (
    <div className="bg-warm-gray font-sans">
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold text-navy-blue font-serif">Get In Touch</h1>
          <p className="mt-4 text-xl text-warm-gray-600">We'd love to hear from you. Whether you have a question, feedback, or a partnership inquiry, please reach out.</p>
        </div>
      </div>
      
      <SectionWrapper className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold font-serif text-navy-blue mb-6">Send us a message</h2>
              <form action="#" method="POST" className="space-y-6">
                <div>
                  <label htmlFor="name" className="sr-only">Full name</label>
                  <input type="text" name="name" id="name" autoComplete="name" placeholder="Full name" required className="block w-full shadow-sm py-3 px-4 placeholder-warm-gray-500 focus:ring-sky-blue focus:border-sky-blue border-warm-gray-300 rounded-md" />
                </div>
                <div>
                  <label htmlFor="email" className="sr-only">Email</label>
                  <input id="email" name="email" type="email" autoComplete="email" placeholder="Email address" required className="block w-full shadow-sm py-3 px-4 placeholder-warm-gray-500 focus:ring-sky-blue focus:border-sky-blue border-warm-gray-300 rounded-md" />
                </div>
                <div>
                  <label htmlFor="subject" className="sr-only">Subject</label>
                  <input type="text" name="subject" id="subject" placeholder="Subject" required className="block w-full shadow-sm py-3 px-4 placeholder-warm-gray-500 focus:ring-sky-blue focus:border-sky-blue border-warm-gray-300 rounded-md" />
                </div>
                <div>
                  <label htmlFor="message" className="sr-only">Message</label>
                  <textarea id="message" name="message" rows={4} placeholder="Your message" required className="block w-full shadow-sm py-3 px-4 placeholder-warm-gray-500 focus:ring-sky-blue focus:border-sky-blue border border-warm-gray-300 rounded-md"></textarea>
                </div>
                <div>
                  <Button type="submit" fullWidth>Send Message</Button>
                </div>
              </form>
            </div>
            
            {/* Contact Info */}
            <div className="space-y-8">
                <div className="bg-white p-8 rounded-lg shadow-lg">
                  <h3 className="text-2xl font-bold font-serif text-navy-blue mb-4">Contact Information</h3>
                  <div className="space-y-4 text-lg text-warm-gray-700">
                      <p className="flex items-center"><FiMapPin className="flex-shrink-0 mr-3 h-6 w-6 text-sky-blue" /><span>123 Charity Lane, New Delhi, 110001, India</span></p>
                      <p className="flex items-center"><FiPhone className="flex-shrink-0 mr-3 h-6 w-6 text-sky-blue" /><span>+91 11 4567 8901</span></p>
                      <p className="flex items-center"><FiMail className="flex-shrink-0 mr-3 h-6 w-6 text-sky-blue" /><span>contact@donationhub.org</span></p>
                  </div>
                </div>
                <div className="bg-white p-8 rounded-lg shadow-lg h-64">
                    <h3 className="text-2xl font-bold font-serif text-navy-blue mb-4">Our Location</h3>
                    <div className="w-full h-full bg-warm-gray-200 rounded-md flex items-center justify-center text-warm-gray-500">
                        Google Maps Embed Placeholder
                    </div>
                </div>
            </div>

          </div>
        </div>
      </SectionWrapper>
    </div>
  );
};

export default ContactPage;