"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { useCurrency } from "@/lib/CurrencyContext";
import { LogOut, User, Building, MapPin, Download, Loader2, ArrowRight } from "lucide-react";

function EmployeePortalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  
  const [emp, setEmp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { currency, usdRate } = useCurrency();

  useEffect(() => {
    if (!id) {
      router.push("/");
      return;
    }
    const fetchEmp = async () => {
      try {
        const res = await api.get(`/employees/${id}`);
        setEmp(res.data);
      } catch (err) {
        console.error("Failed to load employee portal", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmp();
  }, [id, router]);

  const handleDownloadDossier = () => {
    const rate = currency === "USD" ? usdRate : 1.0;
    window.open(`http://localhost:8000/api/v1/reports/employee/${id}?currency=${currency}&rate=${rate}`, "_blank");
  };

  const formatValue = (val: number) => {
    if (currency === "USD") {
      return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val * usdRate);
    }
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!emp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Profile Not Found</h2>
          <button onClick={() => router.push("/")} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg">Return to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      
      {/* Navbar */}
      <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
            A
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
            ACME<span className="text-indigo-600 dark:text-indigo-400">Portal</span>
          </span>
        </div>
        <button 
          onClick={() => router.push("/")}
          className="flex items-center text-slate-500 hover:text-indigo-600 font-medium transition-colors"
        >
          <LogOut className="w-4 h-4 mr-2" /> Sign Out
        </button>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Welcome, {emp.first_name}</h1>
            <p className="text-slate-500 mt-2 text-lg">View your confidential employment details and salary history.</p>
          </div>
          
          <button 
            onClick={handleDownloadDossier}
            className="flex items-center justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/30 font-bold transition-all"
          >
            <Download className="w-5 h-5 mr-2" /> Download Official Dossier
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Profile Card */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 rounded-full flex items-center justify-center border-2 border-indigo-200 dark:border-indigo-700/50 mb-6 mx-auto">
                <span className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                  {emp.first_name[0]}{emp.last_name[0]}
                </span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Full Name</label>
                  <div className="font-semibold text-lg flex items-center mt-1"><User className="w-4 h-4 mr-2 text-slate-400"/> {emp.first_name} {emp.last_name}</div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Work Email</label>
                  <div className="font-medium text-slate-600 dark:text-slate-400 mt-1">{emp.email}</div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Department</label>
                  <div className="font-semibold flex items-center mt-1"><Building className="w-4 h-4 mr-2 text-slate-400"/> {emp.department}</div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Location</label>
                  <div className="font-semibold flex items-center mt-1"><MapPin className="w-4 h-4 mr-2 text-slate-400"/> {emp.city}, {emp.country}</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 shadow-lg text-white">
              <label className="text-indigo-200 font-semibold text-sm uppercase tracking-wider">Current Base Salary</label>
              <div className="text-4xl font-extrabold mt-2 mb-1">{formatValue(emp.base_salary)}</div>
              <p className="text-indigo-200 text-sm">Valid as of {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* History Timeline */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-700 h-full">
              <h2 className="text-xl font-bold mb-6 flex items-center border-b border-slate-100 dark:border-slate-700 pb-4">
                Compensation History
              </h2>
              
              {emp.history.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ArrowRight className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-slate-500 font-medium">No compensation changes on record yet.</p>
                </div>
              ) : (
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-700 before:to-transparent">
                  {emp.history.map((h: any, i: number) => (
                    <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-slate-800 bg-emerald-500 text-slate-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        <svg className="fill-current w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M14.4 7.4L8 13.8l-3.4-3.4 1.4-1.4 2 2 5-5z" />
                        </svg>
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center justify-between space-x-2 mb-1">
                          <div className="font-bold text-slate-900 dark:text-white">Pay Increase</div>
                          <time className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-md">+{h.percentage_change}%</time>
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                          {new Date(h.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                        <div className="flex items-center text-sm font-semibold text-slate-700 dark:text-slate-300">
                          <span className="line-through text-slate-400 mr-2">{formatValue(h.old_salary)}</span>
                          <ArrowRight className="w-4 h-4 mr-2 text-indigo-500"/>
                          <span className="text-indigo-600 dark:text-indigo-400">{formatValue(h.new_salary)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}


import { Suspense } from 'react';

export default function EmployeePortal() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900"><Loader2 className="w-12 h-12 text-indigo-600 animate-spin" /></div>}>
      <EmployeePortalContent />
    </Suspense>
  );
}
