import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import {
  AdaptiveAssessmentState,
  AssessmentQuestion,
  NextQuestionEvaluation,
  DiagnosticReport,
} from '../../services/ai/types';
import {
  startAdaptiveAssessment,
  submitAdaptiveAnswer,
  finalizeAdaptiveAssessment,
} from '../../services/assessmentService';
import {
  Sparkles,
  Award,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Volume2,
  Compass,
  BookOpen,
  TrendingUp,
  RotateCcw,
  Check,
  ShieldCheck,
  Heart,
  Zap,
} from 'lucide-react';

interface AdaptiveAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
  onAssessmentCompleted?: (report: DiagnosticReport) => void;
}

type ModalPhase = 'onboarding' | 'testing' | 'submitting' | 'results';

export const AdaptiveAssessmentModal: React.FC<AdaptiveAssessmentModalProps> = ({
  isOpen,
  onClose,
  studentId,
  studentName,
  onAssessmentCompleted,
}) => {
  const [phase, setPhase] = useState<ModalPhase>('onboarding');
  const [loading, setLoading] = useState(false);
  const [assessmentState, setAssessmentState] = useState<AdaptiveAssessmentState | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<AssessmentQuestion | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [lastIsCorrect, setLastIsCorrect] = useState<boolean | null>(null);
  const [evaluation, setEvaluation] = useState<NextQuestionEvaluation | null>(null);
  const [diagnosticReport, setDiagnosticReport] = useState<DiagnosticReport | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // 1. Handle Start Assessment
  const handleStart = async () => {
    setLoading(true);
    try {
      const { state, initialQuestion } = await startAdaptiveAssessment(studentId);
      setAssessmentState(state);
      setCurrentQuestion(initialQuestion);
      setSelectedOptionId(null);
      setIsAnswerSubmitted(false);
      setLastIsCorrect(null);
      setEvaluation(null);
      setQuestionStartTime(Date.now());
      setPhase('testing');
    } catch (err) {
      console.error('Failed to initialize assessment:', err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Submit Answer
  const handleSubmitAnswer = async () => {
    if (!selectedOptionId || !assessmentState || !currentQuestion || isAnswerSubmitted) return;

    setLoading(true);
    const responseTimeSecs = Math.max(1, Math.round((Date.now() - questionStartTime) / 1000));

    try {
      const { state: nextState, evaluation: nextEval, isCorrect } = await submitAdaptiveAnswer(
        assessmentState,
        selectedOptionId,
        responseTimeSecs
      );

      setAssessmentState(nextState);
      setEvaluation(nextEval);
      setLastIsCorrect(isCorrect);
      setIsAnswerSubmitted(true);
    } catch (err) {
      console.error('Failed to submit answer:', err);
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle Advance to Next Question or Finalize
  const handleNextQuestion = async () => {
    if (!assessmentState || !evaluation) return;

    if (evaluation.isComplete || !evaluation.nextQuestion) {
      // Finalize and generate path
      setLoading(true);
      try {
        const report = await finalizeAdaptiveAssessment(assessmentState);
        setDiagnosticReport(report);
        setPhase('results');
        if (onAssessmentCompleted) {
          onAssessmentCompleted(report);
        }
      } catch (err) {
        console.error('Failed to finalize assessment:', err);
      } finally {
        setLoading(false);
      }
    } else {
      setCurrentQuestion(evaluation.nextQuestion);
      setSelectedOptionId(null);
      setIsAnswerSubmitted(false);
      setLastIsCorrect(null);
      setQuestionStartTime(Date.now());
    }
  };

  const playVoiceExplanation = () => {
    setIsPlayingAudio(true);
    setTimeout(() => {
      setIsPlayingAudio(false);
    }, 4000);
  };

  const getDifficultyBadge = (diff: number) => {
    if (diff === 1) {
      return (
        <Badge variant="brand" size="sm">
          Foundational (Level 1)
        </Badge>
      );
    }
    if (diff === 2) {
      return (
        <Badge variant="saffron" size="sm">
          Standard (Level 2)
        </Badge>
      );
    }
    return (
      <Badge variant="forest" size="sm">
        Challenge (Level 3)
      </Badge>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={phase === 'testing' ? () => {} : onClose}
      title=""
      maxWidth="xl"
    >
      <div className="py-2">
        {/* ========================================================== */}
        {/* PHASE 1: SUPPORTIVE PRE-ASSESSMENT ONBOARDING */}
        {/* ========================================================== */}
        {phase === 'onboarding' && (
          <div className="space-y-6 text-center sm:text-left py-2">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-700 to-brand-500 text-white flex items-center justify-center shadow-lg shrink-0">
                <Compass className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-700">
                  AI Personalization Discovery
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Welcome to Your Learning Checkup, {studentName}!
                </h2>
              </div>
            </div>

            {/* MANDATORY EXPLANATION CARD (User Request requirement) */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-brand-50 via-indigo-50 to-amber-50 border-2 border-brand-200 text-slate-900 space-y-3 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-brand-700 text-white shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-left space-y-1">
                  <p className="text-base sm:text-lg font-bold text-brand-950 leading-snug">
                    "This is not a final exam. It helps ShikshaSetu understand what you already know so your learning path can be personalized."
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600">
                    We adapt questions in real time. If a question is tricky, the engine steps back to visual foundations. If you answer easily, it introduces new challenges!
                  </p>
                </div>
              </div>
            </div>

            {/* Reassuring Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <ClockIcon className="w-4 h-4 text-brand-600" />
                  <span>No Timer Stress</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Take all the time you need to think through every question.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <Heart className="w-4 h-4 text-emerald-600" />
                  <span>Encouraging & Adaptive</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Questions adjust to your pace. Mistakes are just clues for learning.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>~12 Questions</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Quick bite-sized checkup that builds your custom roadmap.
                </p>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-slate-200">
              <Button variant="ghost" onClick={onClose}>
                Maybe Later
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={handleStart}
                isLoading={loading}
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                Start Learning Discovery
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* PHASE 2: ADAPTIVE 10-15 QUESTION FLOW */}
        {/* ========================================================== */}
        {phase === 'testing' && currentQuestion && assessmentState && (
          <div className="space-y-5 py-1">
            {/* Header Telemetry */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Badge variant="brand" size="sm">
                  Question {assessmentState.questionIndex} of ~{assessmentState.totalQuestionsTarget}
                </Badge>
                {getDifficultyBadge(currentQuestion.difficulty)}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={playVoiceExplanation}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    isPlayingAudio
                      ? 'bg-saffron-500 text-slate-950 border-saffron-600 animate-pulse'
                      : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isPlayingAudio ? 'Speaking in Hindi...' : 'Audio Voice Hint'}</span>
                </button>
              </div>
            </div>

            {/* Visual Scaffolding Box (if previous question triggered fallback or error) */}
            {evaluation?.scaffoldingExplanation && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 space-y-2 animate-in fade-in">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Adaptive Bridge: {evaluation.scaffoldingExplanation.topicName}</span>
                </div>
                <p className="text-xs text-amber-900 leading-relaxed font-medium">
                  {evaluation.scaffoldingExplanation.visualHint}
                </p>
                <p className="text-[11px] text-amber-800 italic">
                  "{evaluation.scaffoldingExplanation.simplifiedExplanation}"
                </p>
              </div>
            )}

            {/* Question Text */}
            <div className="space-y-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                {currentQuestion.question}
              </h3>
            </div>

            {/* Interactive Options */}
            <div className="space-y-2.5">
              {currentQuestion.options.map((opt) => {
                const isSelected = selectedOptionId === opt.id;
                let optionStyle =
                  'bg-white border-slate-200 hover:border-brand-400 hover:bg-brand-50/30 text-slate-800';

                if (isSelected) {
                  optionStyle = 'bg-brand-50 border-brand-600 ring-2 ring-brand-500/20 text-brand-950';
                }

                if (isAnswerSubmitted) {
                  if (opt.id === currentQuestion.correct_answer) {
                    optionStyle = 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950 font-bold';
                  } else if (isSelected && opt.id !== currentQuestion.correct_answer) {
                    optionStyle = 'bg-rose-50 border-rose-400 text-rose-950';
                  }
                }

                return (
                  <button
                    key={opt.id}
                    disabled={isAnswerSubmitted}
                    onClick={() => setSelectedOptionId(opt.id)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 ${optionStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-xl bg-slate-100 border border-slate-300 text-xs font-bold flex items-center justify-center shrink-0 uppercase">
                        {opt.id}
                      </span>
                      <span className="text-xs sm:text-sm">{opt.text}</span>
                    </div>

                    {isAnswerSubmitted && opt.id === currentQuestion.correct_answer && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Post-Submit Feedback & Explanation */}
            {isAnswerSubmitted && (
              <div
                className={`p-4 rounded-2xl border space-y-2 animate-in fade-in ${
                  lastIsCorrect
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                    : 'bg-indigo-50/70 border-indigo-200 text-indigo-950'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs">
                  {lastIsCorrect ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-900">Shabash! Correct answer (+15 XP)</span>
                    </>
                  ) : (
                    <>
                      <HelpCircle className="w-4 h-4 text-indigo-600" />
                      <span className="text-indigo-900">Great effort! Let's understand why:</span>
                    </>
                  )}
                </div>
                <p className="text-xs leading-relaxed text-slate-700">
                  {currentQuestion.explanation}
                </p>
                {evaluation?.reasoning && (
                  <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200/60">
                    Adaptive Note: {evaluation.reasoning}
                  </p>
                )}
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-3 flex items-center justify-between gap-3 border-t border-slate-200">
              <span className="text-xs text-slate-400 font-medium">
                {assessmentState.answers.length} answered • Adaptive Engine Active
              </span>

              {!isAnswerSubmitted ? (
                <Button
                  variant="primary"
                  disabled={!selectedOptionId}
                  onClick={handleSubmitAnswer}
                  isLoading={loading}
                >
                  Submit Answer
                </Button>
              ) : (
                <Button
                  variant="saffron"
                  onClick={handleNextQuestion}
                  isLoading={loading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  {evaluation?.isComplete ? 'View My Personalized Path' : 'Continue to Next Question'}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* PHASE 3: COMPREHENSIVE DIAGNOSTIC REPORT & ROADMAP REVEAL */}
        {/* ========================================================== */}
        {phase === 'results' && diagnosticReport && (
          <div className="space-y-6 py-2">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 rounded-2xl bg-emerald-100 text-emerald-700 mb-1">
                <Award className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Discovery Complete! Your Personalized Roadmap is Ready 🎉
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
                ShikshaSetu has mapped your current understanding. Here is what you know well, what is developing, and where your journey begins today!
              </p>
            </div>

            {/* 4 REQUISITE DIAGNOSTIC SECTIONS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* 1. Strong Topics */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                    Strong Topics (80%+)
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                {diagnosticReport.strongTopics.length > 0 ? (
                  <ul className="space-y-1.5">
                    {diagnosticReport.strongTopics.map((t) => (
                      <li key={t.topicId} className="p-2 rounded-xl bg-white border border-emerald-100 text-xs">
                        <div className="font-bold text-emerald-950">{t.topicName}</div>
                        <div className="text-[10px] text-emerald-700">
                          {t.masteryScore}% mastery • {t.correctAttempts}/{t.attempts} correct
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    All foundational topics will become strong as you practice!
                  </p>
                )}
              </div>

              {/* 2. Developing Topics */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                    Developing Topics (50-79%)
                  </span>
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                </div>
                {diagnosticReport.developingTopics.length > 0 ? (
                  <ul className="space-y-1.5">
                    {diagnosticReport.developingTopics.map((t) => (
                      <li key={t.topicId} className="p-2 rounded-xl bg-white border border-amber-100 text-xs">
                        <div className="font-bold text-amber-950">{t.topicName}</div>
                        <div className="text-[10px] text-amber-700">
                          {t.masteryScore}% mastery • Good foundation
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500 italic">No topics currently in this range.</p>
                )}
              </div>

              {/* 3. Topics Needing More Practice */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                    Areas to Strengthen
                  </span>
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                </div>
                {diagnosticReport.needsPracticeTopics.length > 0 ? (
                  <ul className="space-y-1.5">
                    {diagnosticReport.needsPracticeTopics.map((t) => (
                      <li key={t.topicId} className="p-2 rounded-xl bg-white border border-indigo-100 text-xs">
                        <div className="font-bold text-indigo-950">{t.topicName}</div>
                        <div className="text-[10px] text-indigo-700">
                          {t.masteryScore}% mastery • Ready for targeted boosters
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500 italic">None! Excellent conceptual baseline.</p>
                )}
              </div>
            </div>

            {/* 4. RECOMMENDED STARTING POINT WITH EXPLAINABLE REASON */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-brand-900 to-indigo-950 text-white space-y-3 shadow-elevated">
              <div className="flex items-center justify-between">
                <Badge variant="saffron" size="sm" dot>
                  Recommended Starting Point
                </Badge>
                <span className="text-xs text-brand-200">
                  +{diagnosticReport.recommendation.xpBonus} XP Bonus
                </span>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-black">
                  {diagnosticReport.recommendation.title}
                </h3>
                {/* Transparent Explainable Reasoning Box */}
                <div className="mt-2 p-3 rounded-xl bg-white/10 border border-white/10 text-xs sm:text-sm text-brand-100 leading-relaxed">
                  <span className="font-bold text-amber-300 mr-1.5">Why is this recommended?</span>
                  <span>{diagnosticReport.recommendation.reasoning}</span>
                </div>
              </div>
            </div>

            {/* GENERATED PERSONAL LEARNING PATH TIMELINE */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Your Generated Adaptive Learning Path
              </h4>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 divide-y divide-slate-200">
                {diagnosticReport.generatedLearningPath.map((item, idx) => (
                  <div key={item.topicId} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                          item.status === 'mastered'
                            ? 'bg-emerald-500 text-white'
                            : item.status === 'in_progress'
                            ? 'bg-saffron-500 text-slate-950 ring-2 ring-saffron-400/50'
                            : item.status === 'needs_practice'
                            ? 'bg-indigo-500 text-white'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {item.status === 'mastered' ? <Check className="w-4 h-4" /> : idx + 1}
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-slate-900">{item.topicName}</div>
                        <div className="text-[11px] text-slate-500">{item.description}</div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        item.status === 'mastered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'in_progress'
                          ? 'bg-saffron-100 text-saffron-900'
                          : item.status === 'needs_practice'
                          ? 'bg-indigo-100 text-indigo-900'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Final CTA */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200">
              <Button
                variant="primary"
                size="lg"
                onClick={onClose}
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                Apply to My Companion Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx={12} cy={12} r={10} />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
