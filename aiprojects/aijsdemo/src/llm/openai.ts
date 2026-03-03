import OpenAI from 'openai';
import { LLMProvider } from './base';
import { LLMConfig, LLMResponse, Message } from '../types';

export class OpenAIProvider extends LLMProvider {
  private client: OpenAI;

  constructor(config: LLMConfig, apiKey: string) {
    super(config);
    this.client = new OpenAI({ apiKey });
  }

  async chat(messages: Message[], tools?: any[]): Promise<LLMResponse> {
    const response = await this.client.chat.completions.create({
      model: this.config.model || 'gpt-4-turbo-preview',
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      tools: tools?.map(t => ({
        type: 'function',
        function: {
          name: t.name,
          description: t.description,
          parameters: t.parameters
        }
      })),
      temperature: this.config.temperature || 0.7,
      max_tokens: this.config.maxTokens || 2000
    });

    const choice = response.choices[0];
    const toolCalls = choice.message.tool_calls?.map(tc => ({
      name: tc.function.name,
      arguments: JSON.parse(tc.function.arguments)
    }));

    return {
      content: choice.message.content || '',
      toolCalls,
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0
      }
    };
  }

  async *streamChat(messages: Message[], tools?: any[]): AsyncGenerator<string> {
    const stream = await this.client.chat.completions.create({
      model: this.config.model || 'gpt-4-turbo-preview',
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      stream: true,
      temperature: this.config.temperature || 0.7
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) yield content;
    }
  }
}
