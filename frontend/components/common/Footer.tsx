
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    return (
        <footer className="bg-surface text-copy-muted">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-1">
                        <h2 className="text-2xl font-bold text-primary-light">CharityPlus</h2>
                        <p className="mt-4 text-sm">
                            Connecting hearts, changing lives. Join our community to make a difference.
                        </p>
                        <div className="flex space-x-4 mt-6">
                            <a href="#" className="hover:text-copy transition-colors"><ion-icon name="logo-facebook" className="text-2xl"></ion-icon></a>
                            <a href="#" className="hover:text-copy transition-colors"><ion-icon name="logo-twitter" className="text-2xl"></ion-icon></a>
                            <a href="#" className="hover:text-copy transition-colors"><ion-icon name="logo-instagram" className="text-2xl"></ion-icon></a>
                            <a href="#" className="hover:text-copy transition-colors"><ion-icon name="logo-linkedin" className="text-2xl"></ion-icon></a>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-copy tracking-wider uppercase">Explore</h3>
                        <ul className="mt-4 space-y-2">
                            <li><Link to="/about" className="text-base hover:text-copy transition-colors">About Us</Link></li>
                            <li><Link to="/campaigns" className="text-base hover:text-copy transition-colors">Campaigns</Link></li>
                            <li><Link to="/reports" className="text-base hover:text-copy transition-colors">Reports</Link></li>
                            <li><Link to="/contact" className="text-base hover:text-copy transition-colors">Contact</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-copy tracking-wider uppercase">Legal</h3>
                        <ul className="mt-4 space-y-2">
                            <li><a href="#" className="text-base hover:text-copy transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="text-base hover:text-copy transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="text-base hover:text-copy transition-colors">Cookie Policy</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-copy tracking-wider uppercase">Stay Updated</h3>
                        <p className="mt-4 text-sm">Subscribe to our newsletter for the latest updates and stories.</p>
                        <form className="mt-4 flex">
                            <input type="email" placeholder="Your email" className="w-full px-3 py-2 bg-background border border-border rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary" />
                            <button type="submit" className="px-4 py-2 bg-primary text-white rounded-r-md hover:bg-primary-dark transition-colors">
                                <ion-icon name="send-outline"></ion-icon>
                            </button>
                        </form>
                    </div>
                </div>
                <div className="mt-8 border-t border-border pt-8 text-center text-sm">
                    <p>&copy; {new Date().getFullYear()} CharityPlus. All rights reserved. A platform for positive change.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
