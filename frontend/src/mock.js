// Mock data for Pets and Vets Animal Hospital

export const hospitalInfo = {
  name: "Pets and Vets Animal Hospital & Urgent Care",
  address: "43114 Peacock Market Plaza, Suite F110, South Riding, VA 20152",
  phone: "(703) 957-3297",
  email: "info@petsandvetsanimalhospital.com",
  tagline: "Compassionate Care for Your Beloved Pets",
  description: "We provide comprehensive veterinary care and urgent care services for dogs, cats, and exotic pets. Our modern facility offers quality care at affordable prices with a focus on collaborative pet healthcare."
};

export const hours = {
  generalPractice: {
    monday: "9:00 AM - 6:00 PM",
    tuesday: "9:00 AM - 6:00 PM", 
    wednesday: "9:00 AM - 6:00 PM",
    thursday: "Closed",
    friday: "9:00 AM - 6:00 PM",
    saturday: "9:00 AM - 5:00 PM",
    sunday: "Closed"
  },
  urgentCare: {
    everyday: "3:00 PM - 10:00 PM"
  }
};

export const services = [
  {
    id: 1,
    name: "Urgent Care",
    description: "Walk-in or by appointment urgent care services available 7 days a week from 3 PM to 10 PM.",
    icon: "stethoscope",
    details: "Non-surgical urgent care for immediate pet health concerns. No appointment necessary."
  },
  {
    id: 2,
    name: "Wellness Consultations & Vaccines",
    description: "Comprehensive exam and consultation discussing your pet's overall health with FREE vaccines as indicated.",
    icon: "heart",
    details: "Includes FREE rabies, distemper, and feline upper respiratory vaccines for established patients."
  },
  {
    id: 3,
    name: "Surgery",
    description: "Full surgery suite for routine procedures such as spays, neuters, and mass removals.",
    icon: "activity",
    details: "Modern surgical facilities with advanced equipment for safe and effective procedures."
  },
  {
    id: 4,
    name: "Diagnostics",
    description: "Blood work, x-rays, ultrasounds, and comprehensive medical workups with full lab capabilities.",
    icon: "search",
    details: "On-site diagnostic equipment including VETSCAN HM5 hematology analyzer."
  },
  {
    id: 5,
    name: "Dental Care",
    description: "Complete dental services using the latest iM3 Pro-2000 dental machine with ultra scaler.",
    icon: "smile",
    details: "Safe dental procedures to maintain your pet's oral health and prevent dental disease."
  },
  {
    id: 6,
    name: "Puppy & Kitten Care",
    description: "Specialized care for young pets with nurturing support during critical growth stages.",
    icon: "heart-handshake",
    details: "Comprehensive care plans designed specifically for puppies and kittens."
  },
  {
    id: 7,
    name: "Exotic Pet Care",
    description: "We see a wide range of exotic pets. Please call to verify if we can see your specific exotic pet.",
    icon: "bird",
    details: "Specialized care for various exotic pets with some restrictions and limitations."
  }
];

export const specialOffers = [
  {
    id: 1,
    title: "FREE First Office Visit",
    description: "New patients receive their first office visit at no charge",
    highlight: true
  },
  {
    id: 2, 
    title: "Urgent Care",
    description: "Starting at $137, with 20% discount for established patients",
    highlight: false
  },
  {
    id: 3,
    title: "FREE Vaccines",
    description: "Rabies and Distemper boosters (1- and 3-year) for established patients",
    highlight: true
  },
  {
    id: 4,
    title: "Wellness Packages",
    description: "Comprehensive care packages starting at $35.99 per month",
    highlight: false
  },
  {
    id: 5,
    title: "Dental Cleaning",
    description: "All-inclusive dental cleaning for $400.00 for mild dental disease",
    highlight: false
  },
  {
    id: 6,
    title: "Special Discounts",
    description: "10% discounts for Seniors (65+), Veterans, First Responders, and Service Animals",
    highlight: false
  }
];

