import React, { useState, useEffect } from 'react';
import {
  fetchLessonDetail,
  toggleBookmark,
  updateLessonProgress,
  downloadLessonForOffline,
  removeOfflineLesson,
  isLessonOfflineCached,
  recordOfflineQuizAnswer,
} from '../../services/libraryService';
import { LessonDetail, LessonContentType } from '../../types/library';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { useToast } from '../../contexts/ToastContext';
import { useConnectivity } from '../../contexts/ConnectivityContext';
import {
  X,
  Bookmark,
  Download,
  CheckCircle2,
  Play,
  Pause,
  Volume2,
  FileText,
  HelpCircle,
  Sparkles,
  Layers,
  ArrowRight,
  HardDriveDownload,
  WifiOff,
  Check,
  RotateCcw,
  Sliders,
  ExternalLink,
} from 'lucide-react';

interface LessonDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonId: string | null;
  studentId?: string;
  onProgressUpdated?: (lessonId: string, newPct: number) => void;
  onBookmarkToggled?: (lessonId: string, isBookmarked: boolean) => void;
}

export const LessonDetailModal: React.FC<LessonDetailModalProps> = ({
  isOpen,
  onClose,
  lessonId,
  studentId = 'demo-student',
  onProgressUpdated,
  onBookmarkToggled,
}) => {
  const { showToast } = useToast();
  const { canDownloadMedia } = useConnectivity();

  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<LessonContentType>('notes');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isOfflineCached, setIsOfflineCached] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [progressPct, setProgressPct] = useState(0);

  // Audio player state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState<number>(1.0);

  // Interactive Roti Slicer state
  const [slicesCount, setSlicesCount] = useState<number>(4);
  const [selectedSlices, setSelectedSlices] = useState<number>(1);

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submittedQuiz, setSubmittedQuiz] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  useEffect(() => {
    if (!isOpen || !lessonId) return;

    let mounted = true;
    setLoading(true);

    fetchLessonDetail(lessonId, studentId).then((data) => {
      if (!mounted) return;
      if (data) {
        setLesson(data);
        setIsBookmarked(Boolean(data.is_bookmarked));
        setIsOfflineCached(isLessonOfflineCached(data.id));
        setProgressPct(data.progress_pct || 0);

        // Pick initial active tab based on what's available
        const firstContentType = data.content[0]?.content_type || 'notes';
        setActiveTab(firstContentType);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [isOpen, lessonId, studentId]);

  if (!isOpen || !lessonId) return null;

  const handleToggleBookmark = async () => {
    if (!lesson) return;
    const res = await toggleBookmark(studentId, lesson.id);
    setIsBookmarked(res.isBookmarked);
    onBookmarkToggled?.(lesson.id, res.isBookmarked);

    showToast({
      type: res.isBookmarked ? 'success' : 'info',
      title: res.isBookmarked ? 'Saved to Bookmarks' : 'Removed from Bookmarks',
      message: res.isBookmarked
        ? 'Quick access enabled from your learning library.'
        : 'Lesson removed from your saved list.',
    });
  };

  const handleToggleOfflineDownload = async () => {
    if (!lesson) return;

    if (isOfflineCached) {
      removeOfflineLesson(lesson.id);
      setIsOfflineCached(false);
      showToast({
        type: 'info',
        title: 'Offline Copy Removed',
        message: 'Local offline storage freed up.',
      });
    } else {
      const approxBytes = 2 * 1024 * 1024;
      const check = canDownloadMedia(approxBytes);
      if (!check.allowed) {
        showToast({
          type: 'info',
          title: 'Data Saver Restriction',
          message: check.reason || 'Download restricted in low data mode.',
        });
        return;
      }

      setDownloading(true);
      const res = await downloadLessonForOffline(lesson);
      setDownloading(false);
      if (res.success) {
        setIsOfflineCached(true);
        const kb = Math.round(res.totalSizeBytes / 1024);
        showToast({
          type: 'success',
          title: 'Available 100% Offline',
          message: `Saved all notes, interactive tools & audio (${kb} KB) for zero-data learning.`,
        });
      } else {
        showToast({
          type: 'error',
          title: 'Download Failed',
          message: 'Unable to write to local storage.',
        });
      }
    }
  };

  const handleProgressIncrease = async (increment: number) => {
    if (!lesson) return;
    const nextPct = Math.min(100, Math.max(progressPct, progressPct + increment));
    setProgressPct(nextPct);
    await updateLessonProgress(studentId, lesson.id, nextPct);
    onProgressUpdated?.(lesson.id, nextPct);

    if (nextPct === 100) {
      showToast({
        type: 'success',
        title: 'Lesson Mastered! 🌟 (+25 XP)',
        message: 'Outstanding persistence! You completed all learning checkpoints.',
      });
    }
  };

  const handleQuizSubmit = async (questionsList: any[]) => {
    let score = 0;
    questionsList.forEach((q) => {
      if (selectedAnswers[q.id] === q.correct_answer) {
        score += 1;
      }
    });
    setQuizScore(score);
    setSubmittedQuiz(true);

    // Save offline quiz attempts and queue for server sync
    if (lesson) {
      questionsList.forEach((q) => {
        const chosen = selectedAnswers[q.id];
        if (chosen !== undefined) {
          recordOfflineQuizAnswer(
            studentId,
            lesson.id,
            q.id,
            chosen,
            chosen === q.correct_answer,
            score,
            questionsList.length
          ).catch(() => {});
        }
      });
    }

    if (score === questionsList.length) {
      handleProgressIncrease(35);
      showToast({
        type: 'success',
        title: `Perfect Score! ${score}/${questionsList.length} (+20 XP)`,
        message: 'You demonstrated solid conceptual understanding.',
      });
    } else {
      handleProgressIncrease(15);
      showToast({
        type: 'info',
        title: `Quiz Completed: ${score}/${questionsList.length}`,
        message: 'Review the explanations below to clarify tricky points.',
      });
    }
  };

  // Find current tab's content item
  const currentContent = lesson?.content.find((c) => c.content_type === activeTab);

  // Parse quiz questions if in quiz tab
  let parsedQuizQuestions: any[] = [];
  if (activeTab === 'quiz' && currentContent?.body_text) {
    try {
      parsedQuizQuestions = JSON.parse(currentContent.body_text);
    } catch {
      parsedQuizQuestions = [];
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-elevated border border-slate-100 overflow-hidden z-10 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header Bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="brand" size="sm">
              {lesson?.subject_name || 'Mathematics'}
            </Badge>
            <Badge variant="neutral" size="sm">
              Grade {lesson?.grade || 8}
            </Badge>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              • {lesson?.chapter_title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Offline download button */}
            <Button
              variant={isOfflineCached ? 'secondary' : 'secondary'}
              size="sm"
              onClick={handleToggleOfflineDownload}
              isLoading={downloading}
              leftIcon={
                isOfflineCached ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                )
              }
              className={
                isOfflineCached
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'text-slate-700'
              }
            >
              {isOfflineCached ? 'Offline Ready' : 'Save Offline'}
            </Button>

            {/* Bookmark button */}
            <button
              onClick={handleToggleBookmark}
              className={`p-2 rounded-xl border transition-colors ${
                isBookmarked
                  ? 'bg-saffron-50 border-saffron-300 text-saffron-600'
                  : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
              }`}
              title={isBookmarked ? 'Bookmarked' : 'Add to bookmarks'}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Lesson Overview Banner */}
        <div className="p-6 bg-gradient-to-r from-brand-900 via-brand-800 to-brand-900 text-white space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-brand-200 tracking-wider uppercase">
              {lesson?.board_code} Curriculum • Sequence #{lesson?.sequence_order || 1}
            </span>
            <span className="text-xs text-brand-100 font-medium">
              Progress: {progressPct}%
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">{lesson?.title}</h2>
          <p className="text-xs sm:text-sm text-brand-100 leading-relaxed max-w-3xl">
            {lesson?.short_explanation}
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-brand-950/60 rounded-full h-2 overflow-hidden border border-brand-700/50">
            <div
              className="bg-saffron-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Multi-Modal Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-100 bg-white overflow-x-auto scrollbar-none">
          {lesson?.content.map((c) => {
            const isActive = activeTab === c.content_type;
            const getIcon = () => {
              switch (c.content_type) {
                case 'video':
                  return <Play className="w-3.5 h-3.5" />;
                case 'notes':
                  return <FileText className="w-3.5 h-3.5" />;
                case 'audio':
                  return <Volume2 className="w-3.5 h-3.5" />;
                case 'interactive':
                  return <Sliders className="w-3.5 h-3.5" />;
                case 'worksheet':
                  return <Layers className="w-3.5 h-3.5" />;
                case 'quiz':
                  return <HelpCircle className="w-3.5 h-3.5" />;
                default:
                  return <FileText className="w-3.5 h-3.5" />;
              }
            };

            return (
              <button
                key={c.id}
                onClick={() => {
                  setActiveTab(c.content_type);
                  // Reading or switching tabs contributes small incremental learning progress
                  if (progressPct < 30) handleProgressIncrease(10);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
                  isActive
                    ? 'border-brand-600 text-brand-700 bg-brand-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                {getIcon()}
                <span className="capitalize">{c.content_type}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body Content (Scrollable) */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: VIDEO */}
          {activeTab === 'video' && (
            <div className="space-y-4">
              <div className="p-3 bg-brand-50 border border-brand-200 rounded-2xl flex items-center justify-between text-xs text-brand-900">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Low-Bandwidth Compression Active (1.4 MB format)
                </span>
                <span className="font-semibold text-brand-700">Duration: 3 mins</span>
              </div>

              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center relative shadow-inner">
                {currentContent?.media_url ? (
                  <video
                    controls
                    preload="metadata"
                    className="w-full h-full object-cover"
                    src={currentContent.media_url}
                    onPlay={() => handleProgressIncrease(15)}
                  >
                    Your browser does not support HTML5 video streaming.
                  </video>
                ) : (
                  <div className="text-center text-slate-400 p-6">
                    <Play className="w-12 h-12 mx-auto text-brand-400 mb-2" />
                    <p className="text-sm font-medium">Video Animation Stream</p>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-1">
                <h4 className="font-bold text-slate-900">{currentContent?.title}</h4>
                <p>{currentContent?.body_text}</p>
              </div>
            </div>
          )}

          {/* TAB 2: NOTES */}
          {activeTab === 'notes' && (
            <div className="space-y-6">
              {/* Learning Objectives Box */}
              {lesson?.learning_objectives && lesson.learning_objectives.length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/70 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    Key Learning Objectives for This Lesson
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {lesson.learning_objectives.map((obj, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-amber-950">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                        <span>{obj}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Formatted Notes Body */}
              <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-800 leading-relaxed space-y-4">
                {currentContent?.body_text?.split('\n\n').map((paragraph, idx) => {
                  if (paragraph.startsWith('### ')) {
                    return (
                      <h3
                        key={idx}
                        className="text-base font-bold text-brand-900 pt-2 border-b border-slate-100 pb-1"
                      >
                        {paragraph.replace('### ', '')}
                      </h3>
                    );
                  }
                  if (paragraph.startsWith('> ')) {
                    return (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-saffron-50 border-l-4 border-saffron-500 text-xs text-saffron-950 font-medium"
                      >
                        {paragraph.replace('> ', '')}
                      </div>
                    );
                  }
                  return (
                    <p key={idx} className="whitespace-pre-line text-slate-700">
                      {paragraph}
                    </p>
                  );
                })}
              </div>

              {/* Mark notes read button */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Finished reading the concept summary?
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleProgressIncrease(20)}
                  leftIcon={<Check className="w-3.5 h-3.5 text-emerald-600" />}
                >
                  I Understood These Notes
                </Button>
              </div>
            </div>
          )}

          {/* TAB 3: AUDIO */}
          {activeTab === 'audio' && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-slate-900 text-white text-center space-y-4 shadow-elevated">
                <div className="w-16 h-16 rounded-full bg-brand-700/50 border-2 border-brand-400 flex items-center justify-center mx-auto text-brand-300">
                  <Volume2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold">{currentContent?.title}</h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
                    {currentContent?.body_text}
                  </p>
                </div>

                {/* Simple HTML5 Audio Element */}
                <div className="max-w-md mx-auto pt-2">
                  <audio
                    controls
                    className="w-full"
                    src={currentContent?.media_url || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'}
                    onPlay={() => handleProgressIncrease(20)}
                  >
                    Your browser does not support the audio element.
                  </audio>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2 text-xs text-slate-400">
                  <span>Speed:</span>
                  {[0.75, 1.0, 1.25].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setAudioSpeed(spd)}
                      className={`px-2 py-0.5 rounded-lg border text-xs ${
                        audioSpeed === spd
                          ? 'bg-brand-600 border-brand-400 text-white font-bold'
                          : 'border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: INTERACTIVE (Roti & Farmland Slicer) */}
          {activeTab === 'interactive' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-brand-50 border border-brand-200">
                <h4 className="text-sm font-bold text-brand-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-brand-600" />
                  Interactive Experiment: Roti & Land Slicer
                </h4>
                <p className="text-xs text-brand-800 mt-1">
                  Adjust total equal parts (denominator) and shaded parts (numerator) to observe the fraction value live!
                </p>
              </div>

              {/* Interactive Slicer Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* Visual Circle Representation */}
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 flex flex-col items-center justify-center space-y-4">
                  <div className="relative w-48 h-48 rounded-full border-4 border-amber-600 bg-amber-100 flex items-center justify-center shadow-soft overflow-hidden">
                    {/* Visual Pie division segments */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      {Array.from({ length: slicesCount }).map((_, idx) => {
                        const deg = (360 / slicesCount) * idx;
                        return (
                          <div
                            key={idx}
                            className="absolute w-full h-[2px] bg-amber-800/40"
                            style={{ transform: `rotate(${deg}deg)` }}
                          />
                        );
                      })}
                    </div>

                    <div className="text-center z-10 bg-white/90 px-3 py-1.5 rounded-xl border border-amber-300 shadow-sm">
                      <span className="text-xs font-bold text-amber-900 block">Fraction Value</span>
                      <span className="text-xl font-black text-brand-700">
                        {selectedSlices} / {slicesCount}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 text-center font-medium">
                    {selectedSlices} out of {slicesCount} equal slices selected
                  </p>
                </div>

                {/* Slider Controls */}
                <div className="space-y-5 p-5 bg-white rounded-3xl border border-slate-200">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Total Equal Parts (Denominator):</span>
                      <span className="text-brand-600 font-extrabold">{slicesCount} parts</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="8"
                      value={slicesCount}
                      onChange={(e) => {
                        const count = parseInt(e.target.value);
                        setSlicesCount(count);
                        if (selectedSlices > count) setSelectedSlices(count);
                      }}
                      className="w-full accent-brand-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>2 (Halves)</span>
                      <span>4 (Quarters)</span>
                      <span>8 (Eighths)</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Shaded Parts Taken (Numerator):</span>
                      <span className="text-saffron-600 font-extrabold">{selectedSlices} parts</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max={slicesCount}
                      value={selectedSlices}
                      onChange={(e) => setSelectedSlices(parseInt(e.target.value))}
                      className="w-full accent-saffron-500"
                    />
                  </div>

                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                    <span className="font-bold">Equivalence Insight:</span>
                    <p>
                      {selectedSlices / slicesCount === 0.5 ? (
                        <span>
                          🎯 <strong>{selectedSlices}/{slicesCount}</strong> is exactly equal to <strong>1/2 (One Half)</strong>!
                        </span>
                      ) : (
                        <span>
                          Decimal value: {(selectedSlices / slicesCount).toFixed(2)} (or{' '}
                          {Math.round((selectedSlices / slicesCount) * 100)}% of the whole).
                        </span>
                      )}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    variant="saffron"
                    className="w-full"
                    onClick={() => handleProgressIncrease(20)}
                  >
                    I Mastered This Simulation (+20 XP)
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: WORKSHEET */}
          {activeTab === 'worksheet' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{currentContent?.title}</h4>
                  <p className="text-xs text-slate-500">
                    Offline printable practice sheet with rural Indian math challenges.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                  onClick={() => {
                    showToast({
                      type: 'success',
                      title: 'Worksheet Downloaded',
                      message: 'Practice worksheet saved to your downloads folder.',
                    });
                    handleProgressIncrease(15);
                  }}
                >
                  Download PDF
                </Button>
              </div>

              {/* Viewable Worksheet Questions */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
                <h5 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Self-Practice Exercises:
                </h5>
                <pre className="text-xs text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
                  {currentContent?.body_text}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 6: QUIZ */}
          {activeTab === 'quiz' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-brand-50 border border-brand-200">
                <h4 className="text-xs font-bold text-brand-900">
                  Concept Checkup Mini-Quiz
                </h4>
                <p className="text-xs text-brand-800 mt-1">
                  Answer the calibrated checkup questions to verify your understanding and earn completion XP.
                </p>
              </div>

              <div className="space-y-4">
                {parsedQuizQuestions.map((q, qIndex) => {
                  const isAnswered = selectedAnswers[q.id] !== undefined;
                  const isCorrect = selectedAnswers[q.id] === q.correct_answer;

                  return (
                    <div
                      key={q.id}
                      className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3"
                    >
                      <h5 className="text-xs font-bold text-slate-900">
                        {qIndex + 1}. {q.question}
                      </h5>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt: string) => {
                          const isSelected = selectedAnswers[q.id] === opt;
                          let btnStyle = 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100';

                          if (submittedQuiz) {
                            if (opt === q.correct_answer) {
                              btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                            } else if (isSelected && !isCorrect) {
                              btnStyle = 'border-red-400 bg-red-50 text-red-800';
                            }
                          } else if (isSelected) {
                            btnStyle = 'border-brand-500 bg-brand-50 text-brand-900 font-bold';
                          }

                          return (
                            <button
                              key={opt}
                              disabled={submittedQuiz}
                              onClick={() =>
                                setSelectedAnswers((prev) => ({ ...prev, [q.id]: opt }))
                              }
                              className={`p-3 rounded-xl border text-xs text-left transition-all ${btnStyle}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {submittedQuiz && (
                        <div
                          className={`p-3 rounded-xl text-xs ${
                            isCorrect
                              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                              : 'bg-amber-50 text-amber-900 border border-amber-200'
                          }`}
                        >
                          <span className="font-bold">{isCorrect ? '✓ Correct! ' : '💡 Explanation: '}</span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {!submittedQuiz ? (
                <Button
                  size="md"
                  variant="saffron"
                  className="w-full"
                  disabled={Object.keys(selectedAnswers).length < parsedQuizQuestions.length}
                  onClick={() => handleQuizSubmit(parsedQuizQuestions)}
                >
                  Submit Quiz Answers
                </Button>
              ) : (
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-bold text-slate-800">
                    Result: {quizScore} / {parsedQuizQuestions.length} Correct
                  </span>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setSubmittedQuiz(false);
                      setSelectedAnswers({});
                    }}
                    leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                  >
                    Retry Quiz
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Downloadable Attached Resources (Always visible at bottom of content) */}
          {lesson?.resources && lesson.resources.length > 0 && (
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Downloadable Lesson Attachments:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {lesson.resources.map((res) => (
                  <div
                    key={res.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText className="w-4 h-4 text-brand-600 shrink-0" />
                      <span className="text-xs font-medium text-slate-800 truncate">
                        {res.file_name}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        showToast({
                          type: 'success',
                          title: 'Attachment Downloaded',
                          message: `${res.file_name} (${Math.round(res.file_size_bytes / 1024)} KB) saved.`,
                        });
                      }}
                      leftIcon={<Download className="w-3 h-3" />}
                    >
                      Save
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            {isOfflineCached ? (
              <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                <Check className="w-4 h-4" /> Downloaded for Offline Use
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Download className="w-4 h-4 text-slate-400" /> Eligible for Offline Cache
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="md"
              variant={progressPct >= 100 ? 'secondary' : 'saffron'}
              onClick={() => handleProgressIncrease(100)}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              {progressPct >= 100 ? 'Mastered (100%)' : 'Complete Lesson (+25 XP)'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
