"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import api from "@/lib/api";
import { useCurrency } from "@/lib/CurrencyContext";
import Swal from "sweetalert2";
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Zap, Users, Download, FileText, Loader2, Plus, X, AlertCircle, CheckCircle2 } from "lucide-react";

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  country: string;
  city: string;
  base_salary: number;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(15);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  
  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmp, setNewEmp] = useState({
    first_name: "", last_name: "", email: "", department: "Engineering", country: "", city: "", base_salary: ""
  });
  const [emailStatus, setEmailStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();

  const { currency, usdRate } = useCurrency();

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/employees", {
        params: { page, size, search: search || undefined, department: department || undefined, country: country || undefined, city: city || undefined },
      });
      setEmployees(res.data.data);
      setTotal(res.data.total);
    } catch {
      // Errors handled by Axios interceptor
    } finally {
      setLoading(false);
    }
  }, [page, size, search, department, country, city]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchEmployees();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [fetchEmployees]);

  const pollTaskStatus = async (taskId: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/tasks/${taskId}`);
        if (res.data.status === "SUCCESS") {
          clearInterval(interval);
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Bulk update completed successfully!',
            showConfirmButton: false,
            timer: 4000,
            timerProgressBar: true,
          });
          fetchEmployees();
        } else if (res.data.status === "FAILURE") {
          clearInterval(interval);
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'error',
            title: 'Background task failed.',
            showConfirmButton: false,
            timer: 4000
          });
        }
      } catch (err) {
        console.error("Polling error", err);
      }
    }, 2000);
  };

  const handleBulkUpdate = () => {
    if (!department && !country && !city) {
      Swal.fire({
        title: "Select a Target", 
        text: "Please select a department, country, or city from the filters first to apply a bulk update.", 
        icon: "warning",
        confirmButtonColor: "#6366f1",
      });
      return;
    }

    const targetDesc = [department, country, city].filter(Boolean).join(" - ");

    Swal.fire({
      title: `Update Salaries`,
      html: `Target: <strong>${targetDesc}</strong><br><br>Enter percentage increase (e.g., 5 for +5%)`,
      input: "number",
      showCancelButton: true,
      confirmButtonText: "Execute Update",
      confirmButtonColor: "#6366f1",
      preConfirm: (val) => {
        if (!val || isNaN(Number(val))) {
          Swal.showValidationMessage("Please enter a valid number");
        }
        return Number(val);
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await api.post("/salaries/bulk-update", {
            department: department || null,
            country: country || null,
            city: city || null,
            percentage_increase: result.value
          });
          
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'info',
            title: 'Update initiated in background...',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
          });
          
          if (res.data.task_id) {
            pollTaskStatus(res.data.task_id);
          }
        } catch {
          // Handled by Axios
        }
      }
    });
  };

  const handleExportGlobalReport = () => {
    setExporting(true);
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (department) params.append("department", department);
    if (country) params.append("country", country);
    if (city) params.append("city", city);
    
    window.open(`http://localhost:8000/api/v1/reports/salary-history?${params.toString()}`, "_blank");
    setTimeout(() => setExporting(false), 1000);
  };

  const handleDownloadDossier = (empId: string) => {
    const rate = currency === "USD" ? usdRate : 1.0;
    window.open(`http://localhost:8000/api/v1/reports/employee/${empId}?currency=${currency}&rate=${rate}`, "_blank");
  };

  const formatValue = (val: number) => {
    if (currency === "USD") {
      return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val * usdRate);
    }
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);
  };

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(total / size));

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
      }
    }
    return pages;
  };

  // --- Modal Logic ---
  const handleEmailChange = (val: string) => {
    setNewEmp({ ...newEmp, email: val });
    if (!val.includes("@") || !val.includes(".")) {
      setEmailStatus("idle");
      return;
    }
    setEmailStatus("checking");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.get(`/employees/check-email?email=${encodeURIComponent(val)}`);
        setEmailStatus(res.data.exists ? "taken" : "available");
      } catch {
        setEmailStatus("idle");
      }
    }, 500);
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emailStatus === "taken") return;
    setIsSubmitting(true);
    try {
      await api.post("/employees", {
        ...newEmp,
        base_salary: Number(newEmp.base_salary) || 0
      });
      setShowAddModal(false);
      setNewEmp({ first_name: "", last_name: "", email: "", department: "Engineering", country: "", city: "", base_salary: "" });
      setEmailStatus("idle");
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Employee added successfully',
        showConfirmButton: false,
        timer: 3000
      });
      fetchEmployees();
    } catch (err: any) {
      if (err.response?.status === 400) {
        setEmailStatus("taken");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-10 relative">
      
      {/* Premium Filters & Actions Bar */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.2)] border border-slate-100 dark:border-slate-700/60 flex flex-col xl:flex-row justify-between items-center gap-6 relative z-10">
        
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 w-full xl:w-[60%] relative">
          <div className="relative flex-1 min-w-[200px] group">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by name, email, city, country..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
            {loading && search && (
               <Loader2 className="absolute right-4 top-3.5 h-5 w-5 text-indigo-500 animate-spin" />
            )}
          </div>
          
          <select
            className="w-full sm:w-auto px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
            value={department}
            onChange={(e) => { setDepartment(e.target.value); setPage(1); }}
          >
            <option value="">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Sales">Sales</option>
            <option value="Marketing">Marketing</option>
            <option value="Finance">Finance</option>
            <option value="HR">HR</option>
            <option value="Legal">Legal</option>
            <option value="Operations">Operations</option>
          </select>
          
          <select
            className="w-full sm:w-auto px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
            value={country}
            onChange={(e) => { setCountry(e.target.value); setPage(1); }}
          >
            <option value="">All Countries</option>
            <option value="USA">USA</option>
            <option value="India">India</option>
            <option value="UK">UK</option>
            <option value="Canada">Canada</option>
            <option value="Germany">Germany</option>
            <option value="Australia">Australia</option>
            <option value="Singapore">Singapore</option>
          </select>
          
          <select
            className="w-full sm:w-auto px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
            value={city}
            onChange={(e) => { setCity(e.target.value); setPage(1); }}
            disabled={!country}
          >
            <option value="">All Cities</option>
            {country === "USA" && <><option>New York</option><option>San Francisco</option><option>Austin</option><option>Seattle</option><option>Chicago</option></>}
            {country === "India" && <><option>Bangalore</option><option>Mumbai</option><option>Delhi</option><option>Hyderabad</option><option>Pune</option></>}
            {country === "UK" && <><option>London</option><option>Manchester</option><option>Edinburgh</option><option>Bristol</option><option>Birmingham</option></>}
            {country === "Canada" && <><option>Toronto</option><option>Vancouver</option><option>Montreal</option><option>Calgary</option><option>Ottawa</option></>}
            {country === "Germany" && <><option>Berlin</option><option>Munich</option><option>Frankfurt</option><option>Hamburg</option><option>Stuttgart</option></>}
            {country === "Australia" && <><option>Sydney</option><option>Melbourne</option><option>Brisbane</option><option>Perth</option><option>Adelaide</option></>}
            {country === "Singapore" && <option>Singapore</option>}
          </select>
        </div>

        <div className="flex flex-col sm:flex-row w-full xl:w-auto gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center px-4 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-all font-bold tracking-wide"
          >
            <Plus className="w-5 h-5 mr-1" />
            New
          </button>
          
          <button
            onClick={handleExportGlobalReport}
            disabled={exporting}
            className="flex items-center justify-center px-4 py-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-xl transition-all font-bold tracking-wide disabled:opacity-70"
            title="Download Master CSV Report"
          >
            {exporting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Download className="w-5 h-5 mr-2" />}
            Export
          </button>
          
          <button
            onClick={handleBulkUpdate}
            className="flex items-center justify-center px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-indigo-500/30 transition-all font-bold tracking-wide"
          >
            <Zap className="w-5 h-5 mr-2 fill-white/20" />
            Bulk Update
          </button>
        </div>
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add New Employee</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleCreateEmployee} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">First Name</label>
                  <input required type="text" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white" value={newEmp.first_name} onChange={e => setNewEmp({...newEmp, first_name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Last Name</label>
                  <input required type="text" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white" value={newEmp.last_name} onChange={e => setNewEmp({...newEmp, last_name: e.target.value})} />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                <div className="relative">
                  <input 
                    required 
                    type="email" 
                    className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border rounded-xl focus:ring-2 outline-none dark:text-white pr-12 transition-all ${emailStatus === 'taken' ? 'border-red-500 focus:ring-red-500' : emailStatus === 'available' ? 'border-emerald-500 focus:ring-emerald-500' : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500'}`} 
                    value={newEmp.email} 
                    onChange={e => handleEmailChange(e.target.value)} 
                  />
                  <div className="absolute right-4 top-3.5">
                    {emailStatus === 'checking' && <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />}
                    {emailStatus === 'available' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                    {emailStatus === 'taken' && <AlertCircle className="w-5 h-5 text-red-500" />}
                  </div>
                </div>
                {emailStatus === 'taken' && (
                  <p className="text-red-500 text-sm font-medium mt-2 flex items-center"><AlertCircle className="w-4 h-4 mr-1"/> This email is already registered!</p>
                )}
                {emailStatus === 'available' && (
                  <p className="text-emerald-500 text-sm font-medium mt-2 flex items-center"><CheckCircle2 className="w-4 h-4 mr-1"/> Email is available</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Department</label>
                  <select className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white" value={newEmp.department} onChange={e => setNewEmp({...newEmp, department: e.target.value})}>
                    <option>Engineering</option><option>Sales</option><option>Marketing</option><option>Finance</option><option>HR</option><option>Legal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Country</label>
                  <input required type="text" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white" value={newEmp.country} onChange={e => setNewEmp({...newEmp, country: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">City</label>
                  <input required type="text" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white" value={newEmp.city} onChange={e => setNewEmp({...newEmp, city: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Base Salary (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-slate-400 font-bold">$</span>
                  <input required type="number" step="0.01" className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white" value={newEmp.base_salary} onChange={e => setNewEmp({...newEmp, base_salary: e.target.value})} />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-700">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-3 text-slate-600 dark:text-slate-300 font-bold mr-4 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={emailStatus === 'taken' || isSubmitting} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
                  Save Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-slate-100 dark:border-slate-700/60 overflow-hidden">
        
        {loading && employees.length > 0 && (
          <div className="absolute top-0 left-0 w-full h-1 overflow-hidden bg-indigo-100 dark:bg-slate-700 z-20">
            <div className="h-full bg-indigo-500 animate-[pulse_1s_ease-in-out_infinite]" style={{ width: '100%' }}></div>
          </div>
        )}

        <div className={`overflow-x-auto transition-opacity duration-300 ${loading && employees.length > 0 ? "opacity-60 pointer-events-none" : "opacity-100"}`}>
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700/50">
            <thead className="bg-slate-50/80 dark:bg-slate-900/50">
              <tr>
                <th scope="col" className="px-8 py-5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Employee</th>
                <th scope="col" className="px-8 py-5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Department</th>
                <th scope="col" className="px-8 py-5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Location</th>
                <th scope="col" className="px-8 py-5 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Base Salary</th>
                <th scope="col" className="px-8 py-5 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Dossier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50 bg-white dark:bg-slate-800">
              
              {loading && employees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <Loader2 className="inline-block animate-spin h-10 w-10 text-indigo-500 mb-4" />
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Scanning global directory...</p>
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-500 dark:text-slate-400">
                    <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4 shadow-inner">
                      <Users className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="font-bold text-xl text-slate-700 dark:text-slate-300">No employees found</p>
                    <p className="text-sm mt-2 max-w-md mx-auto">We couldn't find anyone matching those exact filters. Try broadening your search or seed the database.</p>
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 flex items-center justify-center border border-indigo-200/50 dark:border-indigo-700/50">
                          <span className="text-indigo-700 dark:text-indigo-300 font-bold">{emp.first_name[0]}{emp.last_name[0]}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{emp.first_name} {emp.last_name}</div>
                          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <span className="px-3 py-1.5 inline-flex text-xs font-bold rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
                        {emp.department}
                      </span>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {emp.city}, <span className="text-slate-500">{emp.country}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-right">
                      <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {formatValue(emp.base_salary)}
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-center">
                      <button 
                        onClick={() => handleDownloadDossier(emp.id)}
                        className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                        title="Download Individual Detailed Dossier"
                      >
                        <FileText className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Advanced Pagination & Row Limits */}
        <div className="bg-slate-50/80 dark:bg-slate-900/50 px-8 py-5 border-t border-slate-200 dark:border-slate-700/50 flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center space-x-3 text-sm font-medium text-slate-600 dark:text-slate-400">
            <span>Rows per page:</span>
            <select
              className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer shadow-sm"
              value={size}
              onChange={(e) => {
                setSize(Number(e.target.value));
                setPage(1);
              }}
              disabled={loading}
            >
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={500}>500</option>
              <option value={1000}>1,000</option>
            </select>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-6">
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400 text-center">
              Showing <span className="font-bold text-slate-900 dark:text-white">{total === 0 ? 0 : (page - 1) * size + 1}</span> to <span className="font-bold text-slate-900 dark:text-white">{Math.min(page * size, total)}</span> of <span className="font-bold text-slate-900 dark:text-white">{total}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <button onClick={() => setPage(1)} disabled={page === 1 || loading} className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm">
                <ChevronsLeft className="h-4 w-4" />
              </button>
              
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || loading} className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm mr-2">
                <ChevronLeft className="h-4 w-4" />
              </button>

              {getPageNumbers().map((pageNum, index) => (
                pageNum === '...' ? (
                  <span key={`ellipsis-${index}`} className="px-2 text-slate-400 font-medium">...</span>
                ) : (
                  <button key={`page-${pageNum}`} onClick={() => setPage(pageNum as number)} disabled={loading} className={`inline-flex items-center justify-center w-9 h-9 rounded-lg border transition-all shadow-sm font-semibold text-sm ${page === pageNum ? "bg-indigo-600 border-indigo-600 text-white shadow-indigo-500/30 pointer-events-none" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed"}`}>
                    {pageNum}
                  </button>
                )
              ))}

              <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages || loading} className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm ml-2">
                <ChevronRight className="h-4 w-4" />
              </button>
              
              <button onClick={() => setPage(totalPages)} disabled={page === totalPages || loading} className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm">
                <ChevronsRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
