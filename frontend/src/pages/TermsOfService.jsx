import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  AlertTriangle, 
  FileText,
  DollarSign,
  Clock,
  Heart,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  Scale,
  Stethoscope,
  Users,
  Building,
  AlertCircle,
  CreditCard,
  Calendar,
  UserX,
  Gavel
} from 'lucide-react';
import { hospitalInfo } from '../mock';

const TermsOfService = () => {
  const primaryColor = '#29add3';
  const primaryLight = '#5bc0db';
  const primaryBg = '#e6f7fb';

  const serviceTerms = [
    {
      icon: Stethoscope,
      title: "Veterinary Services",
      items: [
        "Professional veterinary medical services provided by licensed veterinarians",
        "Diagnostic, treatment, and preventive care services for companion animals",
        "Emergency and urgent care services during posted business hours",
        "Surgical procedures and specialized medical treatments"
      ]
    },
    {
      icon: Clock,
      title: "Service Availability",
      items: [
        "Services available during posted business hours only",
        "Emergency services by appointment or walk-in basis",
        "After-hours emergency referrals to 24-hour emergency facilities",
        "Service availability subject to veterinarian availability and hospital capacity"
      ]
    },
    {
      icon: DollarSign,
      title: "Payment Terms",
      items: [
        "Payment due at time of service unless prior arrangements made",
        "Accepted payment methods: cash, check, credit cards, CareCredit",
        "Estimates provided for major procedures and treatments",
        "Additional charges may apply for after-hours or emergency services"
      ]
    },
    {
      icon: Users,
      title: "Client Responsibilities",
      items: [
        "Provide accurate medical history and current medication information",
        "Follow prescribed treatment plans and medication instructions",
        "Notify hospital of any adverse reactions or complications",
        "Maintain current contact information and emergency contacts"
      ]
    }
  ];

  const liabilityLimitations = [
    {
      icon: AlertTriangle,
      title: "Medical Limitations",
      description: "Veterinary medicine, like human medicine, is not an exact science. Treatment outcomes cannot be guaranteed, and complications may arise despite proper care and treatment."
    },
    {
      icon: Heart,
      title: "Pet Health Risks",
      description: "All medical procedures carry inherent risks. We will discuss potential risks and benefits, but cannot guarantee specific outcomes or prevent all possible complications."
    },
    {
      icon: Clock,
      title: "Emergency Care Limitations",
      description: "Emergency care is provided based on immediate need and available resources. Referral to 24-hour emergency facilities may be necessary for continued care."
    },
    {
      icon: Shield,
      title: "Liability for Outcomes",
      description: "The hospital's liability is limited to the direct cost of services provided. We are not liable for indirect damages, loss of companionship, or emotional distress."
    }
  ];

  const emergencyProvisions = [
    "Emergency care provided in good faith during posted urgent care hours",
    "Life-threatening conditions will be stabilized before transfer if necessary",
    "Emergency treatment consent may be obtained verbally in critical situations",
    "Additional emergency charges apply for after-hours stabilization",
    "Referral to 24-hour emergency facilities when beyond our capacity",
    "No guarantee of availability for walk-in emergency cases"
  ];

  const financialPolicies = [
    {
      title: "Payment Due",
      description: "Full payment is due at the time services are rendered unless prior payment arrangements have been made."
    },
    {
      title: "Estimate Accuracy",
      description: "Treatment estimates are provided in good faith but may change based on complications or additional findings during treatment."
    },
    {
      title: "Declined Services",
      description: "Clients may decline recommended treatments, but the hospital is not liable for consequences of declined care."
    },
    {
      title: "Outstanding Balances",
      description: "Unpaid balances may be subject to collection procedures and additional fees as permitted by law."
    }
  ];

  const websiteTerms = [
    {
      icon: Globe,
      title: "Website Usage",
      items: [
        "Website content is for informational purposes only",
        "Online appointment booking subject to confirmation",
        "Website availability not guaranteed at all times",
        "User-generated content subject to moderation"
      ]
    },
    {
      icon: FileText,
      title: "Content Disclaimer",
      items: [
        "Medical information is general and not specific veterinary advice",
        "Always consult your veterinarian for specific pet health concerns",
        "Website content may not reflect current treatment protocols",
        "External links provided for convenience only"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Hero Section */}
      <section className="text-white sticky z-40 block md:hidden" style={{ top: '4rem', background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)`, paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-bold" style={{ fontSize: '1.125rem' }}>
              Terms of Service
            </h1>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="bg-white">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{ paddingTop: '30px', paddingBottom: '15px' }}>
          <h1 className="text-xl font-bold text-gray-900 mb-6">
            Terms of Service
          </h1>
          <div className="mb-6">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: primaryColor }}>
              Professional Veterinary Care Agreement
            </span>
          </div>
          <p className="text-base text-gray-600 leading-relaxed max-w-3xl mx-auto">
            These Terms of Service govern your use of our veterinary services and website. By using our services or website, you agree to be bound by these terms. Please read them carefully as they contain important information about your rights and responsibilities.
          </p>
          <div className="mt-6 text-sm text-gray-500">
            <p><strong>Effective Date:</strong> January 2025</p>
            <p><strong>Last Updated:</strong> January 2025</p>
            <p><strong>Governing Law:</strong> Commonwealth of Virginia</p>
          </div>
        </div>
      </section>

      {/* Agreement to Terms */}
      <section style={{ backgroundColor: '#f8f9fa', paddingTop: '30px', paddingBottom: '15px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Agreement to Terms
          </h2>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-start mb-4">
              <Scale className="h-6 w-6 mr-4 mt-1 flex-shrink-0" style={{ color: primaryColor }} />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Acceptance of Terms</h3>
                <p className="text-gray-600 mb-4">
                  By scheduling an appointment, receiving services, or using our website, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service, our Privacy Policy, and Accessibility Statement.
                </p>
                <p className="text-gray-600 mb-4">
                  These terms constitute a legally binding agreement between you (the pet owner/client) and Pets and Vets Animal Hospital. If you do not agree to these terms, you should not use our services.
                </p>
                <div className="p-4 rounded-lg" style={{ backgroundColor: '#fff3cd', border: '1px solid #ffeaa7' }}>
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 mr-3 mt-0.5 text-yellow-600" />
                    <p className="text-yellow-700 text-sm">
                      <strong>Important:</strong> These terms may be updated periodically. Continued use of our services constitutes acceptance of any revised terms.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Terms and Conditions */}
      <section className="bg-white" style={{ paddingTop: '15px', paddingBottom: '15px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Service Terms and Conditions
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Our veterinary services are provided under the following terms and conditions:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {serviceTerms.map((term, index) => {
              const Icon = term.icon;
              return (
                <div key={index} className="bg-white p-6 rounded-xl shadow-md border" style={{ borderColor: primaryLight }}>
                  <div className="flex items-center mb-4">
                    <Icon className="h-6 w-6 mr-3" style={{ color: primaryColor }} />
                    <h3 className="text-lg font-semibold text-gray-900">{term.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {term.items.map((item, itemIndex) => (
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

      {/* Liability Limitations */}
      <section style={{ backgroundColor: '#f8f9fa', paddingTop: '15px', paddingBottom: '15px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Liability Limitations and Medical Disclaimers
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Important limitations on liability and responsibility for veterinary care outcomes:
          </p>
          <div className="space-y-6">
            {liabilityLimitations.map((limitation, index) => {
              const Icon = limitation.icon;
              return (
                <div key={index} className="bg-white p-6 rounded-xl shadow-md">
                  <div className="flex items-start">
                    <Icon className="h-6 w-6 mr-4 mt-1 flex-shrink-0" style={{ color: primaryColor }} />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">{limitation.title}</h3>
                      <p className="text-gray-600">{limitation.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-8 p-6 rounded-xl" style={{ backgroundColor: '#f8d7da', border: '1px solid #f5c6cb' }}>
            <div className="flex items-start">
              <AlertTriangle className="h-6 w-6 mr-4 mt-1 flex-shrink-0 text-red-600" />
              <div>
                <h4 className="font-semibold text-red-800 mb-3">Important Medical Disclaimer</h4>
                <p className="text-red-700 text-sm mb-3">
                  <strong>No Guarantees:</strong> We cannot and do not guarantee the success of any treatment, procedure, or outcome. Veterinary medicine involves inherent uncertainties, and individual patient responses may vary.
                </p>
                <p className="text-red-700 text-sm">
                  <strong>Limitation of Damages:</strong> Our liability for any claim arising from veterinary services is limited to the amount paid for those specific services. We are not liable for consequential, incidental, or special damages.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Care Provisions */}
      <section className="bg-white" style={{ paddingTop: '15px', paddingBottom: '15px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Emergency Care Provisions
          </h2>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <Heart className="h-6 w-6 mr-3" style={{ color: primaryColor }} />
              <h3 className="text-lg font-semibold text-gray-900">Emergency and Urgent Care Terms</h3>
            </div>
            <div className="space-y-4">
              {emergencyProvisions.map((provision, index) => (
                <div key={index} className="flex items-start p-4 rounded-lg border-l-4" style={{ borderColor: primaryColor, backgroundColor: primaryBg }}>
                  <div className="flex items-center justify-center w-6 h-6 rounded-full mr-4 flex-shrink-0" style={{ backgroundColor: primaryColor }}>
                    <span className="text-white font-bold text-xs">{index + 1}</span>
                  </div>
                  <p className="text-gray-700 text-sm">{provision}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: '#d1ecf1', border: '1px solid #bee5eb' }}>
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 mr-3 mt-0.5" style={{ color: primaryColor }} />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Virginia Emergency Care Protection</h4>
                  <p className="text-gray-700 text-sm">
                    Under Virginia Code § 8.01-225, veterinarians providing emergency care in good faith are granted liability protection for emergency treatment rendered without compensation at the scene of an emergency.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Financial Policies */}
      <section style={{ backgroundColor: '#f8f9fa', paddingTop: '15px', paddingBottom: '15px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Financial Policies and Payment Terms
          </h2>
          <div className="space-y-4">
            {financialPolicies.map((policy, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-start">
                  <CreditCard className="h-6 w-6 mr-4 mt-1 flex-shrink-0" style={{ color: primaryColor }} />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{policy.title}</h3>
                    <p className="text-gray-600 text-sm">{policy.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign className="h-5 w-5 mr-3" style={{ color: primaryColor }} />
              Additional Financial Terms
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start">
                  <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" style={{ color: primaryColor }} />
                  <span className="text-gray-600 text-sm">Payment plans available for major procedures (approval required)</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" style={{ color: primaryColor }} />
                  <span className="text-gray-600 text-sm">CareCredit accepted for qualified applicants</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" style={{ color: primaryColor }} />
                  <span className="text-gray-600 text-sm">Insurance claim assistance provided when requested</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start">
                  <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" style={{ color: primaryColor }} />
                  <span className="text-gray-600 text-sm">Returned check fees apply as permitted by law</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" style={{ color: primaryColor }} />
                  <span className="text-gray-600 text-sm">Collection costs may be added to unpaid balances</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" style={{ color: primaryColor }} />
                  <span className="text-gray-600 text-sm">Senior citizen and military discounts available</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Website Terms */}
      <section className="bg-white" style={{ paddingTop: '15px', paddingBottom: '15px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Website Usage Terms
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Terms governing the use of our website and online services:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {websiteTerms.map((term, index) => {
              const Icon = term.icon;
              return (
                <div key={index} className="p-6 rounded-xl" style={{ backgroundColor: primaryBg }}>
                  <div className="flex items-center mb-4">
                    <Icon className="h-6 w-6 mr-3" style={{ color: primaryColor }} />
                    <h3 className="text-lg font-semibold text-gray-900">{term.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {term.items.map((item, itemIndex) => (
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

      {/* Legal Jurisdiction */}
      <section style={{ backgroundColor: '#f8f9fa', paddingTop: '15px', paddingBottom: '15px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Legal Jurisdiction and Dispute Resolution
          </h2>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="space-y-6">
              <div className="flex items-start">
                <Gavel className="h-6 w-6 mr-4 mt-1 flex-shrink-0" style={{ color: primaryColor }} />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Governing Law</h3>
                  <p className="text-gray-600 mb-4">
                    These Terms of Service are governed by the laws of the Commonwealth of Virginia, without regard to conflict of law principles. Any legal action or proceeding relating to these terms shall be brought exclusively in the courts of Virginia.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Users className="h-6 w-6 mr-4 mt-1 flex-shrink-0" style={{ color: primaryColor }} />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Dispute Resolution</h3>
                  <p className="text-gray-600 mb-4">
                    We encourage clients to contact us directly to resolve any concerns. For formal disputes, we prefer mediation through a mutually agreed-upon mediator before pursuing litigation.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" style={{ color: primaryColor }} />
                      <span className="text-gray-600 text-sm">Direct communication preferred for resolution</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" style={{ color: primaryColor }} />
                      <span className="text-gray-600 text-sm">Mediation available through Virginia Bar Association</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" style={{ color: primaryColor }} />
                      <span className="text-gray-600 text-sm">Jurisdiction limited to Virginia state and federal courts</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start">
                <UserX className="h-6 w-6 mr-4 mt-1 flex-shrink-0" style={{ color: primaryColor }} />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Termination of Services</h3>
                  <p className="text-gray-600 text-sm">
                    Either party may terminate the veterinary-client relationship with reasonable notice. The hospital reserves the right to terminate services for non-payment, non-compliance with treatment recommendations, or inappropriate behavior. Medical records will be transferred as required by law.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="bg-white" style={{ paddingTop: '15px', paddingBottom: '15px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Questions About These Terms
          </h2>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-gray-600 mb-6 text-center">
              If you have questions about these Terms of Service or need clarification on any provisions:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-100 flex items-center justify-center">
                  <Phone className="h-6 w-6" style={{ color: primaryColor }} />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Call Us</h4>
                <a 
                  href={`tel:${hospitalInfo.phone}`}
                  className="text-sm transition-colors"
                  style={{ color: primaryColor }}
                  onMouseEnter={(e) => e.target.style.color = primaryLight}
                  onMouseLeave={(e) => e.target.style.color = primaryColor}
                >
                  {hospitalInfo.phone}
                </a>
                <p className="text-xs text-gray-500 mt-1">Speak with our team</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-100 flex items-center justify-center">
                  <Mail className="h-6 w-6" style={{ color: primaryColor }} />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Email Us</h4>
                <a 
                  href={`mailto:${hospitalInfo.email}`}
                  className="text-sm transition-colors"
                  style={{ color: primaryColor }}
                  onMouseEnter={(e) => e.target.style.color = primaryLight}
                  onMouseLeave={(e) => e.target.style.color = primaryColor}
                >
                  {hospitalInfo.email}
                </a>
                <p className="text-xs text-gray-500 mt-1">Written inquiries</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-100 flex items-center justify-center">
                  <MapPin className="h-6 w-6" style={{ color: primaryColor }} />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Visit Us</h4>
                <p className="text-gray-600 text-sm">
                  {hospitalInfo.address}
                </p>
                <p className="text-xs text-gray-500 mt-1">In-person consultation</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Acknowledgment */}
      <section style={{ backgroundColor: '#f8f9fa', paddingTop: '15px', paddingBottom: '15px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Terms Acknowledgment</h3>
            <p className="text-gray-600 mb-4 text-center">
              By using our services, you acknowledge that you have read and understood these Terms of Service, along with our 
              <Link to="/privacy-policy" className="mx-1 underline" style={{ color: primaryColor }}>Privacy Policy</Link>
              and
              <Link to="/accessibility" className="mx-1 underline" style={{ color: primaryColor }}>Accessibility Statement</Link>.
            </p>
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#d1ecf1', border: '1px solid #bee5eb' }}>
              <div className="flex items-center justify-center">
                <Building className="h-5 w-5 mr-3" style={{ color: primaryColor }} />
                <p className="text-gray-700 text-sm text-center">
                  <strong>Pets and Vets Animal Hospital</strong> - Licensed veterinary practice serving Northern Virginia since 2020
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
            Professional Veterinary Care You Can Trust
          </h2>
          <p className="mb-8" style={{ color: 'white', fontSize: '1rem' }}>
            Our terms ensure transparent, professional veterinary care for your beloved pets
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`tel:${hospitalInfo.phone}`}
              className="inline-flex items-center justify-center bg-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
              style={{ color: primaryColor }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
            >
              <Phone className="mr-2 h-5 w-5" />
              Schedule Today: {hospitalInfo.phone}
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
              Contact Us for Questions
              <MapPin className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TermsOfService;