import './globals.css';
import React from 'react';
import DashboardSidebar from '../components/DashboardSidebar';
import DashboardHeader from '../components/DashboardHeader';
import GoogleSignInModal from '../components/GoogleSignInModal';
import { AuthProvider } from '../context/AuthContext';
import { NotificationProvider } from '../context/NotificationContext';
import { Compass, Shield, Sparkles } from 'lucide-react';

export const metadata = {
  title: 'KhojSetu | FoundBeacon - Campus Lost & Found Bridge',
  description: 'AI-assisted Campus Lost & Found Bridge with Explainable Matching and Private Ownership Claims',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0b1313] text-slate-800 antialiased min-h-screen p-2 sm:p-4 md:p-5 lg:p-6 flex flex-col items-center justify-start selection:bg-emerald-500/20 selection:text-emerald-950">
        <AuthProvider>
          <NotificationProvider>
            {/* The Master Container matching Dashboard V22 */}
            <div className="w-full max-w-[1720px] bg-[#f4f7f6] rounded-[24px] sm:rounded-[36px] shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-white/10 min-h-[94vh]">
              {/* Left Dark Vertical Dock */}
              <DashboardSidebar />

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col min-w-0 bg-[#f4f7f6]">
                <DashboardHeader />

                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                  {children}
                </main>

                {/* Dashboard V22 Soft Footer */}
                <footer className="border-t border-slate-200/60 bg-white/50 px-6 py-4 text-xs text-slate-500">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-[10px]">
                        K
                      </div>
                      <span className="font-bold text-slate-800">KhojSetu</span>
                      <span className="text-slate-400">• FoundBeacon Campus Lost &amp; Found Bridge</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-slate-500 text-[11px]">
                      <span className="flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5 text-emerald-600" />
                        OWASP S3 Validated
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        PostGIS Spatial Radar
                      </span>
                      <span>•</span>
                      <span>W3C WCAG 2.2 Compliant</span>
                    </div>

                    <div className="text-slate-400 text-[11px]">&copy; 2026 KhojSetu V22.</div>
                  </div>
                </footer>
              </div>
            </div>

            <GoogleSignInModal />
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
