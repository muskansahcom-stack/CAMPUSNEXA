import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useToast } from '../../contexts/ToastContext';
import { teacherService } from '../../services/teacherService';
import { BookOpen, Calendar, Users, Check, Sparkles } from 'lucide-react';

interface CreateAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedStudentId?: string;
  preSelectedTopic?: string;
  onAssignmentCreated: () => void;
}

export const CreateAssignmentModal: React.FC<CreateAssignmentModalProps> = ({
  isOpen,
  onClose,
  preSelectedStudentId,
  preSelectedTopic,
  onAssignmentCreated,
}) => {
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Mathematics');
  const [topicName, setTopicName] = useState('Fractions: Parts of a Whole');
  const [className, setClassName] = useState('Class 8A');
  const [assignmentScope, setAssignmentScope] = useState<'class' | 'specific'>('class');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [instructions, setInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available topics for assignment
  const AVAILABLE_TOPICS = [
    { id: 'top-frac-01', name: 'Fractions: Parts of a Whole', subject: 'Mathematics', grade: 8 },
    { id: 'top-frac-02', name: 'Equivalent Fractions & Simplification', subject: 'Mathematics', grade: 8 },
    { id: 'top-alg-02', name: 'Linear Equations with Balances', subject: 'Mathematics', grade: 8 },
    { id: 'top-sci-01', name: 'Groundwater Table & Traditional Harvesting', subject: 'Science', grade: 8 },
    { id: 'top-dec-01', name: 'Decimals in Village Measurement', subject: 'Mathematics', grade: 7 },
  ];

  const STUDENTS = [
    { id: 'std-ravi-01', name: 'Ravi Kumar', className: 'Class 8A' },
    { id: 'std-sunita-02', name: 'Sunita Soren', className: 'Class 8A' },
    { id: 'std-bikram-03', name: 'Bikram Rabha', className: 'Class 8B' },
    { id: 'std-aarav-01', name: 'Aarav Sharma', className: 'Class 8A' },
    { id: 'std-kavita-01', name: 'Kavita Deshmukh', className: 'Class 8A' },
    { id: 'std-priya-01', name: 'Priya Rathod', className: 'Class 8B' },
  ];

  useEffect(() => {
    if (isOpen) {
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 5);
      setDueDate(defaultDate.toISOString().split('T')[0]);

      if (preSelectedTopic) {
        setTopicName(preSelectedTopic);
        setTitle(`Targeted Practice: ${preSelectedTopic}`);
      } else {
        setTitle('Practice Assignment: Fractions in Everyday Life');
      }

      if (preSelectedStudentId) {
        setAssignmentScope('specific');
        setSelectedStudentIds([preSelectedStudentId]);
      } else {
        setAssignmentScope('class');
        setSelectedStudentIds([]);
      }

      setInstructions('Complete the lesson notes review and score at least 70% on the check quiz.');
    }
  }, [isOpen, preSelectedTopic, preSelectedStudentId]);

  if (!isOpen) return null;

  const handleStudentToggle = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !dueDate) {
      showToast({
        type: 'error',
        title: 'Missing Details',
        message: 'Please provide an assignment title and due date.',
      });
      return;
    }

    if (assignmentScope === 'specific' && selectedStudentIds.length === 0) {
      showToast({
        type: 'error',
        title: 'No Students Selected',
        message: 'Please select at least one student for this targeted assignment.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await teacherService.createAssignment({
        title,
        topicId: AVAILABLE_TOPICS.find((t) => t.name === topicName)?.id || 'top-frac-01',
        topicName,
        subject,
        grade: 8,
        className,
        assignedStudentIds: assignmentScope === 'specific' ? selectedStudentIds : [],
        dueDate,
        instructions,
      });

      showToast({
        type: 'success',
        title: 'Assignment Created & Dispatched',
        message: `Dispatched "${title}" to ${assignmentScope === 'class' ? className : `${selectedStudentIds.length} student(s)`}.`,
      });

      onAssignmentCreated();
      onClose();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Failed to Create Assignment',
        message: err.message || 'An error occurred.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Assignment"
      description="Assign curriculum modules, revision lessons, or targeted remediation to your students."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Assignment Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Assignment Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Fractions Revision: Roti Sharing Model"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
          />
        </div>

        {/* Topic & Subject Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Curriculum Topic</label>
            <select
              value={topicName}
              onChange={(e) => {
                setTopicName(e.target.value);
                const selected = AVAILABLE_TOPICS.find((t) => t.name === e.target.value);
                if (selected) setSubject(selected.subject);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
            >
              {AVAILABLE_TOPICS.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name} ({t.subject})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Subject</label>
            <input
              type="text"
              readOnly
              value={subject}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium bg-slate-50 text-slate-600 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Target Audience: Class or Specific Students */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700">Assign To:</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setAssignmentScope('class')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                assignmentScope === 'class'
                  ? 'bg-brand-50 border-brand-500 text-brand-950 font-bold'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-600" />
                <span className="text-xs">Entire Classroom</span>
              </div>
              <span className="block text-[11px] text-slate-500 font-normal mt-0.5">
                All 22 students in Class 8A
              </span>
            </button>

            <button
              type="button"
              onClick={() => setAssignmentScope('specific')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                assignmentScope === 'specific'
                  ? 'bg-brand-50 border-brand-500 text-brand-950 font-bold'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-saffron-600" />
                <span className="text-xs">Targeted Students</span>
              </div>
              <span className="block text-[11px] text-slate-500 font-normal mt-0.5">
                Selected remedial learners
              </span>
            </button>
          </div>

          {/* Specific Student Checkboxes */}
          {assignmentScope === 'specific' && (
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 max-h-40 overflow-y-auto">
              <span className="text-[11px] font-bold text-slate-600 uppercase">Select Students:</span>
              <div className="grid grid-cols-2 gap-2">
                {STUDENTS.map((s) => {
                  const isChecked = selectedStudentIds.includes(s.id);
                  return (
                    <label
                      key={s.id}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-brand-100 border-brand-400 text-brand-950 font-bold'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleStudentToggle(s.id)}
                        className="w-3.5 h-3.5 text-brand-600 rounded"
                      />
                      <span>{s.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Due Date & Deadline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Class Cohort</label>
            <select
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
            >
              <option value="Class 8A">Class 8A (Main STEM Cohort)</option>
              <option value="Class 8B">Class 8B (Afternoon Batch)</option>
              <option value="Class 7A">Class 7A</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Submission Deadline</label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Teacher Note / Instructions</label>
          <textarea
            rows={2}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="e.g. Please solve offline and check results during afternoon study hall."
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
          />
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="saffron"
            size="md"
            isLoading={isSubmitting}
            leftIcon={<BookOpen className="w-4 h-4" />}
          >
            Dispatch Assignment
          </Button>
        </div>
      </form>
    </Modal>
  );
};
