# Super Admin Campaigns and Blog Generation

Back to the [manual index](./README.md).

Previous section: [Super Admin Console](./07-super-admin-console.md)

## Who This Section Is For

This guide is for super admins who operate the platform-level campaign workflow and the internal blog tooling.

These tools are not part of the normal organization user journey. They are operational controls used to create automated campaigns, review generated taxonomy, monitor runtime progress, and generate or publish jurisdiction blog posts.

## Campaigns Overview

The Campaigns area is built around a controlled lifecycle:

1. Create a draft campaign.
2. Review or edit the draft.
3. Generate taxonomy.
4. Review and edit taxonomy.
5. Approve taxonomy.
6. Launch the campaign.
7. Monitor runtime progress.
8. Pause, resume, or cancel if needed.

The UI enforces backend status rules. That means some buttons only appear when the campaign is in the correct status.

## Opening The Campaigns Workspace

In the super admin console, open `Campaigns`.

The main campaigns page includes:

- a `New Campaign` button
- organization filtering
- status filtering
- industry search
- page size control
- paginated results

Selecting a campaign row opens the campaign detail page.

## Filtering The Campaign List

The campaigns list can be filtered by:

- organization
- status
- industry
- page size

The page also supports previous and next pagination controls. Query parameters are reflected in the URL, so filtered views can be revisited or shared internally.

## Creating A Campaign Draft

Use `New Campaign` to open the campaign form.

The current form requires:

- organization
- campaign name
- industry
- domain description
- target depth
- monitor cadence
- sources per jurisdiction
- max jurisdictions

It also supports an optional `Project ID`.

The current target depth options are:

- `COUNTRY`
- `STATE`
- `CITY`

The monitor backend is currently fixed by the app, so operators do not choose that value manually.

The form blocks submission if:

- organization is missing
- name is empty
- industry is empty
- domain description is empty
- sources per jurisdiction is below 1
- max jurisdictions is below 1

After a successful save, the campaign opens in its detail view.

## Campaign Detail View

The detail page is the main control center for one campaign.

It shows:

- campaign ID
- organization ID
- industry
- target depth
- monitor cadence
- sources per jurisdiction
- max jurisdictions
- updated timestamp
- domain description

It also shows a runtime card with:

- current phase
- whether live updates are connected
- last updated time

Below that, the page shows an action bar and an execution timeline.

## What The Action Bar Does

The action bar changes based on campaign status.

Possible actions include:

- `Edit Draft`
- `Delete Draft`
- `Generate Taxonomy`
- `Review Taxonomy`
- `Launch Campaign`
- `Pause Campaign`
- `Resume Campaign`
- `Cancel Campaign`

If no action is allowed for the current status, the page states that no actions are available.

## Draft-Only Rules

The current code allows draft editing and deletion only while the campaign is in `DRAFT`.

That means:

- you can edit a campaign only while it is still a draft
- you can delete a campaign only while it is still a draft
- taxonomy generation starts from the draft state

If the backend reports the campaign as locked, the UI shows an error explaining that the current status prevents modification from this screen.

## Generating And Reviewing Taxonomy

From a draft campaign, use `Generate Taxonomy`.

After taxonomy exists, open the taxonomy review page. This page includes:

- campaign summary details
- current campaign status
- preview stats
- warnings
- taxonomy tree
- node editor

Preview stats currently show:

- total nodes
- countries
- states
- cities

Warnings are displayed exactly as returned by the backend. If there are no warnings, the page says so.

## Editing Taxonomy Nodes

Select a node in the taxonomy tree to edit it.

The node editor currently supports:

- name
- description
- suggested prompt
- ISO code
- suggested search queries

Suggested search queries are entered as comma-separated values.

After changing a node, use `Apply Node Changes`. This updates the working draft in the page. It does not save the taxonomy to the backend until you use `Save Taxonomy`.

The taxonomy page also supports:

- `Reset Draft` to discard unsaved page-level changes
- `Save Taxonomy` to persist the edited taxonomy
- `Approve Taxonomy` to finalize it

If there are unsaved changes when you approve, the app saves the taxonomy first and then submits approval.

## Approving Taxonomy

Taxonomy approval is only available when the campaign is in `TAXONOMY_READY`.

Approving taxonomy does two things operationally:

