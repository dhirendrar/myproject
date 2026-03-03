import Anthropic from '@anthropic-ai/sdk';
import { LLMProvider } from './base';
import { LLMConfig, LLMResponse, Message } from '../types';

export class AnthropicProvider extends LLMProvider {
  private client: InstanceType<typeof Anthropic>;

  constructor(config: LLMConfig, apiKey: string) {
    super(config);
    this.client = new Anthropic({ apiKey });
  }

  async chat(messages: Message[], tools?: any[]): Promise<LLMResponse> {
    const systemMessage = messages.find(m => m.role === 'system');
    const userMessages = messages.filter(m => m.role !== 'system');

    const response = await (this.client as any).messages.create({
      model: this.config.model || 'claude-3-sonnet-20240229',
      max_tokens: this.config.maxTokens || 2000,
      system: systemMessage?.content,
      messages: userMessages.map(m => ({ role: m.role, content: m.content })),
      tools: tools?.map(t => ({
        name: t.name,
        description: t.description,
        input_schema: t.parameters
      })),
      temperature: this.config.temperature || 0.7
    });

    const textContent = response.content.find((c: any) => c.type === 'text');
    const toolUse = response.content.filter((c: any) => c.type === 'tool_use');

    return {
      content: textContent?.type === 'text' ? (textContent as any).text : '',
      toolCalls: toolUse.map((tu: any) => ({
        name: tu.type === 'tool_use' ? tu.name : '',
        arguments: tu.type === 'tool_use' ? tu.input : {}
      })),
      usage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens
      }
    };
  }

  async *streamChat(messages: Message[], tools?: any[]): AsyncGenerator<string> {
    const systemMessage = messages.find(m => m.role === 'system');
    const userMessages = messages.filter(m => m.role !== 'system');

    const stream = await (this.client as any).messages.stream({
      model: this.config.model || 'claude-3-sonnet-20240229',
      max_tokens: this.config.maxTokens || 2000,
      system: systemMessage?.content,
      messages: userMessages.map(m => ({ role: m.role, content: m.content }))
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        yield chunk.delta.text;
      }
    }
  }
}
