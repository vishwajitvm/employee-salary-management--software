"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useCurrency } from "@/lib/CurrencyContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Users, Briefcase, TrendingUp, IndianRupee, DollarSign } from "lucide-react";

interface SummaryData {
  total_employees: number;
  total_payroll: number;
  avg_salary_by_department: Record<string, number>;
  avg_salary_by_country: Record<string, number>;
}

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#14b8a6", "#f43f5e"];

export default function DashboardPage() {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const { currency, usdRate } = useCurrency();

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await api.get("/analytics/summary");
      setData(res.data);
    } catch {
      // Errors handled by Axios interceptor
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  if (!data) return null;

  const deptData = Object.entries(data.avg_salary_by_department).map(([name, value]) => ({
    name,
    value: Math.round(value),
  }));

  const countryData = Object.entries(data.avg_salary_by_country).map(([name, value]) => ({
    name,
    value: Math.round(value),
  }));

  // Utility to format values based on global context
  const formatValue = (val: number) => {
    if (currency === "USD") {
      return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val * usdRate);
    }
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);
  };

  const formatValueShort = (val: number) => {
    if (currency === "USD") {
      return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0, notation: "compact", compactDisplay: "short" }).format(val * usdRate);
    }
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0, notation: "compact", compactDisplay: "short" }).format(val);
  };

  const CurrencyIcon = currency === "USD" ? DollarSign : IndianRupee;

  return (
    <div className="space-y-8 pb-10">
      
      {/* Premium Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <div className="relative overflow-hidden bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-slate-100 dark:border-slate-700/60 group transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
          <div className="relative z-10 flex items-center mb-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-2xl shadow-sm mr-4">
              <CurrencyIcon strokeWidth={2.5} size={26} />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Annual Payroll</h3>
          </div>
          <p className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight relative z-10">
            {formatValue(data.total_payroll)}
          </p>
        </div>

        <div className="relative overflow-hidden bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-slate-100 dark:border-slate-700/60 group transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
          <div className="relative z-10 flex items-center mb-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl shadow-sm mr-4">
              <Users strokeWidth={2.5} size={26} />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Employees</h3>
          </div>
          <p className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight relative z-10">
            {new Intl.NumberFormat("en-US").format(data.total_employees)}
          </p>
        </div>

        <div className="relative overflow-hidden bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-slate-100 dark:border-slate-700/60 group transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
          <div className="relative z-10 flex items-center mb-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl shadow-sm mr-4">
              <TrendingUp strokeWidth={2.5} size={26} />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Avg Global Salary</h3>
          </div>
          <p className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight relative z-10">
            {formatValue(data.total_payroll / (data.total_employees || 1))}
          </p>
        </div>

      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Bar Chart */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-slate-100 dark:border-slate-700/60">
          <div className="flex items-center mb-8">
            <Briefcase className="w-5 h-5 text-indigo-500 mr-2" />
            <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">Department Averages</h2>
          </div>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} margin={{ top: 20, right: 30, left: 10, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 13, fontWeight: 500}} 
                  angle={-45} 
                  textAnchor="end"
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={(val: any) => formatValueShort(Number(val))} 
                  tick={{fill: '#64748b', fontSize: 13, fontWeight: 500}} 
                />
                <Tooltip 
                  formatter={(val: any) => [formatValue(Number(val)), "Average Salary"]} 
                  cursor={{fill: '#f1f5f9', opacity: 0.1}}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#f8fafc', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)' }} 
                  itemStyle={{color: '#f8fafc', fontWeight: 'bold'}}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-slate-100 dark:border-slate-700/60 flex flex-col">
          <div className="flex items-center mb-8">
            <Users className="w-5 h-5 text-emerald-500 mr-2" />
            <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">Geographic Distribution</h2>
          </div>
          <div className="flex-1 min-h-[350px] relative flex flex-col justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={countryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={90}
                  outerRadius={140}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {countryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: any) => [formatValue(Number(val)), "Average Salary"]} 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#f8fafc', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)' }} 
                  itemStyle={{color: '#f8fafc', fontWeight: 'bold'}}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Custom Legend */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mt-4">
              {countryData.map((entry, index) => (
                <div key={entry.name} className="flex items-center text-sm font-semibold text-slate-600 dark:text-slate-300">
                  <span className="w-3.5 h-3.5 rounded-full mr-2.5 shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                  {entry.name}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
