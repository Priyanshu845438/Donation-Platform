import React from 'react';
import SectionWrapper from '../components/SectionWrapper.tsx';
import { LEGAL_DOCS, POLICY_CONTENTS } from '../constants.ts';
import { FiDownload } from 'react-icons/fi';
import type { PolicyContent } from '../types.ts';

const LegalPage: React.FC = () => {
  return (
    <div className="bg-warm-gray-100 font-sans">
      <div className="bg-navy-blue py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold text-white font-serif">Transparency & Legal</h1>
          <p className="mt-4 text-xl text-warm-gray-200">Our commitment to open and honest operations.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Downloadable Documents */}
        <SectionWrapper className="mb-16">
          <h2 className="text-3xl font-bold text-navy-blue font-serif text-center mb-8">Official Documents</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {LEGAL_DOCS.map(doc => (
              <a 
                key={doc.id}
                href={doc.url}
                download
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center"
              >
                <FiDownload className="h-10 w-10 text-sky-blue mb-4" />
                <h3 className="text-lg font-semibold text-navy-blue">{doc.title}</h3>
                <p className="text-sm text-warm-gray-600 mt-2 flex-grow">{doc.description}</p>
                <span className="mt-4 text-sm font-bold text-sky-blue">Download</span>
              </a>
            ))}
          </div>
        </SectionWrapper>
        
        {/* Policies */}
        <SectionWrapper>
          <h2 className="text-3xl font-bold text-navy-blue font-serif text-center mb-12">Our Policies</h2>
          <div className="space-y-8">
            {Object.values(POLICY_CONTENTS).map((policy: PolicyContent) => (
              <div key={policy.title} className="bg-white p-8 rounded-lg shadow-md">
                <h3 className="text-2xl font-bold font-serif text-navy-blue mb-4">{policy.title}</h3>
                <p className="text-warm-gray-700 leading-relaxed">{policy.content}</p>
              </div>
            ))}
          </div>
        </SectionWrapper>
      </div>
    </div>
  );
};

export default LegalPage;