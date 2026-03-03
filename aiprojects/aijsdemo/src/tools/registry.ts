import { Tool } from '../types';
import { calculatorTool } from './calculator';
import { fileReaderTool } from './fileReader';
import { wikipediaTool, webScraperTool } from './webRetrieval';
import { calendarTool } from './calendar';

export class ToolRegistry {
  private tools: Map<string, Tool> = new Map();

  constructor() {
    this.registerDefaultTools();
  }

  private registerDefaultTools() {
    this.register(calculatorTool);
    this.register(fileReaderTool);
    this.register(wikipediaTool);
    this.register(webScraperTool);
    this.register(calendarTool);
  }

  register(tool: Tool) {
    this.tools.set(tool.name, tool);
  }

  get(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  getAll(): Tool[] {
    return Array.from(this.tools.values());
  }

  async executeTool(name: string, params: any): Promise<any> {
    const tool = this.get(name);
    if (!tool) {
      throw new Error(`Tool not found: ${name}`);
    }
    return await tool.execute(params);
  }
}
