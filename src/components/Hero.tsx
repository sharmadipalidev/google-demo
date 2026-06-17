"use client";

import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { SignInButton, useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function Hero() {
  const { isSignedIn } = useUser();
  return (
    <section className="relative min-h-[110vh] sm:min-h-[140vh] w-full flex flex-col items-center justify-start overflow-hidden bg-bg-base dark:bg-[#0a0a0a] transition-colors duration-300">
      <div className="absolute top-[10vh] sm:top-[12vh] left-0 w-full h-[95vh] sm:h-[120vh] z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-24 sm:h-32 bg-gradient-to-b from-bg-base dark:from-[#0a0a0a] to-transparent z-10 transition-colors duration-300"></div>
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-80 relative z-0"
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
            <span className="text-[#1a1a1a] dark:text-white transition-colors">Your Workspace,</span><br />
            <span className="text-[#8e8e8e] dark:text-zinc-400 transition-colors">Supercharged by AI</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mt-8 bg-white dark:bg-zinc-900 rounded-[6px] border border-black/[0.05] dark:border-white/10 p-1 pl-4 flex items-center shadow-sm w-full max-w-[400px] transition-colors"
          >
            <input
              placeholder="Enter you gmail to get started.."
              className="flex-1 bg-transparent border-none outline-none text-[#1a1a1a] dark:text-white placeholder:text-[#8e8e8e] dark:placeholder:text-zinc-500 text-sm"
            />
            {isSignedIn ? (
              <Link href="/gmail" className="bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] hover:bg-black dark:hover:bg-zinc-200 transition-colors w-9 h-9 rounded-full relative flex items-center justify-center shrink-0">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 6H11M11 6L6 1M11 6L6 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            ) : (
              <SignInButton mode="modal">
                <button className="bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] hover:bg-black dark:hover:bg-zinc-200 transition-colors w-9 h-9 rounded-full relative flex items-center justify-center shrink-0">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 6H11M11 6L6 1M11 6L6 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </SignInButton>
            )}
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="mt-8 text-lg md:text-xl text-white max-w-2xl font-sans bg-black/30 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 shadow-lg"
          >
            Manage your Gmail, schedule Google Meet events, and automate your workflow with a conversational AI agent.
          </motion.p>
        </div>
      </div>

    </section>
  );
}
