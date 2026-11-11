import './globals.css';
import React from 'react';
import DashboardSidebar from '../components/DashboardSidebar';
import DashboardHeader from '../components/DashboardHeader';
import GoogleSignInModal from '../components/GoogleSignInModal';
import { AuthProvider } from '../context/AuthContext';
import { NotificationProvider } from '../context/NotificationContext';
import { Shield, Sparkles, Compass } from 'lucide-react';
import Image from 'next/image';

export const metadata = {
  title: 'KhojSetu | Bridging Lost & Found',
  description: 'AI-assisted Campus Lost & Found Bridge with Explainable Matching and Private Ownership Claims',
  icons: {
    icon: '/logo-icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#F7F7F7] text-foundry-900 antialiased min-h-screen flex flex-col items-center justify-start selection:bg-foundry-900 selection:text-white">
        <AuthProvider>
          <NotificationProvider>
            {/* Foundry Top Announcement Bar */}
            <div className="w-full bg-foundry-900 text-white text-[10px] sm:text-[11px] font-medium tracking-tracked uppercase py-2 px-4 flex items-center justify-between border-b border-foundry-800 z-50">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-khoj-orange animate-pulse"></span>
                <span>Campus Verification Radar Active</span>
              </div>
              <div className="hidden md:flex items-center gap-4 text-neutral-400">
                <span>PostGIS Spatial Intelligence</span>
                <span>•</span>
                <span>Explainable AI Matching</span>
                <span>•</span>
                <span>100% Private Ownership Proof</span>
              </div>
              <div className="text-neutral-400">
                <span>Live Archive 2026</span>
              </div>
            </div>

            {/* Master Foundry Architectural Shell */}
            <div className="w-full max-w-[1780px] min-h-[calc(100vh-36px)] bg-white flex flex-col lg:flex-row border-x border-neutral-200/80 shadow-2xs">
              {/* Left Architectural Dock / Sidebar */}
              <DashboardSidebar />

              {/* Main Editorial & Exhibition Area */}
              <div className="flex-1 flex flex-col min-w-0 bg-[#FAFAFA]">
                <DashboardHeader />

                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                  {children}
                </main>

                {/* Foundry Luxury Charcoal Footer */}
                <footer className="border-t border-neutral-200 bg-foundry-900 text-white px-6 py-8 mt-auto">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-auto flex items-center bg-white px-2.5 py-1 rounded-lg">
                        <img
                          src="/logo-transparent.png"
                          alt="KhojSetu"
                          className="h-7 w-auto object-contain"
                        />
                      </div>
                      <div className="text-xs text-neutral-400">
                        <p className="font-semibold text-white tracking-wide uppercase text-[11px]">KhojSetu Archive</p>
                        <p className="text-[10px] tracking-wider uppercase text-neutral-400">Bridging Lost &amp; Found</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] uppercase tracking-tracked text-neutral-400">
                      <span className="flex items-center gap-1.5 text-neutral-300">
                        <Shield className="w-3.5 h-3.5 text-khoj-orange" />
                        OWASP Privacy Guard
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5 text-neutral-300">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        Spatial Radar Matrix
                      </span>
                      <span>•</span>
                      <span>W3C WCAG 2.2 AA</span>
                    </div>

                    <div className="text-neutral-500 text-[11px] tracking-wider uppercase">
                      &copy; 2026 KhojSetu. All Rights Reserved.
                    </div>
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
