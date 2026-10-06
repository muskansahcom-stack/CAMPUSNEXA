import { supabase } from '../lib/supabase';
import {
  CurriculumTopic,
  AssessmentQuestion,
  AdaptiveAssessmentState,
  NextQuestionEvaluation,
  DiagnosticReport,
  AnswerSubmission,
} from './ai/types';
import { aiProviderClient } from './ai/aiProviderClient';

// ==========================================================
// OFFLINE-READY CURRICULUM FALLBACKS (Guaranteed rural availability)
// ==========================================================

export const FALLBACK_MATH_TOPICS: CurriculumTopic[] = [
  {
    id: '11000000-0000-0000-0000-000000000001',
    subject_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    name: 'Numbers & Place Value',
    description: 'Foundational counting, place values, and number line navigation.',
    difficulty: 1,
    prerequisite_topic_id: null,
  },
  {
    id: '11000000-0000-0000-0000-000000000002',
    subject_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    name: 'Addition & Subtraction Strategies',
    description: 'Combining, separating, and regrouping numbers with mental models.',
    difficulty: 1,
    prerequisite_topic_id: '11000000-0000-0000-0000-000000000001',
  },
  {
    id: '11000000-0000-0000-0000-000000000003',
    subject_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    name: 'Multiplication & Grouping',
    description: 'Repeated addition, equal distributions, and agricultural models.',
    difficulty: 2,
    prerequisite_topic_id: '11000000-0000-0000-0000-000000000002',
  },
  {
    id: '11000000-0000-0000-0000-000000000004',
    subject_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    name: 'Fraction Basics (Parts of a Whole)',
    description: 'Numerators, denominators, and dividing chapatis or land evenly.',
    difficulty: 2,
    prerequisite_topic_id: '11000000-0000-0000-0000-000000000003',
  },
  {
    id: '11000000-0000-0000-0000-000000000005',
    subject_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    name: 'Equivalent Fractions & Simplifying',
    description: 'Multiplying or dividing to maintain proportion and simplify.',
    difficulty: 3,
    prerequisite_topic_id: '11000000-0000-0000-0000-000000000004',
  },
  {
    id: '11000000-0000-0000-0000-000000000006',
    subject_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    name: 'Fractions with Unlike Denominators',
    description: 'Finding common denominators (LCM) to combine unequal parts.',
    difficulty: 3,
    prerequisite_topic_id: '11000000-0000-0000-0000-000000000005',
  },
  {
    id: '11000000-0000-0000-0000-000000000007',
    subject_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    name: 'Decimals & Everyday Money',
    description: 'Tenths, hundredths, and managing rupees and paise accurately.',
    difficulty: 4,
    prerequisite_topic_id: '11000000-0000-0000-0000-000000000006',
  },
  {
    id: '11000000-0000-0000-0000-000000000008',
    subject_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    name: 'Algebraic Thinking & Unknowns',
    description: 'Balance scales, unknown quantities (x), and linear intuition.',
    difficulty: 5,
    prerequisite_topic_id: '11000000-0000-0000-0000-000000000007',
  },
];

