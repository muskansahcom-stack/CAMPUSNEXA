import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { AdminClass, AddStudentPayload } from '../../types/admin';
import { sanitizeInput } from '../../lib/securityUtils';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: AdminClass[];
  onAddStudent: (payload: AddStudentPayload) => Promise<void>;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  classes,
  onAddStudent,
}) => {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState<number>(8);
  const [classId, setClassId] = useState<string>(classes[0]?.id || '');
  const [learningLevel, setLearningLevel] = useState('Foundation Stage 1');
  const [deviceAccess, setDeviceAccess] = useState<'shared_phone' | 'dedicated_phone' | 'tablet' | 'desktop'>('shared_phone');
  const [connectivityMode, setConnectivityMode] = useState<'offline' | 'intermittent_2g' | '3g' | '4g'>('intermittent_2g');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync classId when classes change
  React.useEffect(() => {
    if (classes.length > 0 && !classId) {
      setClassId(classes[0].id);
    }
  }, [classes, classId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = sanitizeInput(name.trim());
    if (!cleanName) return;

    setIsSubmitting(true);
    try {
      await onAddStudent({
        name: cleanName,
        grade: Number(grade),
        classId: classId || classes[0]?.id || '',
        learningLevel,
        deviceAccess,
        connectivityMode,
      });
      setName('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Enroll New Student"
      description="Add a learner to the school institutional roster. Privacy protected: Personal contact numbers and domestic data are strictly excluded."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Student Full Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ramesh Hansda"
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Grade *
            </label>
            <select
              value={grade}
              onChange={(e) => setGrade(Number(e.target.value))}
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
              Assigned Class *
            </label>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} (Grade {cls.grade}{cls.section})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Initial Learning Assessment Level
          </label>
          <select
            value={learningLevel}
            onChange={(e) => setLearningLevel(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
          >
            <option value="Foundation Stage 1">Foundation Stage 1 (Basic Numeracy/Literacy)</option>
            <option value="Foundation Stage 2">Foundation Stage 2 (Developing)</option>
            <option value="Developing Stage 3">Developing Stage 3 (Standard Grade Level)</option>
            <option value="Advanced Stage 4">Advanced Stage 4 (Mastery Pace)</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Primary Device Access
            </label>
            <select
              value={deviceAccess}
              onChange={(e) => setDeviceAccess(e.target.value as any)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
            >
              <option value="shared_phone">Family Shared Phone</option>
              <option value="tablet">Community / School Tablet</option>
              <option value="dedicated_phone">Dedicated Phone</option>
              <option value="desktop">School Desktop Kiosk</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Connectivity Profile
            </label>
            <select
              value={connectivityMode}
              onChange={(e) => setConnectivityMode(e.target.value as any)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
            >
              <option value="intermittent_2g">Weak / Intermittent 2G</option>
              <option value="offline">Strict Offline (IndexedDB Sync)</option>
              <option value="3g">Standard 3G</option>
              <option value="4g">High-speed 4G / Wi-Fi</option>
            </select>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-[11px] leading-relaxed">
          <strong>Privacy Notice:</strong> ShikshaSetu enforces student data minimization. Personal contact details, family financial status, and home addresses are never requested or stored.
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
            Add Student to Roster
          </Button>
        </div>
      </form>
    </Modal>
  );
};
