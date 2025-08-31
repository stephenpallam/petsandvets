import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Lock, 
  Eye,
  Users,
  FileText,
  Clock,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  CheckCircle,
  Globe,
  Database,
  UserX,
  Settings
} from 'lucide-react';
import { hospitalInfo }
import { useBusinessInfo } from '../hooks/useBusinessInfo';

const PrivacyPolicy = () => {
  const { businessInfo: currentBusinessInfo } = useBusinessInfo();
  const primaryColor = '#29add3';
  const primaryLight = '#5bc0db';
  const primaryBg = '#e6f7fb';

  const informationTypes = [
    {
      icon: Users,
      title: "Personal Information",
      items: [
        "Name, address, phone number, and email address",
        "Pet owner identification and contact details",
        "Emergency contact information"
      ]
    },
    {
      icon: FileText,
      title: "Pet Health Information",
      items: [
        "Pet health details and medical history",
        "Treatment records and service history",
        "Vaccination and medication records"
      ]
    },
    {
      icon: Lock,
      title: "Payment Information",
      items: [
        "Billing address and payment details",
        "Insurance information (when applicable)",
        "Transaction history (processed securely by third-party providers)"
      ]
    },
    {
      icon: Globe,
      title: "Website Data",
      items: [
        "IP address and browser information",
        "Website usage analytics and cookies",
        "Form submissions and communication preferences"
      ]
    }
  ];

  const dataUses = [
    {
      icon: Clock,
      title: "Appointment Management",
      description: "Schedule, confirm, and manage your pet's appointments and follow-up care"
    },
    {
      icon: FileText,
      title: "Medical Records",
      description: "Maintain comprehensive health records and share important updates about your pet's health"
    },
    {
      icon: Phone,
      title: "Communication",
      description: "Send appointment reminders, lab results, and health-related messages via SMS or email"
    },
    {
      icon: Settings,
      title: "Service Improvement",
      description: "Enhance our veterinary services, customer care, and overall patient experience"
    }
  ];

  const yourRights = [
    {
      icon: Eye,
      title: "Access Your Information",
      description: "Request to view all personal information we have collected about you and your pets"
    },
    {
      icon: Settings,
      title: "Correct Information",
      description: "Request corrections or updates to any inaccurate personal or pet health information"
    },
    {
      icon: UserX,
      title: "Opt-Out Communications",
      description: "Unsubscribe from SMS messages, emails, or marketing communications at any time"
    },
    {
      icon: Database,
      title: "Data Portability",
      description: "Request a copy of your data in a structured, commonly used format"
    },
    {
      icon: AlertCircle,
      title: "Delete Information",
      description: "Request deletion of your personal data (subject to legal and medical record requirements)"
    },
    {
      icon: Shield,
      title: "Lodge Complaints",
      description: "Contact us directly or file complaints with relevant privacy authorities"
    }
  ];

  const securityMeasures = [
    {
      title: "Data Encryption",
      description: "All sensitive data is encrypted both in transit and at rest using industry-standard protocols"
    },
    {
      title: "Access Controls",
      description: "Strict access controls ensure only authorized personnel can access your information"
    },
    {
      title: "Regular Audits",
      description: "We conduct regular security audits and assessments to maintain data protection standards"
    },
    {
      title: "Staff Training",
      description: "All staff receive regular training on privacy practices and data protection requirements"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Hero Section */}
      <section className="text-white sticky z-40 block md:hidden" style={{ top: '4rem', background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)`, paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-bold" style={{ fontSize: '1.125rem' }}>
              Privacy Policy
            </h1>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="bg-white">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{ paddingTop: '30px', paddingBottom: '15px' }}>
          <h1 className="text-xl font-bold text-gray-900 mb-6">
            Privacy Policy
          </h1>
          <div className="mb-6">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: primaryColor }}>
              Your Privacy Matters to Us
            </span>
          </div>
          <p className="text-base text-gray-600 leading-relaxed max-w-3xl mx-auto">
            At Pets and Vets Animal Hospital, we are committed to protecting your privacy and safeguarding your personal information. This Privacy Policy explains how we collect, use, protect, and share your information when you interact with our services, website, and communication systems.
          </p>
          <div className="mt-6 text-sm text-gray-500">
            <p><strong>Effective Date:</strong> January 2025</p>
            <p><strong>Last Updated:</strong> January 2025</p>
          </div>
        </div>
      </section>

      {/* Information We Collect */}
      <section style={{ backgroundColor: '#f8f9fa', paddingTop: '30px', paddingBottom: '15px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Information We Collect
          </h2>
          <p className="text-center text-gray-600 mb-8">
            We collect information to provide you with the best possible veterinary care and service:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {informationTypes.map((type, index) => {
              const Icon = type.icon;
              return (
                <div key={index} className="bg-white p-6 rounded-xl shadow-md">
                  <div className="flex items-center mb-4">
                    <Icon className="h-6 w-6 mr-3" style={{ color: primaryColor }} />
                    <h3 className="text-lg font-semibold text-gray-900">{type.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {type.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-gray-600 text-sm flex items-start">
                        <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" style={{ color: primaryColor }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How We Use Your Information */}
      <section className="bg-white" style={{ paddingTop: '15px', paddingBottom: '15px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            How We Use Your Information
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Your information helps us provide excellent veterinary care and customer service:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dataUses.map((use, index) => {
              const Icon = use.icon;
              return (
                <div key={index} className="p-6 rounded-xl border-l-4" style={{ borderColor: primaryColor, backgroundColor: primaryBg }}>
                  <div className="flex items-center mb-3">
                    <Icon className="h-5 w-5 mr-3" style={{ color: primaryColor }} />
                    <h3 className="text-lg font-semibold text-gray-900">{use.title}</h3>
                  </div>
                  <p className="text-gray-600 text-sm">{use.description}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-8 p-6 rounded-xl" style={{ backgroundColor: '#fff3cd', border: '1px solid #ffeaa7' }}>
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 mr-3 mt-0.5 text-yellow-600" />
              <div>
                <h4 className="font-semibold text-yellow-800 mb-2">Important Commitment</h4>
                <p className="text-yellow-700 text-sm">
                  <strong>We will never sell or rent your personal information to third parties.</strong> Your data is used solely to provide you with veterinary services and improve your experience with our hospital.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SMS Messaging Terms */}
      <section style={{ backgroundColor: '#f8f9fa', paddingTop: '15px', paddingBottom: '15px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            SMS Messaging Terms
          </h2>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-gray-600 mb-6">
              By providing your phone number, you consent to receive SMS messages from Pets and Vets Animal Hospital for appointment reminders and important communications.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Phone className="h-4 w-4 mr-2" style={{ color: primaryColor }} />
                  Message Frequency
                </h4>
                <p className="text-gray-600 text-sm mb-4">
                  Typically up to 4 messages per month for appointment reminders and health updates. Frequency may vary based on your pet's care needs.
                </p>
                
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" style={{ color: primaryColor }} />
                  Message & Data Rates
                </h4>
                <p className="text-gray-600 text-sm">
                  Standard carrier rates may apply. Pets and Vets Animal Hospital and carriers are not responsible for delays or undelivered messages.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <UserX className="h-4 w-4 mr-2" style={{ color: primaryColor }} />
                  Opt-Out Instructions
                </h4>
                <p className="text-gray-600 text-sm mb-4">
                  Reply <strong>STOP</strong> to any message to opt out. You will receive one final confirmation message after opting out.
                </p>
                
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Settings className="h-4 w-4 mr-2" style={{ color: primaryColor }} />
                  Help & Support
                </h4>
                <p className="text-gray-600 text-sm">
                  Reply <strong>HELP</strong> for assistance, or contact us directly using the information provided below.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Data Security */}
      <section className="bg-white" style={{ paddingTop: '15px', paddingBottom: '15px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Data Security & Protection
          </h2>
          <p className="text-center text-gray-600 mb-8">
            We implement comprehensive safeguards to protect your personal and pet health information:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {securityMeasures.map((measure, index) => (
              <div key={index} className="p-6 rounded-xl" style={{ backgroundColor: primaryBg }}>
                <h3 className="font-semibold text-gray-900 mb-3" style={{ color: primaryColor }}>
                  {measure.title}
                </h3>
                <p className="text-gray-600 text-sm">{measure.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 p-6 rounded-xl" style={{ backgroundColor: '#f8d7da', border: '1px solid #f5c6cb' }}>
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 mr-3 mt-0.5 text-red-600" />
              <div>
                <h4 className="font-semibold text-red-800 mb-2">Security Disclaimer</h4>
                <p className="text-red-700 text-sm">
                  While we implement reasonable safeguards to protect your information, no electronic transmission or storage system is 100% secure. We cannot guarantee absolute security but work continuously to maintain the highest protection standards.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Information Sharing */}
      <section style={{ backgroundColor: '#f8f9fa', paddingTop: '15px', paddingBottom: '15px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            When We Share Information
          </h2>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-gray-600 mb-6">
              We may share your information only in the following limited circumstances:
            </p>
            <div className="space-y-4">
              <div className="flex items-start p-4 rounded-lg border-l-4" style={{ borderColor: primaryColor, backgroundColor: primaryBg }}>
                <div className="flex items-center justify-center w-8 h-8 rounded-full mr-4 flex-shrink-0" style={{ backgroundColor: primaryColor }}>
                  <span className="text-white font-bold text-sm">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Legal Requirements</h4>
                  <p className="text-gray-700 text-sm">When required by law, regulation, or court order to disclose information.</p>
                </div>
              </div>
              <div className="flex items-start p-4 rounded-lg border-l-4" style={{ borderColor: primaryColor, backgroundColor: primaryBg }}>
                <div className="flex items-center justify-center w-8 h-8 rounded-full mr-4 flex-shrink-0" style={{ backgroundColor: primaryColor }}>
                  <span className="text-white font-bold text-sm">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Service Providers</h4>
                  <p className="text-gray-700 text-sm">With trusted third-party vendors (such as payment processors, laboratories, or cloud storage providers) who help us provide services, under strict confidentiality agreements.</p>
                </div>
              </div>
              <div className="flex items-start p-4 rounded-lg border-l-4" style={{ borderColor: primaryColor, backgroundColor: primaryBg }}>
                <div className="flex items-center justify-center w-8 h-8 rounded-full mr-4 flex-shrink-0" style={{ backgroundColor: primaryColor }}>
                  <span className="text-white font-bold text-sm">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Safety & Protection</h4>
                  <p className="text-gray-700 text-sm">To protect our rights, property, or safety, or that of our patients, clients, or the public.</p>
                </div>
              </div>
              <div className="flex items-start p-4 rounded-lg border-l-4" style={{ borderColor: primaryColor, backgroundColor: primaryBg }}>
                <div className="flex items-center justify-center w-8 h-8 rounded-full mr-4 flex-shrink-0" style={{ backgroundColor: primaryColor }}>
                  <span className="text-white font-bold text-sm">4</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Business Transfers</h4>
                  <p className="text-gray-700 text-sm">In the event of a merger, acquisition, or sale of our practice, your information may be transferred to the new entity (with continued protection under this policy).</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Your Privacy Rights */}
      <section className="bg-white" style={{ paddingTop: '15px', paddingBottom: '15px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Your Privacy Rights
          </h2>
          <p className="text-center text-gray-600 mb-8">
            You have important rights regarding your personal information:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {yourRights.map((right, index) => {
              const Icon = right.icon;
              return (
                <div key={index} className="bg-white p-6 rounded-xl shadow-md border" style={{ borderColor: primaryLight }}>
                  <div className="flex items-center mb-4">
                    <Icon className="h-6 w-6 mr-3" style={{ color: primaryColor }} />
                    <h3 className="text-lg font-semibold text-gray-900">{right.title}</h3>
                  </div>
                  <p className="text-gray-600 text-sm">{right.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Cookies & Website Data */}
      <section style={{ backgroundColor: '#f8f9fa', paddingTop: '15px', paddingBottom: '15px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Cookies & Website Analytics
          </h2>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-gray-600 mb-6">
              Our website uses cookies and similar technologies to improve your browsing experience and analyze website usage.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Essential Cookies</h4>
                <p className="text-gray-600 text-sm mb-4">
                  Required for basic website functionality, including session management and security features.
                </p>
                
                <h4 className="font-semibold text-gray-900 mb-3">Analytics Cookies</h4>
                <p className="text-gray-600 text-sm">
                  Help us understand how visitors use our website so we can improve the user experience.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Your Cookie Choices</h4>
                <p className="text-gray-600 text-sm mb-4">
                  You can control cookie settings through your browser preferences. Disabling certain cookies may affect website functionality.
                </p>
                
                <h4 className="font-semibold text-gray-900 mb-3">Third-Party Analytics</h4>
                <p className="text-gray-600 text-sm">
                  We may use services like Google Analytics to understand website usage patterns and improve our services.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Data Retention & Updates */}
      <section className="bg-white" style={{ paddingTop: '15px', paddingBottom: '15px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Data Retention
              </h2>
              <div className="bg-gray-50 rounded-xl p-6">
                <p className="text-gray-600 mb-4">
                  We retain your personal and pet health information for as long as necessary to:
                </p>
                <ul className="space-y-2">
                  <li className="text-gray-600 text-sm flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" style={{ color: primaryColor }} />
                    Provide ongoing veterinary care to your pets
                  </li>
                  <li className="text-gray-600 text-sm flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" style={{ color: primaryColor }} />
                    Comply with legal and professional requirements
                  </li>
                  <li className="text-gray-600 text-sm flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" style={{ color: primaryColor }} />
                    Maintain accurate medical records for future reference
                  </li>
                  <li className="text-gray-600 text-sm flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" style={{ color: primaryColor }} />
                    Resolve any disputes or legal issues
                  </li>
                </ul>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Policy Updates
              </h2>
              <div className="bg-gray-50 rounded-xl p-6">
                <p className="text-gray-600 mb-4">
                  We may update this Privacy Policy periodically to reflect:
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="text-gray-600 text-sm flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" style={{ color: primaryColor }} />
                    Changes in our practices or services
                  </li>
                  <li className="text-gray-600 text-sm flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" style={{ color: primaryColor }} />
                    New legal or regulatory requirements
                  </li>
                  <li className="text-gray-600 text-sm flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" style={{ color: primaryColor }} />
                    Improvements to our privacy protections
                  </li>
                </ul>
                <p className="text-gray-600 text-sm">
                  Updates will be posted on this page with the new effective date. We encourage you to review this policy periodically.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section style={{ backgroundColor: '#f8f9fa', paddingTop: '15px', paddingBottom: '15px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Contact Us About Privacy
          </h2>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-gray-600 mb-6 text-center">
              If you have questions about this Privacy Policy, want to exercise your privacy rights, or have concerns about your data:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-100 flex items-center justify-center">
                  <Phone className="h-6 w-6" style={{ color: primaryColor }} />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Call Us</h4>
                <a 
                  href={`tel:${currentBusinessInfo.phone}`}
                  className="text-sm transition-colors"
                  style={{ color: primaryColor }}
                  onMouseEnter={(e) => e.target.style.color = primaryLight}
                  onMouseLeave={(e) => e.target.style.color = primaryColor}
                >
                  {currentBusinessInfo.phone}
                </a>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-100 flex items-center justify-center">
                  <Mail className="h-6 w-6" style={{ color: primaryColor }} />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Email Us</h4>
                <a 
                  href={`mailto:${currentBusinessInfo.email}`}
                  className="text-sm transition-colors"
                  style={{ color: primaryColor }}
                  onMouseEnter={(e) => e.target.style.color = primaryLight}
                  onMouseLeave={(e) => e.target.style.color = primaryColor}
                >
                  {currentBusinessInfo.email}
                </a>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-100 flex items-center justify-center">
                  <MapPin className="h-6 w-6" style={{ color: primaryColor }} />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Visit Us</h4>
                <p className="text-gray-600 text-sm">
                  {currentBusinessInfo.address}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)`, paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-bold text-white mb-6" style={{ fontSize: '1rem' }}>
            Your Trust is Our Priority
          </h2>
          <p className="mb-8" style={{ color: 'white', fontSize: '1rem' }}>
            We're committed to protecting your privacy while providing excellent veterinary care for your beloved pets
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`tel:${currentBusinessInfo.phone}`}
              className="inline-flex items-center justify-center bg-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
              style={{ color: primaryColor }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
            >
              <Phone className="mr-2 h-5 w-5" />
              Questions? Call: {currentBusinessInfo.phone}
            </a>
            <Link
              to="/reach-us"
              className="inline-flex items-center justify-center border-2 border-white text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'white';
                e.target.style.color = primaryColor;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';  
                e.target.style.color = 'white';
              }}
            >
              Contact Us for Privacy Questions
              <MapPin className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;