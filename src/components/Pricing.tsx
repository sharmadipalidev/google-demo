"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useSession, signIn } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Script from "next/script";

const tiers = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    description: "Perfect for individuals looking to explore basic AI workflows.",
    features: [
      "Smart Email Triage",
      "Basic Calendar Integration",
      "Up to 50 AI queries/month",
      "Standard Support",
    ],
    cta: "Get Started",
    highlighted: false,
    ctaStyle: "bg-black/5 text-[#1a1a1a] hover:bg-black/10",
  },
  {
    name: "Pro",
    price: "₹199",
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
    ctaStyle: "bg-white text-[#1a1a1a] hover:bg-gray-100 shadow-sm",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
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
    ctaStyle: "bg-transparent border border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

export default function Pricing() {
  const { data: session } = useSession();
  const isSignedIn = !!session;
  const router = useRouter();

  const handleAction = async (plan: string) => {
    if (!isSignedIn) {
      signIn.social({ provider: 'google', callbackURL: '/gmail' });
      return;
    }

    if (plan !== "Pro") {
      router.push("/gmail");
      return;
    }

    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 19900, currency: "INR" }),
      });

      const orderData = await res.json();

      if (!res.ok) {
        throw new Error(orderData.error || "Failed to create order");
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Neurosync Pro",
        description: "Upgrade to Pro Plan",
        order_id: orderData.order_id,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (!verifyRes.ok) throw new Error("Payment verification failed");
            
            alert("Payment successful! Welcome to Pro.");
            router.push("/gmail");
          } catch (e: any) {
            alert("Payment verification failed: " + e.message);
          }
        },
        theme: {
          color: "#1a1a1a",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        alert("Payment failed: " + response.error.description);
      });
      rzp.open();
    } catch (e: any) {
      alert("Checkout error: " + e.message);
    }
  };

  return (
    <>
    <Script
      src="https://checkout.razorpay.com/v1/checkout.js"
      strategy="afterInteractive"
    />
    <section id="pricing" className="py-24 bg-bg-base relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* Top Header Section */}
        <div className="flex flex-col items-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-[#4b4b4b] font-bold tracking-widest uppercase text-sm mb-3"
          >
            PRICING
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-5xl font-display font-medium text-[#1a1a1a] leading-tight tracking-tight mb-4 text-center"
          >
            Simple, transparent pricing
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[#8e8e8e] text-lg font-sans text-center max-w-2xl"
          >
            Choose the plan that best fits your workflow needs. No hidden fees.
          </motion.p>
        </div>

        {/* Pricing Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch mb-12 pt-6"
        >
          {tiers.map((tier, index) => (
            <motion.div
              key={index}
              variants={item}
              whileHover={{ y: -5 }}
              className={`relative rounded-3xl p-8 lg:p-10 flex flex-col h-full transition-all duration-300 shadow-xl ${
                tier.highlighted
                  ? "bg-[#1a1a1a] text-white scale-[1.03] z-10"
                  : "bg-white text-[#1a1a1a]"
              }`}
            >
              {/* Most Popular Floating Badge */}
              {tier.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
                  <span className="bg-white text-[#1a1a1a] text-[11px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-full shadow-sm">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Header */}
              <div className="relative z-10 mb-6">
                <h3 className={`text-xl font-bold mb-3 ${tier.highlighted ? "text-white" : "text-[#1a1a1a]"}`}>
                  {tier.name}
                </h3>
                <p className={`text-sm font-medium leading-relaxed pr-4 ${tier.highlighted ? "text-zinc-400" : "text-[#8e8e8e]"}`}>
                  {tier.description}
                </p>
              </div>

              {/* Price */}
              <div className="relative z-10 mb-8 flex items-baseline gap-1.5">
                <span className={`text-5xl font-display font-bold tracking-tight ${tier.highlighted ? "text-white" : "text-[#1a1a1a]"}`}>
                  {tier.price}
                </span>
                <span className={`text-sm font-medium ${tier.highlighted ? "text-zinc-400" : "text-[#8e8e8e]"}`}>
                  {tier.period}
                </span>
              </div>

              {/* Features List */}
              <div className="relative z-10 mb-10 flex-1">
                <ul className="space-y-4">
                  {tier.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center gap-3">
                      <Check className={`w-4 h-4 shrink-0 ${tier.highlighted ? "text-white" : "text-[#1a1a1a]"}`} strokeWidth={2} />
                      <span className={`text-sm font-medium ${tier.highlighted ? "text-zinc-300" : "text-[#4b4b4b]"}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => handleAction(tier.name)}
                className={`relative z-10 w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 ${tier.ctaStyle}`}
              >
                {tier.cta}
              </button>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
    </>
  );
}

