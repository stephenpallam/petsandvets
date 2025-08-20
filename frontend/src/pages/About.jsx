import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Shield, 
  Award, 
  Users,
  MapPin,
  Clock,
  Phone,
  Mail,
  CheckCircle
} from 'lucide-react';
import { hospitalInfo, team } from '../mock';

const About = () => {
  const primaryColor = '#29add3';
  const primaryLight = '#5bc0db';
  const primaryBg = '#e6f7fb';

  const values = [
    {
      icon: Heart,
      title: "Compassionate Care",
      description: "We treat every pet with the same love and attention we would give our own family members."
    },
    {
      icon: Shield,
      title: "Quality Medicine",
      description: "Using the latest medical technology and proven treatment methods for the best outcomes."
    },
    {
      icon: Users,
      title: "Collaborative Approach",
      description: "We work closely with pet owners to develop the best care plans for each individual pet."
    },
    {
      icon: Award,
      title: "Experienced Team",
      description: "Our veterinarians and staff bring years of experience and continuing education to every case."
    }
  ];

  const milestones = [
    { year: "2010", event: "Hospital Founded", description: "Started with a vision to provide affordable, quality pet care" },
    { year: "2015", event: "Facility Expansion", description: "Added modern surgical suite and diagnostic equipment" },
    { year: "2018", event: "Urgent Care Launch", description: "Introduced walk-in urgent care services 7 days a week" },
    { year: "2020", event: "Technology Upgrade", description: "Installed latest iM3 dental equipment and VETSCAN analyzers" },
    { year: "2024", event: "1000+ Happy Pets", description: "Reached milestone of caring for over 1000 local pets" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="py-8 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left">
            <div className="inline-flex items-center px-6 py-3 rounded-xl text-lg font-bold" style={{ backgroundColor: primaryBg, color: primaryColor }}>
              <Heart className="h-5 w-5 mr-3" />
              About Us
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            Our Mission
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed mb-8">
            At Pets and Vets Animal Hospital, we believe that pet care should be a collaborative effort, 
            ensuring that you and our doctors are on the same page. Our mission is to exceed your goals 
            and expectations for your pet's primary and urgent care needs, while providing quality care at affordable prices.
          </p>
          <div className="p-8 rounded-xl" style={{ backgroundColor: primaryBg }}>
            <p className="text-lg font-medium italic" style={{ color: primaryColor }}>
              "We strive to give great modern care for the modern pet at affordable prices, 
              because every pet deserves the best possible care."
            </p>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-left bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-start w-16 h-16 rounded-full mb-6" style={{ backgroundColor: primaryBg }}>
                  <value.icon className="h-8 w-8 ml-4" style={{ color: primaryColor }} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Timeline */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Journey
            </h2>
            <p className="text-xl text-gray-600">
              Building trust and excellence in veterinary care since 2010
            </p>
          </div>

          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex items-start space-x-6">
                <div className="flex-shrink-0 w-20 text-right">
                  <span className="text-2xl font-bold" style={{ color: primaryColor }}>{milestone.year}</span>
                </div>
                <div className="flex-shrink-0 w-4 h-4 rounded-full mt-2" style={{ backgroundColor: primaryColor }}></div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{milestone.event}</h3>
                  <p className="text-gray-600">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600">
              Experienced professionals dedicated to your pet's health and wellbeing
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member) => (
              <div key={member.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                  <p className="font-semibold mb-3" style={{ color: primaryColor }}>{member.role}</p>
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">{member.bio}</p>
                  <p className="text-sm text-gray-500 font-medium">{member.education}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* Contact CTA */}
      <section style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #2196c7 100%)`, paddingTop: '30px', paddingBottom: '30px' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-bold text-white mb-4" style={{ fontSize: '1rem' }}>
            Ready to Give Your Pet the Best Care?
          </h2>
          <p className="mb-8" style={{ color: 'white', fontSize: '1rem' }}>
            Contact us today to schedule an appointment or for urgent care
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
              Get Directions
              <MapPin className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;