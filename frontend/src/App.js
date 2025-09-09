import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import { AuthProvider } from "./contexts/AuthContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import Services from "./pages/Services";
import About from "./pages/About";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import DogDentalCare from "./pages/DogDentalCare";
import CatDentalCare from "./pages/CatDentalCare";
import DogSkinCare from "./pages/DogSkinCare";
import DogEyeCare from "./pages/DogEyeCare";
import DogVaccinations from "./pages/DogVaccinations";
import DogWellnessExams from "./pages/DogWellnessExams";
import DogDietNutrition from "./pages/DogDietNutrition";
import DogSurgeries from "./pages/DogSurgeries";
import CatVaccinations from "./pages/CatVaccinations";
import UltrasoundExams from "./pages/UltrasoundExams";
import PetVaccinations from "./pages/PetVaccinations";
import PreventivePetCare from "./pages/PreventivePetCare";
import VeterinaryDiagnosticServices from "./pages/VeterinaryDiagnosticServices";
import PetDermatologyAllergyCare from "./pages/PetDermatologyAllergyCare";
import DigitalVeterinaryXRays from "./pages/DigitalVeterinaryXRays";
import DentalCleanings from "./pages/DentalCleanings";
import PetToothExtraction from "./pages/PetToothExtraction";
import PetOcularServices from "./pages/PetOcularServices";
import CatDiagnosticImaging from "./pages/CatDiagnosticImaging";
import PetSpayNeuter from "./pages/PetSpayNeuter";
import PetBladderStoneRemoval from "./pages/PetBladderStoneRemoval";
import BlockedCatsUrgentCare from "./pages/BlockedCatsUrgentCare";
import ForeignBodySurgery from "./pages/ForeignBodySurgery";
import SoftTissueSurgeries from "./pages/SoftTissueSurgeries";
import UrgentCare from "./pages/UrgentCare";
import EndOfLifeCare from "./pages/EndOfLifeCare";
import PetMicrochipping from "./pages/PetMicrochipping";
import OnSitePharmacy from "./pages/OnSitePharmacy";
import PetTravelCertificates from "./pages/PetTravelCertificates";
import PetInsurancePayments from "./pages/PetInsurancePayments";
import YourFirstVisit from "./pages/YourFirstVisit";
import OurMission from "./pages/OurMission";
import OurCoreValues from "./pages/OurCoreValues";
import OurTeam from "./pages/OurTeam";
import ReachUs from "./pages/ReachUs";
import ReviewUs from "./pages/ReviewUs";
import OurHours from "./pages/OurHours";
import MessageUs from "./pages/MessageUs";
import ConfigureHours from "./pages/ConfigureHours";
import RegisterPage from "./pages/RegisterPage";
import UserManagement from "./pages/UserManagement";
import NewPatientRegistration from "./pages/forms/NewPatientRegistration";
import PatientDropOff from "./pages/forms/PatientDropOff";
import SurgeryAnesthesiaConsent from "./pages/forms/SurgeryAnesthesiaConsent";
import DentalConsent from "./pages/forms/DentalConsent";
import RequestPetRecords from "./pages/forms/RequestPetRecords";