export const FALLBACK_MATH_QUESTIONS: AssessmentQuestion[] = [
  // Numbers & Place Value
  {
    id: '21000000-0000-0000-0000-000000000001',
    topic_id: '11000000-0000-0000-0000-000000000001',
    question: 'In the number 3,450 (weight of grain in kg), what is the place value of the digit 4?',
    options: [
      { id: 'a', text: '4 Ones (4)' },
      { id: 'b', text: '4 Tens (40)' },
      { id: 'c', text: '4 Hundreds (400)' },
      { id: 'd', text: '4 Thousands (4000)' },
    ],
    correct_answer: 'c',
    explanation: 'In 3,450, 4 is in the hundreds position, so its value is 400 kg.',
    difficulty: 1,
  },
  {
    id: '21000000-0000-0000-0000-000000000002',
    topic_id: '11000000-0000-0000-0000-000000000001',
    question: 'Which number lies exactly halfway between 600 and 700 on a measuring scale?',
    options: [
      { id: 'a', text: '625' },
      { id: 'b', text: '650' },
      { id: 'c', text: '675' },
      { id: 'd', text: '690' },
    ],
    correct_answer: 'b',
    explanation: 'Half of the 100 difference is 50. 600 + 50 = 650.',
    difficulty: 1,
  },
  // Addition & Subtraction
  {
    id: '21000000-0000-0000-0000-000000000003',
    topic_id: '11000000-0000-0000-0000-000000000002',
    question: 'A village nursery had 148 saplings. They planted 79 in the morning. How many remain?',
    options: [
      { id: 'a', text: '69 saplings' },
      { id: 'b', text: '71 saplings' },
      { id: 'c', text: '79 saplings' },
      { id: 'd', text: '89 saplings' },
    ],
    correct_answer: 'a',
    explanation: '148 - 79 = 69 saplings.',
    difficulty: 1,
  },
  // Multiplication & Grouping
  {
    id: '21000000-0000-0000-0000-000000000004',
    topic_id: '11000000-0000-0000-0000-000000000003',
    question: 'If a farmer packs 8 sacks of wheat each weighing 25 kg, what is the total weight?',
    options: [
      { id: 'a', text: '160 kg' },
      { id: 'b', text: '180 kg' },
      { id: 'c', text: '200 kg' },
      { id: 'd', text: '250 kg' },
    ],
    correct_answer: 'c',
    explanation: '8 * 25 kg = 200 kg.',
    difficulty: 2,
  },
  // Fraction Basics
  {
    id: '21000000-0000-0000-0000-000000000005',
    topic_id: '11000000-0000-0000-0000-000000000004',
    question: 'A round roti is cut into 4 equal slices. Shanti eats 3 slices. What fraction did she eat?',
    options: [
      { id: 'a', text: '1/4' },
      { id: 'b', text: '3/4' },
      { id: 'c', text: '4/3' },
      { id: 'd', text: '3/1' },
    ],
    correct_answer: 'b',
    explanation: '3 parts out of 4 equal parts = 3/4.',
    difficulty: 1,
  },
  {
    id: '21000000-0000-0000-0000-000000000006',
    topic_id: '11000000-0000-0000-0000-000000000004',
    question: 'Which of the following represents one half of a whole?',
    options: [
      { id: 'a', text: '1/3' },
      { id: 'b', text: '1/2' },
      { id: 'c', text: '2/1' },
      { id: 'd', text: '1/4' },
    ],
    correct_answer: 'b',
    explanation: '1/2 is one half.',
    difficulty: 1,
  },
  // Equivalent Fractions
  {
    id: '21000000-0000-0000-0000-000000000007',
    topic_id: '11000000-0000-0000-0000-000000000005',
    question: 'Which fraction is equivalent to 2/3?',
    options: [
      { id: 'a', text: '4/6' },
      { id: 'b', text: '3/4' },
      { id: 'c', text: '4/9' },
      { id: 'd', text: '5/6' },
    ],
    correct_answer: 'a',
    explanation: 'Multiply numerator and denominator by 2: (2*2)/(3*2) = 4/6.',
    difficulty: 2,
  },
  {
    id: '21000000-0000-0000-0000-000000000008',
    topic_id: '11000000-0000-0000-0000-000000000005',
    question: 'What is the simplified form of 6/8?',
    options: [
      { id: 'a', text: '2/4' },
      { id: 'b', text: '3/4' },
      { id: 'c', text: '3/8' },
      { id: 'd', text: '1/2' },
    ],
    correct_answer: 'b',
    explanation: 'Divide both by 2: 6/2 = 3, 8/2 = 4 -> 3/4.',
    difficulty: 2,
  },
  {
    id: '21000000-0000-0000-0000-000000000009',
    topic_id: '11000000-0000-0000-0000-000000000005',
    question: 'If 3/5 = x/20, what is the value of x?',
    options: [
      { id: 'a', text: '9' },
      { id: 'b', text: '12' },
      { id: 'c', text: '15' },
      { id: 'd', text: '18' },
    ],
    correct_answer: 'b',
    explanation: '5 * 4 = 20, so 3 * 4 = 12.',
    difficulty: 3,
  },
  // Unlike Fractions
  {
    id: '21000000-0000-0000-0000-000000000010',
    topic_id: '11000000-0000-0000-0000-000000000006',
    question: 'What is 1/2 + 1/4?',
    options: [
      { id: 'a', text: '2/6' },
      { id: 'b', text: '3/4' },
      { id: 'c', text: '2/4' },
      { id: 'd', text: '1/8' },
    ],
    correct_answer: 'b',
    explanation: '1/2 = 2/4. 2/4 + 1/4 = 3/4.',
    difficulty: 2,
  },
  {
    id: '21000000-0000-0000-0000-000000000011',
    topic_id: '11000000-0000-0000-0000-000000000006',
    question: 'What is 2/3 - 1/6?',
    options: [
      { id: 'a', text: '1/3' },
      { id: 'b', text: '1/2' },
      { id: 'c', text: '3/6' },
      { id: 'd', text: '1/6' },
    ],
    correct_answer: 'b',
    explanation: '2/3 = 4/6. 4/6 - 1/6 = 3/6 = 1/2.',
    difficulty: 3,
  },
  // Decimals & Money
  {
    id: '21000000-0000-0000-0000-000000000012',
    topic_id: '11000000-0000-0000-0000-000000000007',
    question: 'Ramesh bought notebooks for Rs. 45.50 and pens for Rs. 24.25. How much did he spend?',
    options: [
      { id: 'a', text: 'Rs. 69.50' },
      { id: 'b', text: 'Rs. 69.75' },
      { id: 'c', text: 'Rs. 70.00' },
      { id: 'd', text: 'Rs. 70.25' },
    ],
    correct_answer: 'b',
    explanation: '45.50 + 24.25 = Rs. 69.75.',
    difficulty: 2,
  },
  {
    id: '21000000-0000-0000-0000-000000000013',
    topic_id: '11000000-0000-0000-0000-000000000007',
    question: 'What is the decimal representation of the fraction 3/4?',
    options: [
      { id: 'a', text: '0.34' },
      { id: 'b', text: '0.43' },
      { id: 'c', text: '0.75' },
      { id: 'd', text: '0.80' },
    ],
    correct_answer: 'c',
    explanation: '3 / 4 = 0.75.',
    difficulty: 3,
  },
  // Algebraic Thinking
  {
    id: '21000000-0000-0000-0000-000000000014',
    topic_id: '11000000-0000-0000-0000-000000000008',
    question: 'On a balance scale, a basket of mangoes + 2 kg balances 8 kg. What is the equation?',
    options: [
      { id: 'a', text: 'm - 2 = 8' },
      { id: 'b', text: 'm + 2 = 8' },
      { id: 'c', text: '2m = 8' },
      { id: 'd', text: 'm / 2 = 8' },
    ],
    correct_answer: 'b',
    explanation: 'Left side is m + 2 kg, right side is 8 kg -> m + 2 = 8.',
    difficulty: 3,
  },
  {
    id: '21000000-0000-0000-0000-000000000015',
    topic_id: '11000000-0000-0000-0000-000000000008',
    question: 'If 3x + 5 = 20, what is the value of x?',
    options: [
      { id: 'a', text: '3' },
      { id: 'b', text: '5' },
      { id: 'c', text: '7' },
      { id: 'd', text: '15' },
    ],
    correct_answer: 'b',
    explanation: '3x = 15 -> x = 5.',
    difficulty: 3,
  },
];

