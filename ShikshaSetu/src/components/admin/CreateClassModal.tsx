import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { AdminTeacher, CreateClassPayload } from '../../types/admin';
import { sanitizeInput } from '../../lib/securityUtils';

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  teachers: AdminTeacher[];
  onCreateClass: (payload: CreateClassPayload) => Promise<void>;
}

export const CreateClassModal: React.FC<CreateClassModalProps> = ({
  isOpen,
  onClose,
  teachers,
  onCreateClass,
}) => {
  const [grade, setGrade] = useState<number>(8);
  const [section, setSection] = useState('A');
  const [name, setName] = useState('Class 8A');
  const [teacherId, setTeacherId] = useState<string>('');
  const [capacity, setCapacity] = useState<number>(30);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update default name when grade/section changes
  const handleGradeChange = (newGrade: number) => {
    setGrade(newGrade);
    setName(`Class ${newGrade}${section}`);
  };

  const handleSectionChange = (newSec: string) => {
    setSection(newSec.toUpperCase());
    setName(`Class ${grade}${newSec.toUpperCase()}`);
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = sanitizeInput(name.trim());
    const cleanSection = sanitizeInput(section.trim());
    if (!cleanName) return;

    setIsSubmitting(true);
    try {
      await onCreateClass({
        name: cleanName,
        grade: Number(grade),
        section: cleanSection,
        teacherId: teacherId || undefined,
        capacity: Number(capacity),
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Classroom Section"
      description="Establish a new grade section and optionally assign a class teacher."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Grade *
            </label>
            <select
              value={grade}
              onChange={(e) => handleGradeChange(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
            >
              <option value={6}>Grade 6</option>
              <option value={7}>Grade 7</option>
              <option value={8}>Grade 8</option>
              <option value={9}>Grade 9</option>
              <option value={10}>Grade 10</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Section *
            </label>
            <input
              type="text"
              required
              maxLength={2}
              value={section}
              onChange={(e) => handleSectionChange(e.target.value)}
              placeholder="e.g. A"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 uppercase"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Display Class Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Class 8A"
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Class Teacher Assignment
          </label>
          <select
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
          >
            <option value="">Leave Unassigned for Now</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.employeeId})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Desk / Student Capacity
          </label>
          <input
            type="number"
            min={5}
            max={80}
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
            Create Class
          </Button>
        </div>
      </form>
    </Modal>
  );
};