import FormsDownload from "./pages/forms/FormsDownload";
import UrgentCareBooking from "./pages/UrgentCareBooking";
import UrgentCareAppointments from "./pages/UrgentCareAppointments";
import PatientRegistrationPDF from "./pages/forms/PatientRegistrationPDF";
import Reviews from "./pages/Reviews";
import BusinessInfo from "./pages/BusinessInfo";
import EmailConfiguration from "./pages/EmailConfiguration";
import SMSConfiguration from "./pages/SMSConfiguration";
import PhotoManagement from "./pages/PhotoManagement";
import LoginPage from "./pages/LoginPage";
import GoogleIntegration from "./pages/GoogleIntegration";
import LoadingDemo from "./pages/LoadingDemo";
import GoogleCallback from "./pages/GoogleCallback";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import AccessibilityStatement from "./pages/AccessibilityStatement";
import TermsOfService from "./pages/TermsOfService";
import AIAgentsDashboard from "./pages/AIAgentsDashboard";
import AIAgentConfig from "./pages/AIAgentConfig";
import AIReadyToPublish from "./pages/AIReadyToPublish";
import AIPublishedPosts from "./pages/AIPublishedPosts";
import AIInReview from "./pages/AIInReview";
import AISettings from "./pages/AISettings";
import AICosts from "./pages/AICosts";
import TimesheetClockInOut from "./pages/TimesheetClockInOut";
import TimesheetManagement from "./pages/TimesheetManagement";
import TimesheetConfiguration from "./pages/TimesheetConfiguration";
import TimesheetReportView from "./pages/TimesheetReportView";
import TimesheetHoursAdjustment from "./pages/TimesheetHoursAdjustment";
import EmployeeManagement from "./pages/EmployeeManagement";
import EmployeeProfile from "./pages/EmployeeProfile";
import EditEmployeeProfile from "./pages/EditEmployeeProfile";
import Customers from "./pages/Customers";
import CMSSettings from "./pages/CMSSettings";
import HolidayManagement from "./pages/HolidayManagement";
import SchedulingCalendar from "./pages/SchedulingCalendar";

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function AppContent() {
  const location = useLocation();

  useEffect(() => {
    console.log('Current route:', location.pathname);
    console.log('Full location:', location);
  }, [location]);

  return (
    <>
      <ScrollToTop />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/about" element={<About />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/dog-dental-care" element={<DogDentalCare />} />
          <Route path="/cat-dental-care" element={<CatDentalCare />} />
          <Route path="/dog-skin-care" element={<DogSkinCare />} />
          <Route path="/dog-eye-care" element={<DogEyeCare />} />
          <Route path="/dog-vaccinations" element={<DogVaccinations />} />
          <Route path="/dog-wellness-exams" element={<DogWellnessExams />} />
          <Route path="/dog-diet-nutrition" element={<DogDietNutrition />} />
          <Route path="/dog-surgeries" element={<DogSurgeries />} />
          <Route path="/cat-diagnostic-imaging" element={<CatDiagnosticImaging />} />
          <Route path="/cat-vaccinations" element={<CatVaccinations />} />
          <Route path="/ultrasound-exams" element={<UltrasoundExams />} />
          <Route path="/pet-vaccinations" element={<PetVaccinations />} />
          <Route path="/preventive-pet-care" element={<PreventivePetCare />} />
          <Route path="/veterinary-diagnostic-services" element={<VeterinaryDiagnosticServices />} />
          <Route path="/pet-dermatology-allergy-care" element={<PetDermatologyAllergyCare />} />
          <Route path="/digital-veterinary-x-rays" element={<DigitalVeterinaryXRays />} />
          <Route path="/dental-cleanings" element={<DentalCleanings />} />
          <Route path="/pet-tooth-extraction" element={<PetToothExtraction />} />
          <Route path="/pet-ocular-services" element={<PetOcularServices />} />
          <Route path="/pet-microchipping" element={<PetMicrochipping />} />
          <Route path="/pet-insurance-payments" element={<PetInsurancePayments />} />
          <Route path="/pet-travel-certificates" element={<PetTravelCertificates />} />
          <Route path="/on-site-pharmacy" element={<OnSitePharmacy />} />
          <Route path="/end-of-life-care" element={<EndOfLifeCare />} />
          <Route path="/pet-spay-neuter" element={<PetSpayNeuter />} />
          <Route path="/pet-bladder-stone-removal" element={<PetBladderStoneRemoval />} />
          <Route path="/blocked-cats-urgent-care" element={<BlockedCatsUrgentCare />} />
          <Route path="/foreign-body-surgery" element={<ForeignBodySurgery />} />
          <Route path="/soft-tissue-surgeries" element={<SoftTissueSurgeries />} />
          <Route path="/urgent-care" element={<UrgentCare />} />
          <Route path="/urgent-care-appointments" element={<UrgentCareAppointments />} />
          <Route path="/urgent-care-booking" element={<UrgentCareBooking />} />
          <Route path="/our-hours" element={<OurHours />} />
          <Route path="/configure-hours" element={<ConfigureHours />} />
          <Route path="/timesheet-clock" element={<TimesheetClockInOut />} />
          <Route path="/timesheet-management" element={<TimesheetManagement />} />
          <Route path="/timesheet-configuration" element={<TimesheetConfiguration />} />
          <Route path="/timesheet-report/:postId" element={<TimesheetReportView />} />
          <Route path="/timesheet-hours-adjustment/:postId" element={<TimesheetHoursAdjustment />} />
          <Route path="/employee-management" element={<EmployeeManagement />} />
          <Route path="/employee-profile/:user_id" element={<EmployeeProfile />} />
          <Route path="/edit-employee/:user_id" element={<EditEmployeeProfile />} />
          <Route path="/customer-management" element={<Customers />} />
          <Route path="/cms-settings" element={<CMSSettings />} />
          <Route path="/holiday-management" element={<HolidayManagement />} />
          <Route path="/scheduling-calendar" element={<SchedulingCalendar />} />
          <Route path="/business-info" element={<BusinessInfo />} />
          <Route path="/message-us" element={<MessageUs />} />
          <Route path="/reach-us" element={<ReachUs />} />
          <Route path="/review-us" element={<ReviewUs />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/our-mission" element={<OurMission />} />
          <Route path="/our-team" element={<OurTeam />} />
          <Route path="/our-core-values" element={<OurCoreValues />} />
          <Route path="/photo-management" element={<PhotoManagement />} />
          <Route path="/forms-download" element={<FormsDownload />} />
          <Route path="/email-configuration" element={<EmailConfiguration />} />
          <Route path="/sms-configuration" element={<SMSConfiguration />} />
          <Route path="/your-first-visit" element={<YourFirstVisit />} />
          <Route path="/forms/new-client-form" element={<NewPatientRegistration />} />
          <Route path="/forms/new-patient-registration" element={<NewPatientRegistration />} />
          <Route path="/forms/patient-drop-off" element={<PatientDropOff />} />
          <Route path="/forms/surgery-anesthesia-consent" element={<SurgeryAnesthesiaConsent />} />
          <Route path="/forms/dental-consent" element={<DentalConsent />} />
          <Route path="/forms/authorization-form" element={<SurgeryAnesthesiaConsent />} />
          <Route path="/forms/boarding-agreement" element={<PatientDropOff />} />
          <Route path="/forms/request-pet-records" element={<RequestPetRecords />} />
          <Route path="/forms/pre-surgical-checklist" element={<SurgeryAnesthesiaConsent />} />
          <Route path="/forms/new-patient-form" element={<NewPatientRegistration />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/user-management" element={<UserManagement />} />
          <Route path="/google/callback" element={<GoogleCallback />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/accessibility-statement" element={<AccessibilityStatement />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/ai-agent-config" element={<AIAgentConfig />} />
          <Route path="/ai-ready-to-publish" element={<AIReadyToPublish />} />
          <Route path="/ai-published-posts" element={<AIPublishedPosts />} />
          <Route path="/ai-in-review" element={<AIInReview />} />
          <Route path="/ai-settings" element={<AISettings />} />
          <Route path="/ai-costs" element={<AICosts />} />
          <Route path="/ai-agents-dashboard" element={<AIAgentsDashboard />} />

          <Route path="/loading-demo" element={<LoadingDemo />} />
        </Routes>
      </main>
      <Footer />
      <Toaster />
    </>
  );
}

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;