export async function fetchSubjectTopics(
  subjectId: string = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
): Promise<CurriculumTopic[]> {
  try {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('subject_id', subjectId)
      .order('difficulty', { ascending: true });

    if (!error && data && data.length > 0) {
      return data as CurriculumTopic[];
    }
  } catch (err) {
    console.warn('Falling back to local curriculum topics:', err);
  }
  return FALLBACK_MATH_TOPICS;
}

export async function fetchAssessmentQuestions(
  topicIds?: string[]
): Promise<AssessmentQuestion[]> {
  try {
    let query = supabase.from('questions').select('*');
    if (topicIds && topicIds.length > 0) {
      query = query.in('topic_id', topicIds);
    }

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data.map((q: any) => ({
        id: q.id,
        topic_id: q.topic_id,
        question: q.question,
        options: Array.isArray(q.options) ? q.options : JSON.parse(q.options || '[]'),
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        difficulty: q.difficulty,
      }));
    }
  } catch (err) {
    console.warn('Falling back to local question bank:', err);
  }
  return FALLBACK_MATH_QUESTIONS;
}

/**
 * Initializes a new adaptive diagnostic session.
 */
export async function startAdaptiveAssessment(
  studentId: string,
  subjectId: string = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  totalQuestionsTarget: number = 12
): Promise<{ state: AdaptiveAssessmentState; initialQuestion: AssessmentQuestion }> {
  let assessmentId = `assess-${Date.now()}`;

  try {
    const { data } = await (supabase.from('assessments') as any)
      .insert({
        student_id: studentId,
        subject_id: subjectId,
        status: 'in_progress',
        score: 0,
      })
      .select('id')
      .single();

    if (data?.id) {
      assessmentId = data.id;
    }
  } catch (err) {
    console.warn('Using client assessment session ID:', err);
  }

  const allTopics = await fetchSubjectTopics(subjectId);
  const allQuestions = await fetchAssessmentQuestions();

  // Start with Topic 4 (Fractions Basics) or Topic 1 at difficulty 1/2 to establish baseline
  const startTopic = allTopics[3] || allTopics[0];
  const candidates = allQuestions.filter(
    (q) => q.topic_id === startTopic.id && q.difficulty <= 2
  );
  const initialQuestion = candidates[0] || allQuestions[0];

  const state: AdaptiveAssessmentState = {
    assessmentId,
    studentId,
    subjectId,
    questionIndex: 1,
    totalQuestionsTarget,
    currentDifficulty: initialQuestion.difficulty,
    answers: [],
    topicPerformance: {},
    currentTopicId: initialQuestion.topic_id,
    activeQuestion: initialQuestion,
    isComplete: false,
  };

  return { state, initialQuestion };
}

