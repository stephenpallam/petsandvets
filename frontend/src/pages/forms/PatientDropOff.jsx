import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Clock, 
  Phone,
  Download,
  ExternalLink,
  Info
} from 'lucide-react';
import { hospitalInfo } from '../../mock';

const PatientDropOff = () => {
  const primaryColor = '#29add3';
  const primaryBg = '#e6f7fb';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${primaryBg} 0%, #ffffff 50%, #f0fdff 100%)` }}>
        <div className="absolute inset-0 bg-white/40"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center justify-center w-16 h-16 rounded-full mr-4" style={{ backgroundColor: primaryBg }}>
              <FileText className="h-8 w-8" style={{ color: primaryColor }} />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Patient Drop-Off Form
            </h1>
          </div>
          <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
            Please complete this form when dropping off your pet for procedures, surgeries, or extended care visits.
          </p>
        </div>
      </section>

      {/* Important Information */}
      <section className="bg-white" style={{ paddingTop: '20px', paddingBottom: '20px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-50 border-2 border-blue-200 p-6 rounded-xl">
            <div className="flex items-start">
              <Info className="h-6 w-6 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-blue-900 mb-2">Drop-Off Information</h3>
                <div className="text-blue-700 space-y-1">
                  <p>• Please complete this form before arriving for your appointment</p>
                  <p>• Bring your pet's current medications and feeding instructions</p>
                  <p>• Include emergency contact information for the day</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section style={{ backgroundColor: primaryBg, paddingTop: '40px', paddingBottom: '40px' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <h2 className="text-xl font-bold text-gray-900 mb-4 sm:mb-0">Complete Online Form</h2>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="https://petsandvetsanimalhospital.com/forms/Patient_Drop_Off_Form.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors duration-200"
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
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </a>
                  <a
                    href="https://petsandvetsanimalhospital.com/patient-drop-off-form"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors duration-200"
                    style={{ backgroundColor: primaryColor }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#2196c7'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = primaryColor}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Full Screen Form
                  </a>
                </div>
              </div>
            </div>
            
            {/* Embedded Form */}
            <div className="relative">
              <iframe
                src="https://petsandvetsanimalhospital.com/patient-drop-off-form"
                width="100%"
                height="800"
                style={{ border: 0, minHeight: '800px' }}
                title="Patient Drop-Off Form"
                loading="lazy"
              ></iframe>
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
                href={`tel:${hospitalInfo.phone}`}
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                style={{ backgroundColor: primaryColor, color: 'white' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#2196c7'}
                onMouseLeave={(e) => e.target.style.backgroundColor = primaryColor}
              >
                <Phone className="mr-2 h-4 w-4" />
                Call {hospitalInfo.phone}
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