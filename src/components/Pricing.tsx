"use client";

import { Check } from "lucide-react";
import { motion } from "framer-motion";

const tiers = [
 {
 name: "Basic",
 price: "Free",
 description: "Perfect for individuals getting started with AI.",
 features: ["100 AI queries per month", "Basic Gmail integration", "Community support"],
 buttonText: "Get Started",
 popular: false,
 },
 {
 name: "Pro",
 price: "$19",
 period: "/month",
 description: "Ideal for professionals needing unlimited power.",
 features: ["Unlimited AI queries", "Advanced Calendar sync", "Priority support", "Custom workflows"],
 buttonText: "Upgrade to Pro",
 popular: true,
 },
 {
 name: "Enterprise",
 price: "Custom",
 description: "For teams and organizations requiring scale.",
 features: ["Dedicated account manager", "SSO integration", "Custom AI training", "99.9% uptime SLA"],
 buttonText: "Contact Sales",
 popular: false,
 },
];

export default function Pricing() {
 return (
 <section className="py-24 sm:py-32 relative z-10">
 <div className="mx-auto max-w-7xl px-6 lg:px-8">
 <div className="mx-auto max-w-2xl text-center">
 <h2 className="text-3xl font-display font-semibold tracking-tight text-[#1a1a1a] dark:text-white sm:text-5xl">Simple, transparent pricing</h2>
 <p className="mt-4 text-lg leading-8 text-[#8e8e8e] dark:text-zinc-400">
 Choose the plan that fits your workflow. Upgrade anytime as your needs grow.
 </p>
 </div>
 <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 lg:gap-y-0">
 {tiers.map((tier, tierIdx) => (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ duration: 0.5, delay: tierIdx * 0.1 }}
 key={tier.name}
 className={`rounded-3xl p-8 ring-1 xl:p-10 ${
 tier.popular
 ? 'bg-[#1a1a1a] dark:bg-zinc-800 ring-[#1a1a1a] dark:ring-white/10 text-white shadow-xl scale-105 z-10'
 : 'bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm ring-black/10 dark:ring-white/10 text-[#1a1a1a] dark:text-white'
 }`}
 >
 <h3 id={tier.name} className={`text-lg font-semibold leading-8 ${tier.popular ? 'text-white' : 'text-[#1a1a1a] dark:text-white'}`}>
 {tier.name}
 </h3>
 {tier.popular && (
 <p className="rounded-full bg-brand-green/20 px-2.5 py-1 text-xs font-semibold leading-5 text-brand-green absolute top-8 right-8">
 Most popular
 </p>
 )}
 <p className={`mt-4 text-sm leading-6 ${tier.popular ? 'text-gray-300' : 'text-[#8e8e8e] dark:text-zinc-400'}`}>{tier.description}</p>
 <p className="mt-6 flex items-baseline gap-x-1">
 <span className={`text-4xl font-bold tracking-tight ${tier.popular ? 'text-white' : 'text-[#1a1a1a] dark:text-white'}`}>{tier.price}</span>
 {tier.period && <span className={`text-sm font-semibold leading-6 ${tier.popular ? 'text-gray-300' : 'text-[#8e8e8e] dark:text-zinc-400'}`}>{tier.period}</span>}
 </p>
 <button
 aria-describedby={tier.name}
 className={`mt-6 block rounded-md py-2 px-3 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 w-full transition-colors ${
 tier.popular
 ? 'bg-white text-[#1a1a1a] hover:bg-gray-100'
 : 'bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] hover:bg-black dark:hover:bg-gray-200'
 }`}
 >
 {tier.buttonText}
 </button>
 <ul role="list" className={`mt-8 space-y-3 text-sm leading-6 xl:mt-10 ${tier.popular ? 'text-gray-300' : 'text-[#8e8e8e] dark:text-zinc-400'}`}>
 {tier.features.map((feature) => (
 <li key={feature} className="flex gap-x-3">
 <Check className={`h-6 w-5 flex-none ${tier.popular ? 'text-brand-green' : 'text-[#1a1a1a] dark:text-white'}`} aria-hidden="true" />
 {feature}
 </li>
 ))}
 </ul>
 </motion.div>
 ))}
 </div>
 </div>
 </section>
 );
}
