"use client";

import { useState } from "react";
import api from "@/lib/api";
import Swal from "sweetalert2";
import { Database, Trash2, AlertTriangle, PlayCircle } from "lucide-react";

export default function SeedPage() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [progress, setProgress] = useState(0);
  const totalTarget = 10000;
  const chunkSize = 1000;

  const handleSeed = async () => {
    setIsSeeding(true);
    setProgress(0);
    
    let currentProgress = 0;
    const iterations = totalTarget / chunkSize;

    try {
      for (let i = 0; i < iterations; i++) {
        await api.post(`/seed/chunk?chunk_size=${chunkSize}`);
        currentProgress += chunkSize;
        setProgress(currentProgress);
      }
      
      Swal.fire(
        "Seeding Complete!",
        `Successfully seeded ${totalTarget} employee records.`,
        "success"
      );
    } catch (e) {
      Swal.fire(
        "Seeding Halted",
        "An error occurred. The current chunk was rolled back automatically.",
        "error"
      );
    } finally {
      setIsSeeding(false);
    }
  };

  const handleClear = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this! All employee data will be wiped.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, clear it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete('/seed/clear');
          setProgress(0);
          Swal.fire('Cleared!', 'Database has been wiped.', 'success');
        } catch (e) {
           // handled by axios interceptor
        }
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center mb-6">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg mr-4">
            <Database size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Database Control Panel</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Safely seed or wipe data for testing</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Seeding Progress</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {Math.round((progress / totalTarget) * 100)}% ({progress} / {totalTarget})
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
            <div 
              className="bg-blue-600 h-4 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${(progress / totalTarget) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleSeed}
            disabled={isSeeding || progress >= totalTarget}
            className="flex-1 flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <PlayCircle className="w-5 h-5 mr-2" />
            {isSeeding ? "Seeding in progress..." : "Start Seeding 10,000 Records"}
          </button>
          
          <button
            onClick={handleClear}
            disabled={isSeeding}
            className="flex-1 flex items-center justify-center px-6 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-md transition-colors disabled:opacity-50 font-medium"
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Wipe Database
          </button>
        </div>
        
        <div className="mt-6 flex items-start p-4 bg-amber-50 dark:bg-amber-900/20 rounded-md border border-amber-200 dark:border-amber-800">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-3 mt-0.5" />
          <p className="text-sm text-amber-800 dark:text-amber-300">
            <strong>Rollback Safety:</strong> Data is seeded in chunks of {chunkSize}. If a failure occurs mid-way, the active chunk is safely rolled back via PostgreSQL transactions, preventing corrupted partial inserts.
          </p>
        </div>
      </div>
    </div>
  );
}
