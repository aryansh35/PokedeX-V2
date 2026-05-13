"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getDashboardData } from "@/server/actions";

import { getDayOrderFromPlanner } from "@/lib/planner-data";

interface DashboardContextType {
   data: any;
   loading: boolean;
   dayOrder: number;
   lastSynced: number | null;
   theme: string;
   setTheme: (theme: string) => void;
   refreshData: (force?: boolean) => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
   const [data, setData] = useState<any>(null);
   const [loading, setLoading] = useState(true);
   const [dayOrder, setDayOrder] = useState(() => getDayOrderFromPlanner());
   const [lastSynced, setLastSynced] = useState<number | null>(null);
   const [theme, setThemeState] = useState<string>("onyx");

   useEffect(() => {
      const savedTheme = localStorage.getItem("pokedex_theme") || "onyx";
      setThemeState(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
   }, []);

   const setTheme = (newTheme: string) => {
      setThemeState(newTheme);
      localStorage.setItem("pokedex_theme", newTheme);
      document.documentElement.setAttribute("data-theme", newTheme);
   };

   const forceLogout = useCallback(() => {
      localStorage.clear();
      sessionStorage.clear();
      if ('caches' in window) {
         caches.keys().then(names => {
            names.forEach(name => caches.delete(name));
         });
      }
      window.location.href = "/login";
   }, []);

   const load = useCallback(async (force: boolean = false, isRetry: boolean = false) => {
      // If we already have data and this isn't a force refresh, don't block the UI
      const cached = localStorage.getItem("pokedex_cache");
      let currentCache = cached ? JSON.parse(cached) : null;

      if (currentCache && !force && !isRetry) {
         setData(currentCache.data);
         // Prioritize Planner but keep cache if planner is zero and cache has value
         const plannerDO = getDayOrderFromPlanner();
         setDayOrder(plannerDO || currentCache.dayOrder || 0);
         setLastSynced(currentCache.dynamicTimestamp);
         setLoading(false); // UI is now interactive with cached data
      } else if (!isRetry) {
         setLoading(true);
      }

      try {
         const now = Date.now();
         const SIX_HOURS = 6 * 60 * 60 * 1000;
         const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

         const targets: string[] = [];
         const lastDOFetch = currentCache?.dayOrderTimestamp || 0;
         const isNewDay = new Date().toDateString() !== new Date(lastDOFetch).toDateString();

         // We still fetch dayOrder as a "live verification" but prioritize planner
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

         // If no sync needed, we already set the data from cache above
         if (targets.length === 0) {
            setLoading(false);
            return;
         }

         // Set a timeout for the network request
         const controller = new AbortController();
         const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

         const res = await getDashboardData(targets);
         clearTimeout(timeoutId);

         if (res.success) {
            const newData = res.data;

            // VALIDATION: Ensure we don't overwrite good cache with empty data (SRM glitch)
            const hasNewAttendance = newData.attendance && newData.attendance.length > 0;
            const hasNewMarks = newData.marks && newData.marks.length > 0;

            const merged = currentCache ? { ...currentCache.data } : {};

            if (targets.includes("attendance") && hasNewAttendance) merged.attendance = newData.attendance;
            if (targets.includes("marks") && hasNewMarks) merged.marks = newData.marks;
            if (targets.includes("courses") && newData.courses?.length > 0) merged.courses = newData.courses;
            if (targets.includes("profile") && newData.profile?.name) merged.profile = newData.profile;

            // INTELLIGENCE: Prioritize Planner, fallback to liveDO
            const plannerDO = getDayOrderFromPlanner();
            const liveDO = targets.includes("dayOrder") ? (newData.dayOrder || plannerDO) : (currentCache?.dayOrder || plannerDO);

            const updatedCache = {
               data: merged,
               dayOrder: liveDO,
               dayOrderTimestamp: targets.includes("dayOrder") ? now : (currentCache?.dayOrderTimestamp || now),
               dynamicTimestamp: (hasNewAttendance || hasNewMarks) ? now : (currentCache?.dynamicTimestamp || now),
               staticTimestamp: (targets.includes("courses") || targets.includes("profile")) ? now : (currentCache?.staticTimestamp || now),
            };

            localStorage.setItem("pokedex_cache", JSON.stringify(updatedCache));
            setData(merged);
            setDayOrder(liveDO);
            setLastSynced(updatedCache.dynamicTimestamp);
         } else if (res.error === "AUTH_ERROR") {
            forceLogout();
            return;
         } else if (currentCache) {
            // Fallback to cache silently if sync fails
            setData(currentCache.data);
            setDayOrder(currentCache.dayOrder || 0);
            setLastSynced(currentCache.dynamicTimestamp);
         } else if (!isRetry) {
            console.warn("Retrying SRM Link...");
            setTimeout(() => load(force, true), 1000);
            return;
         }
      } catch (error) {
         console.error("Dashboard Intelligence Error:", error);
         if (!isRetry && !currentCache) setTimeout(() => load(force, true), 1000);
      } finally {
         setLoading(false);
      }
   }, [forceLogout]);

   useEffect(() => {
      load();
   }, [load]);

   // Hybrid Heartbeat Security: Background Pulse + Visibility/Focus Verification
   useEffect(() => {
      let lastCheck = 0;
      const COOLDOWN = 60000; // 1 minute cooldown to prevent spamming SRM

      const checkSession = async () => {
         const now = Date.now();
         if (now - lastCheck < COOLDOWN) return;

         lastCheck = now;
         try {
            const res = await getDashboardData(["dayOrder"]);
            if (!res.success && res.error === "AUTH_ERROR") {
               forceLogout();
            }
         } catch (e) { /* ignore network noise */ }
      };

      // 1. Periodic Pulse (Every 5 minutes)
      const interval = setInterval(checkSession, 300000);

      // 2. Visibility Pulse (Triggered when tab becomes active or app re-opened)
      const handleVisibilityChange = () => {
         if (document.visibilityState === 'visible') {
            checkSession();
         }
      };

      window.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('focus', checkSession);

      return () => {
         clearInterval(interval);
         window.removeEventListener('visibilitychange', handleVisibilityChange);
         window.removeEventListener('focus', checkSession);
      };
   }, [forceLogout]);

   return (
      <DashboardContext.Provider value={{ data, loading, dayOrder, lastSynced, theme, setTheme, refreshData: load }}>
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
