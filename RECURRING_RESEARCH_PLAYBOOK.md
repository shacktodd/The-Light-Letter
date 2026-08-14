# Oracle Dispatch — Recurring Research and Publication Playbook

You are producing the next public edition of **Oracle Dispatch**, a clear-language newsletter that publishes three rare, real cross-domain insights.

## Research standard

Find exactly three insights spanning at least three of spirituality/esoterica, hard science, history, politics, and sociology. Each must be obscure rather than fun-fact canon, real, cross-domain with a load-bearing link, counterintuitive, and sourced. Vary the direction of surprise. Do not force one hidden thesis across the issue. At least one insight may contain an explicitly unresolved open problem; never fake resolution.

For every insight, write the content in an approachable two-layer structure. The **main claim** and **so what** must be understandable to a general reader without reducing the underlying substance. The evidence and audit fields should preserve depth. Every insight needs named source URLs, a realistic falsifier, a denominator note, and an intentionality note. A claim that cannot name its sources or survive the stated audit must be replaced, not decorated.

## Current-affairs rule

Check the newsletter’s recent public archive. If no `current` issue has been published in the preceding seven days, make this issue `current`. A current issue requires a dated relevance explanation and at least two independent, named current-event source URLs. Do not use a current event as mere decoration: explain the true cross-domain connection and state uncertainty. If no current-event finding reaches the evidence bar, do not publish a weak replacement; explain the failure in the task result.

## Publication contract

The live endpoint expects one JSON object with this shape:

```json
{
  "slug": "lowercase-date-slug",
  "title": "Reader-friendly issue title",
  "standfirst": "At least 80 characters explaining the edition in plain language.",
  "editorNote": "Optional short note.",
  "issueType": "regular or current",
  "currentRelevance": "Required for current issues; at least 60 characters and include a date.",
  "currentSourceUrls": ["https://first-current-source", "https://second-current-source"],
  "insights": [
    {
      "title": "Plain-language headline",
      "domains": "e.g. history · hard science · politics",
      "tier": "E, C, F, or S",
      "mainClaim": "At least 80 characters.",
      "soWhat": "At least 55 characters.",
      "evidenceNote": "At least 60 characters; name methods and sources.",
      "auditNote": "At least 60 characters; steelman then calibrate the inference.",
      "denominatorNote": "At least 35 characters; state what is missing by structure.",
      "intentNote": "At least 35 characters; separate a pattern from planned intent.",
      "falsifier": "At least 35 characters; state what evidence would downgrade the claim.",
      "sources": [{"label":"Named source", "url":"https://source-url", "sourceType":"Primary source, data documentation, or scholarly research"}]
    }
  ]
}
```

After quality-checking the JSON, use `curl` to POST it to the deployed newsletter:

```sh
curl -X POST "$SCHEDULED_TASK_ENDPOINT_BASE/api/scheduled/publish-newsletter" \
  -H "Content-Type: application/json" \
  -H "Cookie: app_session_id=$SCHEDULED_TASK_COOKIE" \
  -d @edition.json
```

The server rejects anything that does not have exactly three distinct insights, each with named sources, a falsifier, a denominator note, and an intentionality note. A `current` edition is rejected unless it contains a relevance note and two independent current-source URLs. Report the endpoint response, source list, and any reason for refusal in the task result. Never invent a source, quote, field result, or research finding.
