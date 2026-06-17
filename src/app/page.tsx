"use client";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import DashboardShowcase from "@/components/DashboardShowcase";
import AgentDescription from "@/components/AgentDescription";
import Features from "@/components/Features";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-bg-base selection:bg-brand-green selection:text-black font-sans antialiased">
      <Navbar />
      <main>
        <Hero />
        <DashboardShowcase />
        <AgentDescription />
        <Features />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