/**
 * Submits student's response for current question, updates telemetry,
 * and calls the AI adaptive provider to determine the next item or prerequisite fallback.
 */
export async function submitAdaptiveAnswer(
  state: AdaptiveAssessmentState,
  selectedAnswer: string,
  responseTimeSeconds: number
): Promise<{ state: AdaptiveAssessmentState; evaluation: NextQuestionEvaluation; isCorrect: boolean }> {
  if (!state.activeQuestion) {
    throw new Error('No active question in assessment state');
  }

  const currentQ = state.activeQuestion;
  const isCorrect = selectedAnswer === currentQ.correct_answer;

  const submission: AnswerSubmission = {
    question_id: currentQ.id,
    topic_id: currentQ.topic_id,
    answer: selectedAnswer,
    is_correct: isCorrect,
    response_time: responseTimeSeconds,
    difficulty: currentQ.difficulty,
  };

  // Try recording answer in Supabase asynchronously
  try {
    await (supabase.from('assessment_answers') as any).insert({
      assessment_id: state.assessmentId,
      question_id: currentQ.id,
      answer: selectedAnswer,
      is_correct: isCorrect,
      response_time: responseTimeSeconds,
    });
  } catch (err) {
    // Offline resilient
  }

  // Update telemetry
  const updatedAnswers = [...state.answers, submission];
  const allTopics = await fetchSubjectTopics(state.subjectId);
  const allQuestions = await fetchAssessmentQuestions();

  const prevPerf = state.topicPerformance[currentQ.topic_id] || {
    topicId: currentQ.topic_id,
    topicName: allTopics.find((t) => t.id === currentQ.topic_id)?.name || 'Topic',
    totalAttempts: 0,
    correctAttempts: 0,
    consecutiveIncorrect: 0,
    consecutiveCorrect: 0,
    accuracyPct: 100,
  };

  const newTotal = prevPerf.totalAttempts + 1;
  const newCorrect = prevPerf.correctAttempts + (isCorrect ? 1 : 0);
  const newConsecutiveIncorrect = isCorrect ? 0 : prevPerf.consecutiveIncorrect + 1;
  const newConsecutiveCorrect = isCorrect ? prevPerf.consecutiveCorrect + 1 : 0;
  const newAccuracy = Math.round((newCorrect / newTotal) * 100);

  const updatedPerf = {
    ...state.topicPerformance,
    [currentQ.topic_id]: {
      ...prevPerf,
      totalAttempts: newTotal,
      correctAttempts: newCorrect,
      consecutiveIncorrect: newConsecutiveIncorrect,
      consecutiveCorrect: newConsecutiveCorrect,
      accuracyPct: newAccuracy,
    },
  };

  const intermediateState: AdaptiveAssessmentState = {
    ...state,
    answers: updatedAnswers,
    topicPerformance: updatedPerf,
  };

  // Run AI Adaptive Engine
  const provider = aiProviderClient.getActiveProvider();
  const evaluation = await provider.evaluateNextQuestion(
    intermediateState,
    allQuestions,
    allTopics
  );

  const nextState: AdaptiveAssessmentState = {
    ...intermediateState,
    questionIndex: intermediateState.questionIndex + 1,
    currentDifficulty: evaluation.currentDifficulty,
    currentTopicId: evaluation.nextQuestion?.topic_id || state.currentTopicId,
    activeQuestion: evaluation.nextQuestion,
    isComplete: evaluation.isComplete,
  };

  return { state: nextState, evaluation, isCorrect };
}

