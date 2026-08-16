"use client";

import React from "react";
import Link from "next/link";

interface TacticalAuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  backHref: string;
  illustrationType: "admin" | "victim";
}

export default function TacticalAuthLayout({
  children,
  title,
  subtitle,
  backHref,
  illustrationType,
}: TacticalAuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[#050B14] flex relative overflow-hidden font-sans">
      {/* Topographical Background Pattern - Global */}
      <div 
        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='topo' width='100' height='100' patternUnits='userSpaceOnUse'%3E%3Cpath d='M0 100 Q 25 75 50 100 T 100 100 M 0 50 Q 25 25 50 50 T 100 50 M 0 0 Q 25 -25 50 0 T 100 0' fill='none' stroke='%2338bdf8' stroke-width='0.5' opacity='0.3'/%3E%3Cpath d='M0 80 Q 30 60 50 80 T 100 80 M 0 30 Q 30 10 50 30 T 100 30' fill='none' stroke='%2338bdf8' stroke-width='0.5' opacity='0.1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23topo)'/%3E%3C/svg%3E")`,
          backgroundSize: '300px 300px'
        }}
      />

      {/* LEFT PANEL: Form Container */}
      <div className="relative z-10 w-full lg:w-[45%] flex items-center justify-center p-4 sm:p-8 lg:p-12 xl:p-20">
        
        {/* Glow Effects behind card */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none z-0"></div>

        <div 
          className="bg-[#0A111E]/80 backdrop-blur-xl rounded-2xl p-8 sm:p-10 relative overflow-hidden w-full max-w-[450px]"
          style={{
            border: '1px solid rgba(34, 211, 238, 0.2)',
            boxShadow: '0 -15px 40px -15px rgba(34, 211, 238, 0.4), 0 20px 40px -10px rgba(0,0,0,0.7)',
          }}
        >
          {/* Top Cyan Glowing Border line */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>

          {/* Back button */}
          <Link href={backHref} className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm font-medium mb-8 transition-colors group w-fit">
            <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">arrow_forward</span>
            Back
          </Link>

          {/* Title */}
          <div className="mb-8">
            <h1 className="text-4xl font-serif text-white mb-2 tracking-wide font-normal">{title}</h1>
            <p className="text-gray-400 text-sm leading-relaxed">{subtitle}</p>
          </div>

          {/* Form Injection */}
          {children}

        </div>
      </div>

      {/* RIGHT PANEL: Tactical HUD Illustration (Hidden on mobile) */}
      <div className="hidden lg:flex relative z-10 w-[55%] items-center justify-center border-l border-cyan-500/10 bg-gradient-to-r from-[#050B14] to-[#0A111E]/50">
        
        {/* Decorative Grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(#ffffff 1px,transparent 1px),linear-gradient(90deg,#ffffff 1px,transparent 1px)",
          backgroundSize: "40px 40px"
        }} />

        <div className="relative w-full max-w-[600px] aspect-square rounded-full border-[1px] border-cyan-500/20 flex items-center justify-center">
          
          {/* Radar Circles */}
          <div className="absolute w-[80%] h-[80%] rounded-full border-[1px] border-cyan-500/30 border-dashed animate-[spin_60s_linear_infinite]"></div>
          <div className="absolute w-[60%] h-[60%] rounded-full border-[1px] border-cyan-500/10 animate-[spin_40s_linear_infinite_reverse]"></div>
          
          {/* Radar Scanner Line */}
          <div className="absolute w-1/2 h-[2px] bg-gradient-to-r from-transparent to-cyan-400 top-1/2 left-1/2 origin-left animate-[spin_4s_linear_infinite] shadow-[0_0_15px_rgba(34,211,238,0.8)] z-20"></div>

          {/* Dynamic Data Stream Overlay */}
          <div className="absolute z-10 flex flex-col items-center">
            {illustrationType === "admin" ? (
               <span className="material-symbols-outlined text-[100px] text-cyan-500/20 mb-4">admin_panel_settings</span>
            ) : (
               <span className="material-symbols-outlined text-[100px] text-emerald-500/20 mb-4">group</span>
            )}
            
            <div className="text-cyan-500/40 font-mono text-xs tracking-[0.2em] text-center space-y-1">
              <p>UPLINK ESTABLISHED</p>
              <p>ENCRYPTED CONNECTION</p>
              <p className="animate-pulse">AWAITING CREDENTIALS...</p>
            </div>
          </div>
          
          {/* Corner Decorators */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500/50"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-500/50"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-500/50"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-500/50"></div>

        </div>
      </div>
    </div>
  );
}
