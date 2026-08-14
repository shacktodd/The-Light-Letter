# Oracle Engine Newsletter — Operating Design

## Publication model

The public site is a readable newsletter archive rather than a research dashboard. Each edition contains exactly three cross-domain insights, each written in a two-layer form: a plain-language **Main claim** and **Why it matters**, followed by expandable evidence, audit, and source notes for readers who want the full method.

The upgraded project now provides a Drizzle/MySQL schema, tRPC server contracts, manuscript-authenticated users, and the Heartbeat SDK. Newsletter data will be added as project-owned public content; administrative publication controls remain server-side and do not expose model credentials to readers.

| Content unit | Required fields | Publication rule |
| --- | --- | --- |
| Edition | date, slug, headline, editorial note, status, issue type | Published editions are immutable; a correction creates a visible update note. |
| Insight | main claim, plain-language so-what, domains, tier, audit summary, source links | Three insights per regular edition, with direction of surprise deliberately varied. |
| Source | named institution/publication, URL, source type, retrieval date | Every published insight requires named sources and clickable links. |
| Current signal | news relevance explanation, current-event source links, audit note | At least one must be included during every seven-day window. |

## Generation and quality gate

The recurring research task will perform web research, write structured candidate editions, and reject candidates that cannot meet the evidence bar. A regular edition may publish only when it contains three distinct insights, names concrete sources, clearly separates documented facts from inferred intent, and supplies a falsifier. A current-affairs edition additionally needs explicit event-date context and at least two independent current sources. Failed validation becomes a draft rather than a public post.

## Schedule design

A single recurring Manus task will run every three days. On each run it will generate one new issue, determine whether the archive lacks a current-events signal in the last seven days, and add that signal when needed. The task will mirror generated edition assets and site changes to the authorized GitHub repository after the edition passes the quality gate. Because recurring work must write to the live site, the project must first be checkpointed and published; the scheduled task will then write through the site’s authenticated publication endpoint.

## Safeguards

The system must not manufacture sources, reviews, quotations, or claims of causation. It must downgrade any statement that outruns its evidence, record retrieval dates for current-event sources, preserve failure logs, and keep a human-readable correction path. The user-facing language should remain clear: the first screen presents the claim and its practical implication; deeper mechanism, audit, denominator, intentionality, and sources are available without hiding the uncertainty.

## Implementation baseline

The original public page is a single long-form archival dossier with client-side filtering and source drawers. It will be reorganized into a newsletter landing page while retaining its evidence-forward visual language. The upgraded tRPC router currently provides only system and authentication procedures, so public edition retrieval and owner-only drafting/publication procedures must be added alongside persistent database helpers.
