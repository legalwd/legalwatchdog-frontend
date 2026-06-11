# Jurisdictions, Sources, and Monitoring

Back to the [manual index](./README.md).

Previous section: [Organizations and Projects](./02-organizations-and-projects.md)

Next section: [Analysis, Revisions, and Tickets](./04-analysis-revisions-and-tickets.md)

## What a Jurisdiction Represents

A jurisdiction is the specific area you want Legal WatchDog to monitor. Depending on your work, a jurisdiction can represent:

- a country
- a state or province
- a legal subject area
- a policy domain
- a regulator or institutional scope

Jurisdictions are added inside a project.

## Creating a Jurisdiction

On a project page, use `Add Jurisdiction` to create one. A jurisdiction usually includes:

- a name
- an optional description

Once created, you open the jurisdiction page to complete setup.

## The Jurisdiction Setup Flow

The first-time setup flow is intentionally guided. The app expects two things:

1. Write instructions.
2. Add sources.

This onboarding view exists because the monitoring engine needs direction before it can interpret changes usefully.

## Step 1: Write Jurisdiction Instructions

Instructions tell the AI what matters for this jurisdiction.

Good instructions should mention:

- what types of changes matter
- what topics to prioritize
- what keywords or sections to watch
- what should be ignored if possible

Example:

"Monitor for changes related to visa fees, document requirements, processing time guidance, and any changes to eligibility language."

Use specific instructions if:

- the source covers many unrelated topics
- only some sections are relevant
- your team needs consistent filtering across updates

## Step 2: Add Sources

After saving instructions, you can add sources in two ways:

1. Search suggested sources from the app’s source discovery interface.
2. Add sources manually.

### Suggested Sources

Suggested source search is useful when:

- you are not sure which official page to monitor
- you want faster setup
- you want to search a verified library of regulatory portals

### Manual Sources

Manual source entry is best when:

- you already know the correct URL
- you need a page not found in suggestions
- you are adding a niche or organization-specific source

When adding a manual source, expect to define:

- source name
- URL
- source type
- scrape frequency
- active status

## Managing Sources

Inside the Sources tab, users can:

- view existing sources
- add new sources
- remove sources
- archive sources

Archiving is safer when you want to stop using a source without fully erasing it. Permanent deletion should be reserved for mistakes or cleanup you are certain about.

## Monitoring and Scraping

Once a jurisdiction has sources, you can trigger monitoring from the scrape section.

The scrape panel can show:

- whether a scrape has started
- job status
- progress percentage
- total sources checked
- successful sources
- filtered sources
- start time
- completion time

This helps users know whether monitoring is still running or has already completed.

## The Three Main Jurisdiction Tabs

After onboarding is complete, the jurisdiction page centers around three tabs:

1. Data Page
2. Sources
3. Analysis

### Data Page

Use this as the operational data surface for the jurisdiction. It is the natural place to review monitored outputs after a scrape.

### Sources

Use this tab to add, review, and manage source URLs.

### Analysis

Use this tab to inspect revisions, summaries, and change interpretation.

## Editing a Jurisdiction Later

From the jurisdiction header and settings, you can usually:

- edit the jurisdiction name
- edit the description
- update the instruction
- delete the jurisdiction

You should update a jurisdiction when:

- your monitoring scope changes
- a regulator restructures its content
- your team wants tighter or broader detection

## Practical Use Cases

- Monitor a ministry website for immigration rule changes.
- Track a regulator’s privacy updates for one country.
- Watch a tax authority page for filing and threshold changes.
- Monitor an education authority for policy circulars.

If you already have monitoring results, continue with [Analysis, Revisions, and Tickets](./04-analysis-revisions-and-tickets.md).
