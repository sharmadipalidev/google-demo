"use client";

import { motion } from "framer-motion";
import { Sparkles, Bot, ShieldCheck } from "lucide-react";

export default function About() {
  return (
    <section id="about" className="py-24 sm:py-32 relative z-10 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Side: Typography */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-display font-semibold tracking-tight text-[#1a1a1a] dark:text-zinc-100 sm:text-5xl mb-6">
              Why Neurosync?
            </h2>
            <p className="text-lg leading-8 text-[#8e8e8e] dark:text-zinc-400 mb-6">
              We believe your inbox shouldn't be a source of stress. Neurosync leverages state-of-the-art AI to transform your daily communication and scheduling into a seamless, conversational experience.
            </p>
            <p className="text-lg leading-8 text-[#8e8e8e] dark:text-zinc-400">
              Stop switching context between your calendar, email, and task manager. Simply tell Neurosync what you want to achieve, and watch it orchestrate your workflow in real-time.
            </p>
          </motion.div>

          {/* Right Side: Staggered Cards */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-green/20 to-transparent blur-3xl rounded-full" />
            
            <div className="grid gap-6 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl p-6 border border-black/5 dark:border-white/5 shadow-sm ml-0 lg:ml-12"
              >
                <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] dark:bg-zinc-800 text-brand-green flex items-center justify-center mb-4">
                  <Bot size={20} />
                </div>
                <h3 className="text-lg font-semibold text-[#1a1a1a] dark:text-zinc-100 mb-2">Conversational AI Agent</h3>
                <p className="text-[#8e8e8e] dark:text-zinc-400 text-sm leading-relaxed">
                  Talk to your inbox like a personal assistant. Ask to summarize threads or draft complex replies instantly.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-[#1a1a1a] dark:bg-zinc-800 rounded-2xl p-6 border border-white/10 shadow-xl mr-0 lg:mr-12"
              >
                <div className="w-10 h-10 rounded-xl bg-white/10 dark:bg-white/5 text-brand-green flex items-center justify-center mb-4">
                  <Sparkles size={20} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Smart Workflows</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Automatically schedule Google Meets, send invites, and manage follow-ups without leaving the chat.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl p-6 border border-black/5 dark:border-white/5 shadow-sm ml-0 lg:ml-12"
              >
                <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] dark:bg-zinc-800 text-brand-green flex items-center justify-center mb-4">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="text-lg font-semibold text-[#1a1a1a] dark:text-zinc-100 mb-2">Enterprise-Grade Security</h3>
                <p className="text-[#8e8e8e] dark:text-zinc-400 text-sm leading-relaxed">
                  Your data is protected. We use secure OAuth connections and never store your sensitive emails unnecessarily.
                </p>
              </motion.div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
