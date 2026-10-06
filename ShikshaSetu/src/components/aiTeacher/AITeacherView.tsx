import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useConnectivity } from '../../contexts/ConnectivityContext';
import { useToast } from '../../contexts/ToastContext';
import {
  StudentLearningContext,
  ChatMessage,
  ExplanationMode,
  SUPPORTED_AI_LANGUAGES,
} from '../../services/aiTeacher/types';
import { assembleStudentLearningContext } from '../../services/aiTeacher/aiTeacherContextService';
import { aiTeacherClient } from '../../services/aiTeacher/aiTeacherClient';
import {
  Bot,
  Send,
  Sparkles,
  WifiOff,
  User,
  CheckCircle2,
  HelpCircle,
  BookOpen,
  Volume2,
  GraduationCap,
  RotateCcw,
  Check,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';

interface AITeacherViewProps {
  studentId: string;
  studentName?: string;
  initialTopic?: string;
}

export const AITeacherView: React.FC<AITeacherViewProps> = ({
  studentId,
  studentName = 'Learner',
  initialTopic,
}) => {
  const { isOnline } = useConnectivity();
  const { showToast } = useToast();

  const [context, setContext] = useState<StudentLearningContext | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [selectedLanguageCode, setSelectedLanguageCode] = useState('hi');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Initialize Student Context & Welcome Message
  useEffect(() => {
    const initContext = async () => {
      const assembled = await assembleStudentLearningContext(studentId, studentName, {
        currentTopic: initialTopic,
        preferredLanguage: selectedLanguageCode,
      });
      setContext(assembled);

      const welcomeMsg: ChatMessage = {
        id: 'msg-welcome',
        sender: 'ai',
        content:
          selectedLanguageCode === 'hi'
            ? `नमस्ते ${assembled.studentName}! 👋\n\nमैं आपका **शिक्षासेतु एआई शिक्षक (ShikshaSetu AI Teacher)** हूँ। मैं देख रहा हूँ कि आप अभी **${assembled.subject}** में **${assembled.currentTopic}** (${assembled.masteryScore}% मास्टरी) सीख रहे हैं।\n\nअगर कोई अवधारणा कठिन लग रही है, या हालिया प्रश्न में गलती हुई है, तो मुझसे खुलकर पूछिए। हम रोटी और खेत जैसे दैनिक उदाहरणों से सब कुछ सरल बनाएँगे!`
            : `Hello ${assembled.studentName}! 👋\n\nI am your **ShikshaSetu AI Teacher**. I see you're currently mastering **${assembled.subject}** • **${assembled.currentTopic}** (${assembled.masteryScore}% mastery).\n\nIf any concept feels tricky, or if you made a mistake on a recent problem, ask me anything! We will break it down using everyday real-world examples.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAiGenerated: true,
        explanationMode: assembled.explanationMode,
        suggestedActions: [
          'Mujhe fraction samajh nahi aa raha.',
          'Why did I get my recent question wrong?',
          'Give me an everyday roti example',
          'Practice a question with me',
        ],
      };

      setMessages([welcomeMsg]);
    };

    initContext();
  }, [studentId, studentName, initialTopic, selectedLanguageCode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  // 2. Handle Sending a Message
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || !context || isSending) return;

    // Check Offline Honesty
    if (!isOnline) {
      showToast({
        type: 'warning',
        title: 'Connection Required',
        message: 'AI Teacher requires an internet connection.',
      });
      return;
    }

    const studentMessage: ChatMessage = {
      id: `msg-student-${Date.now()}`,
      sender: 'student',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAiGenerated: false,
    };

    setMessages((prev) => [...prev, studentMessage]);
    setInputValue('');
    setIsSending(true);

    try {
      const response = await aiTeacherClient.sendStudentMessage(text, context, isOnline);

      const aiMessage: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'ai',
        content: response.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAiGenerated: true,
        explanationMode: response.explanationMode,
        interactiveQuestion: response.interactiveQuestion,
        suggestedActions: response.suggestedActions,
        teacherReferralRecommended: response.teacherReferralRecommended,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'AI Teacher Unavailable',
        message: err.message || 'AI Teacher requires an internet connection.',
      });
    } finally {
      setIsSending(false);
    }
  };

  // 3. Handle Mode Toggle (Simple / Normal / Detailed)
  const handleModeChange = (mode: ExplanationMode) => {
    if (!context) return;
    const updated = { ...context, explanationMode: mode };
    setContext(updated);

    showToast({
      type: 'info',
      title: `Explanation Mode: ${mode.toUpperCase()}`,
      message:
        mode === 'simple'
          ? 'Switched to concrete, visual everyday analogies.'
          : mode === 'detailed'
          ? 'Switched to in-depth mathematical formulas and proofs.'
          : 'Standard NCERT curriculum explanation active.',
    });

    handleSendMessage(`Explain ${context.currentTopic} in ${mode} mode.`);
  };

  // 4. Handle Interactive Question Click Inside Chat Message
  const handleOptionClick = (messageId: string, optionId: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId && msg.interactiveQuestion) {
          const isCorrect = optionId === msg.interactiveQuestion.correctAnswer;
          return {
            ...msg,
            interactiveQuestion: {
              ...msg.interactiveQuestion,
              selectedOptionId: optionId,
              isAnswerCorrect: isCorrect,
            },
          };
        }
        return msg;
      })
    );

    const targetMsg = messages.find((m) => m.id === messageId);
    const chosenOpt = targetMsg?.interactiveQuestion?.options.find((o) => o.id === optionId);

    handleSendMessage(`My answer is ${chosenOpt?.id.toUpperCase()}) ${chosenOpt?.text}`);
  };

  const playVernacularAudio = () => {
    setIsPlayingAudio(true);
    setTimeout(() => {
      setIsPlayingAudio(false);
    }, 4500);
  };

  const currentLangObj =
    SUPPORTED_AI_LANGUAGES.find((l) => l.code === selectedLanguageCode) ||
    SUPPORTED_AI_LANGUAGES[0];

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* ========================================================== */}
      {/* 1. STUDENT LEARNING CONTEXT RIBBON & CONTROLS */}
      {/* ========================================================== */}
      <Card variant="elevated" className="border-brand-200 bg-white">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg text-slate-900">ShikshaSetu AI Teacher</CardTitle>
                  <Badge variant="saffron" size="sm">
                    Personalized Companion
                  </Badge>
                </div>
                <p className="text-xs text-slate-500">
                  Adaptive pedagogical guidance tailored to your exact learning context
                </p>
              </div>
            </div>

            {/* Explanation Mode Switcher */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 self-start sm:self-auto">
              <span className="text-[10px] font-bold text-slate-500 uppercase px-1.5">Mode:</span>
              {(['simple', 'normal', 'detailed'] as ExplanationMode[]).map((mode) => {
                const isActive = context?.explanationMode === mode;
                return (
                  <button
                    key={mode}
                    onClick={() => handleModeChange(mode)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                      isActive
                        ? 'bg-brand-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    {mode}
                  </button>
                );
              })}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-3">
          {/* Live Context Telemetry Pills */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2 text-slate-600">
              <span className="font-bold text-slate-900">Active Context:</span>
              <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-semibold text-brand-700">
                Grade {context?.grade || 8}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-semibold text-brand-700">
                {context?.subject || 'Mathematics'}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-semibold text-brand-700">
                {context?.currentTopic || 'Fractions & Proportions'}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-semibold text-emerald-700">
                {context?.masteryScore || 65}% Mastery
              </span>
            </div>

            {/* Language Selector with Honest Support Tier */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 font-medium">Language:</span>
              <select
                value={selectedLanguageCode}
                onChange={(e) => setSelectedLanguageCode(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-semibold bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
              >
                {SUPPORTED_AI_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name} ({lang.nativeName}) — {lang.badgeLabel}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Honest Language Support Notice if not Full */}
          {currentLangObj.tier !== 'full' && (
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>{currentLangObj.name} ({currentLangObj.badgeLabel}):</strong> Live conversational
                tutoring is in bilingual preview mode while full vernacular textbook alignment is rolling out.
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ========================================================== */}
      {/* 2. STRICT OFFLINE HONESTY NOTICE (When Disconnected) */}
      {/* ========================================================== */}
      {!isOnline && (
        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500 text-slate-950 shrink-0">
              <WifiOff className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-950">
                AI Teacher requires an active internet connection.
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Live conversational tutoring is paused while offline. ShikshaSetu does not simulate or fake
                AI responses. All downloaded lessons, quizzes, and notes remain 100% available offline.
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => window.location.assign('/student?tab=learn')}>
            View Downloaded Lessons
          </Button>
        </div>
      )}

      {/* ========================================================== */}
      {/* 3. CONVERSATIONAL CHAT CONTAINER */}
      {/* ========================================================== */}
      <Card variant="elevated" className="border-slate-200 flex flex-col h-[560px]">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isStudent = msg.sender === 'student';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${
                  isStudent ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    isStudent
                      ? 'bg-saffron-500 text-slate-950'
                      : 'bg-brand-700 text-white shadow-xs'
                  }`}
                >
                  {isStudent ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div className="space-y-2">
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-xs ${
                      isStudent
                        ? 'bg-brand-700 text-white rounded-tr-none'
                        : 'bg-slate-50 border border-slate-200 text-slate-900 rounded-tl-none'
                    }`}
                  >
                    {msg.content}

                    {/* AI Transparency Badge (Never pretend to be a human teacher) */}
                    {msg.isAiGenerated && (
                      <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-brand-600" />
                          <span>AI Generated • ShikshaSetu AI Teacher</span>
                        </span>
                        <span className="capitalize">{msg.explanationMode} Mode</span>
                      </div>
                    )}
                  </div>

                  {/* Embedded Interactive Question Card */}
                  {msg.interactiveQuestion && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-50 to-indigo-50 border border-brand-200 space-y-3 text-slate-900 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <Badge variant="brand" size="sm">
                          Interactive Check Question
                        </Badge>
                        <span className="text-[10px] font-bold text-brand-700 uppercase">
                          Tap an answer
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm font-bold text-slate-900">
                        {msg.interactiveQuestion.question}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {msg.interactiveQuestion.options.map((opt) => {
                          const isSelected = msg.interactiveQuestion?.selectedOptionId === opt.id;
                          const isCorrect = opt.id === msg.interactiveQuestion?.correctAnswer;

                          let btnStyle = 'bg-white hover:bg-slate-100 border-slate-200 text-slate-800';
                          if (isSelected) {
                            btnStyle = isCorrect
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20'
                              : 'bg-rose-50 border-rose-400 text-rose-950';
                          }

                          return (
                            <button
                              key={opt.id}
                              onClick={() => handleOptionClick(msg.id, opt.id)}
                              className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between gap-2 ${btnStyle}`}
                            >
                              <span>
                                <strong className="uppercase mr-1.5">{opt.id})</strong>
                                {opt.text}
                              </span>
                              {isSelected && isCorrect && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {msg.interactiveQuestion.selectedOptionId && (
                        <div className="p-3 rounded-xl bg-white border border-brand-200 text-xs text-slate-700 space-y-1">
                          <p className="font-bold text-brand-900">
                            {msg.interactiveQuestion.isAnswerCorrect ? '🎉 Correct!' : '💡 Let us review:'}
                          </p>
                          <p>{msg.interactiveQuestion.explanation}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Teacher Referral Encouragement Card (Safety guidance) */}
                  {msg.teacherReferralRecommended && (
                    <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                      <GraduationCap className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="font-bold">Encouragement: Ask Your School Teacher</span>
                        <p className="text-[11px] text-amber-800">
                          If this concept still feels tricky, note it down in your notebook and ask your
                          teacher in class tomorrow! Seeing it drawn on the blackboard with your teacher is
                          wonderful reinforcement.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Timestamp */}
                  <div
                    className={`text-[10px] text-slate-400 px-1 ${
                      isStudent ? 'text-right' : 'text-left'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isSending && (
            <div className="flex gap-3 max-w-[80%] mr-auto">
              <div className="w-8 h-8 rounded-xl bg-brand-700 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-600 animate-ping" />
                <span>ShikshaSetu AI Teacher is formulating a grounded explanation...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Action Chips Bar */}
        <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
            Quick Prompts:
          </span>
          <button
            type="button"
            disabled={!isOnline || isSending}
            onClick={() => handleSendMessage('Mujhe fraction samajh nahi aa raha.')}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-brand-400 hover:bg-brand-50 text-[11px] font-semibold text-slate-700 whitespace-nowrap transition-colors"
          >
            🌾 Roti division example
          </button>
          <button
            type="button"
            disabled={!isOnline || isSending}
            onClick={() => handleSendMessage('Why did I get my recent question wrong?')}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-brand-400 hover:bg-brand-50 text-[11px] font-semibold text-slate-700 whitespace-nowrap transition-colors"
          >
            🔍 Explain my mistake
          </button>
          <button
            type="button"
            disabled={!isOnline || isSending}
            onClick={() => handleSendMessage('Give me a step-by-step solution.')}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-brand-400 hover:bg-brand-50 text-[11px] font-semibold text-slate-700 whitespace-nowrap transition-colors"
          >
            📝 Step-by-step
          </button>
          <button
            type="button"
            disabled={!isOnline || isSending}
            onClick={() => handleSendMessage('Give me a practice quiz question.')}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-brand-400 hover:bg-brand-50 text-[11px] font-semibold text-slate-700 whitespace-nowrap transition-colors"
          >
            ❓ Test me
          </button>
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              disabled={!isOnline || isSending}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                isOnline
                  ? selectedLanguageCode === 'hi'
                    ? 'भिन्न या किसी भी विषय पर प्रश्न पूछें (जैसे: "रोटी वाला उदाहरण दो")...'
                    : 'Ask about fractions, your mistakes, or say "give an example"...'
                  : 'AI Teacher requires an internet connection to respond.'
              }
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:bg-slate-100 disabled:text-slate-400"
            />

            <button
              type="button"
              onClick={playVernacularAudio}
              className={`p-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 transition-colors shrink-0 ${
                isPlayingAudio ? 'bg-amber-100 text-amber-900 border-amber-400 animate-pulse' : ''
              }`}
              title="Listen to Vernacular Audio Hint"
            >
              <Volume2 className="w-5 h-5" />
            </button>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!isOnline || isSending || !inputValue.trim()}
              isLoading={isSending}
              rightIcon={<Send className="w-4 h-4" />}
            >
              Send
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};
