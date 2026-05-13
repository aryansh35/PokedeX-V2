"use client";

import { useEffect, useState } from "react";
import { getDashboardData } from "@/server/actions";
import { RefreshCw, LayoutGrid, Book, Bookmark, Zap, BookOpen, FlaskConical } from "lucide-react";

import { useDashboard } from "@/context/DashboardContext";

export default function CoursesPage() {
   const { data, loading } = useDashboard();

   if (loading) return (
      <div className="min-h-screen flex items-center justify-center bg-background">
         <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-2xl shadow-primary/20 animate-bounce">
               <svg viewBox="0 0 100 100" className="w-8 h-8 text-foreground" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="44" fill="white" />
                  <path d="M50 6A44 44 0 0 1 94 50H62A12 12 0 0 0 38 50H6A44 44 0 0 1 50 6Z" fill="currentColor" />
                  <circle cx="50" cy="50" r="12" fill="white" stroke="#000" strokeWidth="6" />
                  <path d="M2 50H38" stroke="#000" strokeWidth="6" strokeLinecap="round" />
                  <path d="M62 50H98" stroke="#000" strokeWidth="6" strokeLinecap="round" />
                  <circle cx="50" cy="50" r="47" stroke="#000" strokeWidth="6" />
               </svg>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/60 animate-pulse">Syncing Data...</p>
         </div>
      </div>
   );

   const labPracticalCourses = data?.courses?.filter((c: any) =>
      (c.slot && c.slot.trim().toUpperCase().startsWith("P")) ||
      c.type.toLowerCase() === "practical"
   );

   const theoryCourses = data?.courses?.filter((c: any) =>
      !labPracticalCourses?.some((lc: any) => lc.code === c.code && lc.slot === c.slot)
   );

   const CourseCard = ({ course, i }: { course: any; i: number }) => (
      <div key={i} className="glass-card rounded-[2.5rem] p-6 lg:p-10 border-primary/10 flex items-start gap-6 lg:gap-8 hover:bg-foreground/[0.02] transition-all group relative overflow-hidden">
         <div className="absolute top-0 right-0 p-10 text-primary/5 group-hover:text-primary/10 transition-all">
            <Zap size={100} strokeWidth={3} />
         </div>

         <div className="w-14 h-14 lg:w-16 lg:h-16 bg-foreground/5 rounded-2xl flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-all flex-shrink-0 relative z-10">
            <LayoutGrid className="w-6 h-6 lg:w-7 lg:h-7" />
         </div>

         <div className="flex-1 relative z-10">
            <div className="flex justify-between items-start mb-4">
               <p className="text-[10px] font-black uppercase text-primary tracking-[0.3em]">{course.code}</p>
               <span className="px-3 py-1 bg-foreground/5 border border-border/10 rounded-full text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {course.credit} Credits
               </span>
            </div>
            <h3 className="text-xl lg:text-2xl font-black leading-tight mb-6 group-hover:text-primary transition-colors uppercase italic tracking-tighter text-foreground">{course.title}</h3>

            <div className="grid grid-cols-2 gap-4 lg:gap-6 pt-6 border-t border-primary/10">
               <div>
                  <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-1">Category</p>
                  <p className="text-xs lg:text-sm font-bold text-foreground line-clamp-1">{course.category}</p>
               </div>
               <div>
                  <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-1">Type</p>
                  <p className="text-xs lg:text-sm font-bold text-foreground">{course.type}</p>
               </div>
               <div>
                  <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-1">Time Slot</p>
                  <p className="text-xs lg:text-sm font-bold text-foreground uppercase italic">{course.slot || "N/A"}</p>
               </div>
               <div>
                  <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-1">Location / Room No</p>
                  <p className="text-xs lg:text-sm font-bold text-foreground uppercase italic">{course.room || "N/A"}</p>
               </div>
               <div className="col-span-2">
                  <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-1">Assigned Faculty</p>
                  <p className="text-xs lg:text-sm font-bold text-foreground uppercase italic">{course.faculty}</p>
               </div>
            </div>
         </div>
      </div>
   );

   return (
      <div className="p-4 lg:p-8 space-y-12 lg:space-y-24 max-w-7xl mx-auto pb-32">
         <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
               <h1 className="text-3xl lg:text-5xl font-black tracking-tighter text-foreground uppercase italic">Course <span className="text-primary">Intelligence</span></h1>
               <p className="text-muted-foreground font-medium text-sm lg:text-lg">Strategic academic catalog and credit distribution</p>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 bg-primary/10 rounded-2xl border border-primary/20">
               <Bookmark className="text-primary fill-primary/20" size={20} />
               <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">Catalog Verified</span>
            </div>
         </header>

         {/* Theory Section */}
         {theoryCourses?.length > 0 && (
            <section className="space-y-10">
               <div className="flex items-center gap-4 px-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-2xl shadow-amber-500/10 border border-amber-500/20">
                     <BookOpen size={24} />
                  </div>
                  <div>
                     <h2 className="text-2xl font-black uppercase tracking-widest text-foreground italic">Theory <span className="text-amber-500">Intelligence</span></h2>
                     <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-[0.3em]">Fundamental Knowledge Matrix</p>
                  </div>
               </div>
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {theoryCourses.map((course: any, i: number) => <CourseCard key={i} course={course} i={i} />)}
               </div>
            </section>
         )}

         {/* Lab/Practical Section */}
         {labPracticalCourses?.length > 0 && (
            <section className="space-y-10">
               <div className="flex items-center gap-4 px-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-2xl shadow-emerald-500/10 border border-emerald-500/20">
                     <FlaskConical size={24} />
                  </div>
                  <div>
                     <h2 className="text-2xl font-black uppercase tracking-widest text-foreground italic">Applied <span className="text-primary">Intelligence</span></h2>
                     <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-[0.3em]">Lab & Practical Execution Matrix</p>
                  </div>
               </div>
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {labPracticalCourses.map((course: any, i: number) => <CourseCard key={i} course={course} i={i} />)}
               </div>
            </section>
         )}
      </div>
   );
}
