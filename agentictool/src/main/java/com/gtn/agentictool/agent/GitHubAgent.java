package com.gtn.agentictool.agent;

import com.gtn.agentictool.llm.LLMService;
import com.gtn.agentictool.model.Issue;
import com.gtn.agentictool.service.GitHubService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class GitHubAgent {

    @Autowired
    private LLMService llmService;
    @Autowired private GitHubService gitHubService;

    public void runAgentCycle() {
        List<Issue> issues = gitHubService.fetchOpenIssues();
        String summary = llmService.summarize(issues);
        // Save to DB or notify
        System.out.println("Summary: " + summary);
    }
}
