"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function DashboardShowcase() {
  return (
    <section className="relative w-full py-20 bg-bg-base overflow-hidden flex justify-center items-center px-4 md:px-8">
      {/* Decorative background glow behind the image */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-brand-green/10 blur-[100px] rounded-full z-0 pointer-events-none"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-6xl mx-auto rounded-xl shadow-2xl border border-black/5 overflow-hidden bg-white"
      >
        <Image
          src="/image.png"
          alt="Neurosync Dashboard Interface"
          width={1920}
          height={1080}
          className="w-full h-auto object-cover"
          priority
        />
      </motion.div>
    </section>
  );
}
