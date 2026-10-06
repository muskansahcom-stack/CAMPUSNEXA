import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { AdminContentItem, ContentApprovalStatus } from '../../types/admin';
import { ContentApprovalModal } from './ContentApprovalModal';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Archive,
  Layers,
  FileCheck,
  Eye,
  AlertCircle,
  FileText,
} from 'lucide-react';

interface ContentManagementSectionProps {
  content: AdminContentItem[];
  onApproveContent: (contentId: string, approved: boolean, note?: string) => Promise<void>;
}

export const ContentManagementSection: React.FC<ContentManagementSectionProps> = ({
  content,
  onApproveContent,
}) => {
  const [activeFilter, setActiveFilter] = useState<ContentApprovalStatus | 'all'>('all');
  const [inspectingItem, setInspectingItem] = useState<AdminContentItem | null>(null);

  const pendingCount = content.filter((c) => c.status === 'pending_approval').length;
  const approvedCount = content.filter((c) => c.status === 'approved').length;

  const filteredItems = content.filter((item) => {
    if (activeFilter === 'all') return true;
    return item.status === activeFilter;
  });

  const getStatusBadge = (status: ContentApprovalStatus) => {
    switch (status) {
      case 'approved':
        return <Badge variant="brand" size="sm">Approved & Published</Badge>;
      case 'pending_approval':
        return <Badge variant="saffron" size="sm">Pending Review</Badge>;
      case 'draft':
        return <Badge variant="neutral" size="sm">Draft</Badge>;
      case 'archived':
        return <Badge variant="danger" size="sm">Archived</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner with Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Curriculum Content & Regional Materials</h3>
          <p className="text-xs text-slate-500">
            Review teacher-authored modules, worksheets, and vernacular content before local deployment
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveFilter('all')}
            className={`py-1.5 px-3 rounded-lg transition-all ${
              activeFilter === 'all'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({content.length})
          </button>
          <button
            onClick={() => setActiveFilter('pending_approval')}
            className={`py-1.5 px-3 rounded-lg transition-all flex items-center gap-1.5 ${
              activeFilter === 'pending_approval'
                ? 'bg-white text-amber-900 shadow-2xs font-bold'
                : 'text-amber-700 hover:text-amber-900'
            }`}
          >
            <span>Pending</span>
            {pendingCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveFilter('approved')}
            className={`py-1.5 px-3 rounded-lg transition-all ${
              activeFilter === 'approved'
                ? 'bg-white text-emerald-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Approved ({approvedCount})
          </button>
        </div>
      </div>

      {/* Content Items List */}
      <div className="space-y-3">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <Card
              key={item.id}
              variant="elevated"
              className="border-slate-200 p-4 hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="brand" size="sm">
                    Grade {item.grade} • {item.subject}
                  </Badge>
                  <span className="text-[11px] font-mono text-slate-500 uppercase bg-slate-100 px-2 py-0.5 rounded-md">
                    {item.contentType.replace('_', ' ')}
                  </span>
                  {getStatusBadge(item.status)}
                </div>

                <h4 className="text-sm font-bold text-slate-900 leading-snug">
                  {item.title}
                </h4>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span>Author: <strong>{item.authorTeacherName}</strong></span>
                  <span>•</span>
                  <span>Submitted {item.submittedAt}</span>
                  {item.status === 'approved' && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-700 font-semibold">
                        {item.usageCount} Student Accesses
                      </span>
                    </>
                  )}
                </div>

                {item.feedbackNote && (
                  <p className="text-xs text-slate-600 italic bg-amber-50/70 border border-amber-200/60 p-2 rounded-xl mt-1">
                    <strong>Admin Note:</strong> "{item.feedbackNote}"
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant={item.status === 'pending_approval' ? 'saffron' : 'secondary'}
                  onClick={() => setInspectingItem(item)}
                  leftIcon={<Eye className="w-3.5 h-3.5" />}
                >
                  {item.status === 'pending_approval' ? 'Review & Approve' : 'Inspect'}
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-xs text-slate-500">
            No curriculum items match the selected filter.
          </div>
        )}
      </div>

      <ContentApprovalModal
        isOpen={!!inspectingItem}
        onClose={() => setInspectingItem(null)}
        contentItem={inspectingItem}
        onApprove={onApproveContent}
      />
    </div>
  );
};
