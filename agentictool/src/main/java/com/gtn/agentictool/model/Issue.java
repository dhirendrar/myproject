package com.gtn.agentictool.model;

public class Issue {
    private String title;
    private String body;

    public Issue(String title, String body) {
        this.title = title;
        this.body = body;
    }

    @Override
    public String toString() {
        return title + ": " + body;
    }
}
