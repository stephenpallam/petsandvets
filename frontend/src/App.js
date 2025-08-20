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
          </Routes>
        </main>
        <Footer />
        <Toaster />
      </BrowserRouter>
    </div>
  );
}

export default App;