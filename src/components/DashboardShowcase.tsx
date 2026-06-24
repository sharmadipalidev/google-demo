"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function DashboardShowcase() {
  return (
    <section className="relative w-full pt-0 pb-20 bg-bg-base overflow-hidden flex justify-center items-center px-4 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-6xl mx-auto rounded-xl shadow-2xl border border-black/10 overflow-hidden bg-white/50 backdrop-blur-xl"
      >
        <Image
          src="/Screenshot 2026-06-21 222038.png"
          alt="neurosync Dashboard Interface"
          width={1920}
          height={1080}
          className="w-full h-auto object-cover"
          priority
          unoptimized
          quality={100}
        />
      </motion.div>
    </section>
  );
}
