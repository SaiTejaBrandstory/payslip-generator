'use client';

import { useState } from 'react';
import ManualEntry from '@/components/ManualEntry';
import ExcelUpload from '@/components/ExcelUpload';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'manual' | 'excel'>('manual');

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold text-center mb-8">Payslip Generator</h1>
      
      <div className="max-w-4xl mx-auto">
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex gap-6">
            <button
              onClick={() => setActiveTab('manual')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'manual'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Manual Entry
            </button>
            <button
              onClick={() => setActiveTab('excel')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'excel'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Excel Upload
            </button>
          </nav>
        </div>

        {activeTab === 'manual' ? <ManualEntry /> : <ExcelUpload />}
        </div>
      </main>
  );
}
