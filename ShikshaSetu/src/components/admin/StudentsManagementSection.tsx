import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import {
  AdminStudent,
  AdminClass,
  StudentManagementStatus,
  AddStudentPayload,
} from '../../types/admin';
import { AddStudentModal } from './AddStudentModal';
import { AssignClassModal } from './AssignClassModal';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Wifi,
  WifiOff,
  Radio,
  Smartphone,
  Tablet,
  Monitor,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';

interface StudentsManagementSectionProps {
  students: AdminStudent[];
  classes: AdminClass[];
  onAddStudent: (payload: AddStudentPayload) => Promise<void>;
  onAssignClass: (studentId: string, newClassId: string) => Promise<void>;
  onUpdateStatus: (studentId: string, status: StudentManagementStatus) => Promise<void>;
}

export const StudentsManagementSection: React.FC<StudentsManagementSectionProps> = ({
  students,
  classes,
  onAddStudent,
  onAssignClass,
  onUpdateStatus,
}) => {
  const [search, setSearch] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [assigningStudent, setAssigningStudent] = useState<AdminStudent | null>(null);

  // Filter students
  const filteredStudents = students.filter((s) => {
    if (selectedClassId !== 'all' && s.classId !== selectedClassId) return false;
    if (selectedStatus !== 'all' && s.status !== selectedStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      return s.name.toLowerCase().includes(q) || s.className.toLowerCase().includes(q);
    }
    return true;
  });

  const getConnectivityPill = (mode: AdminStudent['connectivityMode']) => {
    switch (mode) {
      case 'offline':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
            <WifiOff className="w-3 h-3 text-amber-700" /> Offline
          </span>
        );
      case 'intermittent_2g':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-300">
            <Radio className="w-3 h-3 text-amber-700" /> 2G Weak
          </span>
        );
      case '3g':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
            <Wifi className="w-3 h-3 text-slate-600" /> 3G
          </span>
        );
      case '4g':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-900 border border-emerald-200">
            <Wifi className="w-3 h-3 text-emerald-600" /> 4G / Wi-Fi
          </span>
        );
    }
  };

  const getDeviceIcon = (dev: AdminStudent['deviceAccess']) => {
    switch (dev) {
      case 'tablet':
        return <Tablet className="w-3.5 h-3.5 text-slate-500" />;
      case 'desktop':
        return <Monitor className="w-3.5 h-3.5 text-slate-500" />;
      default:
        return <Smartphone className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const getStatusBadge = (status: StudentManagementStatus) => {
    switch (status) {
      case 'active':
        return <Badge variant="brand" size="sm">Active</Badge>;
      case 'needs_support':
        return <Badge variant="saffron" size="sm">Needs Support</Badge>;
      case 'inactive':
        return <Badge variant="neutral" size="sm">Inactive</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-slate-50/50"
            />
          </div>

          {/* Class Filter */}
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none"
          >
            <option value="all">All Classes ({classes.length})</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="needs_support">Needs Support</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          leftIcon={<UserPlus className="w-3.5 h-3.5" />}
        >
          Add Student
        </Button>
      </div>

      {/* Strict Privacy Callout */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-600 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Data Privacy Guaranteed:</strong> Personal identifiers, parent phone numbers, and home addresses are strictly excluded from institutional rosters.
          </span>
        </div>
        <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
          {filteredStudents.length} of {students.length} Learners Displayed
        </span>
      </div>

      {/* Students Data Table */}
      <Card variant="elevated" className="border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-3">Class</th>
                <th className="py-3 px-3">Learning Level</th>
                <th className="py-3 px-3">Connectivity</th>
                <th className="py-3 px-3">Device Access</th>
                <th className="py-3 px-3 w-32">Overall Progress</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((std) => (
                  <tr key={std.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                      {std.name}
                      <span className="block text-[10px] text-slate-400 font-normal">
                        Active {std.lastActive}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                      <span className="font-semibold text-slate-900">{std.className}</span>
                      <span className="block text-[10px] text-slate-400">Grade {std.grade}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap text-[11px]">
                      {std.learningLevel}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {getConnectivityPill(std.connectivityMode)}
                    </td>
                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 text-[11px]">
                        {getDeviceIcon(std.deviceAccess)}
                        <span className="capitalize">{std.deviceAccess.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span>{std.overallProgressPct}%</span>
                          <span className="text-[10px] font-normal text-slate-400">{std.learningHours}h</span>
                        </div>
                        <ProgressBar
                          value={std.overallProgressPct}
                          size="sm"
                          variant={std.overallProgressPct >= 75 ? 'forest' : std.overallProgressPct >= 50 ? 'brand' : 'saffron'}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {getStatusBadge(std.status)}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setAssigningStudent(std)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 transition-colors cursor-pointer"
                          title="Assign to another classroom section"
                        >
                          Assign Class
                        </button>
                        <select
                          value={std.status}
                          onChange={(e) => onUpdateStatus(std.id, e.target.value as any)}
                          className="text-[11px] font-medium border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-700 cursor-pointer focus:outline-none"
                        >
                          <option value="active">Active</option>
                          <option value="needs_support">Needs Support</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-slate-500">
                    No students match the selected filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modals */}
      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        classes={classes}
        onAddStudent={onAddStudent}
      />

      <AssignClassModal
        isOpen={!!assigningStudent}
        onClose={() => setAssigningStudent(null)}
        student={assigningStudent}
        classes={classes}
        onAssignClass={onAssignClass}
      />
    </div>
  );
};
