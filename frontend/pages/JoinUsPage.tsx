import React from 'react';
import SectionWrapper from '../components/SectionWrapper.tsx';
import Button from '../components/Button.tsx';
import { FiUsers, FiBriefcase, FiHeart, FiCheck } from 'react-icons/fi';

const BenefitCard = ({ icon, title, description, benefits }: { icon: React.ReactNode, title: string, description: string, benefits: string[] }) => (
  <div className="bg-white p-8 rounded-xl shadow-lg h-full flex flex-col">
    <div className="flex items-center mb-4">
      <div className="text-white bg-sky-blue p-3 rounded-full mr-4">{icon}</div>
      <h3 className="text-2xl font-bold font-serif text-navy-blue">{title}</h3>
    </div>
    <p className="text-warm-gray-600 mb-6">{description}</p>
    <ul className="space-y-3 mb-8 flex-grow">
      {benefits.map((benefit, i) => (
        <li key={i} className="flex items-start">
          <FiCheck className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
          <span>{benefit}</span>
        </li>
      ))}
    </ul>
    <div className="mt-auto">
        <Button variant="secondary" fullWidth>Create Account</Button>
    </div>
  </div>
);

const JoinUsPage: React.FC = () => {
  return (
    <div className="bg-warm-gray font-sans">
      <div className="bg-navy-blue text-white text-center py-16">
        <h1 className="text-4xl md:text-5xl font-extrabold font-serif">Join Our Community</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-sky-blue">
          Whether you're an NGO, a company, or a passionate donor, you have a place here.
        </p>
      </div>

      <div className="py-20">
        <SectionWrapper className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8 items-stretch">
            <BenefitCard
              icon={<FiUsers size={24} />}
              title="For NGOs"
              description="Amplify your reach and connect with a dedicated community of supporters."
              benefits={[
                "List your campaigns for free.",
                "Access a wide network of donors and corporate partners.",
                "Easy-to-use dashboard for campaign management.",
                "Transparent reporting and fund disbursement."
              ]}
            />
            <BenefitCard
              icon={<FiBriefcase size={24} />}
              title="For Companies"
              description="Fulfill your Corporate Social Responsibility (CSR) goals with trusted, impactful projects."
              benefits={[
                "Find verified NGOs and projects for your CSR initiatives.",
                "Track the impact of your company's contributions.",
                "Receive detailed reports for compliance and marketing.",
                "Enhance your brand's social value."
              ]}
            />
            <BenefitCard
              icon={<FiHeart size={24} />}
              title="For Donors"
              description="Give with confidence and see the real-world impact of your generosity."
              benefits={[
                "Discover and donate to verified campaigns.",
                "Receive tax benefits under 80G for eligible donations.",
                "Get regular updates from the campaigns you support.",
                "Join a community of like-minded changemakers."
              ]}
            />
          </div>
        </SectionWrapper>
      </div>
    </div>
  );
};

export default JoinUsPage;