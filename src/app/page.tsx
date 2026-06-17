"use client";

import { motion } from "framer-motion";
import { useAuth } from "@clerk/nextjs";
import { Calendar, Mail, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Flow from "@/components/Flow";
import Pricing from "@/components/Pricing";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  const { isSignedIn } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  return (
    <div className="min-h-screen bg-bg-base selection:bg-brand-green selection:text-black overflow-hidden relative">
      <Navbar />
      
      <main>
        <Hero />

        {/* About Section */}
        <About />

        {/* Features Grid */}
        <div className="container mx-auto px-4 py-20 relative z-10 border-t border-black/5">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            <FeatureCard 
              icon={<Mail className="w-6 h-6 text-blue-600" />}
              title="Email Mastery"
              description="Read, compose, and organize your inbox conversationally. The AI handles the heavy lifting of drafting and sending."
              delay={0.1}
            />
            <FeatureCard 
              icon={<Calendar className="w-6 h-6 text-green-600" />}
              title="Smart Scheduling"
              description="Create events, auto-generate Google Meet links, and instantly send official invites just by asking."
              delay={0.2}
            />
            <FeatureCard 
              icon={<Zap className="w-6 h-6 text-yellow-500" />}
              title="Real-time Sync"
              description="Powered by Corsair webhooks, keeping your local database perfectly synchronized with Google's servers."
              delay={0.3}
            />
          </motion.div>
        </div>

        {/* How It Works Flow */}
        <Flow />
        
        {/* Pricing */}
        <Pricing />

        {/* Call To Action */}
        <CTA />

      </main>
      
      <Footer />
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { delay, duration: 0.5 } }
      }}
      className="flex flex-col gap-4 p-8 rounded-2xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border border-black/5 dark:border-white/5 hover:bg-white dark:hover:bg-zinc-800 transition-colors relative overflow-hidden group shadow-sm"
    >
      <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 transition-opacity duration-500 scale-150 rotate-12 pointer-events-none text-black dark:text-white">
        {icon}
      </div>
      <div className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-800 border border-black/10 dark:border-white/10 flex items-center justify-center mb-2 shadow-sm">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{title}</h3>
      <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}
