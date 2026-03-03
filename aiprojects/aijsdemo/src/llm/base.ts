import { LLMConfig, LLMResponse, Message, ToolCall } from '../types';

export abstract class LLMProvider {
  protected config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
  }

  abstract chat(messages: Message[], tools?: any[]): Promise<LLMResponse>;
  abstract streamChat(messages: Message[], tools?: any[]): AsyncGenerator<string>;
}
