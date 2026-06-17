"use client";

import { motion } from "framer-motion";

export default function About() {
  return (
    <section className="py-24 sm:py-32 relative overflow-hidden transition-colors">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
          <div className="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-2">
            <div className="flex flex-col justify-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-3xl font-display font-bold tracking-tight text-[#1a1a1a] dark:text-white sm:text-4xl transition-colors">
                  A new standard for productivity
                </h2>
                <p className="mt-6 text-lg leading-8 text-[#8e8e8e] dark:text-zinc-400 transition-colors">
                  We believe that managing your inbox and calendar shouldn't feel like a chore. Neurosync bridges the gap between your intent and execution by leveraging advanced AI to handle the busywork, so you can focus on what actually matters.
                </p>
                <dl className="mt-10 max-w-xl space-y-8 text-base leading-7 text-[#8e8e8e] dark:text-zinc-400 transition-colors">
                  <div className="relative pl-9">
                    <dt className="inline font-semibold text-[#1a1a1a] dark:text-zinc-200 transition-colors">
                      <svg className="absolute left-1 top-1 h-5 w-5 text-brand-green" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                      Frictionless Setup.
                    </dt>
                    <dd className="inline"> Connect your Google account securely and instantly unlock AI-driven insights across your entire history.</dd>
                  </div>
                  <div className="relative pl-9">
                    <dt className="inline font-semibold text-[#1a1a1a] dark:text-zinc-200 transition-colors">
                      <svg className="absolute left-1 top-1 h-5 w-5 text-brand-green" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                      Privacy First.
                    </dt>
                    <dd className="inline"> We use secure Corsair webhooks and edge processing. Your data remains strictly within your control.</dd>
                  </div>
                </dl>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex items-center justify-center lg:justify-end"
            >
              <div className="relative w-full max-w-lg">
                <div className="absolute -inset-1 bg-brand-green opacity-20 dark:opacity-10 rounded-[32px] blur-2xl transition-opacity"></div>
                <img
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                  alt="Dashboard preview"
                  className="relative rounded-[32px] shadow-2xl object-cover w-full aspect-square border border-black/5 dark:border-white/5 transition-colors"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
