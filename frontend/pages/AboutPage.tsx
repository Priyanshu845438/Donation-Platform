import React from 'react';
import SectionWrapper from '../components/SectionWrapper.tsx';
import { TEAM_MEMBERS } from '../constants.ts';

const AboutPage: React.FC = () => {
  return (
    <div className="bg-warm-gray font-sans">
      {/* Page Header */}
      <div className="bg-navy-blue py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold text-white font-serif">About Donation Hub</h1>
          <p className="mt-4 text-xl text-sky-blue">Transparency, Trust, and Transformation</p>
        </div>
      </div>

      {/* Mission and Vision */}
      <SectionWrapper className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="rounded-lg overflow-hidden shadow-lg">
                <img src="https://picsum.photos/seed/mission/600/400" alt="Community working together" className="w-full h-full object-cover"/>
            </div>
            <div>
              <h2 className="text-3xl font-bold font-serif text-navy-blue">Our Mission & Story</h2>
              <p className="mt-4 text-lg text-warm-gray-700">
                Donation Hub was founded with a simple yet powerful belief: that technology can bridge the gap between those who want to help and those who need it most. We aim to create a transparent, secure, and accessible platform that empowers individuals and organizations to make a meaningful impact on society.
              </p>
              <p className="mt-4 text-lg text-warm-gray-700">
                Our journey began in 2023, driven by the need for a more accountable system in online philanthropy. We are dedicated to verifying every campaign, ensuring every rupee is tracked, and providing clear reports on the impact of your generosity.
              </p>
            </div>
          </div>
        </div>
      </SectionWrapper>
      
      {/* Legal & Transparency Statement */}
      <SectionWrapper className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold font-serif text-navy-blue">Our Commitment to Transparency</h2>
           <p className="mt-4 max-w-3xl mx-auto text-lg text-warm-gray-700">
            We operate with the highest standards of integrity. Donation Hub is a registered entity under the Societies Registration Act, 1860. We are fully compliant with 80G and 12A certifications, allowing for tax-deductible donations where applicable. Our CSR registration enables us to partner with corporations for their social responsibility initiatives. All legal documents are available for public viewing to ensure complete transparency.
          </p>
        </div>
      </SectionWrapper>

      {/* Team Section */}
      <SectionWrapper className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold font-serif text-navy-blue">Meet Our Team</h2>
            <p className="mt-4 text-lg text-warm-gray-600">The passionate individuals driving our mission forward.</p>
          </div>
          <div className="mt-12 grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
            {TEAM_MEMBERS.map((member) => (
              <div key={member.id} className="text-center">
                <img className="mx-auto h-40 w-40 rounded-full object-cover shadow-lg" src={member.imageUrl} alt={member.name} />
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-navy-blue">{member.name}</h3>
                  <p className="text-sky-blue">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
};

export default AboutPage;