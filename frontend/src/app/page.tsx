"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { Building2, Lock, Loader2 } from "lucide-react";
import api from "@/lib/api";

interface EmployeeMin {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [employees, setEmployees] = useState<EmployeeMin[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState("");

  const handleRoleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setRole(selected);
    
    if (selected === "HR_MANAGER") {
      setEmail("hr.manager@acme.com");
      setPassword("password123");
      setSelectedEmpId("");
    } else if (selected === "EMPLOYEE") {
      setEmail("");
      setPassword("userpass123"); // Mock password
      // Fetch 50 employees for dropdown
      setLoadingEmployees(true);
      try {
        const res = await api.get("/employees?size=50");
        setEmployees(res.data.data);
      } catch (err) {
        console.error("Failed to load employees", err);
      } finally {
        setLoadingEmployees(false);
      }
    } else {
      setEmail("");
      setPassword("");
    }
  };

  const handleEmployeeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const empId = e.target.value;
    setSelectedEmpId(empId);
    const emp = employees.find(e => e.id === empId);
    if (emp) {
      setEmail(emp.email);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === "HR_MANAGER") {
      Swal.fire({
        title: "Authenticated via SSO",
        text: "Welcome back, HR Manager.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        router.push("/dashboard");
      });
    } else if (role === "EMPLOYEE" && selectedEmpId) {
      Swal.fire({
        title: "Authenticated",
        text: "Logging into Employee Portal...",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        router.push(`/employee-portal?id=${selectedEmpId}`);
      });
    } else {
      Swal.fire({
        title: "Incomplete",
        text: "Please select an identity to login.",
        icon: "warning",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-indigo-600">
          <Building2 size={48} />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          ACME Org Salary Portal
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Internal Enterprise Tool
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Select Identity Profile
              </label>
              <div className="mt-1">
                <select
                  value={role}
                  onChange={handleRoleChange}
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                >
                  <option value="" disabled>Choose your role...</option>
                  <option value="HR_MANAGER">HR Manager (Admin)</option>
                  <option value="EMPLOYEE">Standard Employee</option>
                </select>
              </div>
            </div>

            {role === "EMPLOYEE" && (
              <div className="animate-in fade-in duration-300 slide-in-from-top-2">
                <label className="block text-sm font-medium text-gray-700">
                  Select Employee (Mock SSO Login)
                </label>
                <div className="mt-1 relative">
                  <select
                    value={selectedEmpId}
                    onChange={handleEmployeeSelect}
                    required
                    disabled={loadingEmployees}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                  >
                    <option value="" disabled>{loadingEmployees ? "Loading 50 employees..." : "Select an employee to impersonate"}</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.first_name} {emp.last_name} ({emp.email})
                      </option>
                    ))}
                  </select>
                  {loadingEmployees && (
                    <div className="absolute right-3 top-2">
                      <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 bg-gray-100 sm:text-sm text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  value={password}
                  readOnly
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 bg-gray-100 sm:text-sm text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Lock className="w-5 h-5 mr-2" /> Sign in via SSO
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
