"use client";

import { motion } from "framer-motion";
import { Mail, Calendar, Sparkles, Workflow, Zap, Shield } from "lucide-react";

const features = [
  {
    icon: Mail,
    title: "Smart Email Triage",
    description: "Automatically sort, prioritize, and draft responses to your daily emails.",
  },
  {
    icon: Calendar,
    title: "Automated Scheduling",
    description: "Connect your Google Calendar and let AI find the perfect time for your meetings.",
  },
  {
    icon: Sparkles,
    title: "Contextual AI Agent",
    description: "An AI that understands the context of your work and suggests next steps.",
  },
  {
    icon: Workflow,
    title: "Seamless Workflows",
    description: "Chain together multiple actions across apps with simple natural language.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Built for speed. Execute complex tasks in milliseconds without switching tabs.",
  },
  {
    icon: Shield,
    title: "Secure by Design",
    description: "Your data is yours. Enterprise-grade security keeps your workspace safe.",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function Features() {
  return (
    <section id="features" className="py-24 bg-bg-base relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-[#4b4b4b] font-bold tracking-widest uppercase text-sm mb-3"
          >
            Platform Features
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-5xl font-display font-medium text-[#1a1a1a] leading-tight"
          >
            Everything you need to work faster
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 text-[#8e8e8e] text-lg max-w-2xl mx-auto"
          >
            neurosync acts as your personal AI operator, handling the busywork so you can focus on what matters.
          </motion.p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={item}
              whileHover={{ y: -5 }}
              className="bg-white/50 backdrop-blur-xl p-8 rounded-2xl border border-white/60 shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-black/[0.04] flex items-center justify-center mb-6 border border-black/[0.05]">
                <feature.icon className="w-6 h-6 text-[#1a1a1a]" />
              </div>
              <h3 className="text-xl font-semibold text-[#1a1a1a] mb-3">{feature.title}</h3>
              <p className="text-[#8e8e8e] leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
