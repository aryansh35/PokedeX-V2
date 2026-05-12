"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getDashboardData } from "@/server/actions";

interface DashboardContextType {
   data: any;
   loading: boolean;
   dayOrder: number;
   lastSynced: number | null;
   refreshData: (force?: boolean) => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
   const [data, setData] = useState<any>(null);
   const [loading, setLoading] = useState(true);
   const [dayOrder, setDayOrder] = useState(0);
   const [lastSynced, setLastSynced] = useState<number | null>(null);

   const load = useCallback(async (force: boolean = false, isRetry: boolean = false) => {
      setLoading(true);
      try {
         const cached = localStorage.getItem("pokedex_cache");
         let currentCache = cached ? JSON.parse(cached) : null;

         const now = Date.now();
         const SIX_HOURS = 6 * 60 * 60 * 1000;
         const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

         const targets: string[] = [];
         
         // Smart Heartbeat: Cache Day Order for 6 hours + Midnight Reset
         const lastDOFetch = currentCache?.dayOrderTimestamp || 0;
         const isNewDay = new Date().toDateString() !== new Date(lastDOFetch).toDateString();
         
         if (force || !currentCache || isNewDay || (now - lastDOFetch > SIX_HOURS)) {
            targets.push("dayOrder");
         }

         if (force || !currentCache) {
            if (!targets.includes("attendance")) targets.push("attendance", "marks", "courses", "profile");
         } else {
            const dynamicAge = now - (currentCache.dynamicTimestamp || 0);
            const staticAge = now - (currentCache.staticTimestamp || 0);
            
            if (dynamicAge > SIX_HOURS && !targets.includes("attendance")) targets.push("attendance", "marks");
            if (staticAge > TWENTY_FOUR_HOURS && !targets.includes("courses")) targets.push("courses", "profile");
         }

         // If everything is fresh, just use cache
         if (targets.length === 0 && currentCache) {
            setData(currentCache.data);
            setDayOrder(currentCache.dayOrder || 0);
            setLastSynced(currentCache.dynamicTimestamp);
            setLoading(false);
            return;
         }

         const res = await getDashboardData(targets);
         if (res.success) {
            const newData = res.data;
            const merged = currentCache ? { ...currentCache.data } : {};
            
            if (targets.includes("attendance")) merged.attendance = newData.attendance;
            if (targets.includes("marks")) merged.marks = newData.marks;
            if (targets.includes("courses")) merged.courses = newData.courses;
            if (targets.includes("profile")) merged.profile = newData.profile;
            
            const liveDO = targets.includes("dayOrder") ? newData.dayOrder : (currentCache?.dayOrder || 0);
            
            const updatedCache = {
               data: merged,
               dayOrder: liveDO,
               dayOrderTimestamp: targets.includes("dayOrder") ? now : (currentCache?.dayOrderTimestamp || now),
               dynamicTimestamp: (targets.includes("attendance") || targets.includes("marks")) ? now : (currentCache?.dynamicTimestamp || now),
               staticTimestamp: (targets.includes("courses") || targets.includes("profile")) ? now : (currentCache?.staticTimestamp || now),
            };

            localStorage.setItem("pokedex_cache", JSON.stringify(updatedCache));
            setData(merged);
            setDayOrder(liveDO);
            setLastSynced(updatedCache.dynamicTimestamp);
         } else if (res.error === "AUTH_ERROR") {
            // CRITICAL: Session terminated elsewhere. Wipe and Redirect.
            localStorage.clear();
            sessionStorage.clear();
            if ('caches' in window) {
               caches.keys().then(names => {
                  names.forEach(name => caches.delete(name));
               });
            }
            window.location.href = "/login";
            return;
         } else if (currentCache) {
            setData(currentCache.data);
            setDayOrder(currentCache.dayOrder || 0);
            setLastSynced(currentCache.dynamicTimestamp);
         } else if (!isRetry) {
            // Automatic Tactical Retry if fresh login fails
            console.warn("Retrying SRM Link...");
            setTimeout(() => load(force, true), 1000);
            return; 
         }
      } catch (error) {
         console.error("Dashboard Intelligence Error:", error);
         if (!isRetry) setTimeout(() => load(force, true), 1000);
      } finally {
         if (!isRetry) setLoading(false);
      }
   }, []);

   useEffect(() => {
      load();
   }, [load]);

   return (
      <DashboardContext.Provider value={{ data, loading, dayOrder, lastSynced, refreshData: load }}>
         {children}
      </DashboardContext.Provider>
   );
}

export function useDashboard() {
   const context = useContext(DashboardContext);
   if (context === undefined) {
      throw new Error("useDashboard must be used within a DashboardProvider");
   }
   return context;
}
