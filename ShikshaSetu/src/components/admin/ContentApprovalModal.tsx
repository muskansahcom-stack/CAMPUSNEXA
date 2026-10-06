import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { AdminContentItem } from '../../types/admin';
import { BookOpen, CheckCircle2, XCircle, AlertCircle, FileText } from 'lucide-react';

interface ContentApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentItem: AdminContentItem | null;
  onApprove: (contentId: string, approved: boolean, feedbackNote?: string) => Promise<void>;
}

export const ContentApprovalModal: React.FC<ContentApprovalModalProps> = ({
  isOpen,
  onClose,
  contentItem,
  onApprove,
}) => {
  const [feedbackNote, setFeedbackNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !contentItem) return null;

  const handleAction = async (approved: boolean) => {
    setIsSubmitting(true);
    try {
      await onApprove(contentItem.id, approved, feedbackNote.trim() || undefined);
      setFeedbackNote('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Curriculum Content Review & Approval"
      description="Inspect teacher-submitted educational modules before institutional publishing."
      maxWidth="md"
    >
      <div className="space-y-4">
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <Badge variant="brand" size="sm">
              Grade {contentItem.grade} • {contentItem.subject}
            </Badge>
            <span className="text-[11px] font-mono text-slate-500 uppercase">
              {contentItem.contentType.replace('_', ' ')}
            </span>
          </div>

          <h3 className="text-base font-bold text-slate-900 leading-snug">
            {contentItem.title}
          </h3>

          <div className="text-xs text-slate-600">
            <strong>Author:</strong> {contentItem.authorTeacherName} • Submitted {contentItem.submittedAt}
          </div>

          {contentItem.topicsCovered && contentItem.topicsCovered.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {contentItem.topicsCovered.map((topic, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-semibold text-slate-700"
                >
                  {topic}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Reviewer Feedback or Instructions (Optional)
          </label>
          <textarea
            rows={3}
            value={feedbackNote}
            onChange={(e) => setFeedbackNote(e.target.value)}
            placeholder="Add comments on state board alignment, vernacular accuracy, or remedial suggestions..."
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <span>
            Approved content is instantly published to the school's local edge library and made accessible for student offline caching.
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={() => handleAction(false)}
            isLoading={isSubmitting}
            leftIcon={<XCircle className="w-4 h-4" />}
          >
            Archive / Reject
          </Button>

          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="saffron"
              size="sm"
              onClick={() => handleAction(true)}
              isLoading={isSubmitting}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Approve & Publish
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
