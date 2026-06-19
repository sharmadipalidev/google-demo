import Link from "next/link";
import { Mail, Calendar, ArrowRight } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function OnboardingPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;
  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-bg-base selection:bg-brand-green selection:text-black font-sans antialiased flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Background Video or Gradient (similar to Hero) */}
      <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-bg-base to-bg-base/80 z-10"></div>
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-[0.05] relative z-0"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260603_132049_036591b8-6e92-4760-b94c-a7ea6eef315c.mp4"
        />
      </div>

      <div className="max-w-md w-full relative z-10 px-6 py-12">
        <div className="text-center mb-10">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-[#1a1a1a]"
            >
              <path d="M12 2C10.3431 2 9 3.34315 9 5C9 6.65685 10.3431 8 12 8C13.6569 8 15 6.65685 15 5C15 3.34315 13.6569 2 12 2Z" fill="currentColor" />
              <path d="M12 16C10.3431 16 9 17.3431 9 19C9 20.6569 10.3431 22 12 22C13.6569 22 15 20.6569 15 19C15 17.3431 13.6569 16 12 16Z" fill="currentColor" />
              <path d="M5 9C3.34315 9 2 10.3431 2 12C2 13.6569 3.34315 15 5 15C6.65685 15 8 13.6569 8 12C8 10.3431 6.65685 9 5 9Z" fill="currentColor" />
              <path d="M19 9C17.3431 9 16 10.3431 16 12C16 13.6569 17.3431 15 19 15C20.6569 15 22 13.6569 22 12C22 10.3431 20.6569 9 19 9Z" fill="currentColor" />
              <circle cx="12" cy="12" r="2" fill="currentColor" />
            </svg>
            <span className="font-display font-semibold text-2xl text-[#1a1a1a] tracking-tight">neurosync</span>
          </div>

          <h1 className="text-3xl font-display font-medium text-[#1a1a1a] mb-3 tracking-tight">
            Connect your accounts
          </h1>
          <p className="text-[#4b4b4b] font-sans">
            Neurosync needs access to your workspace to automate your emails and meetings.
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <a
            href="/api/connect?plugin=gmail"
            className="flex items-center justify-between w-full p-4 bg-white/40 backdrop-blur-lg border border-black/5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-2xl hover:bg-white/60 hover:shadow-[0_4px_15px_rgba(0,0,0,0.05)] hover:border-black/10 transition-all duration-300 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white shadow-sm border border-black/5 rounded-full flex items-center justify-center text-[#1a1a1a]">
                <Mail size={18} />
              </div>
              <div className="font-medium text-[#1a1a1a]">Connect Gmail</div>
            </div>
            <ArrowRight size={18} className="text-[#8e8e8e] group-hover:text-[#1a1a1a] group-hover:translate-x-0.5 transition-all" />
          </a>

          <a
            href="/api/connect?plugin=googlecalendar"
            className="flex items-center justify-between w-full p-4 bg-white/40 backdrop-blur-lg border border-black/5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-2xl hover:bg-white/60 hover:shadow-[0_4px_15px_rgba(0,0,0,0.05)] hover:border-black/10 transition-all duration-300 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white shadow-sm border border-black/5 rounded-full flex items-center justify-center text-[#1a1a1a]">
                <Calendar size={18} />
              </div>
              <div className="font-medium text-[#1a1a1a]">Connect Calendar</div>
            </div>
            <ArrowRight size={18} className="text-[#8e8e8e] group-hover:text-[#1a1a1a] group-hover:translate-x-0.5 transition-all" />
          </a>
        </div>

        <div className="text-center">
          <Link href="/gmail" className="text-sm font-medium text-[#8e8e8e] hover:text-[#1a1a1a] transition-colors inline-flex items-center gap-1.5">
            Skip for now
          </Link>
        </div>
      </div>
    </div>
  );
}
