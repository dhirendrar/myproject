package com.gtn.agentictool.controller;

import com.gtn.agentictool.agent.GitHubAgent;
import com.gtn.agentictool.llm.LLMService;
import com.gtn.agentictool.model.Issue;
import com.gtn.agentictool.service.GitHubService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/github")
public class GitHubController {

    @Autowired
    private GitHubService gitHubService;

    @Autowired
    private LLMService llmService;

    @Autowired
    private GitHubAgent gitHubAgent;

    // Fetch live issues
    @GetMapping("/issues")
    public List<Issue> getOpenIssues() {
        return gitHubService.fetchOpenIssues();
    }

    // Generate and return issue summary
    @GetMapping("/summary")
    public String summarizeIssues() {
        List<Issue> issues = gitHubService.fetchOpenIssues();
        return llmService.summarize(issues);
    }

    // Manually trigger the agent’s cycle
    @PostMapping("/run-agent")
    public String runAgentCycle() {
        gitHubAgent.runAgentCycle();
        return "Agent run triggered.";
    }
}
