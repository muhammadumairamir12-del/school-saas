import React, { useState } from 'react';
import { CalendarCheck, BarChart3 } from 'lucide-react';
import MarkAttendance from '../attendance/MarkAttendance';
import AttendanceReport from '../attendance/AttendanceReport';

const TABS = [
  { id: 'mark', label: 'Mark Attendance', icon: CalendarCheck },
  { id: 'report', label: 'Attendance Report', icon: BarChart3 },
];

export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState('mark');

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 hide-scrollbar">
        <div className="flex bg-slate-100 p-1 rounded-xl w-max">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-teal-800 font-semibold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === 'mark' && <MarkAttendance />}
        {activeTab === 'report' && <AttendanceReport />}
      </div>
    </div>
  );
}