export const facilityImages = [
  {
    id: 1,
    url: "https://petsandvetsanimalhospital.com/images/clinic/reception.png",
    title: "Reception Area",
    description: "Simple & elegant barn style reception area"
  },
  {
    id: 2,
    url: "https://petsandvetsanimalhospital.com/images/clinic/exam_room.png", 
    title: "Exam Room",
    description: "Clean and contemporary exam rooms"
  },
  {
    id: 3,
    url: "https://petsandvetsanimalhospital.com/images/clinic/surgery.png",
    title: "Surgery Suite",
    description: "Advanced lighting and heated surgical table"
  },
  {
    id: 4,
    url: "https://petsandvetsanimalhospital.com/images/clinic/dental.png",
    title: "Dental Equipment", 
    description: "Latest iM3 Pro-2000 dental machine"
  },
  {
    id: 5,
    url: "https://petsandvetsanimalhospital.com/images/clinic/blood_analyzers.png",
    title: "Blood Analyzers",
    description: "VETSCAN HM5 hematology analyzer"
  },
  {
    id: 6,
    url: "https://petsandvetsanimalhospital.com/images/clinic/lab.png",
    title: "Diagnostic Lab",
    description: "On-site pharmacy and diagnostic equipment"
  }
];

export const heroImages = [
  "https://customer-assets.emergentagent.com/job_peacock-pet-care/artifacts/ulwulpak_emilee.png",
  "https://customer-assets.emergentagent.com/job_peacock-pet-care/artifacts/ej59vv47_vanama.png"
];

export const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    rating: 5,
    text: "The staff at Pets and Vets are absolutely wonderful. They took such great care of my cat during her surgery and the follow-up care was exceptional.",
    petName: "Luna"
  },
  {
    id: 2,
    name: "Michael Chen", 
    rating: 5,
    text: "Quick and professional urgent care service. They saw my dog right away when he was having breathing issues. Very grateful for their expertise.",
    petName: "Max"
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    rating: 5,
    text: "Dr. Smith and the team are fantastic. They explain everything clearly and you can tell they really care about the animals. Highly recommend!",
    petName: "Bella"
  }
];

export const team = [
  {
    id: 1,
    name: "Dr. Jennifer Smith",
    role: "Lead Veterinarian",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2",
    bio: "Dr. Smith has over 15 years of experience in veterinary medicine and specializes in internal medicine and surgery.",
    education: "DVM from Virginia Tech"
  },
  {
    id: 2,
    name: "Dr. Robert Wilson", 
    role: "Emergency Care Veterinarian",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d",
    bio: "Dr. Wilson brings expertise in emergency and critical care, ensuring your pets receive immediate attention when needed.",
    education: "DVM from University of Pennsylvania"
  },
  {
    id: 3,
    name: "Lisa Thompson",
    role: "Veterinary Technician",
    image: "https://images.unsplash.com/photo-1594824956233-430a64934d13",
    bio: "Lisa is a certified veterinary technician with a passion for animal care and client education.",
    education: "CVT, Northern Virginia Community College"
  }
];

// Mock API functions
export const mockAPI = {
  // Contact form submission
  submitContactForm: async (formData) => {
    console.log('Mock: Contact form submitted:', formData);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: 'Thank you for your message. We will get back to you soon!' });
      }, 1000);
    });
  },

  // Newsletter subscription  
  subscribeNewsletter: async (email) => {
    console.log('Mock: Newsletter subscription:', email);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: 'Successfully subscribed to our newsletter!' });
      }, 800);
    });
  },

  // Request appointment
  requestAppointment: async (appointmentData) => {
    console.log('Mock: Appointment request:', appointmentData);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ 
          success: true, 
          message: 'Appointment request received. We will contact you to confirm your appointment.',
          appointmentId: 'APT-' + Math.random().toString(36).substr(2, 9)
        });
      }, 1200);
    });
  }
};