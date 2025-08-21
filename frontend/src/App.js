import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
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
import OurMission from "./pages/OurMission";
import OurCoreValues from "./pages/OurCoreValues";
import OurTeam from "./pages/OurTeam";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
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
            <Route path="/pet-spay-neuter" element={<PetSpayNeuter />} />
            <Route path="/pet-bladder-stone-removal" element={<PetBladderStoneRemoval />} />
            <Route path="/blocked-cats-urgent-care" element={<BlockedCatsUrgentCare />} />
            <Route path="/foreign-body-surgery" element={<ForeignBodySurgery />} />
            <Route path="/soft-tissue-surgeries" element={<SoftTissueSurgeries />} />
            <Route path="/urgent-care" element={<UrgentCare />} />
            <Route path="/end-of-life-care" element={<EndOfLifeCare />} />
            <Route path="/pet-microchipping" element={<PetMicrochipping />} />
            <Route path="/on-site-pharmacy" element={<OnSitePharmacy />} />
            <Route path="/our-mission" element={<OurMission />} />
            <Route path="/our-core-values" element={<OurCoreValues />} />
            <Route path="/our-team" element={<OurTeam />} />
          </Routes>
        </main>
        <Footer />
        <Toaster />
      </BrowserRouter>
    </div>
  );
}

export default App;