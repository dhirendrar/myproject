package com.gtn.agentictool.service;

import com.gtn.agentictool.model.Issue;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Service
public class GitHubService {

    @Value("${github.repo}")
    private String repo;

    public List<Issue> fetchOpenIssues() {
        String apiUrl = "https://api.github.com/repos/" + repo + "/issues";
        // Call GitHub API and parse issues (you can use WebClient or RestTemplate)
        return Collections.singletonList(new Issue("Sample issue", "Details about it")); // mock
    }
}