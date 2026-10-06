import { PersonalizationProvider } from './types';
import { RuleBasedAdaptiveEngine } from './ruleBasedAdaptiveEngine';

/**
 * AI Provider Registry & Client
 *
 * Implements an abstraction layer separating the educational UI and application logic
 * from the underlying personalization implementation.
 *
 * Security Architecture Guarantee:
 * - NO external AI API keys are stored, accessed, or bundled into client-side code.
 * - The primary engine is the resilient, deterministic RuleBasedAdaptiveEngine which
 *   functions completely offline in low-connectivity rural environments.
 * - For future cloud-hosted LLM extensions (e.g., Gemini or Claude for free-form dialogue),
 *   the provider communicates via authenticated server-side API endpoints, never exposing credentials.
 */

class AIProviderManager {
  private providers: Map<string, PersonalizationProvider> = new Map();
  private activeProviderId: string;

  constructor() {
    const defaultEngine = new RuleBasedAdaptiveEngine();
    this.registerProvider(defaultEngine);
    this.activeProviderId = defaultEngine.id;
  }

  public registerProvider(provider: PersonalizationProvider): void {
    this.providers.set(provider.id, provider);
  }

  public setActiveProvider(providerId: string): void {
    if (!this.providers.has(providerId)) {
      throw new Error(`AI Provider "${providerId}" is not registered.`);
    }
    this.activeProviderId = providerId;
  }

  public getActiveProvider(): PersonalizationProvider {
    const provider = this.providers.get(this.activeProviderId);
    if (!provider) {
      const fallback = new RuleBasedAdaptiveEngine();
      this.registerProvider(fallback);
      return fallback;
    }
    return provider;
  }

  public getRegisteredProviders(): { id: string; name: string }[] {
    return Array.from(this.providers.values()).map((p) => ({
      id: p.id,
      name: p.name,
    }));
  }
}

export const aiProviderClient = new AIProviderManager();
