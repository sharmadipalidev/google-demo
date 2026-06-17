"use client";

import { motion } from "framer-motion";
import { Mail, Bot } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-[110vh] sm:min-h-[140vh] w-full flex flex-col items-center justify-start overflow-hidden bg-bg-base transition-colors duration-300">
      
      {/* Background Video Container */}
      <div className="absolute top-[10vh] sm:top-[12vh] left-0 w-full h-[95vh] sm:h-[120vh] z-0 pointer-events-none">
        {/* Expanded gradient overlay to improve text readability */}
        <div className="absolute top-0 left-0 w-full h-[40vh] sm:h-[50vh] bg-gradient-to-b from-bg-base to-transparent z-10 transition-colors duration-300"></div>
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-20 relative z-0 transition-opacity duration-300"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260603_132049_036591b8-6e92-4760-b94c-a7ea6eef315c.mp4"
        />
      </div>

      <div className="max-w-7xl w-full mx-auto px-8 md:px-16 lg:px-20 relative z-10 grid grid-cols-12 gap-x-4 md:gap-x-8 pt-[15vh] sm:pt-[18vh]">
        <div className="col-span-12 md:col-span-10 md:col-start-2 flex flex-col items-center text-center">

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.05 }}
            className="text-5xl md:text-7xl lg:text-[5.5rem] font-display font-medium leading-[1.1] tracking-tight"
          >
            <span className="text-[#1a1a1a] transition-colors">Your Workspace,</span><br />
            <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-zinc-700 to-zinc-500 transition-colors">Supercharged by AI</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mt-8 bg-black/5 backdrop-blur-xl rounded-full border border-black/10 p-1.5 pl-6 flex items-center shadow-sm w-full max-w-[420px] transition-all duration-300"
          >
            <input
              placeholder="Email address"
              className="flex-1 bg-transparent border-none outline-none text-[#1a1a1a] placeholder:text-[#4b4b4b] text-sm py-2 leading-none"
            />
            <button className="bg-white text-[#1a1a1a] font-semibold text-sm px-6 py-2.5 rounded-full shadow-sm hover:bg-gray-50 transition-colors whitespace-nowrap ml-2">
              Start now
            </button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="mt-6 text-lg md:text-xl text-[#4b4b4b] max-w-2xl font-sans"
          >
            Manage your Gmail, schedule Google Meet events, and automate your workflow with a conversational AI agent.
          </motion.p>
        </div>
      </div>

    </section>
  );
}
