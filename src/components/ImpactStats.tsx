"use client";

import { motion } from "framer-motion";

export default function ImpactStats() {
  const stats = [
    {
      value: "< 60s",
      label: "Google Workspace setup time"
    },
    {
      value: "3x",
      label: "Faster calendar scheduling"
    },
    {
      value: "10+",
      label: "Hours saved every week"
    },
    {
      value: "24/7",
      label: "AI agent availability"
    }
  ];

  return (
    <section className="py-24 bg-bg-base relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-[#4b4b4b] font-bold tracking-widest uppercase text-sm mb-3"
          >
            Measurable Impact
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl font-display font-medium text-[#1a1a1a] leading-tight tracking-tight mb-5"
          >
            Automate your workspace instantly
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-[#8e8e8e] text-lg max-w-2xl mx-auto leading-relaxed"
          >
            No complex setup or workflows to memorize. Connect your Google account in seconds and start delegating your busywork right away.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/30 shadow-lg overflow-hidden relative"
        >
          {/* Optional subtle glow inside the glass card */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
          <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-black/[0.05]">
            {stats.map((stat, index) => (
              <div key={index} className="px-6 py-10 md:py-12 text-center flex flex-col items-center justify-center">
                <div className="text-4xl md:text-5xl font-display font-medium text-[#1a1a1a] tracking-tight mb-3">
                  {stat.value}
                </div>
                <div className="text-sm text-[#8e8e8e] leading-relaxed max-w-[180px]">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
        
      </div>
    </section>
  );
}
