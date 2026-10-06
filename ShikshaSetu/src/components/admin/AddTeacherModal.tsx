import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { AdminClass, AddTeacherPayload } from '../../types/admin';
import { sanitizeInput, validateEmail } from '../../lib/securityUtils';

interface AddTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: AdminClass[];
  onAddTeacher: (payload: AddTeacherPayload) => Promise<void>;
}

export const AddTeacherModal: React.FC<AddTeacherModalProps> = ({
  isOpen,
  onClose,
  classes,
  onAddTeacher,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['Mathematics']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const ALL_SUBJECTS = [
    'Mathematics',
    'Science & Agriculture',
    'Odia & Vernacular',
    'Marathi Literature',
    'Hindi',
    'Social Studies & Geography',
    'English Language',
  ];

  if (!isOpen) return null;

  const handleClassToggle = (classId: string) => {
    setSelectedClasses((prev) =>
      prev.includes(classId) ? prev.filter((id) => id !== classId) : [...prev, classId]
    );
  };

  const handleSubjectToggle = (subj: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subj) ? prev.filter((s) => s !== subj) : [...prev, subj]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const cleanName = sanitizeInput(name.trim());
    const cleanEmail = email.trim();
    const cleanEmpId = sanitizeInput(employeeId.trim());

    if (!cleanName || !cleanEmail) return;

    if (!validateEmail(cleanEmail)) {
      setErrorMsg('Please enter a valid faculty email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddTeacher({
        name: cleanName,
        email: cleanEmail,
        employeeId: cleanEmpId || `EMP-${Date.now().toString().slice(-4)}`,
        assignedClasses: selectedClasses,
        assignedSubjects: selectedSubjects,
      });
      setName('');
      setEmail('');
      setEmployeeId('');
      setSelectedClasses([]);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Faculty Teacher"
      description="Register an educator into the school teaching staff roster and assign classes and subjects."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
            {errorMsg}
          </div>
        )}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Teacher Full Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Minati Behera"
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teacher@shiksha.local"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Employee ID
            </label>
            <input
              type="text"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="e.g. EMP-OD-140"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Assign Teaching Classes
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50/50">
            {classes.map((cls) => (
              <label
                key={cls.id}
                className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 text-xs font-medium cursor-pointer hover:bg-slate-50 select-none"
              >
                <input
                  type="checkbox"
                  checked={selectedClasses.includes(cls.id)}
                  onChange={() => handleClassToggle(cls.id)}
                  className="w-3.5 h-3.5 text-brand-600 rounded"
                />
                <span>{cls.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Assign Subjects
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50/50">
            {ALL_SUBJECTS.map((subj) => (
              <label
                key={subj}
                className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 text-xs font-medium cursor-pointer hover:bg-slate-50 select-none"
              >
                <input
                  type="checkbox"
                  checked={selectedSubjects.includes(subj)}
                  onChange={() => handleSubjectToggle(subj)}
                  className="w-3.5 h-3.5 text-brand-600 rounded"
                />
                <span className="truncate">{subj}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
            Add Teacher to Staff
          </Button>
        </div>
      </form>
    </Modal>
  );
};
