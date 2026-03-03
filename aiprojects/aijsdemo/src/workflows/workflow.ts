import { Agent } from '../agents/agent';
import { WorkflowState } from '../types';

type WorkflowNode = (state: WorkflowState) => Promise<WorkflowState>;

export class Workflow {
  private nodes: Map<string, WorkflowNode> = new Map();
  private edges: Map<string, string[]> = new Map();
  private entryPoint: string = '';

  addNode(name: string, node: WorkflowNode) {
    this.nodes.set(name, node);
  }

  addEdge(from: string, to: string) {
    if (!this.edges.has(from)) {
      this.edges.set(from, []);
    }
    this.edges.get(from)!.push(to);
  }

  setEntryPoint(name: string) {
    this.entryPoint = name;
  }

  async execute(initialState: WorkflowState): Promise<WorkflowState> {
    let currentState = initialState;
    let currentNode = this.entryPoint;

    while (currentNode) {
      const node = this.nodes.get(currentNode);
      if (!node) break;

      currentState = await node(currentState);

      // Determine next node
      const nextNodes = this.edges.get(currentNode);
      if (!nextNodes || nextNodes.length === 0) break;

      // Use nextStep from state or take first edge
      currentNode = currentState.nextStep || nextNodes[0];
      currentState.nextStep = undefined;
    }

    return currentState;
  }
}

// Example: Multi-agent research workflow
export class ResearchWorkflow {
  private workflow: Workflow;

  constructor(private researchAgent: Agent, private summaryAgent: Agent) {
    this.workflow = new Workflow();
    this.setupWorkflow();
  }

  private setupWorkflow() {
    // Research node
    this.workflow.addNode('research', async (state: WorkflowState) => {
      const query = state.messages[state.messages.length - 1].content;
      const result = await this.researchAgent.run(query, state.messages.slice(0, -1));
      
      state.messages.push({ role: 'assistant', content: result });
      state.context.researchResult = result;
      return state;
    });

    // Summary node
    this.workflow.addNode('summarize', async (state: WorkflowState) => {
      const summaryPrompt = `Summarize the following research: ${state.context.researchResult}`;
      const summary = await this.summaryAgent.run(summaryPrompt);
      
      state.messages.push({ role: 'assistant', content: summary });
      state.context.summary = summary;
      return state;
    });

    this.workflow.setEntryPoint('research');
    this.workflow.addEdge('research', 'summarize');
  }

  async run(query: string): Promise<string> {
    const initialState: WorkflowState = {
      messages: [{ role: 'user', content: query }],
      context: {}
    };

    const finalState = await this.workflow.execute(initialState);
    return finalState.context.summary || 'No summary generated';
  }
}
