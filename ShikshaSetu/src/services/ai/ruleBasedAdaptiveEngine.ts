import {
  CurriculumTopic,
  AssessmentQuestion,
  AnswerSubmission,
  AdaptiveAssessmentState,
  NextQuestionEvaluation,
  DiagnosticReport,
  TopicMastery,
  PersonalizationProvider,
  GeneratedPathItem,
  ExplainableRecommendation,
  AdaptiveAction,
} from './types';

export class RuleBasedAdaptiveEngine implements PersonalizationProvider {
  public readonly id = 'rule_based_adaptive_v1';
  public readonly name = 'ShikshaSetu Rule-Based Adaptive Engine';

  /**
   * Evaluates the student's current telemetry to select the next adaptive question,
   * adjust difficulty, or trigger prerequisite fallback with visual scaffolding.
   */
  public async evaluateNextQuestion(
    state: AdaptiveAssessmentState,
    allQuestions: AssessmentQuestion[],
    allTopics: CurriculumTopic[]
  ): Promise<NextQuestionEvaluation> {
    const answeredQuestionIds = new Set(state.answers.map((a) => a.question_id));
    const recentAnswers = state.answers.slice(-3);
    const lastAnswer = state.answers[state.answers.length - 1];

    // Determine completion (reached target 10-15 questions or exhausted available calibrated pool)
    if (state.answers.length >= state.totalQuestionsTarget) {
      return {
        nextQuestion: null,
        isComplete: true,
        currentDifficulty: state.currentDifficulty,
        adaptiveAction: 'maintain',
        reasoning: 'Assessment target questions reached. Preparing diagnostic report.',
      };
    }

    let nextDifficulty = state.currentDifficulty;
    let adaptiveAction: AdaptiveAction = 'maintain';
    let reasoning = 'Maintaining current difficulty baseline to gather steady assessment data.';
    let scaffoldingExplanation: NextQuestionEvaluation['scaffoldingExplanation'] = undefined;
    let targetTopicId = state.currentTopicId;

    const currentTopic = allTopics.find((t) => t.id === targetTopicId);
    const currentTopicPerf = state.topicPerformance[targetTopicId] || {
      topicId: targetTopicId,
      topicName: currentTopic?.name || 'Current Topic',
      totalAttempts: 0,
      correctAttempts: 0,
      consecutiveIncorrect: 0,
      consecutiveCorrect: 0,
      accuracyPct: 100,
    };

    // 1. Check for Repeated Mistakes on Current Topic (>= 2 consecutive or accuracy < 50%)
    const hasRepeatedMistakes =
      currentTopicPerf.consecutiveIncorrect >= 2 ||
      (currentTopicPerf.totalAttempts >= 2 && currentTopicPerf.accuracyPct < 50);

    // 2. Check for Prerequisite Fallback:
    // If student struggles with a topic that has a prerequisite (e.g. Equivalent Fractions -> Fraction Basics)
    if (hasRepeatedMistakes && currentTopic?.prerequisite_topic_id) {
      const prerequisiteTopic = allTopics.find(
        (t) => t.id === currentTopic.prerequisite_topic_id
      );

      if (prerequisiteTopic) {
        adaptiveAction = 'prerequisite_fallback';
        nextDifficulty = 1; // Drop to foundational level
        targetTopicId = prerequisiteTopic.id;
        reasoning = `Repeated difficulty detected on ${currentTopic.name}. Stepping back to prerequisite foundation: ${prerequisiteTopic.name} to reinforce core concepts.`;

        scaffoldingExplanation = {
          topicName: prerequisiteTopic.name,
          visualHint: `Visual Concept Bridge: Before working with ${currentTopic.name}, let's look at ${prerequisiteTopic.name}. Imagine dividing a roti or a farming field into equal portions first.`,
          simplifiedExplanation: `When we understand ${prerequisiteTopic.name}, solving ${currentTopic.name} becomes intuitive and natural. Let's practice a foundational question together!`,
        };
      }
    } else if (lastAnswer && !lastAnswer.is_correct) {
      // General error: reduce difficulty if above 1
      if (nextDifficulty > 1) {
        nextDifficulty = (nextDifficulty - 1) as 1 | 2;
        adaptiveAction = 'decrease_difficulty';
        reasoning = `A slight hesitation occurred. Adapting down to difficulty level ${nextDifficulty} to build confidence and conceptual clarity.`;
      } else {
        adaptiveAction = 'maintain';
        reasoning = 'Reinforcing foundational conceptual understanding at level 1.';
      }

      if (currentTopic) {
        scaffoldingExplanation = {
          topicName: currentTopic.name,
          visualHint: 'Step-by-step hint: Break the problem into visual parts. Think of everyday village examples like sharing grain or measuring cloth.',
          simplifiedExplanation:
            'Every thoughtful attempt strengthens your brain. Review the concept and try the next related question.',
        };
      }
    } else if (
      recentAnswers.length >= 2 &&
      recentAnswers.every((a) => a.is_correct)
    ) {
      // Correct answers streak: gradually increase difficulty
      if (nextDifficulty < 3) {
        nextDifficulty = (nextDifficulty + 1) as 2 | 3;
        adaptiveAction = 'increase_difficulty';
        reasoning = `Consistent mastery demonstrated! Advancing difficulty to level ${nextDifficulty} to discover full learning potential.`;
      } else {
        // If already at max difficulty, advance to next topic in curriculum
        const nextTopicIndex = allTopics.findIndex((t) => t.id === targetTopicId) + 1;
        if (nextTopicIndex < allTopics.length) {
          targetTopicId = allTopics[nextTopicIndex].id;
          nextDifficulty = 2; // Standard difficulty for new topic
          adaptiveAction = 'increase_difficulty';
          reasoning = `Mastery achieved on ${currentTopic?.name}. Transitioning to next milestone: ${allTopics[nextTopicIndex].name}.`;
        }
      }
    }

    // 3. Select next unvisited question matching targetTopicId and nextDifficulty
    let candidateQuestions = allQuestions.filter(
      (q) =>
        !answeredQuestionIds.has(q.id) &&
        q.topic_id === targetTopicId &&
        q.difficulty === nextDifficulty
    );

    // If no exact match for difficulty on this topic, look for any unvisited question on this topic
    if (candidateQuestions.length === 0) {
      candidateQuestions = allQuestions.filter(
        (q) => !answeredQuestionIds.has(q.id) && q.topic_id === targetTopicId
      );
    }

    // If topic is exhausted, pick an unvisited question from the nearest unassessed topic
    if (candidateQuestions.length === 0) {
      candidateQuestions = allQuestions.filter((q) => !answeredQuestionIds.has(q.id));
    }

    if (candidateQuestions.length === 0) {
      // No more questions available
      return {
        nextQuestion: null,
        isComplete: true,
        currentDifficulty: nextDifficulty,
        adaptiveAction: 'maintain',
        reasoning: 'All calibrated diagnostic items completed.',
      };
    }

    // Pick first candidate
    const chosenQuestion = candidateQuestions[0];

    return {
      nextQuestion: chosenQuestion,
      isComplete: false,
      currentDifficulty: chosenQuestion.difficulty,
      adaptiveAction,
      reasoning,
      scaffoldingExplanation,
    };
  }

