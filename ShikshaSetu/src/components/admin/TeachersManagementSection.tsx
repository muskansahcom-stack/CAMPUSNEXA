import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { AdminTeacher, AdminClass, AddTeacherPayload } from '../../types/admin';
import { AddTeacherModal } from './AddTeacherModal';
import {
  GraduationCap,
  UserPlus,
  BookOpen,
  Layers,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
} from 'lucide-react';

interface TeachersManagementSectionProps {
  teachers: AdminTeacher[];
  classes: AdminClass[];
  onAddTeacher: (payload: AddTeacherPayload) => Promise<void>;
  onAssignClasses: (teacherId: string, classIds: string[]) => Promise<void>;
  onAssignSubjects: (teacherId: string, subjects: string[]) => Promise<void>;
}

export const TeachersManagementSection: React.FC<TeachersManagementSectionProps> = ({
  teachers,
  classes,
  onAddTeacher,
  onAssignClasses,
  onAssignSubjects,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<AdminTeacher | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Faculty Staff & Subject Allocation</h3>
          <p className="text-xs text-slate-500">
            Manage assigned grade sections, instructional subjects, and educator activity telemetry
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          leftIcon={<UserPlus className="w-3.5 h-3.5" />}
        >
          Add Faculty Teacher
        </Button>
      </div>

      {/* Teachers Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {teachers.map((tch) => (
          <Card key={tch.id} variant="elevated" className="border-slate-200 hover:border-slate-300 transition-all p-4 space-y-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center font-bold text-brand-700 text-sm shrink-0">
                  {tch.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{tch.name}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span className="font-mono">{tch.employeeId}</span>
                    <span>•</span>
                    <span className="truncate max-w-[160px]">{tch.email}</span>
                  </div>
                </div>
              </div>

              <Badge variant={tch.status === 'active' ? 'brand' : 'neutral'} size="sm">
                {tch.status === 'active' ? 'Active' : 'On Leave'}
              </Badge>
            </div>

            {/* Assigned Classes */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Assigned Classes
              </span>
              <div className="flex flex-wrap gap-1.5">
                {tch.assignedClassNames.length > 0 ? (
                  tch.assignedClassNames.map((cls, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 font-semibold text-xs"
                    >
                      {cls}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">No classes assigned</span>
                )}
              </div>
            </div>

            {/* Assigned Subjects */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Assigned Subjects
              </span>
              <div className="flex flex-wrap gap-1.5">
                {tch.assignedSubjects.map((sub, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-medium text-[11px]"
                  >
                    {sub}
                  </span>
                ))}
              </div>
            </div>

            {/* Activity & Support Stats */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                  Assignments
                </span>
                <span className="font-bold text-slate-900">{tch.lessonsAssignedCount} sent</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                  Alerts Resolved
                </span>
                <span className="font-bold text-emerald-700">{tch.supportAlertsResolvedCount} resolved</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                  Last Active
                </span>
                <span className="text-[11px] text-slate-600 font-medium">{tch.lastActive}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <AddTeacherModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        classes={classes}
        onAddTeacher={onAddTeacher}
      />
    </div>
  );
};
