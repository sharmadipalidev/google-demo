"use client";

import { motion } from "framer-motion";
import { Link2, MessageSquareText, Zap } from "lucide-react";

const steps = [
  {
    id: 1,
    title: "Connect Account",
    description: "Securely link your Google account to grant Neurosync access to your Gmail and Calendar with zero hassle.",
    icon: <Link2 className="w-6 h-6" />,
  },
  {
    id: 2,
    title: "Ask Neurosync",
    description: "Simply type what you need. 'Draft a polite decline to John' or 'Set up a 30m sync with Sarah tomorrow'.",
    icon: <MessageSquareText className="w-6 h-6" />,
  },
  {
    id: 3,
    title: "Instant Execution",
    description: "The AI agent parses your request, interacts directly with Google's APIs, and confirms the action instantly.",
    icon: <Zap className="w-6 h-6" />,
  },
];

export default function Flow() {
  return (
    <section id="flow" className="py-24 sm:py-32 relative z-10 bg-white/30 dark:bg-black/30 backdrop-blur-md border-y border-black/5 dark:border-white/5">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-display font-semibold tracking-tight text-[#1a1a1a] dark:text-white sm:text-5xl"
          >
            How it works
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-lg leading-8 text-[#8e8e8e] dark:text-zinc-400"
          >
            A simple 3-step process to reclaim hours of your work week.
          </motion.p>
        </div>

        <div className="relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-[2px] bg-gradient-to-r from-transparent via-[#1a1a1a]/10 dark:via-white/10 to-transparent" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {steps.map((step, idx) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: idx * 0.2 }}
                className="relative flex flex-col items-center text-center group"
              >
                <div className="w-24 h-24 bg-white dark:bg-zinc-800 rounded-3xl border border-black/5 dark:border-white/5 flex items-center justify-center shadow-sm mb-6 relative z-10 group-hover:scale-105 transition-transform duration-300">
                  <div className="w-16 h-16 bg-[#1a1a1a] dark:bg-black rounded-2xl flex items-center justify-center text-brand-green">
                    {step.icon}
                  </div>
                  {/* Step number badge */}
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-brand-green text-[#1a1a1a] font-bold flex items-center justify-center shadow-md">
                    {step.id}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-[#1a1a1a] dark:text-white mb-3">{step.title}</h3>
                <p className="text-[#8e8e8e] dark:text-zinc-400 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
