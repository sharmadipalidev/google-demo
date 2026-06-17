"use client";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Flow from "@/components/Flow";
import Pricing from "@/components/Pricing";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-bg-base dark:bg-[#0a0a0a] selection:bg-brand-green selection:text-black overflow-hidden relative transition-colors duration-300">
      <Navbar />
      
      <main>
        <Hero />
        <About />
        <Flow />
        <Pricing />
        <CTA />
      </main>
      
      <Footer />
    </div>
  );
}
