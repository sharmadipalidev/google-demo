"use client";

import { motion } from "framer-motion";
import { SignInButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  const { isSignedIn } = useAuth();

  return (
    <section className="py-24 relative z-10">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative isolate overflow-hidden bg-[#1a1a1a] px-6 py-24 text-center shadow-2xl sm:rounded-3xl sm:px-16 border border-white/10"
        >
          {/* Subtle green glow behind */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-green/20 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-brand-green/10 blur-[100px] rounded-full pointer-events-none" />

          <h2 className="mx-auto max-w-2xl text-3xl font-display font-semibold tracking-tight text-white sm:text-4xl">
            Ready to supercharge your inbox?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
            Join the future of email management. Stop typing and start commanding your workspace with Neurosync today.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            {isSignedIn ? (
              <Link
                href="/gmail"
                className="rounded-xl bg-brand-green px-8 py-3.5 text-sm font-semibold text-[#1a1a1a] shadow-sm hover:bg-brand-green/90 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 flex items-center gap-2"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <SignInButton mode="modal">
                <button className="rounded-xl bg-brand-green px-8 py-3.5 text-sm font-semibold text-[#1a1a1a] shadow-sm hover:bg-brand-green/90 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 flex items-center gap-2">
                  Get Started for Free <ArrowRight className="w-4 h-4" />
                </button>
              </SignInButton>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
