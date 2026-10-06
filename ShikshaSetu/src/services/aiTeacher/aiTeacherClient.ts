import { AITeacherEngine } from './aiTeacherEngine';
import { StudentLearningContext, AITeacherResponse } from './types';
import { validateAIRequest } from '../../lib/securityUtils';

/**
 * AI Teacher Client Interface
 *
 * Enforces Offline Honesty & Input Security:
 * - If the client is offline, live AI generation is explicitly prohibited.
 * - Validates input message length and neutralizes malicious markup.
 * - Displays: "AI Teacher requires an internet connection."
 * - Does NOT fake offline AI responses.
 */
class AITeacherClientService {
  private engine: AITeacherEngine;

  constructor() {
    this.engine = new AITeacherEngine();
  }

  /**
   * Sends student message to the AI Teacher engine with full context.
   * Checks network connectivity to ensure authentic, non-faked AI tutoring.
   */
  public async sendStudentMessage(
    userMessage: string,
    context: StudentLearningContext,
    isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true
  ): Promise<AITeacherResponse> {
    // 1. Strict Offline Honesty Check
    if (!isOnline) {
      throw new Error('AI Teacher requires an internet connection.');
    }

    // 2. Input Security & Guardrail Check: Validate & sanitize prompt
    const validation = validateAIRequest(userMessage);
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid message format.');
    }

    // Small simulated network latency for natural conversational feel (300-500ms)
    await new Promise((resolve) => setTimeout(resolve, 350));

    return this.engine.generateResponse(validation.sanitized, context);
  }
}

export const aiTeacherClient = new AITeacherClientService();
