import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Twitter } from 'lucide-react';
import { hospitalInfo, hours } from '../mock';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Hospital Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="rounded-lg p-2" style={{ backgroundColor: '#29add3' }}>
                <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                  <div className="relative">
                    {/* Hospital plus sign */}
                    <div 
                      className="absolute" 
                      style={{
                        width: '16px',
                        height: '4px',
                        backgroundColor: '#29add3',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                      }}
                    ></div>
                    <div 
                      className="absolute" 
                      style={{
                        width: '4px',
                        height: '16px',
                        backgroundColor: '#29add3',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold">Pets & Vets</h3>
                <p className="text-sm text-gray-400">Animal Hospital & Urgent Care</p>
              </div>
            </div>
            
            {/* Contact Info */}
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

            {/* Social Media Icons */}
            <div className="flex space-x-4 pt-2">
              <a 
                href="#" 
                className="text-gray-400 transition-colors"
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

          {/* General Practice Hours */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white flex items-center">
              <Clock className="h-5 w-5 mr-2" style={{ color: '#5bc0db' }} />
              General Practice Hours
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Monday:</span>
                <span className="text-white">{hours.generalPractice.monday}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Tuesday:</span>
                <span className="text-white">{hours.generalPractice.tuesday}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Wednesday:</span>
                <span className="text-white">{hours.generalPractice.wednesday}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Thursday:</span>
                <span className="text-white">{hours.generalPractice.thursday}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Friday:</span>
                <span className="text-white">{hours.generalPractice.friday}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Saturday:</span>
                <span className="text-white">{hours.generalPractice.saturday}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Sunday:</span>
                <span className="text-white">{hours.generalPractice.sunday}</span>
              </div>
            </div>
          </div>

          {/* Urgent Care Hours */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white flex items-center">
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

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-6 pt-6 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 Pets and Vets Animal Hospital & Urgent Care. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;