import { LLMProvider } from './base';
import { OpenAIProvider } from './openai';
import { AnthropicProvider } from './anthropic';
import { LLMConfig } from '../types';

export class LLMFactory {
  static createProvider(config: LLMConfig): LLMProvider {
    const apiKey = config.provider === 'openai' 
      ? process.env.OPENAI_API_KEY 
      : process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      throw new Error(`API key not found for provider: ${config.provider}`);
    }

    switch (config.provider) {
      case 'openai':
        return new OpenAIProvider(config, apiKey);
      case 'anthropic':
        return new AnthropicProvider(config, apiKey);
      default:
        throw new Error(`Unsupported LLM provider: ${config.provider}`);
    }
  }
}