- finalizes the taxonomy structure
- enables campaign launch from the detail page

The taxonomy view also shows the approval timestamp after approval has happened.

## Launching And Monitoring Campaigns

Once taxonomy is approved, use `Launch Campaign`.

The detail page tracks progress through the runtime status card and the execution timeline.

The app can receive updates in two ways:

- live updates through a progress stream
- fallback polling when the stream is unavailable

The timeline shows phase records with:

- phase name
- start time
- completion time when available
- completed items
- total items
- failed items

## Campaign Statuses You May See

The current frontend supports these statuses:

- `DRAFT`
- `GENERATING_TAXONOMY`
- `TAXONOMY_READY`
- `HYDRATING`
- `DISCOVERING_SOURCES`
- `SCRAPING`
- `PUBLISHING`
- `MONITORING`
- `ACTIVE`
- `PAUSED`
- `COMPLETED`
- `FAILED`
- `CANCELLED`

In practice:

- `DRAFT` is the editable setup state
- `TAXONOMY_READY` means taxonomy can be reviewed, approved, and launched
- `HYDRATING` through `MONITORING` represent active pipeline phases
- `ACTIVE` means the run is considered live
- `PAUSED` can be resumed
- `FAILED`, `COMPLETED`, and `CANCELLED` are terminal outcomes for a run

The current UI also allows launch from `FAILED`, which suggests operators can retry a failed campaign from the detail page.

## Pause, Resume, And Cancel

When a campaign is running, the detail page may expose:

- `Pause Campaign`
- `Resume Campaign`
- `Cancel Campaign`

Use these carefully:

- pause when you need to temporarily stop a run
- resume when a paused run should continue
- cancel when the run should be stopped entirely

Cancel uses a confirmation dialog because it halts an active or paused campaign.

## Blog Tooling Overview

Open `Blog` in the super admin console to use the content workflow.

The blog area has two panels:

- `Generate`
- `Posts List`

The active panel is also reflected in the URL query string, so the page can reopen into the same panel.

## Generating A Blog Post

The `Generate` panel is jurisdiction-based.

The current selection flow is:

1. Select an organization.
2. Optionally select a project, or leave it at `All projects`.
3. Select a jurisdiction.

After a jurisdiction is selected, the app automatically checks whether a blog post already exists for that jurisdiction.

The panel includes two main actions:

- `Generate`
- `Check generation status`

## What Happens During Blog Generation

When generation starts, the app calls the blog generation endpoint for the selected organization and jurisdiction.

The interface shows a generation status card with states such as:

- not started
- checking for an existing post
- generation queued
- generation in progress
- blog post ready
- generation check failed

If the backend returns a job ID, the panel shows it next to the status.

## Viewing And Publishing The Generated Post

The `Generated Post` section shows:

- title
- meta description when available
- full markdown-rendered blog content

If a post exists and is not yet published, the `Publish post` button becomes available.

Publishing currently sends `is_published: true`. The current UI does not expose an unpublish action from this panel.

Once published, the button changes to `Published`.

## Posts List

The `Posts List` panel is for browsing already published blog posts.

It currently supports:

- organization selection
- comma-separated query term search
- pagination
- opening a single post view

An organization must be selected before the list loads.

The chosen organization is also remembered locally in the browser, so the panel can reopen with the last used organization selected.

## Searching Published Posts

Enter search terms as comma-separated values, then use `Search`.

The app sends those terms as `query_terms` to the backend. If no posts match, the page shows `No published blog posts found.`

Each list row currently shows:

- post title
- selected organization label
- jurisdiction name when available
- `View blog post`

## Single Blog Post View

Selecting `View blog post` opens a dedicated page for that post.

This page currently shows:

- a link back to the posts list
- title
- meta description when available
- full rendered blog content

If the post cannot be loaded, the page displays an error or `No blog post found.`

## Practical Operating Notes

- Campaign edits should be completed before taxonomy generation because the edit workflow is draft-only.
- Taxonomy review is the checkpoint before launch. Treat it as a quality-control step.
- Use the execution timeline to understand which phase has run and whether failures occurred.
- Blog generation is tied to a jurisdiction, not directly to a campaign record.
- The posts list is focused on published posts. Draft or unpublished content is reviewed from the generation panel for a selected jurisdiction.
