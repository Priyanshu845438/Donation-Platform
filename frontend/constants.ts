import type { User, Testimonial, TeamMember, PolicyDocument, PolicyContent } from './types.ts';

export const TESTIMONIALS: Testimonial[] = [
  { id: 1, name: 'Priya Sharma', role: 'Monthly Donor', quote: 'This platform makes it so easy to find and support causes I care about. The transparency and regular updates give me confidence that my contributions are making a real difference.', avatar: 'https://picsum.photos/seed/priya/100' },
  { id: 2, name: 'Rohan Verma', role: 'NGO Partner', quote: 'As a small NGO, getting visibility was a challenge. Partnering with this platform has connected us with a wider community of supporters and amplified our impact significantly.', avatar: 'https://picsum.photos/seed/rohan/100' },
  { id: 3, name: 'Anjali Desai', role: 'Corporate Sponsor', quote: 'Our company\'s CSR initiatives have been streamlined through this platform. The detailed reporting and verified campaigns align perfectly with our goal of responsible corporate citizenship.', avatar: 'https://picsum.photos/seed/anjali/100' },
];

export const TEAM_MEMBERS: TeamMember[] = [
    { id: 1, name: 'Aarav Mehta', role: 'Founder & CEO', imageUrl: 'https://picsum.photos/seed/aarav/400' },
    { id: 2, name: 'Saanvi Gupta', role: 'Head of Operations', imageUrl: 'https://picsum.photos/seed/saanvi/400' },
    { id: 3, name: 'Vikram Singh', role: 'Chief Technology Officer', imageUrl: 'https://picsum.photos/seed/vikram/400' },
    { id: 4, name: 'Diya Patel', role: 'Head of Partnerships', imageUrl: 'https://picsum.photos/seed/diya/400' },
];

export const LEGAL_DOCS: PolicyDocument[] = [
    { id: '80g', title: '80G Certificate', url: '#', description: 'Tax exemption certificate under section 80G of the Income Tax Act.' },
    { id: '12a', title: '12A Certificate', url: '#', description: 'Registration under section 12A, making the organization eligible for tax exemptions.' },
    { id: 'csr', title: 'CSR Registration', url: '#', description: 'Certificate of registration for undertaking Corporate Social Responsibility activities.' },
    { id: 'pan', title: 'PAN Card', url: '#', description: 'Permanent Account Number of the organization.' },
];

export const POLICY_CONTENTS: Record<string, PolicyContent> = {
    'privacy-policy': {
        title: 'Privacy Policy',
        content: 'Our Privacy Policy outlines how we collect, use, and protect your personal information. We are committed to ensuring that your privacy is protected. Should we ask you to provide certain information by which you can be identified when using this website, then you can be assured that it will only be used in accordance with this privacy statement.'
    },
    'terms-conditions': {
        title: 'Terms and Conditions',
        content: 'Welcome to our website. If you continue to browse and use this website, you are agreeing to comply with and be bound by the following terms and conditions of use, which together with our privacy policy govern our relationship with you in relation to this website.'
    },
    'refund-policy': {
        title: 'Refund Policy',
        content: 'Donations made through our platform are generally non-refundable. However, if a campaign is cancelled or in case of a processing error, we will work with you to ensure your donation is redirected or refunded as appropriate. Please contact our support team for any queries regarding refunds.'
    },
    'donation-usage-policy': {
        title: 'Donation Usage Policy',
        content: 'We are committed to transparency in how donations are used. A small percentage of each donation is used to cover platform fees and operational costs, enabling us to continue our work. The vast majority of your donation goes directly to the specified campaign or NGO. Detailed breakdowns are provided on the donation page and in your receipts.'
    }
};

/**
 * @deprecated Mock data, will be removed once all modules are updated. Exported to prevent legacy import errors.
 */
export const USERS: User[] = [];
