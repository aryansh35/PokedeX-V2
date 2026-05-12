"use client";

import { useEffect, useState } from "react";
import { getDashboardData } from "@/server/actions";
import { BookOpen, RefreshCw, Star, LayoutGrid, Beaker, Zap } from "lucide-react";

import { useDashboard } from "@/context/DashboardContext";

export default function MarksPage() {
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

  const theory = data?.marks?.filter((m: any) => m.courseType.toLowerCase().includes('theory')) || [];
  const practical = data?.marks?.filter((m: any) => m.courseType.toLowerCase().includes('practical') || m.courseType.toLowerCase().includes('lab')) || [];

  const GradeProjector = ({ internals, maxInternals }: { internals: number; maxInternals: number }) => {
    const [targetGrade, setTargetGrade] = useState("O");
    
    const grades = [
      { label: "O", min: 91 },
      { label: "A+", min: 81 },
      { label: "A", min: 71 },
      { label: "B+", min: 61 },
      { label: "B", min: 56 },
      { label: "C", min: 50 },
    ];

    const currentInternalWeight = (internals / maxInternals) * 60;
    const target = grades.find(g => g.label === targetGrade)?.min || 91;
    const requiredFromEndSem40 = target - currentInternalWeight;
    const requiredFromEndSem75 = (requiredFromEndSem40 / 40) * 75;

    return (
      <div className="mt-8 p-6 lg:p-8 rounded-[2.5rem] bg-primary/[0.03] border border-primary/10 relative overflow-hidden group/projector">
        <div className="absolute top-0 right-0 p-6 text-primary/5 opacity-20 group-hover/projector:opacity-40 transition-opacity">
           <Zap size={80} />
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
           <div>
              <div className="flex items-center gap-2 mb-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Target Grade Projector</p>
              </div>
              <p className="text-sm font-medium text-muted-foreground max-w-sm">Select your goal to see required performance in the 75-mark End-Sem exam.</p>
           </div>

           <div className="flex flex-wrap gap-2">
              {grades.map((g) => (
                 <button
                    key={g.label}
                    onClick={() => setTargetGrade(g.label)}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                       targetGrade === g.label 
                       ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105" 
                       : "bg-white/5 text-muted-foreground hover:bg-white/10"
                    }`}
                 >
                    {g.label}
                 </button>
              ))}
           </div>

           <div className="px-8 py-4 rounded-2xl bg-white/5 border border-white/5 text-center min-w-[140px]">
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Required / 75</p>
              <p className={`text-2xl font-black italic tracking-tighter ${requiredFromEndSem75 > 75 ? 'text-rose-500' : requiredFromEndSem75 <= 0 ? 'text-emerald-500' : 'text-white'}`}>
                 {requiredFromEndSem75 > 75 ? "EXCEEDED" : requiredFromEndSem75 <= 0 ? "SECURED" : requiredFromEndSem75.toFixed(1)}
              </p>
           </div>
        </div>
      </div>
    );
  };

  const Section = ({ title, marks, icon: Icon, isTheory }: any) => (
    <div className="space-y-8">
      <div className="flex items-center gap-4 px-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-2xl shadow-primary/10">
          <Icon size={24} />
        </div>
        <div>
           <h2 className="text-2xl font-black uppercase tracking-tighter italic">{title}</h2>
           <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">{marks.length} Active Subjects</p>
        </div>
      </div>
      <div className="space-y-8">
        {marks.map((course: any, i: number) => (
          <div key={i} className="glass-card rounded-[2.5rem] p-6 lg:p-12 border-white/5 hover:border-primary/20 transition-all relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-12 text-primary/5 group-hover:text-primary/10 transition-all">
                <Zap size={160} strokeWidth={3} />
             </div>

             <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-10 mb-8 lg:mb-12 relative z-10">
                <div className="flex items-start gap-4 lg:gap-8 flex-1">
                   <div className="w-14 h-14 lg:w-20 lg:h-20 bg-primary rounded-2xl lg:rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-primary/20 flex-shrink-0">
                      <BookOpen className="w-7 h-7 lg:w-9 lg:h-9" />
                   </div>
                   <div>
                      <div className="flex items-center gap-3 mb-2">
                         <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20">
                            {course.courseCode}
                         </span>
                         <span className="px-3 py-1 bg-white/5 text-muted-foreground rounded-full text-[10px] font-black uppercase tracking-widest border border-white/5">
                            {course.credits} Credits
                         </span>
                      </div>
                      <h3 className="text-xl lg:text-3xl font-black leading-tight group-hover:text-primary transition-colors uppercase italic tracking-tighter">
                         {course.courseTitle}
                      </h3>
                   </div>
                </div>
                
                <div className="p-6 lg:p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 min-w-full lg:min-w-[240px] text-center flex flex-col items-center justify-center relative overflow-hidden group/score">
                   <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/score:opacity-100 transition-opacity" />
                   <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-3 relative z-10">Total Obtained</p>
                   <div className="flex items-baseline gap-2 relative z-10">
                      <span className="text-4xl lg:text-5xl font-black tracking-tighter tabular-nums">{course.totalObtained}</span>
                      <span className="text-lg font-bold text-muted-foreground">/ {course.totalMax}</span>
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 relative z-10">
                {course.scores.map((score: any, si: number) => (
                   <div key={si} className="p-4 lg:p-6 rounded-2xl bg-white/[0.03] border border-white/5 group/test hover:border-primary/20 transition-all text-center">
                      <p className="text-[8px] lg:text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1 lg:mb-2 group-hover/test:text-primary transition-colors">
                         {score.label.split('/')[0]}
                      </p>
                      <p className="text-xl lg:text-2xl font-black tracking-tighter tabular-nums">{score.value}</p>
                   </div>
                ))}
             </div>

             {/* Grade Projector Integration - Only for Theory */}
             {isTheory && <GradeProjector internals={parseFloat(course.totalObtained)} maxInternals={parseFloat(course.totalMax)} />}
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
               Assessment <span className="text-primary italic">Sync</span>
            </h1>
            <p className="text-muted-foreground font-medium text-sm lg:text-lg italic uppercase tracking-widest">Detailed performance tracking and evaluation</p>
          </div>
          <div className="flex items-center gap-3 px-6 py-3 bg-primary/10 rounded-2xl border border-primary/20">
             <Star className="text-amber-500 fill-amber-500" size={20} />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Live Grades Active</span>
          </div>
        </header>

      {theory.length > 0 && <Section title="Theory Assessments" marks={theory} icon={LayoutGrid} isTheory={true} />}
      {practical.length > 0 && <Section title="Practical & Lab" marks={practical} icon={Beaker} isTheory={false} />}

      {(!data?.marks || data.marks.length === 0) && (
        <div className="p-20 flex flex-col items-center justify-center glass-card rounded-[2.5rem] border-dashed border-white/10 opacity-30">
           <p className="text-muted-foreground font-bold text-xl uppercase tracking-widest">No evaluation data found</p>
        </div>
      )}
      </div>
    </div>
  );
}
