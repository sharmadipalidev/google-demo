"use client";

import { motion } from "framer-motion";
import { Link2, Sparkles, CheckCircle2 } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      icon: Link2,
      title: "1. Connect your accounts",
      description: "Securely link your Google Workspace, including Gmail and Calendar, in just a few clicks."
    },
    {
      icon: Sparkles,
      title: "2. Ask the AI Agent",
      description: "Use natural language to tell the agent what you need—like 'Schedule a meeting with John next Tuesday'."
    },
    {
      icon: CheckCircle2,
      title: "3. See it done",
      description: "Neurosync instantly executes the workflow across your apps and provides a quick confirmation."
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-bg-base relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-[#4b4b4b] font-bold tracking-widest uppercase text-sm mb-3"
          >
            How it works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-5xl font-display font-medium text-[#1a1a1a] leading-tight"
          >
            Automate your day in three steps
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-3xl p-8 border border-black/[0.05] shadow-sm relative text-center"
            >
              <motion.div 
                className="w-16 h-16 rounded-2xl bg-brand-green/10 flex items-center justify-center mx-auto mb-6 cursor-default"
                whileHover={{ scale: 1.1, rotate: index === 1 ? 0 : (index % 2 === 0 ? 8 : -8) }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: index * 0.4 }}
                >
                  <step.icon className="w-8 h-8 text-brand-green" />
                </motion.div>
              </motion.div>
              <h3 className="text-xl font-semibold text-[#1a1a1a] mb-3">{step.title}</h3>
              <p className="text-[#8e8e8e] leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
