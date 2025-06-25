package com.gtn.agentictool.llm;

import com.gtn.agentictool.model.Issue;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LLMService {

    @Value("${openai.api-key}")
    private String apiKey;

    public String summarize(List<Issue> issues) {
        String prompt = "Summarize these GitHub issues:\n" +
                issues.stream().map(Issue::toString).collect(Collectors.joining("\n"));
        // Use WebClient or RestTemplate to call OpenAI API with the prompt
        return "Mock summary of issues"; // replace with real call
    }
}
