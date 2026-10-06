import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { NormalizedQuestion } from '../../../types/connectivity';
import { CheckCircle2, XCircle, HelpCircle, Sparkles, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { VoiceInstructionButton } from '../../voice/VoiceInstructionButton';
import { VoiceAnswerInput } from '../../voice/VoiceAnswerInput';

interface UniversalQuestionRendererProps {
  question: NormalizedQuestion;
  onAnswerSubmitted?: (selectedAnswer: string, isCorrect: boolean) => void;
  showDataSourceBadge?: boolean;
}

export const UniversalQuestionRenderer: React.FC<UniversalQuestionRendererProps> = ({
  question,
  onAnswerSubmitted,
  showDataSourceBadge = true,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [fillValue, setFillValue] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);

  const isCorrect =
    question.type === 'fill_blank'
      ? fillValue.trim().toLowerCase() === question.correct_answer.trim().toLowerCase()
      : selectedOption === question.correct_answer;

  const handleSelectOption = (option: string) => {
    if (isSubmitted) return;
    setSelectedOption(option);
  };

  const handleCheckAnswer = () => {
    if (isSubmitted) return;
    setIsSubmitted(true);
    const answer = question.type === 'fill_blank' ? fillValue : selectedOption || '';
    if (onAnswerSubmitted) {
      onAnswerSubmitted(answer, isCorrect);
    }
  };

  const handleReset = () => {
    setSelectedOption(null);
    setFillValue('');
    setIsSubmitted(false);
  };

  const getDataSourcePill = () => {
    switch (question.dataSource) {
      case 'local_cache':
        return <Badge variant="neutral" size="sm">IndexedDB Local</Badge>;
      case 'minimal_payload':
        return <Badge variant="saffron" size="sm">2G Minimal</Badge>;
      case 'message_packet':
        return <Badge variant="neutral" size="sm">Mesh Packet</Badge>;
      default:
        return <Badge variant="brand" size="sm">Live Cloud</Badge>;
    }
  };

  return (
    <Card variant="elevated" className="border-slate-200 hover:border-brand-200 transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="brand" size="sm">
              {question.topic}
            </Badge>
            <span className="text-[11px] font-semibold text-slate-400 capitalize">
              {question.type.replace('_', ' ')}
            </span>
          </div>
          {showDataSourceBadge && getDataSourcePill()}
        </div>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mt-2">
          <CardTitle className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed flex-1">
            {question.question}
          </CardTitle>
          <VoiceInstructionButton textToSpeak={question.question} size="sm" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        {/* TEMPLATE 1: MCQ (Multiple Choice) */}
        {question.type === 'mcq' && (
          <div className="space-y-2">
            {question.options.map((opt, idx) => {
              const isSelected = selectedOption === opt;
              let btnClass = 'bg-white border-slate-200 hover:border-slate-300 text-slate-800';

              if (isSubmitted) {
                if (opt === question.correct_answer) {
                  btnClass = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold';
                } else if (isSelected && !isCorrect) {
                  btnClass = 'bg-red-50 border-red-300 text-red-950';
                }
              } else if (isSelected) {
                btnClass = 'bg-brand-50 border-brand-500 text-brand-950 font-bold shadow-xs';
              }

              return (
                <button
                  key={idx}
                  disabled={isSubmitted}
                  onClick={() => handleSelectOption(opt)}
                  className={`w-full p-3 rounded-2xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between ${btnClass}`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-600 shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
                  </div>

                  {isSubmitted && opt === question.correct_answer && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                  {isSubmitted && isSelected && !isCorrect && (
                    <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* TEMPLATE 2: TRUE / FALSE */}
        {question.type === 'true_false' && (
          <div className="grid grid-cols-2 gap-3">
            {['True', 'False'].map((val) => {
              const isSelected = selectedOption === val;
              let btnClass = 'bg-white border-slate-200 text-slate-800';

              if (isSubmitted) {
                if (val === question.correct_answer) {
                  btnClass = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold';
                } else if (isSelected && !isCorrect) {
                  btnClass = 'bg-red-50 border-red-300 text-red-950';
                }
              } else if (isSelected) {
                btnClass = 'bg-brand-50 border-brand-500 text-brand-950 font-bold';
              }

              return (
                <button
                  key={val}
                  disabled={isSubmitted}
                  onClick={() => handleSelectOption(val)}
                  className={`p-3.5 rounded-2xl border text-center font-bold text-sm transition-all ${btnClass}`}
                >
                  {val}
                </button>
              );
            })}
          </div>
        )}

        {/* TEMPLATE 3: FILL IN THE BLANK */}
        {question.type === 'fill_blank' && (
          <div className="space-y-2">
            <input
              type="text"
              disabled={isSubmitted}
              value={fillValue}
              onChange={(e) => setFillValue(e.target.value)}
              placeholder="Type your answer here..."
              className={`w-full p-3 rounded-2xl border text-sm font-semibold focus:outline-hidden ${
                isSubmitted
                  ? isCorrect
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                    : 'bg-red-50 border-red-300 text-red-950'
                  : 'bg-white border-slate-300 focus:border-brand-500'
              }`}
            />
            {!isSubmitted && (
              <VoiceAnswerInput onTranscript={(text) => setFillValue(text)} />
            )}
            {isSubmitted && !isCorrect && (
              <span className="text-xs text-slate-600 block">
                Correct answer: <strong className="text-slate-900">{question.correct_answer}</strong>
              </span>
            )}
          </div>
        )}

        {/* Hint toggle */}
        {question.hint && (
          <div className="pt-1">
            <button
              onClick={() => setShowHint(!showHint)}
              className="text-[11px] text-brand-700 hover:text-brand-900 font-bold flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showHint ? 'Hide Rural Analogy Hint' : 'Show Everyday Hint'}</span>
            </button>
            {showHint && (
              <div className="mt-2 p-2.5 rounded-xl bg-brand-50/70 border border-brand-100 text-xs text-brand-950 animate-in fade-in duration-150">
                🌾 <strong>Hint:</strong> {question.hint}
              </div>
            )}
          </div>
        )}

        {/* Actions & Feedback */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          {!isSubmitted ? (
            <Button
              size="sm"
              variant="saffron"
              disabled={question.type === 'fill_blank' ? !fillValue.trim() : !selectedOption}
              onClick={handleCheckAnswer}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Check Answer
            </Button>
          ) : (
            <div className="flex items-center justify-between w-full">
              <span
                className={`text-xs font-bold flex items-center gap-1.5 ${
                  isCorrect ? 'text-emerald-700' : 'text-amber-800'
                }`}
              >
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Correct! (+10 XP)
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-600" /> Keep learning!
                  </>
                )}
              </span>

              <Button size="sm" variant="ghost" onClick={handleReset}>
                Try Again
              </Button>
            </div>
          )}
        </div>

        {/* Step-by-Step Explanation when submitted */}
        {isSubmitted && (
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1 animate-in fade-in duration-150">
            <span className="font-bold text-slate-900 block text-[11px] uppercase">Explanation:</span>
            <p className="leading-relaxed">{question.explanation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
