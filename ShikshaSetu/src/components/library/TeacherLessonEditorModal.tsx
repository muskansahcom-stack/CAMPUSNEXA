import React, { useState, useEffect } from 'react';
import {
  fetchEducationBoards,
  fetchChapters,
  createTeacherLesson,
  toggleLessonPublishStatus,
} from '../../services/libraryService';
import { EducationBoardRow, ChapterRow, LessonRow } from '../../types/library';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { useToast } from '../../contexts/ToastContext';
import { sanitizeInput } from '../../lib/securityUtils';
import {
  BookPlus,
  Save,
  Send,
  Eye,
  EyeOff,
  Video,
  FileText,
  Volume2,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Paperclip,
  Check,
  Plus,
  Trash2,
} from 'lucide-react';

interface TeacherLessonEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherId?: string;
  onLessonCreated?: (lessonId: string) => void;
}

export const TeacherLessonEditorModal: React.FC<TeacherLessonEditorModalProps> = ({
  isOpen,
  onClose,
  teacherId = 'demo-teacher',
  onLessonCreated,
}) => {
  const { showToast } = useToast();

  const [boards, setBoards] = useState<EducationBoardRow[]>([]);
  const [chapters, setChapters] = useState<ChapterRow[]>([]);

  // Hierarchy selections
  const [selectedBoardId, setSelectedBoardId] = useState<string>('');
  const [selectedGrade, setSelectedGrade] = useState<number>(8);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' // Math
  );
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');

  // Lesson fields
  const [title, setTitle] = useState('');
  const [shortExplanation, setShortExplanation] = useState('');
  const [objectives, setObjectives] = useState<string[]>([
    'State the core foundational principle',
    'Apply concept to everyday rural community situations',
  ]);
  const [newObjective, setNewObjective] = useState('');
  const [isPublished, setIsPublished] = useState(true);

  // Content blocks
  const [notesBody, setNotesBody] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [worksheetText, setWorksheetText] = useState('');

  // Assignment to class
  const [assignToClass, setAssignToClass] = useState(true);
  const [selectedClassName, setSelectedClassName] = useState('Grade 8 Cohort (42 Students)');

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    fetchEducationBoards().then((b) => {
      setBoards(b);
      if (b.length > 0 && !selectedBoardId) setSelectedBoardId(b[0].id);
    });
  }, [isOpen]);

  useEffect(() => {
    if (!selectedBoardId) return;
    fetchChapters(selectedBoardId, selectedGrade, selectedSubjectId).then((ch) => {
      setChapters(ch);
      if (ch.length > 0) setSelectedChapterId(ch[0].id);
      else setSelectedChapterId('');
    });
  }, [selectedBoardId, selectedGrade, selectedSubjectId]);

  if (!isOpen) return null;

  const handleAddObjective = () => {
    if (newObjective.trim()) {
      setObjectives((prev) => [...prev, newObjective.trim()]);
      setNewObjective('');
    }
  };

  const handleRemoveObjective = (index: number) => {
    setObjectives((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveLesson = async () => {
    if (!title.trim() || !shortExplanation.trim()) {
      showToast({
        type: 'error',
        title: 'Missing Required Fields',
        message: 'Please provide a lesson title and short explanation.',
      });
      return;
    }

    if (!selectedChapterId) {
      showToast({
        type: 'error',
        title: 'Select a Curriculum Chapter',
        message: 'Please link this lesson to a valid board and chapter.',
      });
      return;
    }

    setSaving(true);
    const res = await createTeacherLesson(
      {
        title: sanitizeInput(title.trim()),
        chapter_id: selectedChapterId,
        short_explanation: sanitizeInput(shortExplanation.trim()),
        learning_objectives: objectives.map((obj) => sanitizeInput(obj.trim())),
        is_published: isPublished,
        notes_body: notesBody.trim() ? sanitizeInput(notesBody.trim()) : undefined,
        video_url: videoUrl.trim() || undefined,
        audio_url: audioUrl.trim() || undefined,
        worksheet_text: worksheetText.trim() ? sanitizeInput(worksheetText.trim()) : undefined,
      },
      teacherId
    );
    setSaving(false);

    if (res.success) {
      showToast({
        type: 'success',
        title: isPublished ? 'Lesson Published to Library' : 'Lesson Saved as Draft',
        message: assignToClass
          ? `Dispatched as assignment to ${selectedClassName}.`
          : 'Lesson successfully authored in curriculum repository.',
      });
      onLessonCreated?.(res.lessonId);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Author Curriculum Lesson & Multi-Modal Content"
      description="Create a curriculum-aligned lesson capsule with notes, video, audio story, and practice worksheet."
      maxWidth="3xl"
    >
      <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
        {/* Step 1: Configurable Curriculum Hierarchy Selection */}
        <div className="p-4 rounded-2xl bg-brand-50/70 border border-brand-100 space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="brand" size="sm">
              Hierarchy Alignment
            </Badge>
            <span className="text-xs font-semibold text-brand-900">
              Country: India • Configurable Multi-Board Placement
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Board */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Education Board *
              </label>
              <select
                value={selectedBoardId}
                onChange={(e) => setSelectedBoardId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium"
              >
                {boards.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.code} ({b.state})
                  </option>
                ))}
              </select>
            </div>

            {/* Grade */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Grade *
              </label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium"
              >
                <option value={6}>Grade 6</option>
                <option value={7}>Grade 7</option>
                <option value={8}>Grade 8</option>
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Subject *
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium"
              >
                <option value="aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa">Mathematics</option>
                <option value="cccccccc-cccc-cccc-cccc-cccccccccccc">Environmental Science</option>
              </select>
            </div>
          </div>

          {/* Chapter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Curriculum Chapter *
            </label>
            <select
              value={selectedChapterId}
              onChange={(e) => setSelectedChapterId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium"
            >
              {chapters.length > 0 ? (
                chapters.map((c) => (
                  <option key={c.id} value={c.id}>
                    Chapter {c.chapter_number}: {c.title}
                  </option>
                ))
              ) : (
                <option value="">No chapters registered for this combination</option>
              )}
            </select>
          </div>
        </div>

        {/* Step 2: Lesson Core Metadata */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Lesson Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Village Land Measuring: Calculating Trapezoid Plots"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Short Conceptual Explanation *
            </label>
            <textarea
              rows={2}
              value={shortExplanation}
              onChange={(e) => setShortExplanation(e.target.value)}
              placeholder="1-2 sentences summarizing what the student will understand in everyday terms..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Learning Objectives Checklist Builder */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Learning Objectives Checklist
            </label>
            <div className="space-y-2">
              {objectives.map((obj, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                    <span>{obj}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveObjective(idx)}
                    className="p-1.5 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  placeholder="Add another learning objective..."
                  className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddObjective();
                    }
                  }}
                />
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleAddObjective}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Multi-Modal Content Editor */}
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Multi-Modal Lesson Elements:
          </span>

          {/* Notes Content */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600" /> Lesson Notes & Formulas
            </label>
            <textarea
              rows={4}
              value={notesBody}
              onChange={(e) => setNotesBody(e.target.value)}
              placeholder="Enter markdown formatted notes. Use ### for headers, > for key takeaways, and real village examples..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Video URL */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-red-500" /> Video URL (Low-Bandwidth)
              </label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://commondatastorage.googleapis.com/...mp4"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white"
              />
            </div>

            {/* Audio URL */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-emerald-600" /> Spoken Audio URL
              </label>
              <input
                type="url"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                placeholder="https://.../vernacular_guide.mp3"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white"
              />
            </div>
          </div>

          {/* Worksheet Content */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-600" /> Practice Worksheet Exercises
            </label>
            <textarea
              rows={3}
              value={worksheetText}
              onChange={(e) => setWorksheetText(e.target.value)}
              placeholder="1. Practice question 1...&#10;2. Practice question 2..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white"
            />
          </div>
        </div>

        {/* Step 4: Publication & Classroom Assignment */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">Publication Status:</span>
            <button
              type="button"
              onClick={() => setIsPublished(!isPublished)}
              className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                isPublished
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}
            >
              {isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              {isPublished ? 'Published (Live for Students)' : 'Draft (Hidden from Library)'}
            </button>
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="assignClass"
                checked={assignToClass}
                onChange={(e) => setAssignToClass(e.target.checked)}
                className="w-4 h-4 text-brand-600 rounded"
              />
              <label htmlFor="assignClass" className="text-xs text-slate-700 font-medium">
                Assign immediately to {selectedClassName}
              </label>
            </div>
            <span className="text-[11px] text-slate-400">Due in 7 days</span>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Button variant="secondary" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="saffron"
            size="md"
            onClick={handleSaveLesson}
            isLoading={saving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            {isPublished ? 'Publish Lesson' : 'Save Draft'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
