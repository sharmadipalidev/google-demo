import Link from "next/link";
import { Mail, Calendar, ArrowRight } from "lucide-react";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4 font-sans text-gray-900">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Welcome! Let's get set up.</h1>
          <p className="text-gray-500">
            Connect your accounts to start automating your workflows.
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <a
            href="/api/connect?plugin=gmail"
            className="flex items-center justify-between w-full p-4 border border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-lg text-red-500 group-hover:bg-red-100 transition-colors">
                <Mail size={20} />
              </div>
              <div className="font-medium">Connect Gmail</div>
            </div>
            <ArrowRight size={18} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
          </a>

          <a
            href="/api/connect?plugin=googlecalendar"
            className="flex items-center justify-between w-full p-4 border border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-500 group-hover:bg-blue-100 transition-colors">
                <Calendar size={20} />
              </div>
              <div className="font-medium">Connect Google Calendar</div>
            </div>
            <ArrowRight size={18} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
          </a>
        </div>

        <div className="text-center">
          <Link href="/gmail" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
            Skip for now and continue to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
