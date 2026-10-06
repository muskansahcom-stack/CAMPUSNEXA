import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { TeacherAssignment } from '../../types/teacher';
import {
  BookOpen,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  Plus,
  AlertCircle,
} from 'lucide-react';

interface AssignmentsTrackerViewProps {
  assignments: TeacherAssignment[];
  onCreateAssignment: () => void;
  onViewStudent: (studentId: string) => void;
}

export const AssignmentsTrackerView: React.FC<AssignmentsTrackerViewProps> = ({
  assignments,
  onCreateAssignment,
  onViewStudent,
}) => {
  const [expandedAssignmentId, setExpandedAssignmentId] = useState<string | null>(
    assignments[0]?.id || null
  );

  const toggleExpand = (id: string) => {
    setExpandedAssignmentId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Classroom Assignments & Completion Tracking
          </h2>
          <p className="text-xs text-slate-500">
            Track submission rates, pending reviews, and dispatch targeted practice to individual students.
          </p>
        </div>

        <Button
          variant="saffron"
          size="md"
          onClick={onCreateAssignment}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create Assignment
        </Button>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {assignments.map((asg) => {
          const isExpanded = expandedAssignmentId === asg.id;

          return (
            <Card
              key={asg.id}
              variant="elevated"
              className="border-slate-200 hover:border-brand-300 transition-all overflow-hidden"
            >
              <div className="p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="brand" size="sm">
                        {asg.subject}
                      </Badge>
                      <Badge variant="neutral" size="sm">
                        {asg.className}
                      </Badge>
                      <span className="text-[11px] text-slate-400 font-medium">
                        Due: {new Date(asg.dueDate).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900">{asg.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-1">{asg.instructions}</p>
                  </div>

                  {/* Progress & Quick Stats */}
                  <div className="flex items-center gap-6 shrink-0">
                    <div className="w-36 space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span>Completion</span>
                        <span className="text-brand-700">{asg.completionRate}%</span>
                      </div>
                      <ProgressBar
                        value={asg.completionRate}
                        variant={asg.completionRate >= 80 ? 'forest' : asg.completionRate >= 50 ? 'brand' : 'saffron'}
                        size="sm"
                      />
                      <span className="text-[10px] text-slate-400 block text-right">
                        {asg.completedCount} / {asg.assignedStudentCount} finished
                      </span>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleExpand(asg.id)}
                      rightIcon={
                        isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                      }
                    >
                      {isExpanded ? 'Hide Details' : 'Student Status'}
                    </Button>
                  </div>
                </div>

                {/* EXPANDED STUDENT STATUS TABLE */}
                {isExpanded && (
                  <div className="mt-5 pt-4 border-t border-slate-100 space-y-3 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
                      <span>Student Roster Completion Status</span>
                      <span>{asg.pendingCount} Pending Submissions</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {asg.studentStatuses.map((st) => (
                        <div
                          key={st.studentId}
                          className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200 flex items-center justify-between gap-2"
                        >
                          <div className="space-y-0.5 overflow-hidden">
                            <span className="text-xs font-bold text-slate-900 block truncate">
                              {st.studentName}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              {st.submittedAt ? `Submitted ${st.submittedAt}` : 'Not submitted yet'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {st.status === 'completed' ? (
                              <Badge variant="brand" size="sm">
                                {st.score}% Done
                              </Badge>
                            ) : st.status === 'in_progress' ? (
                              <Badge variant="neutral" size="sm">
                                Working ({st.score}%)
                              </Badge>
                            ) : (
                              <Badge variant="saffron" size="sm">
                                Pending
                              </Badge>
                            )}

                            <button
                              onClick={() => onViewStudent(st.studentId)}
                              className="text-[10px] text-brand-700 hover:text-brand-900 font-bold ml-1 underline"
                              title="View student profile"
                            >
                              Profile
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
