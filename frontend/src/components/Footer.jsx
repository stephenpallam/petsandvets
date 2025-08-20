import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Twitter } from 'lucide-react';
import { hospitalInfo, hours } from '../mock';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Hospital Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="rounded-full p-2" style={{ backgroundColor: '#29add3' }}>
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <span className="font-bold text-lg" style={{ color: '#29add3' }}>P&V</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold">Pets & Vets</h3>
                <p className="text-sm text-gray-400">Animal Hospital & Urgent Care</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              {hospitalInfo.description}
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-gray-400 transition-colors"
                style={{ '&:hover': { color: '#5bc0db' } }}
                onMouseEnter={(e) => e.target.style.color = '#5bc0db'}
                onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 transition-colors"
                onMouseEnter={(e) => e.target.style.color = '#5bc0db'}
                onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 transition-colors"
                onMouseEnter={(e) => e.target.style.color = '#5bc0db'}
                onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/" 
                  className="text-gray-300 transition-colors text-sm"
                  onMouseEnter={(e) => e.target.style.color = '#5bc0db'}
                  onMouseLeave={(e) => e.target.style.color = '#d1d5db'}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/services" 
                  className="text-gray-300 transition-colors text-sm"
                  onMouseEnter={(e) => e.target.style.color = '#5bc0db'}
                  onMouseLeave={(e) => e.target.style.color = '#d1d5db'}
                >
                  Our Services
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className="text-gray-300 transition-colors text-sm"
                  onMouseEnter={(e) => e.target.style.color = '#5bc0db'}
                  onMouseLeave={(e) => e.target.style.color = '#d1d5db'}
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/gallery" 
                  className="text-gray-300 transition-colors text-sm"
                  onMouseEnter={(e) => e.target.style.color = '#5bc0db'}
                  onMouseLeave={(e) => e.target.style.color = '#d1d5db'}
                >
                  Gallery
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-gray-300 transition-colors text-sm"
                  onMouseEnter={(e) => e.target.style.color = '#5bc0db'}
                  onMouseLeave={(e) => e.target.style.color = '#d1d5db'}
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Services</h3>
            <ul className="space-y-2">
              <li className="text-gray-300 text-sm">Urgent Care</li>
              <li className="text-gray-300 text-sm">Wellness Exams</li>
              <li className="text-gray-300 text-sm">Surgery</li>
              <li className="text-gray-300 text-sm">Dental Care</li>
              <li className="text-gray-300 text-sm">Diagnostics</li>
              <li className="text-gray-300 text-sm">Exotic Pet Care</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: '#5bc0db' }} />
                <p className="text-gray-300 text-sm">{hospitalInfo.address}</p>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5" style={{ color: '#5bc0db' }} />
                <a 
                  href={`tel:${hospitalInfo.phone}`} 
                  className="text-gray-300 transition-colors text-sm"
                  onMouseEnter={(e) => e.target.style.color = '#5bc0db'}
                  onMouseLeave={(e) => e.target.style.color = '#d1d5db'}
                >
                  {hospitalInfo.phone}
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5" style={{ color: '#5bc0db' }} />
                <a 
                  href={`mailto:${hospitalInfo.email}`} 
                  className="text-gray-300 transition-colors text-sm"
                  onMouseEnter={(e) => e.target.style.color = '#5bc0db'}
                  onMouseLeave={(e) => e.target.style.color = '#d1d5db'}
                >
                  {hospitalInfo.email}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Hours Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2" style={{ color: '#5bc0db' }} />
                General Practice Hours
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-300">Monday:</div>
                <div className="text-white">{hours.generalPractice.monday}</div>
                <div className="text-gray-300">Tuesday:</div>
                <div className="text-white">{hours.generalPractice.tuesday}</div>
                <div className="text-gray-300">Wednesday:</div>
                <div className="text-white">{hours.generalPractice.wednesday}</div>
                <div className="text-gray-300">Thursday:</div>
                <div className="text-white">{hours.generalPractice.thursday}</div>
                <div className="text-gray-300">Friday:</div>
                <div className="text-white">{hours.generalPractice.friday}</div>
                <div className="text-gray-300">Saturday:</div>
                <div className="text-white">{hours.generalPractice.saturday}</div>
                <div className="text-gray-300">Sunday:</div>
                <div className="text-white">{hours.generalPractice.sunday}</div>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-red-400" />
                Urgent Care Hours
              </h4>
              <div className="text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Every Day:</span>
                  <span className="text-white font-medium">{hours.urgentCare.everyday}</span>
                </div>
                <p className="text-red-400 text-xs mt-2">Walk-ins welcome or call ahead</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 Pets and Vets Animal Hospital & Urgent Care. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;