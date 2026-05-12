"use client";

import {
  GraduationCap, LogOut, LayoutDashboard,
  CheckCircle, BookOpen, Users, User,
  Clock, Calendar, Menu, X, RefreshCw,
  Calculator
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { DashboardProvider, useDashboard } from "@/context/DashboardContext";

const Pokeball = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    {/* Background Circle */}
    <circle cx="50" cy="50" r="44" fill="white" />
    {/* Top Half (Theme Color) */}
    <path d="M50 6A44 44 0 0 1 94 50H62A12 12 0 0 0 38 50H6A44 44 0 0 1 50 6Z" fill="currentColor" />
    {/* Center Button & Lines */}
    <circle cx="50" cy="50" r="12" fill="white" stroke="#000" strokeWidth="6" />
    <path d="M2 50H38" stroke="#000" strokeWidth="6" strokeLinecap="round" />
    <path d="M62 50H98" stroke="#000" strokeWidth="6" strokeLinecap="round" />
    <circle cx="50" cy="50" r="47" stroke="#000" strokeWidth="6" />
  </svg>
);

function InnerDashboardContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { loading, lastSynced, refreshData } = useDashboard();

  const getSyncStatus = () => {
    if (!lastSynced) return "Just now";
    const diff = Math.floor((Date.now() - lastSynced) / 60000); // mins
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    return mins === 0 ? `${hours}h ago` : `${hours}h ${mins}m ago`;
  };

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Attendance", href: "/dashboard/attendance", icon: CheckCircle },
    { label: "Internal Marks", href: "/dashboard/marks", icon: BookOpen },
    { label: "GPA Calculator", href: "/dashboard/gpa", icon: Calculator },
    { label: "Timetable", href: "/dashboard/timetable", icon: Clock },
    { label: "Courses", href: "/dashboard/courses", icon: Users },
    { label: "Academic Planner", href: "/dashboard/calendar", icon: Calendar },
    { label: "Profile", href: "/dashboard/profile", icon: User },
  ];

  return (
    <div className="flex min-h-screen bg-[#0a0a0b] text-white selection:bg-primary/30 relative">

      {/* Unified Mobile/Global Header */}
      <div className="fixed top-0 left-0 right-0 z-[50] lg:left-72 bg-[#0a0a0b]/80 backdrop-blur-xl border-b border-white/5 h-16 flex items-center px-4 lg:px-8 justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsOpen(true)}
            className="lg:hidden w-8 h-8 flex items-center justify-center transition-all active:scale-95"
          >
            <Menu size={18} />
          </button>

          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full animate-pulse ${loading ? 'bg-amber-500' : 'bg-emerald-500'}`} />
            <span className="text-[10px] lg:text-[11px] font-bold text-white/40 tracking-widest uppercase italic">
              Updated: {getSyncStatus()}
            </span>
          </div>
        </div>

        <button
          onClick={() => refreshData(true)}
          disabled={loading}
          className="w-8 h-8 flex items-center justify-center transition-all active:scale-95 text-white/40 hover:text-primary disabled:opacity-50"
          title="Force Sync"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Backdrop for Mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] lg:hidden animate-in fade-in duration-300"
        />
      )}

      {/* Sidebar - Desktop Fixed / Mobile Drawer */}
      <aside className={`
        fixed h-full bg-[#0a0a0b] z-[110] border-r border-white/5 transition-transform duration-500 ease-out flex flex-col
        w-72 lg:translate-x-0
        ${isOpen ? "translate-x-0 shadow-[20px_0_60px_rgba(0,0,0,0.8)]" : "-translate-x-full"}
      `}>
        {/* Mobile Close Button - Integrated */}
        <div className="lg:hidden absolute top-4 right-4">
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center border border-white/10 transition-all active:scale-95"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-8 pt-6 lg:pt-8">
          <div className="flex items-center gap-3 group cursor-default">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-2xl shadow-primary/20 group-hover:scale-110 transition-transform">
              <Pokeball className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter italic">Pokéde<span className="text-primary">X</span></h1>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-base font-bold transition-all duration-300 group ${pathname === item.href
                ? "bg-primary text-white shadow-xl shadow-primary/20"
                : "text-muted-foreground hover:text-white hover:bg-white/5"
                }`}
            >
              <span className={`${pathname === item.href ? "text-white" : "text-primary/50 group-hover:text-primary"} transition-colors`}>
                <item.icon size={22} />
              </span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5">
          <button 
            onClick={async () => {
              const { logoutAction } = await import("@/server/actions");
              
              // 1. Wipe all client-side storage
              localStorage.clear();
              if ('caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(cacheNames.map(name => caches.delete(name)));
              }
              sessionStorage.clear();
              
              // 2. Perform server-side logout (clears cookies and redirects)
              await logoutAction();
            }}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold text-rose-500 hover:bg-rose-500/10 transition-all active:scale-95"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 min-h-screen w-full relative pt-13 lg:pt-10">
        {children}
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <InnerDashboardContent>
        {children}
      </InnerDashboardContent>
    </DashboardProvider>
  );
}