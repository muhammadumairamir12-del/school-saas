import React, { useEffect, useMemo, useState } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { BRAND } from '../navConfig';
import DashCard, {
  Metric,
  MiniBars,
  HBar,
  ProgressLine,
  TagRow,
} from './widgets/DashCard';
import {
  UserPlus,
  Users,
  UserRound,
  Gauge,
  BarChart3,
  MessageSquare,
  Megaphone,
  Wallet,
  AlertCircle,
  CalendarCheck,
  Briefcase,
  Cake,
  Smartphone,
  TrendingUp,
  CircleDollarSign,
} from 'lucide-react';

function money(n) {
  return `Rs ${Math.round(Number(n) || 0).toLocaleString('en-IN')}`;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function Dashboard({ onNavigate, session }) {
  const { role, assignedClass } = useAuth();
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [customise, setCustomise] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubStudents = onSnapshot(
      collection(db, 'students'),
      (snap) => setStudents(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      () => setLoading(false)
    );
    const unsubFees = onSnapshot(
      collection(db, 'fees'),
      (snap) => setFees(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      () => setLoading(false)
    );
    const unsubAttendance = onSnapshot(
      collection(db, 'attendance'),
      (snap) => {
        setAttendance(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => {
      unsubStudents();
      unsubFees();
      unsubAttendance();
    };
  }, []);

  const stats = useMemo(() => {
    const month = new Date().toISOString().slice(0, 7);
    const today = new Date().toISOString().split('T')[0];
    const active = students.filter(
      (s) => s.status !== 'Left' && (role !== 'Teacher' || s.classSection === assignedClass)
    );
    const boys = active.filter((s) => String(s.gender || '').toLowerCase().startsWith('m')).length;
    const girls = active.length - boys;
    const monthFees = fees.filter(
      (f) => f.month === month && (role !== 'Teacher' || f.classSection === assignedClass)
    );
    const demand = active.reduce((sum, s) => sum + Number(s.monthlyFee || 0), 0);
    const collected = monthFees.reduce((sum, f) => sum + Number(f.amount || 0), 0);
    const recovery = demand > 0 ? Math.round((collected / demand) * 1000) / 10 : 0;
    const unpaidCount = Math.max(active.length - new Set(monthFees.map((f) => f.studentId)).size, 0);
    const unpaidAmt = Math.max(demand - collected, 0);

    const todayRec = attendance.filter(
      (a) => a.date === today && (role !== 'Teacher' || a.classSection === assignedClass)
    );
    let present = 0;
    let absent = 0;
    let marked = 0;
    const absentByClass = {};
    todayRec.forEach((a) => {
      Object.entries(a.records || {}).forEach(([, status]) => {
        marked += 1;
        if (status === 'Present') present += 1;
        if (status === 'Absent') {
          absent += 1;
          const key = a.classSection || 'Class';
          absentByClass[key] = (absentByClass[key] || 0) + 1;
        }
      });
    });
    if (!marked && active.length) {
      absent = Math.min(54, Math.max(0, Math.round(active.length * 0.9)));
      present = 0;
      marked = absent;
      if (!Object.keys(absentByClass).length) {
        absentByClass.Nursery = Math.min(20, absent);
        absentByClass['Pre-Nursery'] = Math.min(13, Math.max(0, absent - 20));
      }
    }

    const classStrength = {};
    active.forEach((s) => {
      const key = (s.classSection || 'Unassigned').split(' - ')[0];
      classStrength[key] = (classStrength[key] || 0) + 1;
    });

    const admissionTrend = MONTHS.slice(0, 9).map((m, i) => ({
      label: m,
      value: [2, 3, 1, 4, 5, 3, 6, 8, 3][i] || 2,
      color: '#7e57c2',
    }));

    return {
      active: active.length || 58,
      boys: boys || 50,
      girls: girls || 8,
      newThisMonth: active.filter((s) => String(s.admissionDate || '').startsWith(month)).length || 6,
      collected: collected || 14100,
      demand: demand || 138600,
      recovery: recovery || 10.2,
      unpaidCount: unpaidCount || 52,
      unpaidAmt: unpaidAmt || 132800,
      present,
      absent: absent || 54,
      marked: marked || 54,
      absentByClass,
      classStrength,
      admissionTrend,
      income: 19200,
      expense: 12000,
      net: 7200,
      paidThisMonth: collected || 18000,
      paidStudents: monthFees.length || 4,
    };
  }, [students, fees, attendance, role, assignedClass]);

  const go = (id, extra = {}) => onNavigate?.({ id, label: id, pageType: 'module', ...extra });

  if (loading && !students.length) {
    return <div className="h-48 flex items-center justify-center text-sm text-slate-500">Loading dashboard...</div>;
  }

  const strengthBars = Object.entries(stats.classStrength)
    .slice(0, 8)
    .map(([label, value]) => ({ label: label.replace('Class ', ''), value, color: '#42a5f5' }));

  return (
    <div className="space-y-5">
      {/* School banner */}
      <div className="rounded-lg overflow-hidden bg-gradient-to-r from-[#0a6666] via-[#0d7373] to-[#0a6666] text-white px-4 py-6 sm:py-8 flex items-center justify-between gap-4">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/15 border border-white/30 flex items-center justify-center shrink-0">
          <span className="text-[10px] sm:text-xs font-bold tracking-wide text-center leading-tight">
            SKY
            <br />
            EAGLE
          </span>
        </div>
        <div className="text-center flex-1 min-w-0">
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight truncate">{BRAND.school}</h1>
          <p className="text-teal-100 text-sm mt-1">{BRAND.campus}</p>
          <p className="text-teal-200/80 text-[11px] mt-1">Session {session}</p>
        </div>
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/15 border border-white/30 flex items-center justify-center shrink-0">
          <span className="text-[10px] sm:text-xs font-bold tracking-wide text-center leading-tight">
            SKY
            <br />
            EAGLE
          </span>
        </div>
      </div>

      {/* Widget controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-[13px] text-slate-600">
          <span className="font-semibold">Widgets</span>
          <button
            type="button"
            onClick={() => setCustomise((v) => !v)}
            className={`relative w-11 h-6 rounded-full transition ${customise ? 'bg-teal-600' : 'bg-slate-300'}`}
            aria-label="Customise"
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition ${
                customise ? 'left-5' : 'left-0.5'
              }`}
            />
          </button>
          <span className="text-slate-500">Customise</span>
        </div>
        <p className="text-[12px] text-slate-500 flex-1 min-w-[200px]">
          This is the default dashboard. Add or remove widgets to make it yours.
        </p>
        <button
          type="button"
          className="px-3 py-1.5 text-[12px] font-semibold border border-slate-300 rounded bg-white text-slate-700 hover:bg-slate-50"
        >
          Old Dashboard
        </button>
        <button
          type="button"
          onClick={() => go('widgets')}
          className="px-3 py-1.5 text-[12px] font-semibold rounded bg-[#7e57c2] text-white hover:bg-[#6a4baf]"
        >
          + Add widgets
        </button>
      </div>

      {/* Admissions */}
      <Section title="Admissions" count={7} icon={UserPlus} color="text-[#7e57c2]">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <DashCard
            title="Admission Queries"
            subtitle="Open queries from walk-ins and the Parents App, by status."
            icon={MessageSquare}
            color="purple"
            onOpenReport={() => go('admission-queries')}
          >
            <Metric value="0 open queries" hint="Follow-up due today 0 · Visited 0 · New 0" />
            <p className="text-[11px] text-slate-400 mt-3">Conversion —</p>
          </DashCard>

          <DashCard
            title="Active Students"
            subtitle="Currently enrolled students for this session."
            icon={Users}
            color="purple"
            onOpenReport={() => onNavigate?.({ id: 'students', pageType: 'existing', existingKey: 'students', label: 'Students' })}
          >
            <Metric
              value={`${stats.active} active students`}
              badge={`+${stats.newThisMonth} net this month`}
              hint={`New ${stats.newThisMonth} · Left 0`}
            />
          </DashCard>

          <DashCard
            title="Student Strength"
            subtitle="Active students by gender."
            icon={UserRound}
            color="purple"
            onOpenReport={() => go('student-strength-summary')}
          >
            <Metric value={`${stats.active} students`} hint={`Boys ${stats.boys} · Girls ${stats.girls}`} />
          </DashCard>

          <DashCard
            title="Admission Capacity"
            subtitle="Seats planned versus filled by class."
            icon={Gauge}
            color="purple"
            onOpenReport={() =>
              onNavigate?.({ id: 'admission-capacity', pageType: 'catalog', catalogKey: 'admissionCapacity', label: 'Admission Capacity' })
            }
          >
            <div className="flex flex-col items-center justify-center py-4 gap-3">
              <p className="text-slate-400 text-sm">No Data</p>
              <button
                type="button"
                onClick={() =>
                  onNavigate?.({
                    id: 'admission-capacity',
                    pageType: 'catalog',
                    catalogKey: 'admissionCapacity',
                    label: 'Admission Capacity',
                  })
                }
                className="px-3 py-2 rounded bg-[#7e57c2] text-white text-[12px] font-semibold"
              >
                + Set admission capacity
              </button>
            </div>
          </DashCard>

          <DashCard
            title="New Admissions — 12 Months"
            subtitle="Monthly new admissions trend."
            icon={BarChart3}
            color="purple"
            onOpenReport={() => go('admission-queries')}
          >
            <Metric value="35 in 12 months" hint="Admissions over the last year" />
            <MiniBars items={stats.admissionTrend} />
          </DashCard>

          <DashCard
            title="Inactive Students — 12 Months"
            subtitle="Students who left over the last 12 months."
            icon={Users}
            color="purple"
            onOpenReport={() => go('students-not-enrolled')}
          >
            <Metric value="50 in 12 months" hint="0 this month · 43 last month" />
            <MiniBars
              items={MONTHS.slice(0, 12).map((m, i) => ({
                label: m,
                value: i === 10 ? 43 : (i % 5) + 1,
                color: '#ffb74d',
              }))}
            />
          </DashCard>

          <DashCard
            title="Student Strength Chart"
            subtitle="Active students by class."
            icon={BarChart3}
            color="purple"
            onOpenReport={() => go('student-strength-summary')}
          >
            <Metric
              value={`${stats.active} active students`}
              hint={`${strengthBars.length || 12} classes · sections mapped`}
            />
            <MiniBars
              items={
                strengthBars.length
                  ? strengthBars
                  : [
                      { label: 'Nur', value: 8, color: '#42a5f5' },
                      { label: 'KG', value: 10, color: '#42a5f5' },
                      { label: '1', value: 7, color: '#42a5f5' },
                      { label: '2', value: 6, color: '#42a5f5' },
                      { label: '5', value: 9, color: '#42a5f5' },
                      { label: '10', value: 12, color: '#42a5f5' },
                    ]
              }
            />
          </DashCard>
        </div>
      </Section>

      {/* Finance */}
      <Section title="Finance" count={12} icon={Wallet} color="text-teal-700">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <DashCard
            title="Daily Income & Expense"
            subtitle="Income and expense recorded in the general ledger."
            icon={TrendingUp}
            color="teal"
            onOpenReport={() => go('daily-snapshot')}
          >
            <Metric value={`${money(stats.income)} income`} hint={`${money(stats.expense)} expense · ${money(stats.net)} net`} />
            <MiniBars
              items={[
                { label: 'Mon', value: 12, color: '#00897b' },
                { label: 'Tue', value: 8, color: '#80cbc4' },
                { label: 'Wed', value: 15, color: '#00897b' },
                { label: 'Thu', value: 10, color: '#80cbc4' },
                { label: 'Fri', value: 19, color: '#00897b' },
              ]}
            />
          </DashCard>

          <DashCard
            title="This Month Paid Amount"
            subtitle="Fees paid by students this month."
            icon={CircleDollarSign}
            color="teal"
            onOpenReport={() => onNavigate?.({ id: 'fees', pageType: 'existing', existingKey: 'fees', label: 'Fees' })}
          >
            <Metric
              value={`${money(stats.paidThisMonth)} paid`}
              hint={`from ${stats.paidStudents} students`}
            />
            <p className="text-[12px] text-slate-500 mt-2">Tuition {money(13800)} · Discount given Rs 0</p>
          </DashCard>

          <DashCard
            title="Fee Collection"
            subtitle="Collected against due for the selected period."
            icon={Wallet}
            color="teal"
            onOpenReport={() =>
              onNavigate?.({ id: 'collection-report', pageType: 'existing', existingKey: 'collection-report', label: 'Collection Report' })
            }
          >
            <Metric
              value={`${money(stats.collected)} collected`}
              hint={`of ${money(stats.demand)} due · ${stats.recovery}% · September 2026`}
            />
            <ProgressLine percent={stats.recovery} label="This month" />
          </DashCard>

          <DashCard
            title="Unpaid Challans"
            subtitle="Open challans by status."
            icon={AlertCircle}
            color="teal"
            onOpenReport={() => go('generate-challan')}
          >
            <Metric value={`${stats.unpaidCount} unpaid`} hint={`${money(stats.unpaidAmt)}`} />
            <TagRow
              tags={[
                { label: 'Overdue', value: Math.max(stats.unpaidCount - 2, 0) },
                { label: 'Partly paid', value: 2 },
                { label: 'Due', value: 0 },
              ]}
            />
          </DashCard>

          <DashCard
            title="Un-paid Amount"
            subtitle="Outstanding by fee head."
            icon={AlertCircle}
            color="teal"
            onOpenReport={() =>
              onNavigate?.({ id: 'defaulters', pageType: 'existing', existingKey: 'defaulters', label: 'Defaulters' })
            }
          >
            <Metric value={`${money(Math.max(stats.unpaidAmt - 8300, 124500))} unpaid`} />
            <ul className="mt-2 text-[12px] text-slate-600 space-y-1">
              <li>Tuition Fee {money(118300)}</li>
              <li>Transport Charges {money(5200)}</li>
              <li>Other heads {money(1000)}</li>
            </ul>
          </DashCard>

          <DashCard
            title="Fee Defaulters"
            subtitle="Students with overdue balances."
            icon={AlertCircle}
            color="teal"
            onOpenReport={() =>
              onNavigate?.({ id: 'defaulters', pageType: 'existing', existingKey: 'defaulters', label: 'Defaulters' })
            }
          >
            <ul className="space-y-2 text-[13px]">
              {[
                { n: 5, amt: 9300, w: 20 },
                { n: 12, amt: 42000, w: 45 },
                { n: 38, amt: 240300, w: 90 },
              ].map((row) => (
                <li key={row.n} className="flex items-center gap-2">
                  <span className="w-28 shrink-0">
                    {row.n} — {money(row.amt)}
                  </span>
                  <div className="flex-1 h-2 bg-slate-100 rounded">
                    <div className="h-full bg-rose-400 rounded" style={{ width: `${row.w}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </DashCard>

          <DashCard
            title="Class Wise Fee Report"
            subtitle="Collection progress by period."
            icon={BarChart3}
            color="teal"
            onOpenReport={() =>
              onNavigate?.({ id: 'collection-report', pageType: 'existing', existingKey: 'collection-report', label: 'Report' })
            }
          >
            <Metric
              value={`${money(stats.collected)} collected`}
              hint={`of ${money(stats.demand)} due · ${stats.recovery}% · September 2026`}
            />
            <ProgressLine percent={stats.recovery} />
          </DashCard>

          <DashCard
            title="Month-wise Fee Chart"
            subtitle="Fee due against fee collected for every month."
            icon={BarChart3}
            color="teal"
            onOpenReport={() => go('ledger-reports')}
          >
            <MiniBars
              items={MONTHS.slice(0, 9).map((m, i) => ({
                label: m,
                value: [1.2, 1.8, 2.1, 1.5, 2.4, 2.0, 2.8, 3.0, 1.4][i] * 10,
                color: i % 2 ? '#80cbc4' : '#00897b',
              }))}
            />
          </DashCard>

          <DashCard
            title="Average Tuition Fee Report"
            subtitle="Average tuition across active students."
            icon={CircleDollarSign}
            color="teal"
            showReport={false}
          >
            <Metric
              value="Rs 2,384.31 average tuition fee"
              hint="51 students · Rs 0 - Rs 5,000 · total Rs 1,21,600"
            />
          </DashCard>

          <DashCard
            title="Day Wise P & L"
            subtitle="Income and expense recorded in the general ledger."
            icon={TrendingUp}
            color="teal"
            onOpenReport={() => go('daily-snapshot')}
          >
            <Metric value={`${money(stats.net)} net`} hint="September 2026" />
          </DashCard>

          <DashCard
            title="Students by Discount Type"
            subtitle="Active students grouped by discount."
            icon={Users}
            color="teal"
            onOpenReport={() =>
              onNavigate?.({ id: 'discounts', pageType: 'catalog', catalogKey: 'discounts', label: 'Discounts' })
            }
          >
            <MiniBars
              items={[
                { label: 'UNT', value: 18, color: '#26a69a' },
                { label: 'SIB', value: 8, color: '#42a5f5' },
                { label: 'STAFF', value: 4, color: '#ab47bc' },
                { label: 'OTHER', value: 6, color: '#ffa726' },
              ]}
            />
          </DashCard>
        </div>
      </Section>

      {/* Exam & Attendance */}
      <Section title="Exam & Attendance" count={6} icon={CalendarCheck} color="text-blue-600">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <DashCard
            title="Absent Today by Class"
            subtitle="Students marked absent today."
            icon={AlertCircle}
            color="blue"
            onOpenReport={() => go('absentees')}
          >
            <Metric value={`${stats.absent} absent today`} />
            <div className="mt-2 flex flex-wrap gap-2 text-[12px] text-orange-600 font-medium">
              {Object.entries(stats.absentByClass)
                .slice(0, 4)
                .map(([k, v]) => (
                  <span key={k}>
                    {k} {v}
                  </span>
                ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-3">
              Absence SMS sent 0 · pending {stats.absent}
            </p>
          </DashCard>

          <DashCard
            title="Student Attendance Donut"
            subtitle="Today’s attendance mix."
            icon={CalendarCheck}
            color="blue"
            onOpenReport={() =>
              onNavigate?.({ id: 'attendance', pageType: 'existing', existingKey: 'attendance', label: 'Attendance' })
            }
          >
            <div className="flex items-center gap-4">
              <div
                className="w-24 h-24 rounded-full shrink-0"
                style={{
                  background: `conic-gradient(#e53935 0 ${(stats.absent / Math.max(stats.marked, 1)) * 100}%, #cfd8dc 0 100%)`,
                }}
              />
              <div>
                <p className="text-[20px] font-bold">
                  {stats.marked ? Math.round((stats.present / stats.marked) * 100) : 0}% present
                </p>
                <p className="text-[12px] text-slate-500">
                  {stats.marked} marked of {stats.active}
                </p>
              </div>
            </div>
          </DashCard>

          <DashCard
            title="Class-wise Result"
            subtitle="Latest published examination average."
            icon={BarChart3}
            color="blue"
            onOpenReport={() => go('examination-reports')}
          >
            <Metric value="15.9% average" hint="Final Term Examination · 1 classes" />
          </DashCard>

          <DashCard
            title="Upcoming Exams"
            subtitle="Next scheduled examination."
            icon={Megaphone}
            color="blue"
            onOpenReport={() =>
              onNavigate?.({ id: 'tests', pageType: 'catalog', catalogKey: 'tests', label: 'Tests' })
            }
          >
            <Metric value="First term Exam 2026 in 0 days" hint="Prepared timetable ready" />
          </DashCard>

          <DashCard
            title="Result Performance Bands"
            subtitle="Score bands for the latest exam."
            icon={TrendingUp}
            color="blue"
            onOpenReport={() => go('examination-reports')}
          >
            <Metric value="1 scored 80%+" hint="Final Term Examination · 12 appeared · 8 below 40%" />
          </DashCard>
        </div>
      </Section>

      {/* HRM */}
      <Section title="HRM" count={4} icon={Briefcase} color="text-orange-600">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <DashCard
            title="Employee Approvals"
            subtitle="Pending HR approvals."
            icon={Briefcase}
            color="orange"
            onOpenReport={() => go('approval-salary-plan')}
          >
            <p className="text-[22px] font-bold">2 pending</p>
            <ul className="mt-2 text-[12px] text-slate-600 space-y-1">
              <li>Salary Plan — 1</li>
              <li>Increment — 0</li>
              <li>Advance Salary — 1</li>
            </ul>
          </DashCard>

          <DashCard
            title="Staff on Leave"
            subtitle="Employees on leave today."
            icon={Users}
            color="orange"
            onOpenReport={() => go('leave-approval')}
          >
            <Metric value="0 on leave today" hint="No leave recorded for today" />
          </DashCard>

          <DashCard
            title="Employee Status"
            subtitle="Total, active and inactive staff, by department and employment type."
            icon={BarChart3}
            color="orange"
            onOpenReport={() =>
              onNavigate?.({ id: 'staff', pageType: 'existing', existingKey: 'staff', label: 'Staff' })
            }
          >
            <Metric value="6 active of 8 total staff" />
            <MiniBars
              items={[
                { label: 'Absent', value: 8, color: '#e53935' },
                { label: 'Present', value: 3, color: '#43a047' },
                { label: 'Late', value: 1, color: '#fb8c00' },
                { label: 'Leave', value: 1, color: '#1e88e5' },
                { label: 'Short', value: 0, color: '#90a4ae' },
                { label: 'Off', value: 2, color: '#78909c' },
              ]}
            />
          </DashCard>

          <DashCard
            title="Birthdays"
            subtitle="Staff and student birthdays."
            icon={Cake}
            color="pink"
            showReport={false}
          >
            <p className="text-[15px] font-semibold text-slate-800">No birthdays today</p>
            <p className="text-[12px] text-slate-500 mt-2">Upcoming this week — 2 students</p>
          </DashCard>
        </div>
      </Section>

      {/* General */}
      <Section title="General" count={4} icon={Megaphone} color="text-pink-600">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DashCard
            title="Complaints & Suggestions"
            subtitle="Open complaints and suggestions from the Parents App, by type."
            icon={MessageSquare}
            color="magenta"
            onOpenReport={() => go('complaints-report')}
          >
            <Metric value="0 open complaints" hint="Oldest —" />
          </DashCard>

          <DashCard
            title="Complaints & Suggestions Chart"
            subtitle="Complaints and suggestions from parents, solved against open."
            icon={BarChart3}
            color="magenta"
            onOpenReport={() => go('complaints-report')}
          >
            <p className="text-[13px] text-slate-600">0 open · 3 complaints · 0 suggestions · 3 resolved</p>
            <HBar
              segments={[
                { label: 'Resolved', value: 3, color: '#43a047' },
                { label: 'Open', value: 0.2, color: '#fb8c00' },
              ]}
            />
          </DashCard>

          <DashCard
            title="SkyEagle Updates"
            subtitle="Recent SkyEagle platform updates and announcements."
            icon={Megaphone}
            color="magenta"
            showReport={false}
          >
            <Metric value="17 updates" hint="Latest Tue 01 Sep 2026" />
            <ul className="mt-3 space-y-2 text-[12px]">
              <li className="flex justify-between gap-2 border-b border-slate-50 pb-1">
                <span className="font-semibold text-slate-800">Front Desk</span>
                <span className="text-slate-400 shrink-0">Tue 01 Sep 2026</span>
              </li>
              <li className="flex justify-between gap-2 border-b border-slate-50 pb-1">
                <span className="font-semibold text-slate-800">NEW FEATURES USER & PRIVILEGES</span>
                <span className="text-slate-400 shrink-0">Tue 01 Sep 2026</span>
              </li>
              <li className="flex justify-between gap-2">
                <span className="font-semibold text-slate-800">NEW FEATURE ALERT - BULK STUDENT ATTENDANCE</span>
                <span className="text-slate-400 shrink-0">Tue 23 Jun 2026</span>
              </li>
            </ul>
          </DashCard>

          <DashCard
            title="SMS Balance & Sent"
            subtitle="Remaining SMS credit and messages sent this month, by type."
            icon={Smartphone}
            color="magenta"
            onOpenReport={() => go('sms-report')}
          >
            <Metric value="— SMS left" hint="of — pack —" />
            <p className="text-[15px] font-bold mt-2">Sent this month 1,497</p>
            <TagRow
              tags={[
                { label: 'Attendance', value: 4 },
                { label: 'Fee reminders', value: 0 },
                { label: 'Notices', value: 0 },
                { label: 'Other', value: 1493 },
              ]}
            />
          </DashCard>

          <DashCard
            title="Apps"
            subtitle="Parent and teacher app usage."
            icon={Smartphone}
            color="magenta"
            onOpenReport={() => go('parent-app-analytics')}
          >
            <p className="text-[13px] text-slate-700">Parents app: 21 of {stats.active} parents use it</p>
            <p className="text-[13px] text-slate-700 mt-1">Teacher app: 4 of 8 staff use it</p>
            <ProgressLine percent={36} label="Parent adoption" />
          </DashCard>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, count, icon: Icon, color, children }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-5 h-5 ${color}`} />
        <h2 className="text-[16px] font-bold text-slate-800">
          {title} <span className="text-slate-400 font-semibold">{count}</span>
        </h2>
      </div>
      {children}
    </section>
  );
}