  /**
   * Computes comprehensive diagnostic mastery report without labeling students negatively,
   * categorizing topics into Strong, Developing, and Topics Needing Practice, and generating
   * an explainable recommendation citing exact attempts and performance.
   */
  public async computeMasteryReport(
    studentId: string,
    assessmentId: string,
    answers: AnswerSubmission[],
    allTopics: CurriculumTopic[],
    allQuestions: AssessmentQuestion[]
  ): Promise<DiagnosticReport> {
    const totalQuestions = answers.length;
    const correctCount = answers.filter((a) => a.is_correct).length;
    const overallScore = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    // 1. Group answers by topic
    const topicAnswerMap = new Map<string, AnswerSubmission[]>();
    for (const ans of answers) {
      const existing = topicAnswerMap.get(ans.topic_id) || [];
      existing.push(ans);
      topicAnswerMap.set(ans.topic_id, existing);
    }

    // 2. Compute mastery score for each topic
    const topicMasteries: TopicMastery[] = [];

    for (const topic of allTopics) {
      const topicAnswers = topicAnswerMap.get(topic.id) || [];
      const attempts = topicAnswers.length;

      if (attempts === 0) {
        // Topic wasn't directly tested (e.g. far downstream), mark based on prerequisite
        continue;
      }

      const correctAttempts = topicAnswers.filter((a) => a.is_correct).length;

      // Weighted mastery formula taking difficulty into account
      // Easy (1) = weight 1, Medium (2) = weight 1.5, Hard (3) = weight 2
      let weightedPointsEarned = 0;
      let totalPossibleWeightedPoints = 0;

      for (const ans of topicAnswers) {
        const weight = ans.difficulty === 3 ? 2.0 : ans.difficulty === 2 ? 1.5 : 1.0;
        totalPossibleWeightedPoints += weight;
        if (ans.is_correct) {
          weightedPointsEarned += weight;
        }
      }

      const rawAccuracy = (correctAttempts / attempts) * 100;
      const weightedScore =
        totalPossibleWeightedPoints > 0
          ? (weightedPointsEarned / totalPossibleWeightedPoints) * 100
          : rawAccuracy;

      const masteryScore = Math.round(weightedScore);

      let status: TopicMastery['status'] = 'developing';
      let diagnosticSummary = '';

      if (masteryScore >= 80) {
        status = 'strong';
        diagnosticSummary = `Solid conceptual grasp! You solved ${correctAttempts} of ${attempts} questions accurately.`;
      } else if (masteryScore >= 50) {
        status = 'developing';
        diagnosticSummary = `Good foundational intuition with ${correctAttempts} of ${attempts} correct. Ready to bridge to consistency.`;
      } else {
        status = 'needs_practice';
        diagnosticSummary = `Great effort! With targeted visual practice, this topic will quickly become a strength.`;
      }

      topicMasteries.push({
        topicId: topic.id,
        topicName: topic.name,
        masteryScore,
        attempts,
        correctAttempts,
        status,
        diagnosticSummary,
      });
    }

    // Categorize topics
    const strongTopics = topicMasteries.filter((t) => t.status === 'strong');
    const developingTopics = topicMasteries.filter((t) => t.status === 'developing');
    const needsPracticeTopics = topicMasteries.filter((t) => t.status === 'needs_practice');

    // 3. Determine Recommended Starting Point with EXPLAINABLE logic
    let recommendedStartingTopic: TopicMastery;
    let recommendation: ExplainableRecommendation;

    // Prerequisite priority: If any topic needing practice has a prerequisite that also needs attention or is the root blocker
    if (needsPracticeTopics.length > 0) {
      // Find the first unmastered topic in topological order
      const firstStruggle = needsPracticeTopics[0];
      const topicObj = allTopics.find((t) => t.id === firstStruggle.topicId);
      const prereqObj = topicObj?.prerequisite_topic_id
        ? allTopics.find((t) => t.id === topicObj.prerequisite_topic_id)
        : null;

      // Transparent pedagogical reasoning string (e.g. "Recommended because your last 3 attempts on Fractions were below 60%.")
      const reasonText = prereqObj
        ? `Recommended because your recent ${firstStruggle.attempts} attempts on ${firstStruggle.topicName} were ${firstStruggle.masteryScore}% (below 60%). Strengthening ${prereqObj.name} first will make mastering this topic intuitive and easy.`
        : `Recommended because your recent ${firstStruggle.attempts} attempts on ${firstStruggle.topicName} were ${firstStruggle.masteryScore}% (below 60%). A quick 10-minute focus will turn this into a strong area.`;

      recommendedStartingTopic = firstStruggle;
      recommendation = {
        topicId: prereqObj ? prereqObj.id : firstStruggle.topicId,
        topicName: prereqObj ? prereqObj.name : firstStruggle.topicName,
        title: `Reinforce ${prereqObj ? prereqObj.name : firstStruggle.topicName}`,
        actionText: 'Start 10-Min Booster',
        reasoning: reasonText,
        prerequisiteId: prereqObj?.id || null,
        prerequisiteName: prereqObj?.name,
        estimatedMinutes: 10,
        xpBonus: 50,
      };
    } else if (developingTopics.length > 0) {
      const firstDeveloping = developingTopics[0];
      recommendedStartingTopic = firstDeveloping;
      recommendation = {
        topicId: firstDeveloping.topicId,
        topicName: firstDeveloping.topicName,
        title: `Advance in ${firstDeveloping.topicName}`,
        actionText: 'Continue Practice',
        reasoning: `Recommended because you have good momentum with ${firstDeveloping.masteryScore}% mastery in ${firstDeveloping.topicName}. A few more practice questions will lock in complete mastery!`,
        estimatedMinutes: 10,
        xpBonus: 40,
      };
    } else if (strongTopics.length > 0) {
      // All tested are strong! Recommend the next unassessed milestone in curriculum
      const lastStrong = strongTopics[strongTopics.length - 1];
      const nextTopicIndex = allTopics.findIndex((t) => t.id === lastStrong.topicId) + 1;
      const nextTopic = nextTopicIndex < allTopics.length ? allTopics[nextTopicIndex] : allTopics[allTopics.length - 1];

      recommendedStartingTopic = lastStrong;
      recommendation = {
        topicId: nextTopic.id,
        topicName: nextTopic.name,
        title: `Explore New Frontier: ${nextTopic.name}`,
        actionText: 'Unlock New Milestone',
        reasoning: `Recommended because you demonstrated outstanding mastery (80%+) across tested topics! You are ready to explore ${nextTopic.name}.`,
        estimatedMinutes: 12,
        xpBonus: 60,
      };
    } else {
      // Fallback to first curriculum topic
      const firstTopic = allTopics[0];
      const fallbackMastery: TopicMastery = {
        topicId: firstTopic.id,
        topicName: firstTopic.name,
        masteryScore: 50,
        attempts: 0,
        correctAttempts: 0,
        status: 'developing',
        diagnosticSummary: 'Foundational starting point.',
      };
      recommendedStartingTopic = fallbackMastery;
      recommendation = {
        topicId: firstTopic.id,
        topicName: firstTopic.name,
        title: `Start with ${firstTopic.name}`,
        actionText: 'Begin Foundation',
        reasoning: `Recommended as the ideal starting foundation for your grade.`,
        estimatedMinutes: 8,
        xpBonus: 30,
      };
    }

    // 4. Generate Ordered Learning Path Items
    const generatedLearningPath = this.generateTopologicalPath(
      allTopics,
      topicMasteries,
      recommendation.topicId
    );

    return {
      assessmentId,
      overallScore,
      totalQuestions,
      strongTopics,
      developingTopics,
      needsPracticeTopics,
      recommendedStartingTopic,
      recommendation,
      generatedLearningPath,
    };
  }

