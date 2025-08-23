import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CreditCard, 
  Shield, 
  CheckCircle,
  Clock,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Heart,
  Star,
  ExternalLink,
  Banknote,
  Wallet,
  Users
} from 'lucide-react';
import { hospitalInfo } from '../mock';

const PetInsurancePayments = () => {
  const primaryColor = '#29add3';
  const primaryLight = '#5bc0db';
  const primaryBg = '#e6f7fb';

  const paymentMethods = [
    {
      method: "Credit Cards",
      description: "Visa, MasterCard, Discover, and American Express",
      icon: CreditCard,
      color: "#10b981"
    },
    {
      method: "Cash & Checks",
      description: "Cash and personal checks accepted with valid ID",
      icon: Banknote,
      color: "#3b82f6"
    },
    {
      method: "Pet Insurance",
      description: "Direct payment with reimbursement from your provider",
      icon: Shield,
      color: "#8b5cf6"
    },
    {
      method: "CareCredit",
      description: "Healthcare financing with flexible payment options",
      icon: Wallet,
      color: "#f59e0b"
    }
  ];

  const insuranceProviders = [
    {
      name: "Trupanion",
      description: "Comprehensive coverage with direct pay options",
      url: "https://trupanion.com/",
      color: "#10b981"
    },
    {
      name: "Nationwide Pet Insurance",
      description: "Trusted nationwide coverage for pets",
      url: "https://www.petinsurance.com/",
      color: "#3b82f6"
    },
    {
      name: "Pet Care Insurance",
      description: "Affordable pet insurance plans",
      url: "https://www.petcareinsurance.com/",
      color: "#8b5cf6"
    },
    {
      name: "24 Pet Watch",
      description: "24/7 pet insurance and wellness plans",
      url: "https://www.24petwatch.com/",
      color: "#ef4444"
    }
  ];

  const careCreditBenefits = [
    {
      benefit: "Low Monthly Payments",
      description: "Spread larger expenses over manageable monthly payments",
      icon: DollarSign
    },
    {
      benefit: "Interest-Free Options",
      description: "6-month interest-free financing available for qualifying purchases",
      icon: Clock
    },
    {
      benefit: "Fast Approval",
      description: "Quick approval process with no annual fee required",
      icon: CheckCircle
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${primaryBg} 0%, #ffffff 50%, #f0fdff 100%)` }}>
        <div className="absolute inset-0 bg-white/40"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{ paddingTop: '30px', paddingBottom: '15px' }}>
          <h1 className="text-xl font-bold text-gray-900 mb-6">
            Insurance & Payments
          </h1>
          <div className="mb-6">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: primaryColor }}>
              Flexible Options for Every Pet Family
            </span>
          </div>
          <p className="text-base text-gray-600 leading-relaxed max-w-3xl mx-auto">
            At Pets and Vets Animal Hospital, we believe quality veterinary care should be accessible. That's why we offer multiple payment options and financial solutions to fit your budget.
          </p>
        </div>
      </section>

      {/* Payment Methods */}
      <section className="bg-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Methods</h2>
            <p className="text-gray-600">Payment is required at the time of service. We accept:</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paymentMethods.map((method, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl">
                <div className="flex items-center mb-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full mr-4" style={{ backgroundColor: `${method.color}15` }}>
                    <method.icon className="h-6 w-6" style={{ color: method.color }} />
                  </div>
                  <h3 className="font-semibold text-gray-900">{method.method}</h3>
                </div>
                <p className="text-sm text-gray-600">{method.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pet Insurance */}
      <section style={{ backgroundColor: '#f8f9fa', paddingTop: '30px', paddingBottom: '15px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Pet Insurance</h2>
            <p className="text-gray-600 max-w-3xl mx-auto mb-6">
              Pet insurance helps cover unexpected illness or injury costs. You pay at the time of service, and your insurance provider reimburses you later. When choosing a plan, consider monthly premiums, coverage for pre-existing or hereditary conditions, reimbursement limits, and preventive care options.
            </p>
            <p className="text-gray-700 font-medium mb-8">
              We recommend exploring trusted providers such as:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {insuranceProviders.map((provider, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">{provider.name}</h3>
                  <div className="flex items-center justify-center w-8 h-8 rounded-full" style={{ backgroundColor: `${provider.color}15` }}>
                    <Shield className="h-4 w-4" style={{ color: provider.color }} />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">{provider.description}</p>
                <a
                  href={provider.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm font-semibold transition-colors hover:opacity-80"
                  style={{ color: provider.color }}
                >
                  Visit Website <ExternalLink className="ml-1 h-4 w-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CareCredit */}
      <section style={{ backgroundColor: '#f8f9fa', paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">CareCredit</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              For larger expenses, CareCredit offers a simple way to spread costs over time with:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {careCreditBenefits.map((item, index) => (
              <div key={index} className="bg-white p-6 rounded-xl text-center shadow-md">
                <div className="flex items-center justify-center w-16 h-16 rounded-full mb-4 mx-auto" style={{ backgroundColor: '#f59e0b15' }}>
                  <item.icon className="h-8 w-8" style={{ color: '#f59e0b' }} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-3">{item.benefit}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center mb-4">
              <Heart className="h-6 w-6 mr-3" style={{ color: '#f59e0b' }} />
              <h3 className="text-lg font-semibold text-gray-900">What CareCredit Covers</h3>
            </div>
            <p className="text-gray-600 mb-4">
              CareCredit can be used for exams, surgeries, dental care, medications, parasite prevention, vaccinations, and more.
            </p>
            <a
              href="https://www.carecredit.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center font-semibold transition-colors hover:opacity-80"
              style={{ color: '#f59e0b' }}
            >
              Learn more at CareCredit.com <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section style={{ backgroundColor: primaryColor, paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <Users className="h-8 w-8 text-white mr-3" />
            <h2 className="font-bold text-white" style={{ fontSize: '1rem' }}>
              We're Here to Help
            </h2>
          </div>
          <p className="text-blue-100 mb-8" style={{ fontSize: '1rem' }}>
            If you have any questions about payment, insurance, or financing, call us at {hospitalInfo.phone}. We'll help you find the best solution for your pet's care.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href={`tel:${hospitalInfo.phone}`}
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Phone className="mr-2 h-5 w-5" />
              Call {hospitalInfo.phone}
            </a>
            <Link
              to="/reach-us"
              className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-gray-900 transition-colors"
            >
              <MapPin className="mr-2 h-5 w-5" />
              Visit Our Location
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PetInsurancePayments;