"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth, SignInButton, UserButton } from "@clerk/nextjs";
import { Bot, Calendar, Mail, Zap, ChevronRight, ShieldCheck, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";

export default function Home() {
  const { isSignedIn } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };

  return (
    <div className="min-h-screen bg-bg-base selection:bg-brand-green selection:text-black overflow-hidden relative">
      <Navbar />
      
      <main>
        <Hero />

        <div className="container mx-auto px-4 pb-20 relative z-10">
          {/* Existing Content section below Hero */}
          <motion.div 
            className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto mt-16 mb-24"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              {isSignedIn ? (
                <Link href="/gmail" className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 font-semibold text-white bg-[#1a1a1a] rounded-xl overflow-hidden transition-transform hover:scale-[1.02] active:scale-[0.98]">
                  <span className="relative flex items-center gap-2">
                    Go to Dashboard <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              ) : (
                <SignInButton mode="modal">
                  <button className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 font-semibold text-white bg-[#1a1a1a] rounded-xl overflow-hidden transition-transform hover:scale-[1.02] active:scale-[0.98]">
                    <span className="relative flex items-center gap-2">
                      Launch AI Assistant <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </button>
                </SignInButton>
              )}
              <Link href="https://docs.corsair.dev" target="_blank" className="inline-flex items-center justify-center gap-2 px-8 py-4 font-semibold text-zinc-900 bg-white/50 border border-black/10 rounded-xl hover:bg-white transition-colors">
                Read Documentation
              </Link>
            </motion.div>
          </motion.div>

          {/* Features Grid */}
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

          {/* Security / Trust section */}
          <motion.div 
            className="mt-32 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 text-zinc-500 mb-4">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-sm font-medium tracking-wider uppercase">Enterprise Grade Security</span>
            </div>
            <p className="text-zinc-500 max-w-md mx-auto">
              Your data is securely authenticated using OAuth 2.0. We never store your emails or calendar events permanently.
            </p>
          </motion.div>
        </div>
      </main>
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
      className="flex flex-col gap-4 p-8 rounded-2xl bg-white/50 backdrop-blur-sm border border-black/5 hover:bg-white transition-colors relative overflow-hidden group shadow-sm"
    >
      <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-5 transition-opacity duration-500 scale-150 rotate-12 pointer-events-none text-black">
        {icon}
      </div>
      <div className="w-12 h-12 rounded-xl bg-white border border-black/10 flex items-center justify-center mb-2 shadow-sm">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-zinc-900">{title}</h3>
      <p className="text-zinc-600 leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}
