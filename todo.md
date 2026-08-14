# Oracle Engine Newsletter Conversion Checklist

- [x] Confirm the managed publication route, with GitHub treated as a code mirror rather than the automation host.
- [ ] Inspect the available GitHub connection options for an automatic repository mirror and identify any required user authorization.
- [x] Upgrade the project with secure server-side generation, persistent storage, and scheduling support.
- [x] Define edition, insight, source, publication-status, and current-events data models.
- [x] Establish source-validation, human-review, and failure-handling rules for automated content.
- [x] Design the newsletter home, issue archive, recents feed, and current-affairs edition lane.
- [x] Implement the authenticated publication endpoint and quality gate that the recurring research task will use.
- [ ] Create the live recurring three-day research task after the site is published, with a weekly current-events check built into its playbook.
- [ ] Add GitHub Pages-ready export instructions and repository metadata without attempting external publication.
- [x] Run the newsletter quality-gate unit tests, type check, and production build.
- [ ] Verify the reader experience on desktop and mobile, then test the live schedule callback after publication.
- [ ] Resolve the GitHub token’s missing repository-creation permission or connect an existing repository for the code mirror.
- [ ] Verify the exact owner/repository slug for The Light Letter and push the validated newsletter code to that existing mirror.
