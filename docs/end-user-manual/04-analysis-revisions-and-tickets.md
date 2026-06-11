# Analysis, Revisions, and Tickets

Back to the [manual index](./README.md).

Previous section: [Jurisdictions, Sources, and Monitoring](./03-jurisdictions-sources-and-monitoring.md)

Next section: [Profile, Billing, Invitations, and API Access](./05-profile-billing-invitations-and-api.md)

## Why This Area Matters

Monitoring only becomes useful when your team can decide:

- what changed
- whether it matters
- what action should happen next

That is what the Analysis and Tickets workflow is for.

## Analysis View

The Analysis tab on a jurisdiction helps you work source by source and revision by revision.

Users can typically:

- select a source
- load revisions for that source
- review whether a change was detected
- read summaries
- inspect scrape history
- open ticket workflows from important changes

## Revisions

A revision represents a captured result from monitoring a source at a point in time.

Use revisions to answer questions like:

- Did the source change?
- When did it change?
- What changed in practical terms?
- Which source version should I escalate?

## Change vs No-Change Review

The app distinguishes between:

- change detected
- no change detected

This is useful for teams who want to focus only on meaningful updates and avoid reviewing unchanged pages repeatedly.

## Summaries

Where available, summaries convert change details into readable text. These summaries are helpful when:

- the source content is long
- legal text is dense
- you need a quick first-pass understanding before deeper review

Users should still validate major changes against the original source when the issue is high-risk or business-critical.

## Scrape History

The jurisdiction analysis area can also show scrape job history so users can review:

- previous runs
- job status
- summaries tied to a run
- timing and progress information

This is helpful when a team needs to confirm whether a missing update is due to:

- no change being found
- a failed run
- an incomplete run

## Downloading Revision Files

Where supported, revisions may include downloadable files or artifacts. Use this when your team needs:

- archival review
- offline sharing
- audit evidence
- attachment to a ticket or report

## Tickets Overview

Tickets are the handoff layer between monitoring and team action.

You should create or open a ticket when:

- a detected change needs legal review
- an internal stakeholder must be informed
- follow-up research is required
- the update may affect operations, clients, or compliance posture

## Where Tickets Appear

Tickets can be accessed from:

- the main Tickets page
- a specific ticket detail page
- jurisdiction or revision workflows that open a ticket

The ticket list supports context-aware filtering. Depending on how you arrived there, the ticket list may be scoped to:

- a jurisdiction
- a project
- an organization

## Ticket List

The ticket list supports practical review actions such as:

- switching between open and closed tickets
- searching by title, ID, status, or priority
- opening a ticket detail page
- navigating back to the originating context

This makes it easier for teams to review only the tickets that matter to their current project or jurisdiction.

## Ticket Detail

A ticket detail page supports collaboration around a single issue. Users can typically:

- review the ticket content
- add comments
- edit their comments
- delete their comments
- attach a document
- close or update the ticket
- invite additional participants where supported

## Guest Access

Some ticket flows include guest access support. This is useful when:

- an external reviewer needs limited access
- someone should review one issue without full workspace access
- you want contextual access to a single ticket

## Best Practices for Teams

- Create tickets only for actionable changes.
- Use clear ticket titles tied to the real-world issue.
- Add comments with business impact, not only technical notes.
- Attach supporting files when the update may need audit or legal review.
- Close tickets only after the follow-up is actually complete.

## Example Workflow

1. A jurisdiction scrape completes.
2. A source revision shows a change.
3. The summary indicates a document requirement update.
4. A user opens a ticket from that revision.
5. The legal team comments on impact and assigns next steps.
6. The ticket is closed once the organization has responded.
