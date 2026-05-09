"use client";

import { useDashboard } from "@/context/DashboardContext";
import { RefreshCw, Calculator, TrendingUp, Star, Award, BookOpen, Target, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function GPAPage() {
   const { data, loading } = useDashboard();
   const [targetGPA, setTargetGPA] = useState("9.0");
   const [mode, setMode] = useState<"auto" | "manual" | "cgpa">("auto");
   const [manualGrades, setManualGrades] = useState<Record<string, { grade: string; points: number }>>({});
   const [semesters, setSemesters] = useState<any[]>([{ id: 1, sgpa: "", credits: "" }]);

   if (loading) return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b]">
         <RefreshCw className="w-8 h-8 text-primary animate-spin" />
      </div>
   );

   const marks = data?.marks || [];

   const grades = [
      { label: "O", points: 10 },
      { label: "A+", points: 9 },
      { label: "A", points: 8 },
      { label: "B+", points: 7 },
      { label: "B", points: 6 },
      { label: "C", points: 5 },
      { label: "F", points: 0 },
   ];

   const getGradePoints = (percentage: number) => {
      if (percentage >= 91) return { grade: "O", points: 10 };
      if (percentage >= 81) return { grade: "A+", points: 9 };
      if (percentage >= 71) return { grade: "A", points: 8 };
      if (percentage >= 61) return { grade: "B+", points: 7 };
      if (percentage >= 56) return { grade: "B", points: 6 };
      if (percentage >= 50) return { grade: "C", points: 5 };
      return { grade: "F", points: 0 };
   };

   // Calculate SGPA and Projections
   const calculator = (() => {
      let totalGradePoints = 0;
      let totalCredits = 0;
      
      const courseStats = marks.map((m: any) => {
         const credits = parseInt(m.credits) || 0;
         let grade = "";
         let points = 0;
         let percentage = 0;

         if (mode === "auto") {
            percentage = (parseFloat(m.totalObtained) / parseFloat(m.totalMax)) * 100;
            const res = getGradePoints(percentage);
            grade = res.grade;
            points = res.points;
         } else {
            const manual = manualGrades[m.courseCode] || { grade: "O", points: 10 };
            grade = manual.grade;
            points = manual.points;
         }

         if (credits > 0) {
            totalGradePoints += (points * credits);
            totalCredits += credits;
         }

         return { ...m, percentage, grade, points, credits };
      });

      const sgpaNum = totalCredits > 0 ? (totalGradePoints / totalCredits) : 0;
      const sgpa = sgpaNum.toFixed(2);
      return { sgpa, sgpaNum, courseStats, totalCredits };
   })();

   // CGPA Logic
   const calculateCGPA = () => {
      let totalPoints = 0;
      let totalCredits = 0;
      semesters.forEach(s => {
         const sgpa = parseFloat(s.sgpa) || 0;
         const credits = parseFloat(s.credits) || 0;
         if (sgpa > 0 && credits > 0) {
            totalPoints += (sgpa * credits);
            totalCredits += credits;
         }
      });
      const cgpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0;
      return { cgpa: cgpa.toFixed(2), cgpaNum: cgpa, totalCredits };
   };

   const cgpaResults = calculateCGPA();
   const targetDiff = parseFloat(targetGPA) - calculator.sgpaNum;

   const toggleManualGrade = (courseCode: string) => {
      setManualGrades(prev => {
         const current = prev[courseCode] || { grade: "O", points: 10 };
         const currentIndex = grades.findIndex(g => g.label === current.grade);
         const nextIndex = (currentIndex + 1) % grades.length;
         return { ...prev, [courseCode]: { grade: grades[nextIndex].label, points: grades[nextIndex].points } };
      });
   };

   return (
      <div className="pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
         <div className="p-4 lg:p-12 space-y-10 lg:space-y-16 max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
               <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                     <div className="w-8 h-[2px] bg-primary rounded-full" />
                     <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Intelligence Hub</span>
                  </div>
                  <h1 className="text-4xl lg:text-8xl font-black tracking-tighter text-white uppercase italic leading-[0.8] mb-3">
                     GPA <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500 italic">Sentinel</span>
                  </h1>
                  <p className="text-muted-foreground font-medium text-xs lg:text-lg italic uppercase tracking-widest opacity-60">High-Precision Academic Performance Analytics</p>
               </div>
               
               {/* Unified Master Switcher */}
               <div className="grid grid-cols-3 p-1 bg-white/5 rounded-[1.5rem] border border-white/5 backdrop-blur-xl w-full md:w-[450px]">
                  <button 
                     onClick={() => setMode("auto")}
                     className={`px-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${mode === "auto" ? "bg-primary text-white shadow-lg" : "text-white/40 hover:text-white"}`}
                  >
                     Auto Sync
                  </button>
                  <button 
                     onClick={() => setMode("manual")}
                     className={`px-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${mode === "manual" ? "bg-primary text-white shadow-lg" : "text-white/40 hover:text-white"}`}
                  >
                     Simulation
                  </button>
                  <button 
                     onClick={() => setMode("cgpa")}
                     className={`px-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${mode === "cgpa" ? "bg-primary text-white shadow-lg" : "text-white/40 hover:text-white"}`}
                  >
                     Strategic CGPA
                  </button>
               </div>
            </header>

            {mode !== "cgpa" ? (
               <>
                  {/* GPA Hero Card */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                     <div className="lg:col-span-2 glass-card rounded-[2.5rem] lg:rounded-[4rem] p-8 lg:p-14 border-white/5 relative overflow-visible group shadow-2xl">
                        {/* Decorative Background Elements */}
                        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] group-hover:bg-primary/20 transition-all duration-1000" />
                        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-500/10 rounded-full blur-[100px]" />

                        <div className="relative z-10">
                           <div className="flex items-center justify-between mb-12">
                              <div className="flex items-center gap-4">
                                 <div className="w-14 h-14 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-primary/40 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                    <TrendingUp size={28} />
                                 </div>
                                 <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-1">Live Projection</p>
                                    <p className="text-xs font-bold text-white/40">Real-time Calculation</p>
                                 </div>
                              </div>
                              <div className="hidden md:block">
                                 <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map(i => <div key={i} className={`w-1 h-8 rounded-full ${i <= Math.floor(calculator.sgpaNum / 2) ? 'bg-primary' : 'bg-white/5'}`} />)}
                                 </div>
                              </div>
                           </div>

                           <div className="flex flex-col items-center justify-center text-center gap-6 w-full">
                              <div className="relative">
                                 <h2 className="text-8xl lg:text-[12rem] font-black tracking-tighter italic leading-none text-white drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                                    {calculator.sgpa}
                                 </h2>
                                 <div className="mt-6 flex flex-col items-center gap-2">
                                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Current Semester Grade</p>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="glass-card rounded-[2.5rem] lg:rounded-[3.5rem] p-8 lg:p-12 border-white/5 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 text-primary/5 group-hover:scale-110 transition-transform">
                           <Target size={120} />
                        </div>

                        <div className="relative z-10">
                           <div className="flex items-center gap-3 mb-8">
                              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary">
                                 <Star size={20} className="fill-primary" />
                              </div>
                              <div>
                                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Goal Shield</p>
                                 <h3 className="text-xl font-black uppercase italic tracking-tighter">GPA Target</h3>
                              </div>
                           </div>

                           <div className="space-y-10">
                              <div className="relative pt-10">
                                 <input
                                    type="range"
                                    min="0"
                                    max="10"
                                    step="0.1"
                                    value={targetGPA}
                                    onChange={(e) => setTargetGPA(e.target.value)}
                                    className="w-full h-3 bg-white/5 rounded-full appearance-none cursor-pointer accent-primary"
                                 />
                                 <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                                    <div className="px-6 py-3 bg-primary rounded-2xl shadow-2xl shadow-primary/40 transform -rotate-3 group-hover:rotate-0 transition-transform">
                                       <span className="text-3xl font-black italic text-white tracking-tighter">{targetGPA}</span>
                                    </div>
                                 </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                 <div className="text-center p-4 rounded-2xl bg-white/5">
                                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Gap</p>
                                    <p className={`text-xl font-black italic ${targetDiff <= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                       {targetDiff <= 0 ? '0.00' : targetDiff.toFixed(2)}
                                    </p>
                                 </div>
                                 <div className="text-center p-4 rounded-2xl bg-white/5">
                                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Tier</p>
                                    <p className="text-xl font-black italic text-primary">
                                       {parseFloat(targetGPA) >= 9 ? 'S' : 'A'}
                                    </p>
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className={`mt-10 p-8 rounded-[2rem] text-center border transition-all ${targetDiff <= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
                           <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Strategy</p>
                           <p className="text-sm font-bold uppercase italic text-white leading-tight">
                              {targetDiff <= 0
                                 ? 'Maintain Current trajectory to exceed target.'
                                 : `Aggressive performance boost needed in remaining units.`}
                           </p>
                        </div>
                     </div>
                  </div>

                  {/* Course Breakdown */}
                  <section className="space-y-10">
                     <div className="flex items-center justify-between px-4">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-xl">
                              <BookOpen size={24} />
                           </div>
                           <div>
                              <h2 className="text-3xl font-black uppercase tracking-tighter text-white italic">Course <span className="text-primary">Sentinel</span></h2>
                              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                                 {mode === "auto" ? "Individual Subject Intelligence" : "Simulation Override Matrix"}
                              </p>
                           </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {calculator.courseStats.map((course: any, i: number) => (
                           <div key={i} className="glass-card rounded-[3rem] p-10 border-white/5 hover:border-primary/30 transition-all group relative overflow-hidden flex flex-col justify-between min-h-[22rem]">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-all" />

                              <div className="relative z-10 flex-1">
                                 <div className="flex justify-between items-start gap-4 mb-8">
                                    <div className="flex-1 min-w-0">
                                       <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-primary border border-primary/20 mb-3 block w-fit">
                                          {course.courseCode}
                                       </span>
                                       <h4 className="text-xl lg:text-2xl font-black uppercase italic tracking-tighter leading-tight group-hover:text-primary transition-colors break-words">
                                          {course.courseTitle}
                                       </h4>
                                    </div>
                                    <button 
                                       onClick={() => mode === "manual" && toggleManualGrade(course.courseCode)}
                                       className={`w-16 h-16 shrink-0 bg-white/[0.02] border flex items-center justify-center rounded-2xl text-2xl font-black italic transition-all group-hover:scale-110 shadow-2xl ${
                                          mode === "manual" 
                                          ? "cursor-pointer border-primary ring-2 ring-primary/20 ring-offset-4 ring-offset-[#0a0a0b] text-primary bg-primary/5 animate-pulse" 
                                          : "cursor-default border-white/5 text-white group-hover:text-primary"
                                       }`}
                                    >
                                       {course.grade}
                                    </button>
                                 </div>
                              </div>

                              <div className="relative z-10 space-y-6 mt-auto">
                                 <div className="relative">
                                    <div className="flex justify-between items-end mb-3">
                                       <p className="text-[10px] font-black uppercase tracking-widest text-white/30">
                                          {mode === "auto" ? "Intelligence Depth" : "Simulation Weight"}
                                       </p>
                                       <p className="text-2xl font-black italic text-white">
                                          {mode === "auto" ? `${course.percentage.toFixed(1)}%` : `${course.points} GP`}
                                       </p>
                                    </div>
                                    <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden p-[2px]">
                                       <div
                                          className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all duration-1000 ease-out"
                                          style={{ width: mode === "auto" ? `${course.percentage}%` : `${(course.points / 10) * 100}%` }}
                                       />
                                    </div>
                                 </div>

                                 <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                                    <div>
                                       <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Credits</p>
                                       <p className="text-lg font-black italic text-white/80">{course.credits} <span className="text-[10px] opacity-40">Unit</span></p>
                                    </div>
                                    <div className="text-right">
                                       <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Points</p>
                                       <p className="text-lg font-black italic text-primary">{course.points} <span className="text-[10px] opacity-40">GP</span></p>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </section>
               </>
            ) : (
               <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 animate-in fade-in zoom-in-95 duration-500">
                  <div className="lg:col-span-3 space-y-6">
                     <div className="flex items-center justify-between px-4 mb-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Input Matrix</p>
                        <button 
                           onClick={() => setSemesters([...semesters, { id: Date.now(), sgpa: "", credits: "" }])}
                           className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl text-[10px] font-black uppercase text-primary hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/10"
                        >
                           <Plus size={14} />
                           Add Semester
                        </button>
                     </div>

                     <div className="space-y-4">
                        {semesters.map((sem, index) => (
                           <div key={sem.id} className="glass-card rounded-3xl p-6 lg:p-8 border-white/5 flex flex-col md:flex-row items-center gap-6 group hover:border-primary/20 transition-all relative overflow-hidden">
                              <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
                              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 font-black italic text-xl shrink-0">{index + 1}</div>
                              <div className="flex-1 grid grid-cols-2 gap-6 w-full">
                                 <div className="space-y-2">
                                    <label className="text-[9px] font-black text-white/20 uppercase tracking-widest block ml-1">SGPA Score</label>
                                    <input 
                                       type="number" step="0.01" placeholder="0.00" value={sem.sgpa}
                                       onChange={(e) => setSemesters(semesters.map(s => s.id === sem.id ? { ...s, sgpa: e.target.value } : s))}
                                       className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-xl font-black italic text-white placeholder:text-white/5 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                    />
                                 </div>
                                 <div className="space-y-2">
                                    <label className="text-[9px] font-black text-white/20 uppercase tracking-widest block ml-1">Credits</label>
                                    <input 
                                       type="number" placeholder="00" value={sem.credits}
                                       onChange={(e) => setSemesters(semesters.map(s => s.id === sem.id ? { ...s, credits: e.target.value } : s))}
                                       className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-xl font-black italic text-white placeholder:text-white/5 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                    />
                                 </div>
                              </div>
                              <button 
                                 onClick={() => semesters.length > 1 && setSemesters(semesters.filter(s => s.id !== sem.id))}
                                 className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shrink-0 border border-rose-500/20"
                              >
                                 <Trash2 size={18} />
                              </button>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="lg:col-span-2 space-y-8">
                     <div className="glass-card rounded-[3rem] p-8 lg:p-12 border-primary/20 bg-primary/5 shadow-2xl shadow-primary/10 relative overflow-visible text-center group sticky top-8">
                        <div className="absolute top-0 right-0 p-10 text-primary/10 group-hover:scale-110 transition-transform pointer-events-none">
                           <TrendingUp size={120} />
                        </div>
                        <div className="relative z-10">
                           <p className="text-[12px] font-black uppercase tracking-[0.5em] text-primary mb-8">Cumulative Grade</p>
                           <div className="relative inline-block mb-10 w-full">
                              <h2 className="text-7xl lg:text-[9rem] font-black tracking-tighter italic leading-none text-white drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] break-words">
                                 {cgpaResults.cgpa}
                              </h2>
                           </div>
                           <div className="grid grid-cols-1 gap-4 pt-8 border-t border-white/5">
                              <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
                                 <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Lifetime Credits Accumulated</p>
                                 <p className="text-3xl font-black italic text-white">{cgpaResults.totalCredits}</p>
                              </div>
                           </div>
                           <div className="mt-8 p-6 rounded-3xl bg-primary/10 border border-primary/20">
                              <p className="text-[9px] font-black text-primary/60 uppercase tracking-widest mb-2">Academic Standing</p>
                              <p className="text-sm font-bold uppercase italic text-white">
                                 {cgpaResults.cgpaNum >= 9 ? 'Elite Distinction Tier' : cgpaResults.cgpaNum >= 8 ? 'High Honors Protocol' : 'Optimization Mode Active'}
                              </p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            )}
         </div>
      </div>
   );
}