  /**
   * Builds an ordered learning path according to the curriculum prerequisite graph,
   * setting status according to calculated student mastery.
   */
  private generateTopologicalPath(
    allTopics: CurriculumTopic[],
    topicMasteries: TopicMastery[],
    startingTopicId: string
  ): GeneratedPathItem[] {
    const masteryLookup = new Map(topicMasteries.map((m) => [m.topicId, m]));
    const pathItems: GeneratedPathItem[] = [];

    // Traverse allTopics in ordered sequence
    let hasFoundStartingPoint = false;

    for (let i = 0; i < allTopics.length; i++) {
      const topic = allTopics[i];
      const m = masteryLookup.get(topic.id);

      let status: GeneratedPathItem['status'] = 'not_started';

      if (topic.id === startingTopicId) {
        status = 'in_progress';
        hasFoundStartingPoint = true;
      } else if (m && m.status === 'strong') {
        status = 'mastered';
      } else if (m && m.status === 'needs_practice') {
        status = 'needs_practice';
      } else if (hasFoundStartingPoint) {
        status = 'not_started';
      } else if (m && m.status === 'developing') {
        status = 'in_progress';
      }

      pathItems.push({
        topicId: topic.id,
        topicName: topic.name,
        sequence: i + 1,
        status,
        description: topic.description || `Milestone ${i + 1}`,
      });
    }

    return pathItems;
  }
}
