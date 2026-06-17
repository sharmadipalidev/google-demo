"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAuth, SignInButton } from "@clerk/nextjs";
import { ChevronRight } from "lucide-react";


export default function Navbar() {
 const [isOpen, setIsOpen] = useState(false);
 const { isSignedIn } = useAuth();



 return (
 <nav className="fixed top-0 left-0 w-full z-50 py-6 md:py-10 bg-gradient-to-b from-[#f1f1f1]/80 to-transparent backdrop-blur-[2px]">
 <div className="grid grid-cols-12 max-w-7xl mx-auto px-6 items-center">
 {/* Left: Logo (Cols 1-3) */}
 <div className="col-span-8 md:col-span-3 flex items-center gap-2 z-50 relative">
 <svg
 width="24"
 height="24"
 viewBox="0 0 24 24"
 fill="none"
 xmlns="http://www.w3.org/2000/svg"
 className="text-[#1a1a1a] "
 >
 <path
 d="M12 2C10.3431 2 9 3.34315 9 5C9 6.65685 10.3431 8 12 8C13.6569 8 15 6.65685 15 5C15 3.34315 13.6569 2 12 2Z"
 fill="currentColor"
 />
 <path
 d="M12 16C10.3431 16 9 17.3431 9 19C9 20.6569 10.3431 22 12 22C13.6569 22 15 20.6569 15 19C15 17.3431 13.6569 16 12 16Z"
 fill="currentColor"
 />
 <path
 d="M5 9C3.34315 9 2 10.3431 2 12C2 13.6569 3.34315 15 5 15C6.65685 15 8 13.6569 8 12C8 10.3431 6.65685 9 5 9Z"
 fill="currentColor"
 />
 <path
 d="M19 9C17.3431 9 16 10.3431 16 12C16 13.6569 17.3431 15 19 15C20.6569 15 22 13.6569 22 12C22 10.3431 20.6569 9 19 9Z"
 fill="currentColor"
 />
 <circle cx="12" cy="12" r="2" fill="currentColor" />
 </svg>
 <span className="font-display font-semibold text-xl text-[#1a1a1a] tracking-tight">
 neurosync
 </span>
 </div>



 <div className="hidden md:flex col-span-9 justify-end items-center gap-4">
 {isSignedIn ? (
 <Link
 href="/gmail"
 className="bg-[#1a1a1a] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-black transition-colors flex items-center gap-1 shadow-sm"
 >
 Get Started <ChevronRight className="w-4 h-4" />
 </Link>
 ) : (
 <SignInButton mode="modal">
 <button className="bg-[#1a1a1a] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-black transition-colors flex items-center gap-1 shadow-sm">
 Go to Dashboard <ChevronRight className="w-4 h-4" />
 </button>
 </SignInButton>
 )}

 </div>

 {/* Mobile Toggle */}
 <div className="col-span-4 md:hidden flex justify-end items-center z-50 relative">
 <button
 onClick={() => setIsOpen(!isOpen)}
 className="w-10 h-10 flex flex-col justify-center items-center gap-1.5 focus:outline-none"
 >
 <motion.span
 animate={isOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
 className="w-6 h-[2px] bg-[#1a1a1a] block transition-transform"
 />
 <motion.span
 animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
 className="w-6 h-[2px] bg-[#1a1a1a] block transition-opacity"
 />
 <motion.span
 animate={isOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
 className="w-6 h-[2px] bg-[#1a1a1a] block transition-transform"
 />
 </button>
 </div>
 </div>

 {/* Mobile Menu */}
 <AnimatePresence>
 {isOpen && (
 <motion.div
 initial={{ opacity: 0, y: -20 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -20 }}
 className="absolute top-0 left-0 w-full h-screen bg-[#f1f1f1] flex flex-col items-center justify-center gap-8 z-40"
 >
 <div className="absolute top-8 right-6">

 </div>

 <div className="flex flex-col gap-4 mt-8 w-64">
 {isSignedIn ? (
 <Link
 href="/gmail"
 onClick={() => setIsOpen(false)}
 className="bg-[#1a1a1a] text-white px-6 py-4 rounded-xl text-lg font-semibold hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-sm w-full"
 >
 Go to Dashboard <ChevronRight className="w-5 h-5" />
 </Link>
 ) : (
 <SignInButton mode="modal">
 <button onClick={() => setIsOpen(false)} className="bg-[#1a1a1a] text-white px-6 py-4 rounded-xl text-lg font-semibold hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-sm w-full">
 Go to Dashboard <ChevronRight className="w-5 h-5" />
 </button>
 </SignInButton>
 )}
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </nav>
 );
}
