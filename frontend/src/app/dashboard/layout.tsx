"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, Users, LogOut, Database, Activity, Sun, Moon, Banknote, IndianRupee, DollarSign } from "lucide-react";
import { useCurrency } from "@/lib/CurrencyContext";

// Create a sub-component for the layout interior so it has access to useCurrency
function DashboardInterior({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [theme, setTheme] = useState("light");
  const { currency, setCurrency } = useCurrency();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const pageTitle = pathname === "/dashboard" ? "Overview & Analytics" :
                    pathname === "/dashboard/employees" ? "Employee Directory" :
                    pathname === "/dashboard/seed" ? "Database Control Center" : "";

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      
      {/* Modern Sidebar */}
      <aside className="w-72 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200/60 dark:border-slate-800/60 flex flex-col transition-colors z-20">
        <div className="h-20 flex items-center px-8 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 mr-3">
            <span className="text-white font-bold text-xl tracking-tighter">AC</span>
          </div>
          <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
            ACME HR
          </span>
        </div>
        
        <nav className="flex-1 px-4 py-8 space-y-2.5 overflow-y-auto">
          <div className="px-4 mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Core</div>
          
          <Link
            href="/dashboard"
            className={`flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 group ${
              pathname === "/dashboard"
                ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-semibold shadow-sm border border-indigo-100 dark:border-indigo-500/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50"
            }`}
          >
            <LayoutDashboard className={`w-5 h-5 mr-3 transition-transform group-hover:scale-110 ${pathname === "/dashboard" ? "text-indigo-600 dark:text-indigo-400" : ""}`} />
            Overview
          </Link>

          <Link
            href="/dashboard/employees"
            className={`flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 group ${
              pathname === "/dashboard/employees"
                ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-semibold shadow-sm border border-indigo-100 dark:border-indigo-500/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50"
            }`}
          >
            <Users className={`w-5 h-5 mr-3 transition-transform group-hover:scale-110 ${pathname === "/dashboard/employees" ? "text-indigo-600 dark:text-indigo-400" : ""}`} />
            Directory
          </Link>

          <div className="px-4 mt-8 mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">System</div>

          <Link
            href="/dashboard/seed"
            className={`flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 group ${
              pathname === "/dashboard/seed"
                ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-semibold shadow-sm border border-indigo-100 dark:border-indigo-500/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50"
            }`}
          >
            <Database className="w-5 h-5 mr-3 transition-transform group-hover:scale-110" />
            Data Seeder
          </Link>
          
          <a
            href="http://localhost:8000/tracenest"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 group"
          >
            <Activity className="w-5 h-5 mr-3 transition-transform group-hover:scale-110" />
            TraceNest Logs
          </a>
        </nav>

        <div className="p-6 border-t border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center px-4 py-3 mb-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            {theme === "light" ? (
              <><Moon className="w-5 h-5 mr-3 text-slate-500" /> Switch to Dark Mode</>
            ) : (
              <><Sun className="w-5 h-5 mr-3 text-amber-500" /> Switch to Light Mode</>
            )}
          </button>
          
          <Link
            href="/"
            className="flex items-center px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Sleek Top Header */}
        <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between px-10 z-10 sticky top-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">
              {pageTitle}
            </h1>
          </div>

          <div className="flex items-center space-x-6">
            {/* Currency Toggle Component */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner">
              <button
                onClick={() => setCurrency("INR")}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                  currency === "INR" 
                    ? "bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm" 
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                <IndianRupee className="w-4 h-4 mr-1.5" />
                INR
              </button>
              <button
                onClick={() => setCurrency("USD")}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                  currency === "USD" 
                    ? "bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm" 
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                <DollarSign className="w-4 h-4 mr-1.5" />
                USD
              </button>
            </div>
            
            {/* User Avatar */}
            <div className="flex items-center pl-6 border-l border-slate-200 dark:border-slate-700">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 border-2 border-white dark:border-slate-800 shadow-md"></div>
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto p-10 relative">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardInterior>{children}</DashboardInterior>
  );
}

