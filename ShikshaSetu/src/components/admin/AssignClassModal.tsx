import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { AdminStudent, AdminClass } from '../../types/admin';

interface AssignClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: AdminStudent | null;
  classes: AdminClass[];
  onAssignClass: (studentId: string, newClassId: string) => Promise<void>;
}

export const AssignClassModal: React.FC<AssignClassModalProps> = ({
  isOpen,
  onClose,
  student,
  classes,
  onAssignClass,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(student?.classId || classes[0]?.id || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (student) {
      setSelectedClassId(student.classId);
    }
  }, [student]);

  if (!isOpen || !student) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId) return;

    setIsSubmitting(true);
    try {
      await onAssignClass(student.id, selectedClassId);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reassign Student Class"
      description={`Transfer student ${student.name} to another classroom section.`}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
          <div><strong>Student:</strong> {student.name}</div>
          <div><strong>Current Class:</strong> {student.className}</div>
          <div><strong>Progress:</strong> {student.overallProgressPct}%</div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Select Destination Classroom Section *
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
          >
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name} (Grade {cls.grade}{cls.section} • {cls.studentCount}/{cls.capacity} students)
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
            Confirm Reassignment
          </Button>
        </div>
      </form>
    </Modal>
  );
};
