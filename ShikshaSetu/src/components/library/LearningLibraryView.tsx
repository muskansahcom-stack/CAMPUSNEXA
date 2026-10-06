import React, { useState, useEffect, useMemo } from 'react';
import {
  fetchEducationBoards,
  fetchLessons,
  getOfflineLessons,
  toggleBookmark,
} from '../../services/libraryService';
import {
  EducationBoardRow,
  LessonSummaryItem,
  LibraryFilters,
} from '../../types/library';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { EmptyState } from '../ui/EmptyState';
import { LessonDetailModal } from './LessonDetailModal';
import { useToast } from '../../contexts/ToastContext';
import {
  Search,
  BookOpen,
  Bookmark,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  Layers,
  Play,
  FileText,
  Volume2,
  Sliders,
  HelpCircle,
  HardDriveDownload,
  Sparkles,
  Compass,
  ArrowRight,
  WifiOff,
  X,
} from 'lucide-react';

interface LearningLibraryViewProps {
  studentId?: string;
  onOpenLesson?: (lessonId: string) => void;
}

export const LearningLibraryView: React.FC<LearningLibraryViewProps> = ({
  studentId = 'demo-student',
  onOpenLesson,
}) => {
  const { showToast } = useToast();

  const [boards, setBoards] = useState<EducationBoardRow[]>([]);
  const [lessons, setLessons] = useState<LessonSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBoardId, setSelectedBoardId] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [filterMode, setFilterMode] = useState<'all' | 'bookmarked' | 'offline' | 'in_progress'>('all');

  // Modal State
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

  // Fetch boards and lessons on mount
  const loadData = async () => {
    setLoading(true);
    const [bData, lData] = await Promise.all([
      fetchEducationBoards(),
      fetchLessons({}, studentId),
    ]);
    setBoards(bData);
    setLessons(lData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [studentId]);

  // Handle bookmark toggle from card
  const handleCardBookmark = async (e: React.MouseEvent, lessonId: string) => {
    e.stopPropagation();
    const res = await toggleBookmark(studentId, lessonId);
    setLessons((prev) =>
      prev.map((l) => (l.id === lessonId ? { ...l, is_bookmarked: res.isBookmarked } : l))
    );
    showToast({
      type: res.isBookmarked ? 'success' : 'info',
      title: res.isBookmarked ? 'Saved to Bookmarks' : 'Removed from Bookmarks',
      message: res.isBookmarked ? 'Lesson saved to your quick list.' : 'Lesson removed from saved list.',
    });
  };

  // Continue Learning lessons (in progress)
  const inProgressLessons = useMemo(() => {
    return lessons.filter(
      (l) => l.progress_status === 'in_progress' || (l.progress_pct && l.progress_pct > 0 && l.progress_pct < 100)
    );
  }, [lessons]);

  // Filtered lessons
  const filteredLessons = useMemo(() => {
    return lessons.filter((l) => {
      // Board filter
      if (selectedBoardId !== 'all' && l.board_id !== selectedBoardId) return false;

      // Grade filter
      if (selectedGrade !== 'all' && l.grade !== parseInt(selectedGrade)) return false;

      // Subject filter
      if (selectedSubject !== 'all') {
        if (selectedSubject === 'math' && !l.subject_name?.toLowerCase().includes('math')) return false;
        if (selectedSubject === 'science' && !l.subject_name?.toLowerCase().includes('science')) return false;
      }

      // Quick tab filter mode
      if (filterMode === 'bookmarked' && !l.is_bookmarked) return false;
      if (filterMode === 'offline' && !l.is_offline_cached) return false;
      if (filterMode === 'in_progress' && l.progress_pct === 0) return false;

      // Search query
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = l.title.toLowerCase().includes(q);
        const matchExpl = l.short_explanation.toLowerCase().includes(q);
        const matchChap = l.chapter_title?.toLowerCase().includes(q);
        const matchSubj = l.subject_name?.toLowerCase().includes(q);
        if (!matchTitle && !matchExpl && !matchChap && !matchSubj) return false;
      }

      return true;
    });
  }, [lessons, selectedBoardId, selectedGrade, selectedSubject, filterMode, searchQuery]);

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play className="w-3 h-3 text-red-500" />;
      case 'notes':
        return <FileText className="w-3 h-3 text-blue-500" />;
      case 'audio':
        return <Volume2 className="w-3 h-3 text-emerald-500" />;
      case 'interactive':
        return <Sliders className="w-3 h-3 text-purple-500" />;
      case 'worksheet':
        return <Layers className="w-3 h-3 text-amber-500" />;
      case 'quiz':
        return <HelpCircle className="w-3 h-3 text-saffron-600" />;
      default:
        return <FileText className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Hero Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-brand-900 via-brand-800 to-brand-950 text-white shadow-elevated relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="saffron" size="sm">
              ShikshaSetu Learning Library
            </Badge>
            <span className="text-xs text-brand-200">
              National & State Curriculum Hub
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Curriculum Lessons & Concept Capsules
          </h1>

          <p className="text-xs sm:text-sm text-brand-100 leading-relaxed">
            Multi-modal learning designed for rural students across India: Video, Notes, Audio stories,
            interactive visual tools, and full offline caching for zero-connectivity study.
          </p>
        </div>

        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-8 translate-y-8">
          <BookOpen className="w-72 h-72 text-white" />
        </div>
      </div>

      {/* CONTINUE LEARNING SECTION (When student has in-progress modules) */}
      {inProgressLessons.length > 0 && filterMode === 'all' && searchQuery.trim() === '' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-saffron-500" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Continue Where You Left Off
              </h3>
            </div>
            <span className="text-xs text-slate-500">
              {inProgressLessons.length} active module{inProgressLessons.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inProgressLessons.map((l) => (
              <div
                key={l.id}
                onClick={() => setActiveLessonId(l.id)}
                className="p-5 rounded-2xl bg-white border border-brand-200 hover:border-brand-400 shadow-soft transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="saffron" size="sm">
                      {l.subject_name} • Grade {l.grade}
                    </Badge>
                    <span className="text-xs font-bold text-brand-700">
                      {l.progress_pct}% Completed
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 group-hover:text-brand-700 transition-colors">
                    {l.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {l.short_explanation}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="w-1/2">
                    <ProgressBar value={l.progress_pct || 0} max={100} variant="saffron" size="sm" />
                  </div>
                  <Button size="sm" variant="saffron" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Resume
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SEARCH & MULTI-LEVEL CURRICULUM FILTERS */}
      <Card variant="elevated" className="p-5 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by topic, keyword (e.g. Fractions, Rainwater, Land Area)..."
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all text-slate-900"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dropdown Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Education Board Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Education Board
            </label>
            <select
              value={selectedBoardId}
              onChange={(e) => setSelectedBoardId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:ring-2 focus:ring-brand-500"
            >
              <option value="all">All Boards (India Wide)</option>
              {boards.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.code} ({b.state})
                </option>
              ))}
            </select>
          </div>

          {/* Grade Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Grade Level
            </label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:ring-2 focus:ring-brand-500"
            >
              <option value="all">All Grades</option>
              <option value="6">Grade 6</option>
              <option value="7">Grade 7</option>
              <option value="8">Grade 8</option>
            </select>
          </div>

          {/* Subject Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:ring-2 focus:ring-brand-500"
            >
              <option value="all">All Subjects</option>
              <option value="math">Mathematics</option>
              <option value="science">Environmental Science</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Chips */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              filterMode === 'all'
                ? 'bg-brand-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Lessons ({lessons.length})
          </button>

          <button
            onClick={() => setFilterMode('bookmarked')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              filterMode === 'bookmarked'
                ? 'bg-saffron-500 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" /> Saved Bookmarks (
            {lessons.filter((l) => l.is_bookmarked).length})
          </button>

          <button
            onClick={() => setFilterMode('offline')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              filterMode === 'offline'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <HardDriveDownload className="w-3.5 h-3.5" /> Downloaded Offline (
            {lessons.filter((l) => l.is_offline_cached).length})
          </button>

          <button
            onClick={() => setFilterMode('in_progress')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              filterMode === 'in_progress'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> In Progress (
            {lessons.filter((l) => l.progress_pct && l.progress_pct > 0 && l.progress_pct < 100).length})
          </button>
        </div>
      </Card>

      {/* LESSONS GRID */}
      {filteredLessons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLessons.map((l) => (
            <div
              key={l.id}
              onClick={() => setActiveLessonId(l.id)}
              className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-brand-400 hover:shadow-elevated transition-all cursor-pointer flex flex-col justify-between group relative"
            >
              {/* Card Header Top */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge variant="brand" size="sm">
                      {l.board_code}
                    </Badge>
                    <Badge variant="neutral" size="sm">
                      Grade {l.grade}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Offline Cached Indicator */}
                    {l.is_offline_cached && (
                      <span
                        className="p-1 text-emerald-600 bg-emerald-50 rounded-lg"
                        title="Downloaded for Offline Use"
                      >
                        <HardDriveDownload className="w-3.5 h-3.5" />
                      </span>
                    )}

                    {/* Bookmark Toggle */}
                    <button
                      onClick={(e) => handleCardBookmark(e, l.id)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        l.is_bookmarked
                          ? 'bg-saffron-50 border-saffron-200 text-saffron-500'
                          : 'bg-white border-transparent text-slate-300 hover:text-slate-600 hover:border-slate-200'
                      }`}
                      title={l.is_bookmarked ? 'Saved to bookmarks' : 'Add to bookmarks'}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${l.is_bookmarked ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Title & Chapter */}
                <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-700 transition-colors line-clamp-2">
                  {l.title}
                </h3>
                <span className="block text-[11px] text-brand-600 font-semibold mt-0.5">
                  {l.chapter_title}
                </span>

                <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                  {l.short_explanation}
                </p>
              </div>

              {/* Card Footer: Media formats & Progress */}
              <div className="mt-5 pt-3 border-t border-slate-100 space-y-3">
                {/* Multi-modal format pills */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {l.content_types.map((type) => (
                    <span
                      key={type}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-[10px] font-semibold text-slate-600 capitalize"
                    >
                      {getContentIcon(type)}
                      {type}
                    </span>
                  ))}
                  <span className="text-[10px] text-slate-400 font-medium ml-auto flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {l.total_duration_minutes}m
                  </span>
                </div>

                {/* Progress Bar / Completed status */}
                {l.progress_pct !== undefined && l.progress_pct > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">Progress</span>
                      <span
                        className={`font-bold ${
                          l.progress_pct >= 100 ? 'text-emerald-600' : 'text-brand-600'
                        }`}
                      >
                        {l.progress_pct}%
                      </span>
                    </div>
                    <ProgressBar
                      value={l.progress_pct}
                      max={100}
                      variant={l.progress_pct >= 100 ? 'forest' : 'brand'}
                      size="sm"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* POLISHED EMPTY STATES */
        <Card variant="default" className="p-8">
          {filterMode === 'bookmarked' ? (
            <EmptyState
              title="No Bookmarked Lessons"
              description="Click the bookmark ribbon icon on any lesson card to save it here for fast quick-study."
              actionLabel="Browse All Lessons"
              onAction={() => setFilterMode('all')}
              actionVariant="secondary"
            />
          ) : filterMode === 'offline' ? (
            <EmptyState
              title="No Offline Lessons Downloaded"
              description="Download lessons when connected to the internet so you can study without relying on cellular data or power cuts."
              actionLabel="Explore Lessons to Download"
              onAction={() => setFilterMode('all')}
              actionVariant="secondary"
            />
          ) : (
            <EmptyState
              title="No Lessons Match Your Search"
              description={`We couldn't find any lessons matching "${searchQuery}". Try adjusting your keywords or clearing the active filters.`}
              actionLabel="Clear All Filters"
              onAction={() => {
                setSearchQuery('');
                setSelectedBoardId('all');
                setSelectedGrade('all');
                setSelectedSubject('all');
                setFilterMode('all');
              }}
              actionVariant="secondary"
            />
          )}
        </Card>
      )}

      {/* LESSON DETAIL CONTENT PLAYER MODAL */}
      <LessonDetailModal
        isOpen={Boolean(activeLessonId)}
        onClose={() => setActiveLessonId(null)}
        lessonId={activeLessonId}
        studentId={studentId}
        onBookmarkToggled={(id, isBookmarked) => {
          setLessons((prev) =>
            prev.map((l) => (l.id === id ? { ...l, is_bookmarked: isBookmarked } : l))
          );
        }}
        onProgressUpdated={(id, newPct) => {
          setLessons((prev) =>
            prev.map((l) =>
              l.id === id
                ? {
                    ...l,
                    progress_pct: newPct,
                    progress_status: newPct >= 100 ? 'completed' : 'in_progress',
                  }
                : l
            )
          );
        }}
      />
    </div>
  );
};
