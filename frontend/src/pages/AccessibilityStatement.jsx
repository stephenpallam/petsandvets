import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Users, 
  Eye,
  Keyboard,
  Volume2,
  Monitor,
  Heart,
  CheckCircle,
  Globe,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  Settings,
  FileText,
  Headphones,
  MousePointer
} from 'lucide-react';
import { hospitalInfo }
import { useBusinessInfo } from '../mock';

const AccessibilityStatement = () => {
  const { businessInfo: currentBusinessInfo } = useBusinessInfo();
  const primaryColor = '#29add3';
  const primaryLight = '#5bc0db';
  const primaryBg = '#e6f7fb';

  const accessibilityFeatures = [
    {
      icon: Eye,
      title: "Visual Accessibility",
      items: [
        "High contrast color schemes for better readability",
        "Alternative text descriptions for all images and graphics",
        "Scalable fonts that work with browser zoom functions",
        "Clear visual indicators for interactive elements"
      ]
    },
    {
      icon: Keyboard,
      title: "Keyboard Navigation",
      items: [
        "Full keyboard accessibility for all interactive elements",
        "Logical tab order throughout all pages",
        "Visible focus indicators for keyboard navigation",
        "Skip navigation links for faster content access"
      ]
    },
    {
      icon: Volume2,
      title: "Audio & Video Support",
      items: [
        "Captions and transcripts for video content",
        "Audio descriptions where applicable",
        "Text alternatives for audio information",
        "Volume controls for multimedia content"
      ]
    },
    {
      icon: Monitor,
      title: "Screen Reader Compatible",
      items: [
        "Semantic HTML structure for assistive technologies",
        "Proper heading hierarchy and page structure",
        "Descriptive link text and button labels",
        "Form field labels and error messages"
      ]
    }
  ];

  const improvementAreas = [
    {
      icon: FileText,
      title: "Improving Site Structure",
      description: "We're continuously editing our pages to include appropriate headings, lists, paragraphs, and formatting for better usability with assistive technology."
    },
    {
      icon: Eye,
      title: "Adding Text Equivalents",
      description: "We're adding alternative text, captions, and transcripts to images and videos so users who can't see or hear have a text equivalent to interact with."
    },
    {
      icon: Keyboard,
      title: "Building for Full Keyboard Access",
      description: "We are developing new pages with keyboard accessibility in mind so that users can easily tab through a page to find the content they need."
    },
    {
      icon: Globe,
      title: "Creating Site Consistency",
      description: "We are creating templates for our site to ensure consistency. Once you're familiar with how our pages and menus work, you can expect similar functionality across the site."
    },
    {
      icon: Settings,
      title: "Mobile Accessibility",
      description: "We're ensuring our mobile experience is fully accessible with proper touch targets, gesture alternatives, and responsive design."
    },
    {
      icon: Heart,
      title: "Pet Care Information Access",
      description: "We're making sure all pet health information, appointment booking, and emergency care details are accessible to all pet owners."
    }
  ];

  const assistiveTechnologies = [
    "Screen readers (NVDA, JAWS, VoiceOver)",
    "Voice recognition software",
    "Keyboard navigation tools",
    "Screen magnification software",
    "High contrast display modes",
    "Mobile accessibility features"
  ];

  const wcagCompliance = [
    {
      level: "WCAG 2.2 Level AA",
      description: "We strive to meet the Web Content Accessibility Guidelines (WCAG) 2.2 Level AA standards"
    },
    {
      level: "Section 508",
      description: "Our website aims to comply with Section 508 of the Rehabilitation Act"
    },
    {
      level: "ADA Compliance",
      description: "We work to meet the Americans with Disabilities Act (ADA) accessibility requirements"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Hero Section */}
      <section className="text-white sticky z-40 block md:hidden" style={{ top: '4rem', background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)`, paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-bold" style={{ fontSize: '1.125rem' }}>
              Accessibility Statement
            </h1>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="bg-white">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{ paddingTop: '30px', paddingBottom: '15px' }}>
          <h1 className="text-xl font-bold text-gray-900 mb-6">
            Accessibility Statement
          </h1>
          <div className="mb-6">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: primaryColor }}>
              Accessible Care for All Pet Families
            </span>
          </div>
          <p className="text-base text-gray-600 leading-relaxed max-w-3xl mx-auto">
            At Pets and Vets Animal Hospital, we are committed to ensuring that our website is accessible to all users, including those with disabilities. We believe that every pet owner should have equal access to information about veterinary care, appointment booking, and pet health resources.
          </p>
          <div className="mt-6 text-sm text-gray-500">
            <p><strong>Last Updated:</strong> January 2025</p>
            <p><strong>WCAG Compliance Level:</strong> AA (In Progress)</p>
          </div>
        </div>
      </section>

      {/* Our Commitment */}
      <section style={{ backgroundColor: '#f8f9fa', paddingTop: '30px', paddingBottom: '15px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Our Commitment to Accessibility
          </h2>
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-start mb-4">
              <Heart className="h-6 w-6 mr-4 mt-1 flex-shrink-0" style={{ color: primaryColor }} />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Accessibility, Diversity, and Inclusion</h3>
                <p className="text-gray-600 mb-4">
                  At Pets and Vets Animal Hospital, accessibility, diversity, and inclusion are important values that affect everything we do. Whether you use a screen reader, voice recognition software, or another kind of assistive technology, we want to be accessible to you and easy to navigate.
                </p>
                <p className="text-gray-600">
                  We are actively taking steps to further enhance and improve the accessibility of our website. If you have difficulty using or accessing any element of this website, please contact us through our contact form, call, or email, and we will work with you to provide the information, item, or transaction you seek through a communication method that is accessible for you, consistent with applicable law.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Accessibility Features */}
      <section className="bg-white" style={{ paddingTop: '15px', paddingBottom: '15px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Accessibility Features We Provide
          </h2>
          <p className="text-center text-gray-600 mb-8">
            We've implemented various accessibility features to ensure our website works with assistive technologies:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {accessibilityFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white p-6 rounded-xl shadow-md border" style={{ borderColor: primaryLight }}>
                  <div className="flex items-center mb-4">
                    <Icon className="h-6 w-6 mr-3" style={{ color: primaryColor }} />
                    <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {feature.items.map((item, itemIndex) => (
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

      {/* Standards Compliance */}
      <section style={{ backgroundColor: '#f8f9fa', paddingTop: '15px', paddingBottom: '15px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Accessibility Standards We Follow
          </h2>
          <div className="space-y-4">
            {wcagCompliance.map((standard, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-start">
                  <Shield className="h-6 w-6 mr-4 mt-1 flex-shrink-0" style={{ color: primaryColor }} />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{standard.level}</h3>
                    <p className="text-gray-600">{standard.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Headphones className="h-5 w-5 mr-3" style={{ color: primaryColor }} />
              Compatible Assistive Technologies
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assistiveTechnologies.map((tech, index) => (
                <div key={index} className="flex items-center p-3 rounded-lg" style={{ backgroundColor: primaryBg }}>
                  <CheckCircle className="h-4 w-4 mr-3 flex-shrink-0" style={{ color: primaryColor }} />
                  <span className="text-gray-700 text-sm">{tech}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Ongoing Improvements */}
      <section className="bg-white" style={{ paddingTop: '15px', paddingBottom: '15px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            How Our Site Has Changed and Is Changing
          </h2>
          <p className="text-center text-gray-600 mb-8">
            We set our web accessibility standards high and are working to achieve them. Here are some of the things we've done and are continuing to do:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {improvementAreas.map((area, index) => {
              const Icon = area.icon;
              return (
                <div key={index} className="p-6 rounded-xl" style={{ backgroundColor: primaryBg }}>
                  <div className="flex items-center mb-4">
                    <Icon className="h-6 w-6 mr-3" style={{ color: primaryColor }} />
                    <h3 className="text-lg font-semibold text-gray-900">{area.title}</h3>
                  </div>
                  <p className="text-gray-600 text-sm">{area.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Veterinary-Specific Accessibility */}
      <section style={{ backgroundColor: '#f8f9fa', paddingTop: '15px', paddingBottom: '15px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Pet Care Accessibility Features
          </h2>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-gray-600 mb-6">
              We understand that accessing veterinary care information is crucial for pet health. Our accessibility features include:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <MousePointer className="h-4 w-4 mr-2" style={{ color: primaryColor }} />
                  Easy Appointment Booking
                </h4>
                <ul className="space-y-2">
                  <li className="text-gray-600 text-sm flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" style={{ color: primaryColor }} />
                    Keyboard-accessible appointment forms
                  </li>
                  <li className="text-gray-600 text-sm flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" style={{ color: primaryColor }} />
                    Clear form labels and error messages
                  </li>
                  <li className="text-gray-600 text-sm flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" style={{ color: primaryColor }} />
                    Multiple contact methods for assistance
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Heart className="h-4 w-4 mr-2" style={{ color: primaryColor }} />
                  Emergency Care Access
                </h4>
                <ul className="space-y-2">
                  <li className="text-gray-600 text-sm flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" style={{ color: primaryColor }} />
                    Clearly marked urgent care information
                  </li>
                  <li className="text-gray-600 text-sm flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" style={{ color: primaryColor }} />
                    Emergency contact numbers easy to find
                  </li>
                  <li className="text-gray-600 text-sm flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" style={{ color: primaryColor }} />
                    High contrast emergency alert sections
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feedback and Contact */}
      <section className="bg-white" style={{ paddingTop: '15px', paddingBottom: '15px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Accessibility Feedback & Support
          </h2>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-gray-600 mb-6 text-center">
              We welcome your feedback on the accessibility of our website. If you encounter any barriers or have suggestions for improvement:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
                <p className="text-xs text-gray-500 mt-1">For immediate accessibility assistance</p>
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
                <p className="text-xs text-gray-500 mt-1">For accessibility feedback</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-100 flex items-center justify-center">
                  <MapPin className="h-6 w-6" style={{ color: primaryColor }} />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Visit Us</h4>
                <Link 
                  to="/reach-us"
                  className="text-sm transition-colors"
                  style={{ color: primaryColor }}
                  onMouseEnter={(e) => e.target.style.color = primaryLight}
                  onMouseLeave={(e) => e.target.style.color = primaryColor}
                >
                  Contact Form
                </Link>
                <p className="text-xs text-gray-500 mt-1">Submit accessibility concerns</p>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <h4 className="font-semibold text-gray-900 mb-3">Our Response Commitment</h4>
              <p className="text-gray-600 text-sm mb-4">
                We aim to respond to accessibility feedback within 3 business days. We will work with you to provide the information, service, or transaction you seek through a communication method that is accessible for you, consistent with applicable law.
              </p>
              <div className="p-4 rounded-lg" style={{ backgroundColor: '#fff3cd', border: '1px solid #ffeaa7' }}>
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 mr-3 mt-0.5 text-yellow-600" />
                  <div>
                    <p className="text-yellow-700 text-sm">
                      <strong>Alternative Access:</strong> If you cannot access any information or service on our website, please call us at {currentBusinessInfo.phone} or email us at {currentBusinessInfo.email} for immediate assistance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Legal Disclaimer */}
      <section style={{ backgroundColor: '#f8f9fa', paddingTop: '15px', paddingBottom: '15px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Accessibility Disclaimer
          </h2>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-gray-600 mb-4">
              By visiting our website, you explicitly accept and agree to this accessibility statement, along with our 
              <Link to="/privacy-policy" className="mx-1 underline" style={{ color: primaryColor }}>Privacy Policy</Link>
              and Terms of Service described on our website.
            </p>
            <p className="text-gray-600 mb-4">
              By using this website, you acknowledge that we take accessibility matters seriously and work to provide all information, items, transactions, or services you seek through a communication method that is accessible for you, consistent with applicable law.
            </p>
            <p className="text-gray-600 text-sm">
              While we strive to ensure our website meets accessibility standards, if you experience any difficulties accessing our content or services, please contact us immediately so we can provide alternative access methods or direct assistance.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)`, paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-bold text-white mb-6" style={{ fontSize: '1rem' }}>
            Accessible Pet Care for Everyone
          </h2>
          <p className="mb-8" style={{ color: 'white', fontSize: '1rem' }}>
            We're committed to ensuring all pet families can access our services and information easily
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
              Need Help? Call: {currentBusinessInfo.phone}
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
              Contact Us for Accessibility Support
              <MapPin className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AccessibilityStatement;