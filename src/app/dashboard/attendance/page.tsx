"use client";

import { useEffect, useState } from "react";
import { getDashboardData } from "@/server/actions";
import { 
  CheckCircle2, AlertCircle, RefreshCw, 
  LayoutGrid, Beaker, Zap, ShieldCheck 
} from "lucide-react";

import { useDashboard } from "@/context/DashboardContext";

export default function AttendancePage() {
  const { data, loading, lastSynced, refreshData } = useDashboard();

  const getSyncStatus = () => {
    if (!lastSynced) return null;
    const diff = Math.floor((Date.now() - lastSynced) / 60000);
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    return `${hours}h ${mins}m ago`;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b]">
      <RefreshCw className="w-8 h-8 text-primary animate-spin" />
    </div>
  );

  const theory = data?.attendance?.filter((i: any) => (i.type || "").toLowerCase().includes('theory')) || [];
  const practical = data?.attendance?.filter((i: any) => (i.type || "").toLowerCase().includes('practical') || (i.type || "").toLowerCase().includes('lab')) || [];

  const Section = ({ title, courses, icon: Icon }: any) => (
    <div className="space-y-8">
      <div className="flex items-center gap-4 px-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-2xl shadow-primary/10">
          <Icon size={24} />
        </div>
        <div>
           <h2 className="text-2xl font-black uppercase tracking-tighter italic">{title}</h2>
           <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">{courses.length} Active Courses</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {courses.map((course: any, i: number) => (
          <div key={i} className="glass-card rounded-[2rem] lg:rounded-[3rem] p-6 lg:p-10 border-white/5 hover:bg-white/[0.02] transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 text-primary/5 group-hover:text-primary/10 transition-all">
               <Zap size={120} strokeWidth={3} />
            </div>
            
            <div className="flex items-start justify-between mb-6 lg:mb-8 relative z-10">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">{course.courseCode}</p>
                <h3 className="text-2xl font-black leading-tight group-hover:text-primary transition-colors italic tracking-tighter uppercase">{course.courseTitle}</h3>
              </div>
              <div className={`p-3 lg:p-4 rounded-xl lg:rounded-2xl ${course.status === 'safe' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'} border border-current/20`}>
                {course.status === 'safe' ? <CheckCircle2 className="w-5 h-5 lg:w-6 lg:h-6" /> : <AlertCircle className="w-5 h-5 lg:w-6 lg:h-6" />}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 lg:gap-6 relative z-10">
              <div className="p-3 lg:p-4 rounded-xl lg:rounded-2xl bg-white/5 border border-white/5">
                <p className="text-[8px] lg:text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Percentage</p>
                <p className="text-lg lg:text-2xl font-black tabular-nums">{course.attendance}%</p>
              </div>
              <div className="p-3 lg:p-4 rounded-xl lg:rounded-2xl bg-white/5 border border-white/5">
                <p className="text-[8px] lg:text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Conducted</p>
                <p className="text-lg lg:text-2xl font-black tabular-nums">{course.conducted}</p>
              </div>
              <div className="p-3 lg:p-4 rounded-xl lg:rounded-2xl bg-white/5 border border-white/5">
                <p className="text-[8px] lg:text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                  {course.status === 'safe' ? 'Margin' : 'Needed'}
                </p>
                <p className={`text-lg lg:text-2xl font-black tabular-nums ${course.status === 'safe' ? 'text-emerald-500' : 'text-red-500'}`}>
                  {course.margin}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="pb-32">
      <div className="p-4 lg:p-12 space-y-8 lg:space-y-16 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl lg:text-7xl font-black tracking-tighter text-white uppercase italic leading-none mb-3">
               Attendance <span className="text-primary italic">Hub</span>
            </h1>
            <p className="text-muted-foreground font-medium text-sm lg:text-lg italic uppercase tracking-widest">Real-time tracking and margin analysis</p>
          </div>
          <div className="flex items-center gap-3 px-6 py-3 bg-primary/10 rounded-2xl border border-primary/20">
             <ShieldCheck className="text-primary" size={20} />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Verification Active</span>
          </div>
        </header>

      {theory.length > 0 && <Section title="Theory Courses" courses={theory} icon={LayoutGrid} />}
      {practical.length > 0 && <Section title="Practical & Lab" courses={practical} icon={Beaker} />}

      {(!data?.attendance || data.attendance.length === 0) && (
        <div className="p-20 flex flex-col items-center justify-center glass-card rounded-[3rem] border-dashed border-white/10 opacity-30">
           <p className="text-muted-foreground font-bold text-xl uppercase tracking-widest">No attendance data found</p>
        </div>
      )}
      </div>
    </div>
  );
}
