"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const tiers = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for individuals looking to explore basic AI workflows.",
    features: [
      "Smart Email Triage",
      "Basic Calendar Integration",
      "Up to 50 AI queries/month",
      "Standard Support",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "For power users who need advanced automation and unlimited access.",
    features: [
      "Everything in Starter",
      "Unlimited AI queries",
      "Advanced Multi-app Workflows",
      "Priority Support",
      "Custom AI Context",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For teams requiring secure, scalable, and custom AI solutions.",
    features: [
      "Everything in Pro",
      "Enterprise-grade Security",
      "Dedicated Account Manager",
      "Custom API Integrations",
      "Team Analytics",
    ],
    cta: "Contact Sales",
    highlighted: false,
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
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-bg-base relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-[#4b4b4b] font-bold tracking-widest uppercase text-sm mb-3"
          >
            Pricing
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-5xl font-display font-medium text-[#1a1a1a] leading-tight"
          >
            Simple, transparent pricing
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 text-[#8e8e8e] text-lg max-w-2xl mx-auto"
          >
            Choose the plan that best fits your workflow needs. No hidden fees.
          </motion.p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center"
        >
          {tiers.map((tier, index) => (
            <motion.div
              key={index}
              variants={item}
              className={`relative backdrop-blur-xl rounded-3xl p-8 border ${
                tier.highlighted
                  ? "bg-[#1a1a1a] border-[#2a2a2a] shadow-2xl md:scale-105 z-10"
                  : "bg-white/50 border-white/60 shadow-xl"
              } transition-transform duration-300 flex flex-col h-full`}
            >
              {tier.highlighted && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-white text-black text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="mb-6">
                <h3 className={`text-xl font-semibold mb-2 ${tier.highlighted ? "text-white" : "text-[#1a1a1a]"}`}>{tier.name}</h3>
                <p className={`text-sm h-10 ${tier.highlighted ? "text-zinc-400" : "text-[#8e8e8e]"}`}>{tier.description}</p>
              </div>
              
              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className={`text-4xl font-display font-bold ${tier.highlighted ? "text-white" : "text-[#1a1a1a]"}`}>{tier.price}</span>
                  {tier.period && <span className={`font-medium ${tier.highlighted ? "text-zinc-400" : "text-[#8e8e8e]"}`}>{tier.period}</span>}
                </div>
              </div>
              
              <div className="flex-1">
                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-3">
                      <Check className={`w-5 h-5 shrink-0 mt-0.5 ${tier.highlighted ? "text-white" : "text-[#1a1a1a]"}`} />
                      <span className={`text-sm ${tier.highlighted ? "text-zinc-300" : "text-[#4b4b4b]"}`}>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <button
                className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                  tier.highlighted
                    ? "bg-white text-black hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                    : tier.name === "Enterprise"
                    ? "bg-transparent border-2 border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white"
                    : "bg-white/60 text-[#1a1a1a] hover:bg-white border border-white/80 shadow-sm"
                }`}
              >
                {tier.cta}
              </button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
