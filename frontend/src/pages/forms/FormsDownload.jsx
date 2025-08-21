import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Download, 
  FileText, 
  Phone,
  ExternalLink,
  Info,
  Calendar,
  Users,
  Heart,
  Stethoscope,
  Shield
} from 'lucide-react';
import { hospitalInfo } from '../../mock';

const FormsDownload = () => {
  const primaryColor = '#29add3';
  const primaryBg = '#e6f7fb';

  const formCategories = [
    {
      title: "Patient Registration",
      description: "New patient information and appointment scheduling",
      icon: Users,
      color: "#10b981",
      forms: [
        {
          name: "New Patient Registration Form",
          description: "Complete patient information for first-time visits",
          onlineLink: "/forms/new-patient-registration",
          downloadLink: "https://petsandvetsanimalhospital.com/forms/New_Patient_Registration_Form.pdf"
        }
      ]
    },
    {
      title: "Drop-Off & Visit Forms",
      description: "Forms for pet drop-off and extended care visits",
      icon: Calendar,
      color: "#3b82f6", 
      forms: [
        {
          name: "Patient Drop-Off Form",
          description: "Required when leaving your pet for procedures or extended care",
          onlineLink: "/forms/patient-drop-off",
          downloadLink: "https://petsandvetsanimalhospital.com/forms/Patient_Drop_Off_Form.pdf"
        }
      ]
    },
    {
      title: "Consent Forms",
      description: "Authorization forms for medical procedures",
      icon: Shield,
      color: "#8b5cf6",
      forms: [
        {
          name: "Surgery & Anesthesia Consent Form",
          description: "Required consent for all surgical procedures and anesthesia",
          onlineLink: "/forms/surgery-anesthesia-consent",
          downloadLink: "https://petsandvetsanimalhospital.com/forms/Surgery_And_Anesthesia_Consent_Form.pdf"
        },
        {
          name: "Dental Procedure Consent Form", 
          description: "Consent for dental cleanings, extractions, and procedures",
          onlineLink: "/forms/dental-consent",
          downloadLink: "https://petsandvetsanimalhospital.com/forms/Dental_Content_Form.pdf"
        },
        {
          name: "Anesthesia Free Dental Cleaning Consent Form",
          description: "Consent for anesthesia-free preventive dental cleaning",
          onlineLink: "https://petsandvetsanimalhospital.com/anesthesia-free-dental-consent-form",
          downloadLink: "https://petsandvetsanimalhospital.com/forms/Anesthesia_Free_Preventive_Dental_Cleaning_Consent_Form.pdf"
        }
      ]
    },
    {
      title: "Records & Documentation", 
      description: "Forms for medical records and information requests",
      icon: FileText,
      color: "#f59e0b",
      forms: [
        {
          name: "Request Pet Records Form",
          description: "Request copies of your pet's medical records",
          onlineLink: "/forms/request-pet-records", 
          downloadLink: "https://petsandvetsanimalhospital.com/forms/Request_Pet_Records_Form.pdf"
        },
        {
          name: "Hospital Hours Disclosure Form",
          description: "Information about our operating hours and policies",
          downloadLink: "https://petsandvetsanimalhospital.com/forms/Pets_and_Vets_Hours_Disclosure_Form.pdf"
        }
      ]
    },
    {
      title: "Procedure Information",
      description: "Educational materials and procedure information",
      icon: Stethoscope,
      color: "#ef4444",
      forms: [
        {
          name: "Surgical Information Packet",
          description: "Pre and post-operative care instructions",
          downloadLink: "https://petsandvetsanimalhospital.com/forms/Surgical_Information_Packet.pdf"
        },
        {
          name: "Anesthesia Procedure Form",
          description: "Information about anesthesia procedures and safety",
          downloadLink: "https://petsandvetsanimalhospital.com/forms/Anesthesia_Procedure_Form.pdf"
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${primaryBg} 0%, #ffffff 50%, #f0fdff 100%)` }}>
        <div className="absolute inset-0 bg-white/40"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center justify-center w-16 h-16 rounded-full mr-4" style={{ backgroundColor: primaryBg }}>
              <Download className="h-8 w-8" style={{ color: primaryColor }} />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Download & Print Forms
            </h1>
          </div>
          <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
            Download, print, and complete these forms ahead of your visit to save time at our hospital.
          </p>
        </div>
      </section>

      {/* Instructions */}
      <section className="bg-white" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-50 border-2 border-blue-200 p-8 rounded-xl">
            <div className="flex items-start">
              <Info className="h-6 w-6 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-blue-900 mb-3">How to Use These Forms</h3>
                <div className="text-blue-700 space-y-2">
                  <p><strong>Option 1 - Online:</strong> Click "Complete Online" to fill out forms digitally</p>
                  <p><strong>Option 2 - Download:</strong> Click "Download PDF" to print and fill out by hand</p>
                  <p><strong>Bring completed forms with you</strong> to your appointment to expedite check-in</p>
                  <p><strong>Questions?</strong> Call us at {hospitalInfo.phone} for assistance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Forms Categories */}
      <section style={{ backgroundColor: primaryBg, paddingTop: '40px', paddingBottom: '40px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {formCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full mr-4" style={{ backgroundColor: `${category.color}15` }}>
                    <category.icon className="h-6 w-6" style={{ color: category.color }} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{category.title}</h2>
                    <p className="text-gray-600">{category.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {category.forms.map((form, formIndex) => (
                    <div key={formIndex} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{form.name}</h3>
                      <p className="text-gray-600 mb-4 text-sm">{form.description}</p>
                      
                      <div className="flex flex-col sm:flex-row gap-3">
                        {form.onlineLink && (
                          <Link
                            to={form.onlineLink}
                            className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors duration-200"
                            style={{ backgroundColor: category.color }}
                            onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                            onMouseLeave={(e) => e.target.style.opacity = '1'}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            Complete Online
                          </Link>
                        )}
                        
                        <a
                          href={form.downloadLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors duration-200"
                          style={{ borderColor: category.color, color: category.color }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = category.color;
                            e.target.style.color = 'white';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                            e.target.style.color = category.color;
                          }}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download PDF
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-white" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Need Help with Forms?
            </h2>
            <p className="text-gray-600">
              Our team is here to assist you with any questions about these forms or your upcoming visit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-6 rounded-xl text-center">
              <Phone className="h-8 w-8 mx-auto mb-4" style={{ color: primaryColor }} />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Call Us</h3>
              <p className="text-gray-700 mb-4">Speak with our team directly</p>
              <a
                href={`tel:${hospitalInfo.phone}`}
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-white font-semibold transition-colors duration-200"
                style={{ backgroundColor: primaryColor }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#2196c7'}
                onMouseLeave={(e) => e.target.style.backgroundColor = primaryColor}
              >
                <Phone className="mr-2 h-5 w-5" />
                {hospitalInfo.phone}
              </a>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl text-center">
              <Heart className="h-8 w-8 mx-auto mb-4" style={{ color: primaryColor }} />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Schedule Visit</h3>
              <p className="text-gray-700 mb-4">Book your appointment online</p>
              <Link
                to="/message-us"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg border-2 font-semibold transition-colors duration-200"
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
                <Calendar className="mr-2 h-5 w-5" />
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FormsDownload;