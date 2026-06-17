"use client";

import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative min-h-[110vh] sm:min-h-[140vh] w-full flex flex-col items-center justify-start overflow-hidden bg-bg-base">
      <div className="absolute top-[10vh] sm:top-[12vh] left-0 w-full h-[95vh] sm:h-[120vh] z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-24 sm:h-32 bg-gradient-to-b from-bg-base to-transparent z-10"></div>
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="w-full h-full object-cover opacity-100 relative z-0" 
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260603_132049_036591b8-6e92-4760-b94c-a7ea6eef315c.mp4"
        />
      </div>

      <div className="max-w-7xl w-full mx-auto px-8 md:px-16 lg:px-20 relative z-10 grid grid-cols-12 gap-x-4 md:gap-x-8 pt-[15vh] sm:pt-[18vh]">
        <div className="col-span-12 md:col-span-10 md:col-start-2 flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/40 border border-black/10 text-sm text-[#1a1a1a] font-medium mb-6 shadow-sm backdrop-blur-sm"
          >
            <Sparkles className="w-4 h-4 text-[#8e8e8e]" />
            <span>Introducing Corsair Workspace Assistant</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.05 }}
            className="text-5xl md:text-7xl lg:text-[5.5rem] font-display font-medium leading-[1.1] tracking-tight"
          >
            <span className="text-[#1a1a1a]">Your Workspace,</span><br />
            <span className="text-[#8e8e8e]">Supercharged by AI</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mt-8 text-lg md:text-xl text-[#8e8e8e] max-w-2xl font-sans"
          >
            Manage your Gmail, schedule Google Meet events, and automate your workflow with a conversational AI agent.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.15 }}
            className="mt-12 bg-white rounded-[6px] border border-black/[0.05] p-1 pl-4 flex items-center shadow-sm w-full max-w-[400px]"
          >
            <input 
              placeholder="Ask me anything..." 
              className="flex-1 bg-transparent border-none outline-none text-[#1a1a1a] placeholder:text-[#8e8e8e] text-sm"
            />
            <button className="bg-[#1a1a1a] text-white w-9 h-9 rounded-full relative flex items-center justify-center shrink-0">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 6H11M11 6L6 1M11 6L6 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </motion.div>
        </div>
      </div>

      <div className="absolute right-8 md:right-16 top-1/2 -translate-y-1/2 z-20">
        <div className="bg-white/40 backdrop-blur-md rounded-full flex flex-col text-xs font-medium text-[#1a1a1a] p-1 border border-black/10 shadow-sm gap-1">
          <button className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">en</button>
          <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors">pl</button>
        </div>
      </div>

      <div className="absolute bottom-8 left-8 md:left-16 z-20 text-[#1a1a1a] text-xs font-medium">
        2024
      </div>
      
      <div className="absolute bottom-8 right-8 md:right-16 z-20 text-[#1a1a1a] text-xs font-medium lowercase">
        mental health tools
      </div>
    </section>
  );
}
