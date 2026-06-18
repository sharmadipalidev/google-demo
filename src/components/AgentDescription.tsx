"use client";

import { motion } from "framer-motion";
import { Bot, Sparkles, Zap, Shield } from "lucide-react";

export default function AgentDescription() {
  return (
    <section id="agent" className="py-24 relative overflow-hidden bg-bg-base border-y border-black/5">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-black/[0.03] blur-[120px] rounded-[100%] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Text Content */}
          <div>

            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-display font-medium text-[#1a1a1a] leading-tight mb-6"
            >
              The intelligent agent that works <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 to-zinc-500">alongside you.</span>
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-[#4b4b4b] text-lg leading-relaxed mb-8"
            >
              Neurosync's AI agent isn't just a chatbot—it's a proactive assistant deeply integrated into your workflow. It understands context, manages your inbox, and schedules meetings autonomously.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              {[
                { icon: Zap, text: "Executes multi-step workflows instantly" },
                { icon: Bot, text: "Learns from your email habits" },
                { icon: Shield, text: "Enterprise-grade privacy & security" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white border border-black/5 shadow-sm flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-[#1a1a1a]" />
                  </div>
                  <span className="text-[#1a1a1a] font-medium">{item.text}</span>
                </div>
              ))}
            </motion.div>
          </div>
          
          {/* Right Visual / Mock Chat */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative lg:ml-10"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-black/[0.05] to-transparent blur-3xl rounded-full" />
            <div className="relative bg-white/50 backdrop-blur-xl border border-white/60 rounded-2xl p-6 shadow-xl">
              
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-black/5">
                <div className="w-10 h-10 rounded-full bg-black/[0.04] flex items-center justify-center border border-black/10">
                  <Bot className="w-5 h-5 text-[#1a1a1a]" />
                </div>
                <div>
                  <h3 className="text-[#1a1a1a] font-medium">Neurosync Agent</h3>
                  <p className="text-[#8e8e8e] text-sm">Always online</p>
                </div>
              </div>
              
              <div className="space-y-5">
                <div className="flex justify-end">
                  <div className="bg-[#1a1a1a] text-white text-sm px-5 py-3.5 rounded-2xl rounded-tr-none max-w-[85%] leading-relaxed shadow-sm">
                    Schedule a sync with Sarah for tomorrow afternoon and draft a follow-up email regarding the Q3 roadmap.
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-[#1a1a1a] flex items-center justify-center mt-1">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-[#f1f1f1] border border-black/5 text-[#1a1a1a] text-sm px-5 py-3.5 rounded-2xl rounded-tl-none max-w-[85%] leading-relaxed shadow-sm">
                    Done! I've scheduled a 30-minute Meet with Sarah for tomorrow at 2:00 PM. 
                    <br/><br/>
                    I also drafted the Q3 roadmap email. You can review it in your drafts folder right now.
                  </div>
                </div>
              </div>
              
            </div>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}
