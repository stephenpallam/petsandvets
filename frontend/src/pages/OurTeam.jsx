import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users,
  MapPin,
  Phone,
  Award,
  Heart,
  Star,
  GraduationCap,
  Stethoscope
} from 'lucide-react';
import { hospitalInfo, team } from '../mock';

const OurTeam = () => {
  const primaryColor = '#29add3';
  const primaryLight = '#5bc0db';
  const primaryBg = '#e6f7fb';

  const teamHighlights = [
    {
      title: "Licensed Veterinarians",
      description: "Board-certified professionals with extensive training and experience",
      icon: Stethoscope,
      color: "#10b981"
    },
    {
      title: "Continuing Education",
      description: "Our team stays current with the latest veterinary advances and techniques",
      icon: GraduationCap,
      color: "#3b82f6"
    },
    {
      title: "Compassionate Care",
      description: "Every team member is dedicated to treating your pet with love and respect",
      icon: Heart,
      color: "#ef4444"
    },
    {
      title: "Years of Experience",
      description: "Collectively, our team brings decades of veterinary expertise to every case",
      icon: Award,
      color: "#f59e0b"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{ paddingTop: '30px', paddingBottom: '15px' }}>
          <h1 className="text-xl font-bold text-gray-900 mb-6">
            Our Team
          </h1>
          <div className="mb-6">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: primaryColor }}>
              Professional • Caring • Experienced • Dedicated
            </span>
          </div>
          <p className="text-base text-gray-600 leading-relaxed max-w-3xl mx-auto">
            Get to know the dedicated individuals who make up our veterinary family
          </p>
        </div>
      </section>

      {/* Team Members */}
      <section className="bg-[#f8f9fa] py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-8 text-center">
            Meet Our Veterinary Professionals
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.map((member) => (
              <div key={member.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{member.name}</h3>
                  <p className="font-semibold mb-3 text-sm" style={{ color: primaryColor }}>{member.role}</p>
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">{member.bio}</p>
                  <div className="flex items-center">
                    <GraduationCap className="h-4 w-4 mr-2" style={{ color: primaryColor }} />
                    <p className="text-xs text-gray-500 font-medium">{member.education}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Highlights */}
      <section className="bg-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              What Makes Our Team Special
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Our veterinary team combines professional expertise with genuine compassion for animals and their families
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamHighlights.map((highlight, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-4" style={{ backgroundColor: `${highlight.color}15` }}>
                  <highlight.icon className="h-8 w-8" style={{ color: highlight.color }} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{highlight.title}</h3>
                <p className="text-gray-700 text-sm leading-relaxed">{highlight.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Philosophy */}
      <section className="bg-white" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-8 rounded-xl border-l-4" style={{ borderColor: primaryColor }}>
            <div className="flex items-center mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full mr-4" style={{ backgroundColor: '#f8f9fa' }}>
                <Heart className="h-6 w-6" style={{ color: primaryColor }} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Our Team Philosophy</h3>
            </div>
            <p className="text-gray-800 leading-relaxed mb-4">
              At Pets & Vets Animal Hospital, we believe that great veterinary care comes from a team that genuinely cares 
              about both pets and their families. Our professionals don't just bring medical expertise—they bring empathy, 
              understanding, and a commitment to making every visit as comfortable as possible for you and your pet.
            </p>
            <div className="flex items-center">
              <Star className="h-5 w-5 mr-2" style={{ color: primaryColor }} />
              <span className="text-gray-800 font-medium">Professional • Caring • Experienced • Dedicated</span>
            </div>
          </div>
        </div>
      </section>

      {/* Join Our Team */}
      <section style={{ backgroundColor: '#f8f9fa', paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Interested in Joining Our Team?
          </h2>
          <p className="text-gray-700 mb-6">
            We're always looking for passionate veterinary professionals who share our commitment to exceptional pet care
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
            style={{ backgroundColor: primaryColor, color: 'white' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#2196c7'}
            onMouseLeave={(e) => e.target.style.backgroundColor = primaryColor}
          >
            Contact Us About Opportunities
          </Link>
        </div>
      </section>

      {/* Contact CTA */}
      <section style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)`, paddingTop: '40px', paddingBottom: '40px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-bold text-white mb-4 text-xl">
            Ready to Meet Our Team?
          </h2>
          <p className="mb-8 text-white text-lg">
            Schedule an appointment and experience the difference our caring team makes
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`tel:${hospitalInfo.phone}`}
              className="inline-flex items-center justify-center bg-white px-8 py-4 rounded-lg font-semibold transition-colors duration-200"
              style={{ color: primaryColor }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
            >
              <Phone className="mr-2 h-5 w-5" />
              Call Now: {hospitalInfo.phone}
            </a>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center border-2 border-white text-white px-8 py-4 rounded-lg font-semibold transition-colors duration-200"
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'white';
                e.target.style.color = primaryColor;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';  
                e.target.style.color = 'white';
              }}
            >
              Schedule Visit
              <MapPin className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OurTeam;