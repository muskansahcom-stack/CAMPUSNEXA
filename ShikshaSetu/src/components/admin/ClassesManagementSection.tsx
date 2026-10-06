import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { AdminClass, AdminTeacher, CreateClassPayload } from '../../types/admin';
import { CreateClassModal } from './CreateClassModal';
import {
  Layers,
  Plus,
  Users,
  GraduationCap,
  Edit,
  TrendingUp,
  UserCheck,
} from 'lucide-react';

interface ClassesManagementSectionProps {
  classes: AdminClass[];
  teachers: AdminTeacher[];
  onCreateClass: (payload: CreateClassPayload) => Promise<void>;
  onEditClass: (classId: string, payload: Partial<CreateClassPayload>) => Promise<void>;
}

export const ClassesManagementSection: React.FC<ClassesManagementSectionProps> = ({
  classes,
  teachers,
  onCreateClass,
  onEditClass,
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<AdminClass | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Classroom Sections & Enrollment</h3>
          <p className="text-xs text-slate-500">
            Structure grade levels, assign class teachers, and monitor student capacity
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsCreateModalOpen(true)}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Create Classroom Section
        </Button>
      </div>

      {/* Class Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((cls) => {
          const occupancyPct = Math.round((cls.studentCount / cls.capacity) * 100);

          return (
            <Card
              key={cls.id}
              variant="elevated"
              className="border-slate-200 hover:border-slate-300 transition-all p-4 space-y-3.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center font-bold text-blue-700 text-xs shrink-0">
                    G{cls.grade}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">{cls.name}</h4>
                    <span className="text-[11px] text-slate-500">
                      Grade {cls.grade} • Section {cls.section}
                    </span>
                  </div>
                </div>

                <Badge variant={cls.teacherName && cls.teacherName !== 'Unassigned' ? 'brand' : 'saffron'} size="sm">
                  {cls.teacherName && cls.teacherName !== 'Unassigned' ? 'Staffed' : 'Unassigned'}
                </Badge>
              </div>

              {/* Class Teacher */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-700">
                  <GraduationCap className="w-4 h-4 text-brand-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Class Teacher
                    </span>
                    <span className="font-semibold text-slate-900">{cls.teacherName || 'Unassigned'}</span>
                  </div>
                </div>

                <select
                  value={cls.teacherId || ''}
                  onChange={(e) => onEditClass(cls.id, { teacherId: e.target.value || undefined })}
                  className="text-[11px] font-medium border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-700 cursor-pointer focus:outline-none max-w-[130px]"
                >
                  <option value="">Reassign...</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Student Capacity */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Enrollment</span>
                  <span className="font-bold text-slate-900">
                    {cls.studentCount} / {cls.capacity} students ({occupancyPct}%)
                  </span>
                </div>
                <ProgressBar
                  value={occupancyPct}
                  size="sm"
                  variant={occupancyPct >= 90 ? 'saffron' : 'brand'}
                />
              </div>

              {/* Average Progress */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                  Average Progress
                </span>
                <span className="font-bold text-indigo-700">{cls.averageProgressPct}%</span>
              </div>
            </Card>
          );
        })}
      </div>

      <CreateClassModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        teachers={teachers}
        onCreateClass={onCreateClass}
      />
    </div>
  );
};
