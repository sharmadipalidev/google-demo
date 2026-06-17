"use client";

import { motion } from "framer-motion";
import { Mic, ArrowRight, Zap } from "lucide-react";

export default function Flow() {
  const steps = [
    {
      icon: <Mic className="w-6 h-6 text-brand-green" />,
      title: "1. Speak or Type",
      description: "Ask the agent to schedule a meeting, summarize an email thread, or find a document.",
    },
    {
      icon: <Zap className="w-6 h-6 text-brand-green" />,
      title: "2. AI Processing",
      description: "Neurosync understands the context and uses Corsair tools to interface with Google APIs securely.",
    },
    {
      icon: <ArrowRight className="w-6 h-6 text-brand-green" />,
      title: "3. Instant Execution",
      description: "The event is created, the draft is prepared, and your UI updates in real-time.",
    },
  ];

  return (
    <section className="py-24 sm:py-32 bg-white/30 dark:bg-zinc-900/30 backdrop-blur-md border-y border-black/5 dark:border-white/5 transition-colors">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-display font-semibold tracking-tight text-[#1a1a1a] dark:text-white sm:text-5xl transition-colors">
            How it works
          </h2>
          <p className="mt-4 text-lg leading-8 text-[#8e8e8e] dark:text-zinc-400 transition-colors">
            Three simple steps to automate your daily Google Workspace tasks.
          </p>
        </div>
        
        <div className="mx-auto mt-16 max-w-5xl sm:mt-20">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {steps.map((step, idx) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.2 }}
                className="relative flex flex-col items-center text-center p-8 rounded-3xl bg-white dark:bg-zinc-800 shadow-sm border border-black/5 dark:border-white/5 transition-colors"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1a1a1a] dark:bg-zinc-900 shadow-lg mb-6 transition-colors">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold leading-7 text-[#1a1a1a] dark:text-white transition-colors">
                  {step.title}
                </h3>
                <p className="mt-3 text-base leading-7 text-[#8e8e8e] dark:text-zinc-400 transition-colors">
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
