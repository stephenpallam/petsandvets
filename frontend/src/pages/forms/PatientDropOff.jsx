import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Clock, 
  Phone
} from 'lucide-react';
import { hospitalInfo } from '../mock';
import { useBusinessInfo } from '../../hooks/useBusinessInfo';

const PatientDropOff = () => {
  const { businessInfo: currentBusinessInfo } = useBusinessInfo();
  const primaryColor = '#29add3';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Form Section */}
      <section style={{ backgroundColor: '#f8f9fa', paddingTop: '40px', paddingBottom: '40px' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden" style={{ paddingTop: '20px' }}>
            {/* Embedded Form */}
            <div className="relative overflow-hidden">              
              <iframe 
                id="petsandvets"
                src="https://docs.google.com/forms/d/e/1FAIpQLSf81vjpN9cttLuv1ww4DI91rSRhDsSGS60xP9GvCBKMZZlhzA/viewform?embedded=true" 
                width="100%" 
                height="5294"
                frameBorder="0" 
                marginHeight="0" 
                marginWidth="0" 
                onLoad={() => {
                  try {
                    window.parent.parent.scroll(0,0);
                  } catch (e) {
                    // Handle cross-origin restrictions gracefully
                    console.log('Scroll adjustment handled');
                  }
                }}
                title="Patient Drop Off Form"
              >
                Loading...
              </iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Help Section */}
      <section className="bg-white" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <Clock className="h-6 w-6 mr-3" style={{ color: primaryColor }} />
                <h3 className="text-lg font-bold text-gray-900">Need Help?</h3>
              </div>
              <p className="text-gray-700 mb-4">
                If you have trouble with the online form or have questions, please call us during business hours.
              </p>
              <a
                href={`tel:${currentBusinessInfo.phone}`}
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                style={{ backgroundColor: primaryColor, color: 'white' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#2196c7'}
                onMouseLeave={(e) => e.target.style.backgroundColor = primaryColor}
              >
                <Phone className="mr-2 h-4 w-4" />
                Call {currentBusinessInfo.phone}
              </a>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <FileText className="h-6 w-6 mr-3" style={{ color: primaryColor }} />
                <h3 className="text-lg font-bold text-gray-900">Other Forms</h3>
              </div>
              <p className="text-gray-700 mb-4">
                Need to complete other forms for your visit? View all available forms.
              </p>
              <Link
                to="/forms-download"
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg border-2 font-medium transition-colors duration-200"
                style={{ borderColor: primaryColor, color: primaryColor }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = primaryColor;
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = primaryColor;
                }}
              >
                View All Forms
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PatientDropOff;