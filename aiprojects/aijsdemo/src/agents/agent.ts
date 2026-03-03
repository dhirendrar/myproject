import { LLMProvider } from '../llm/base';
import { ToolRegistry } from '../tools/registry';
import { Message, AgentConfig } from '../types';

export class Agent {
  private config: AgentConfig;
  private llmProvider: LLMProvider;
  private toolRegistry: ToolRegistry;

  constructor(config: AgentConfig, llmProvider: LLMProvider, toolRegistry: ToolRegistry) {
    this.config = config;
    this.llmProvider = llmProvider;
    this.toolRegistry = toolRegistry;
  }

  async run(userMessage: string, conversationHistory: Message[] = []): Promise<string> {
    const messages: Message[] = [
      { role: 'system', content: this.config.systemPrompt },
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ];

    let iterations = 0;
    const maxIterations = 10;

    while (iterations < maxIterations) {
      const response = await this.llmProvider.chat(messages, this.config.tools);

      // If no tool calls, return the response
      if (!response.toolCalls || response.toolCalls.length === 0) {
        return response.content;
      }

      // Execute tool calls
      for (const toolCall of response.toolCalls) {
        try {
          const result = await this.toolRegistry.executeTool(toolCall.name, toolCall.arguments);
          messages.push({
            role: 'assistant',
            content: `Tool ${toolCall.name} called with result: ${JSON.stringify(result)}`
          });
        } catch (error: any) {
          messages.push({
            role: 'assistant',
            content: `Tool ${toolCall.name} failed: ${error.message}`
          });
        }
      }

      iterations++;
    }

    return 'Maximum iterations reached. Please try again with a simpler request.';
  }

  getName(): string {
    return this.config.name;
  }
}