/**
 * Finalizes assessment, persists student mastery and personalized learning paths,
 * and compiles the complete explainable diagnostic report.
 */
export async function finalizeAdaptiveAssessment(
  state: AdaptiveAssessmentState
): Promise<DiagnosticReport> {
  const allTopics = await fetchSubjectTopics(state.subjectId);
  const allQuestions = await fetchAssessmentQuestions();

  const provider = aiProviderClient.getActiveProvider();
  const report = await provider.computeMasteryReport(
    state.studentId,
    state.assessmentId,
    state.answers,
    allTopics,
    allQuestions
  );

  // 1. Update assessment record
  try {
    await (supabase.from('assessments') as any)
      .update({
        status: 'completed',
        score: report.overallScore,
        completed_at: new Date().toISOString(),
      })
      .eq('id', state.assessmentId);
  } catch (err) {
    console.warn('Could not update assessment in Supabase:', err);
  }

  // 2. Persist Student Mastery for all evaluated topics
  const allMasteries = [
    ...report.strongTopics,
    ...report.developingTopics,
    ...report.needsPracticeTopics,
  ];

  for (const m of allMasteries) {
    try {
      await (supabase.from('student_mastery') as any).upsert(
        {
          student_id: state.studentId,
          topic_id: m.topicId,
          mastery_score: m.masteryScore,
          attempts: m.attempts,
          correct_attempts: m.correctAttempts,
          last_attempted_at: new Date().toISOString(),
        },
        { onConflict: 'student_id,topic_id' }
      );
    } catch (err) {
      console.warn('Could not upsert mastery:', err);
    }
  }

  // 3. Persist Learning Path and Learning Path Items
  try {
    const { data: pathData } = await (supabase.from('learning_paths') as any)
      .insert({
        student_id: state.studentId,
        subject_id: state.subjectId,
        generated_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (pathData?.id) {
      const itemsToInsert = report.generatedLearningPath.map((item) => ({
        learning_path_id: pathData.id,
        topic_id: item.topicId,
        sequence: item.sequence,
        status: item.status,
      }));

      await (supabase.from('learning_path_items') as any).insert(itemsToInsert);
    }
  } catch (err) {
    console.warn('Could not persist learning path:', err);
  }

  // 4. Update student telemetry & recent activity in Supabase
  try {
    await (supabase.from('student_recent_activities') as any).insert({
      profile_id: state.studentId,
      title: 'Diagnostic Learning Checkup',
      subject: 'Mathematics',
      activity_type: 'quiz',
      xp_earned: 50,
    });
  } catch (err) {
    console.warn('Could not record checkup activity:', err);
  }

  // Cache latest diagnostic report in local storage for offline retrieval
  try {
    localStorage.setItem(
      `shiksha_latest_report_${state.studentId}`,
      JSON.stringify(report)
    );
  } catch (e) {
    // ignore
  }

  return report;
}

export function getCachedDiagnosticReport(studentId: string): DiagnosticReport | null {
  try {
    const raw = localStorage.getItem(`shiksha_latest_report_${studentId}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    return null;
  }
  return null;
}
