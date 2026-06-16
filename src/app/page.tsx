"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth, SignInButton, UserButton } from "@clerk/nextjs";
import { Bot, Calendar, Mail, Zap, ChevronRight, ShieldCheck, Sparkles } from "lucide-react";

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
    <main className="min-h-screen bg-[#030303] text-white selection:bg-indigo-500/30 overflow-hidden relative">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none opacity-50 mix-blend-screen" />
      <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <Bot className="w-6 h-6 text-indigo-500" />
            <span>Corsair AI</span>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium">
            <Link href="https://docs.corsair.dev" target="_blank" className="text-white/70 hover:text-white transition-colors hidden sm:block">
              Documentation
            </Link>
            <Link href="https://github.com/corsair-dev" target="_blank" className="text-white/70 hover:text-white transition-colors font-semibold">
              GitHub
            </Link>
            {isSignedIn ? (
              <UserButton />
            ) : (
              <SignInButton mode="modal">
                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium">
                  Sign In
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 pt-32 pb-20 relative z-10">
        {/* Hero Section */}
        <motion.div 
          className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto mt-16 mb-24"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-indigo-300 font-medium mb-8 backdrop-blur-sm shadow-[0_0_15px_rgba(99,102,241,0.1)]">
            <Sparkles className="w-4 h-4" />
            <span>Introducing Corsair Workspace Assistant</span>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
            Your Workspace, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              Supercharged by AI
            </span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-xl md:text-2xl text-white/60 mb-12 max-w-2xl leading-relaxed">
            Manage your Gmail, schedule Google Meet events, and automate your workflow with a conversational AI agent.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            {isSignedIn ? (
              <Link href="/gmail" className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 font-semibold text-white bg-indigo-600 rounded-xl overflow-hidden transition-transform hover:scale-[1.02] active:scale-[0.98]">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center gap-2">
                  Go to Dashboard <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            ) : (
              <SignInButton mode="modal">
                <button className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 font-semibold text-white bg-indigo-600 rounded-xl overflow-hidden transition-transform hover:scale-[1.02] active:scale-[0.98]">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative flex items-center gap-2">
                    Launch AI Assistant <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              </SignInButton>
            )}
            <Link href="https://docs.corsair.dev" target="_blank" className="inline-flex items-center justify-center gap-2 px-8 py-4 font-semibold text-white bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
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
            icon={<Mail className="w-6 h-6 text-blue-400" />}
            title="Email Mastery"
            description="Read, compose, and organize your inbox conversationally. The AI handles the heavy lifting of drafting and sending."
            delay={0.1}
          />
          <FeatureCard 
            icon={<Calendar className="w-6 h-6 text-green-400" />}
            title="Smart Scheduling"
            description="Create events, auto-generate Google Meet links, and instantly send official invites just by asking."
            delay={0.2}
          />
          <FeatureCard 
            icon={<Zap className="w-6 h-6 text-yellow-400" />}
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
          <div className="inline-flex items-center gap-2 text-white/50 mb-4">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-sm font-medium tracking-wider uppercase">Enterprise Grade Security</span>
          </div>
          <p className="text-white/40 max-w-md mx-auto">
            Your data is securely authenticated using OAuth 2.0. We never store your emails or calendar events permanently.
          </p>
        </motion.div>
      </div>
    </main>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { delay, duration: 0.5 } }
      }}
      className="flex flex-col gap-4 p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity duration-500 scale-150 rotate-12 pointer-events-none">
        {icon}
      </div>
      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-2">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white">{title}</h3>
      <p className="text-white/60 leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}
