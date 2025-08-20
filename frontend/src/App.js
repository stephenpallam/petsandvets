import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import Header from "./components/Header";
import Footer from "./components/Footer";
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
import CatDiagnosticImaging from "./pages/CatDiagnosticImaging";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
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
          </Routes>
        </main>
        <Footer />
        <Toaster />
      </BrowserRouter>
    </div>
  );
}

export default App;