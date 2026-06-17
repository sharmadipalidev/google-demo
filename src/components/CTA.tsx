"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useAuth, SignInButton } from "@clerk/nextjs";

export default function CTA() {
  const { isSignedIn } = useAuth();

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden transition-colors">
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <div className="w-full h-full bg-[#1a1a1a] dark:bg-black transition-colors"></div>
        <div className="absolute w-[800px] h-[800px] bg-brand-green/20 rounded-full blur-[120px] opacity-50 pointer-events-none"></div>
      </div>
      
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-3xl"
        >
          <h2 className="text-4xl font-display font-bold tracking-tight text-white sm:text-6xl transition-colors">
            Ready to reclaim your time?
          </h2>
          <p className="mt-6 text-lg leading-8 text-zinc-300 transition-colors">
            Join thousands of professionals who have automated their inbox and calendar using the power of Neurosync AI.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            {isSignedIn ? (
              <Link
                href="/gmail"
                className="rounded-full bg-brand-green px-8 py-4 text-sm font-semibold text-[#1a1a1a] shadow-sm hover:bg-[#8ade00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green transition-all hover:scale-105 flex items-center gap-2"
              >
                Go to Dashboard <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <SignInButton mode="modal">
                <button className="rounded-full bg-brand-green px-8 py-4 text-sm font-semibold text-[#1a1a1a] shadow-sm hover:bg-[#8ade00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green transition-all hover:scale-105 flex items-center gap-2">
                  Get Started for Free <ChevronRight className="w-4 h-4" />
                </button>
              </SignInButton>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
