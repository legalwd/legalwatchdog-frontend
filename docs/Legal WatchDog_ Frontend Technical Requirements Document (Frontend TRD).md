# **Legal WatchDog: Frontend Technical Requirements Document (Frontend TRD)**

**Product:** Legal WatchDog (LWD) 

**Module:** Web Frontend 

**Version:** 1.0 (Frontend‑Focused) 

**Date:** 17 Nov 2025

**References**

* [Core Product PRD: LegalWatchDog](https://docs.google.com/document/d/1r3O0SxVVHB-AHy-GLJ0o4clqGJpFVVER1V_BKDMXwnw)  
* [Backend & AI TRD: Legal Watch Dog](https://docs.google.com/document/d/1T_wFJbScFOWrmu6XytgMeNIX3g44zTnoKOi44p7h96A)

## **Table of Contents**

1. **Purpose & Scope**  
    1.1 Frontend Goals  
    1.2 Non-Goals

2. **Target Users & Roles (Frontend View)**

3. **Frontend Scope Overview**  
    3.1 In-Scope Feature Areas  
    3.2 Out-of-Scope

4. **UX & UI Principles**

5. **Information Architecture & Navigation**  
    5.1 High-Level Navigation  
    5.2 Route Map

6. **Functional Requirements: By Area**  
    6.1 Authentication & Session Management  
    6.2 Organisation & User Management  
    6.3 Project & Jurisdiction Management  
    6.4 Source Discovery & Management  
    6.5 Monitoring & Jobs  
    6.6 Outputs, Revisions & Diff  
    6.7 Tickets & Collaboration  
    6.8 Notifications  
    6.9 API Keys & External Access  
    6.10 Admin & System Health  
    6.11 Participant Portal

7. **Frontend Architecture & State Management**  
    7.1 Technology Stack  
    7.2 State Stores  
    7.3 API Client Layer  
    7.4 Request & Response Data Shapes

8. **Error Handling, Empty States & Edge Cases**  
    8.1 Global Error Patterns  
    8.2 Empty States  
    8.3 Rate Limiting & API Errors

9. **Security, Privacy & Compliance (Frontend)**

10. **Performance & Observability**  
     10.1 Performance Targets  
     10.2 Techniques  
     10.3 Frontend Observability

11. **Accessibility & Internationalisation**  
     11.1 Accessibility  
     11.2 Internationalisation (i18n)

12. **Analytics & Audit UI**

13. **Testing & Quality Criteria**  
     13.1 Unit & Component Tests  
     13.2 Integration / E2E  
     13.3 Definition of Done  
     13.4 Core Features Under Mandatory Automated Test Coverage

14. **Risks & Assumptions**  
     14.1 Risks  
     14.2 Assumptions

15. **Open Questions**

## 

## 

## **1\. Purpose & Scope**

This document defines the **functional, UX, and technical requirements** for the **Legal WatchDog web frontend**. It covers:

* Main **Vue 3 SPA** for authenticated organisation users (Admins, Project Managers, Team Members).  
* Lightweight **participant portal** for external Responders/Stakeholders accessing tickets via secure links.  
* Cross‑cutting frontend concerns including **state management**, **API integration**, **access control**, **error handling**, **performance**, and **accessibility**.

Backend behaviour, scraping logic, and AI processing are **out of scope** here except where they affect the UI contract.

### **1.1 Frontend Goals**

1. Provide a **cohesive, low‑friction UX** for:  
* Setting up organisations, projects, jurisdictions, and sources.  
* Reviewing outputs, diffs, and monitoring history.  
* Managing tickets, participants, and collaboration.  
2. Represent the backend state **accurately, consistently, and with clear status** (loading, success, failure, empty, permission‑denied).  
3. Ensure **role‑appropriate visibility** and **safe participant access** via tokenised links.  
4. Support **enterprise‑grade standards**: auditability, robust error surfaces, predictable interactions, and performance.

### 

### 

### **1.2 Non‑Goals**

* Mobile native apps (iOS/Android).  
* Custom report building or BI dashboards beyond defined analysis views.  
* Back‑office billing or complex subscription management UIs.  
* In‑browser scraping or AI processing.

## **2\. Target Users & Roles (Frontend View)**

Roles are defined at org level; frontend must enforce these at **navigation, visibility, and action** level.

1. **Organisation Administrator**  
* Manages org profile, members, roles, and org‑wide settings.  
* Needs full visibility across **all projects and tickets** in the org.  
2. **Project Manager**  
* Owns specific projects and jurisdictions.  
* Configures prompts, schedules, and sources.  
* Reviews outputs/diffs and manages tickets, notifications, and participants.  
3. **Team Member**  
* Restricted to **assigned projects** and tickets.  
* Reviews outputs and diffs; participates in ticket threads.  
* Cannot modify org‑level settings or global prompts.  
4. **Responder/Stakeholder (Participant)**  
* No platform account.  
* Accesses a **single ticket** via an expiring secure link.  
* Can view ticket context \+ relevant outputs and submit comments/attachments **only within that ticket**.  
5. **API Consumer (for awareness)**  
* Uses data programmatically via API keys.  
* Frontend must provide **API key management UI** and limited API docs/usage hints, but is not the consumer itself.

## **3\. Frontend Scope Overview**

### **3.1 In‑Scope Feature Areas**

1. **Authentication & Session Management**  
* Registration, login, OTP verification, password reset.  
* Session refresh, logout, global handling of 401/403.  
2. **Organisation & User Management**  
* Org profile, member list, invitations, role management, deactivation.  
3. **Project & Jurisdiction Management**  
* CRUD for projects and jurisdiction trees (including sub‑jurisdictions).  
* Prompt configuration and inheritance display.  
4. **Source Discovery & Management**  
* Source search, source library, attach/detach to jurisdictions.  
* Source status/health indicators and bulk operations.  
5. **Monitoring & Job Controls**  
* Baseline run, manual re‑scrape, schedule configuration.  
* Job status, progress, and result dashboards.  
6. **Outputs, Revisions & Diff UX**  
* Revisions listing, detail view (summary, raw, metadata).  
* Diff visualisation for text/markdown and structured JSON.  
* Change history timeline.  
7. **Ticketing & Collaboration UI**  
* Ticket list, filters, detail, comments, attachments.  
* Participant(s) invite management and access indication.  
8. **Notifications**  
* In‑app notifications center.  
* Toast/inline alerts for important events.  
9. **API Keys & External Access UI**  
* Create, revoke, and list API keys.  
* Display scopes and integration hints.  
10. **Admin & System Health Views**  
* High‑level health indicators and usage metrics for Admins.  
11. **Participant Portal (Ticket View)**  
* Minimal UI for external responders: view ticket, context, diffs; add comments/attachments.

### **3.2 Out‑of‑Scope (for this version)**

* Fine‑grained theming beyond base design system tokens.  
* Offline support or advanced caching strategies beyond standard HTTP caching \+ client stores.  
* Interactive scraping definition UIs (e.g., visual CSS selector builder).

## **4\. UX & UI Principles**

1. **Clarity first:** prioritise legible tables, clear statuses, and explicit messages over visual flair.  
2. **Surface risk early:** emphasise changes, failed scrapes, and stale data with strong but accessible indicators.  
3. **Minimal cognitive load:** keep forms compact; use wizards/steps where configuration is complex.  
4. **Consistency:** shared components for lists, forms, detail panes, tags, and status badges.  
5. **Accessibility:** WCAG 2.1 AA‑aligned patterns (focus states, contrast, aria labels, keyboard navigation).  
6. **Responsive:** fully usable on laptops and large desktops; serviceable on tablets and phones. 

## **5\. Information Architecture & Navigation**

### **5.1 High‑Level Navigation**

* Public routes (unauthenticated):  
* / (public marketing landing page; no authentication required)  
* /app (SPA entry: redirects to /auth/login when unauthenticated, or /app/dashboard when session valid)  
* /auth/login  
* /auth/register  
* /auth/verify  
* /auth/password/reset  
* **Main app shell (authenticated):** /app/\*  
  Layout:  
* Global top bar: organisation selector (if multiple), project selector, search, notifications, user menu.  
* Left sidebar: primary navigation (Dashboard, Projects, Tickets, Sources, Notifications, Admin, API keys).  
* Content area: route outlet.  
* **Participant portal (token‑based):**  
* /p/tickets/:participantToken

### **5.2 Route Map (Indicative)**

* / (public marketing landing page)  
* /app (SPA entry; redirect based on auth state)  
* /auth/login  
* /auth/register  
* /auth/verify (OTP)  
* /auth/password/reset  
* /app/dashboard  
* /app/organizations/me  
* /app/organizations/members  
* /app/projects  
* /app/projects/:projectId  
* /app/projects/:projectId/jurisdictions  
* /app/projects/:projectId/jurisdictions/:jurisdictionId  
* /app/projects/:projectId/jurisdictions/:jurisdictionId/sources  
* /app/sources/search  
* /app/sources/:sourceId  
* /app/projects/:projectId/schedule  
* /app/projects/:projectId/jobs/:jobId  
* /app/revisions/:revisionId  
* /app/revisions/:revisionId/diff  
* /app/tickets  
* /app/tickets/:ticketId  
* /app/notifications  
* /app/api-keys  
* /app/admin/metrics  
* /p/tickets/:participantToken

Route guards MUST enforce:

* Authentication for /app/\*.  
* Role‑based access (e.g. /app/admin/\* \-\> Admin only).  
* Participant tokens granting access only to the relevant ticket and linked revisions.

## **6\. Functional Requirements: By Area**

Each subsection 6.x maps directly to a backend endpoint family and must reference the corresponding API contract from the Backend TRD:

* 6.1: Authentication (/auth/\*)  
* 6.2: Organisations (/organizations/\*)  
* 6.3: Projects & Jurisdictions (/projects/\*)  
* 6.4: Sources (/sources/\*)  
* 6.5: Monitoring & Jobs (/projects/\* baseline/scrape/schedule and /scrape-jobs/\*)  
* 6.6: Outputs & Revisions (/projects/\*/jurisdictions/\*/revisions, /revisions/\*)  
* 6.7: Tickets & Collaboration (/tickets/\*)  
* 6.8: Notifications (/notifications/\*)  
* 6.9: API Keys & External Outputs (/api-keys/\*, /external/\*)  
* 6.10: Admin & System Health (/health, /admin/metrics)  
* 6.11: Participant Portal (ticket endpoints with participant tokens)

### 

### 

### 

### 

### 

### **6.1 Authentication & Session Management (FR‑FE‑AUTH)**

**Backend references:** /auth/register, /auth/verify/otp, /auth/login, /auth/refresh, /auth/logout, /auth/password-reset-tokens, /auth/password.

#### ***6.1.1 Login***

**UI:**

* Email \+ password fields; “Remember this device” (client‑side only for UX, not persisting sensitive tokens to localStorage if security policy forbids).  
* Clear error messages for invalid credentials or locked/deactivated users.

**Behaviour:**

* On success, rely on the HTTP‑only auth cookie set by the backend and store only minimal, non‑sensitive user/org profile data in Pinia. No long‑lived secrets are stored in JavaScript‑accessible storage.  
* Redirect to the last visited project or /app/dashboard.  
* On 401/403, show error and remain on login.

**Acceptance Criteria:**

* Users with valid credentials are redirected into the app shell.  
* Wrong credentials produce a non‑ambiguous error message without revealing which part is wrong.  
* Deactivated users receive a clear message and cannot proceed.

#### ***6.1.2 Registration & OTP Verification***

#### 

#### **UI:**

* Step 1: Organisation \+ Admin user details (email, password, organisation name).  
* Step 2: OTP verification screen.

**Behaviour:**

* Call /auth/register; on success, show OTP entry page.  
* Call /auth/verify/otp={otp}; on success, login user and redirect into app.

**Acceptance Criteria:**

* Registration validates required fields client‑side and server‑side.  
* OTP failures show clear feedback and support limited retries.  
* After successful OTP verification, the user is authenticated without needing to re‑login.

#### ***6.1.3 Password Reset***

**Request screen:**

* Asks for email and calls /auth/password-reset-tokens.  
* Shows generic success messages regardless of whether an account exists.  
* Reset screen (from email link/token):  
* New password \+ confirm.  
* Calls /auth/password.

**Acceptance Criteria:**

* Invalid/expired token shows clear error and provides a path back to request a new reset.  
* Password strength validation is enforced on the client‑side.

#### ***6.1.4 Session Refresh & Logout***

The frontend must:

* Use an HTTP interceptor to refresh tokens via POST /auth/refresh when access tokens expire (if using non-cookie strategy).  
* Globally handle 401:  
* Attempt refresh once.  
* On failure, clear state, redirect to login, and show a “session expired” message.  
* Provide logout action calling POST /auth/logout, then clearing all stores and returning to /auth/login.

**Acceptance Criteria:**

* No silent failures: expired sessions always eventually surface a UX event (banner/toast \+ redirect).  
* API calls are not spammed with repeated failing refresh attempts.

#### ***6.1.5 Future Authentication Methods (OAuth / SSO)***

* The frontend authentication module must be designed to support additional providers (OAuth2 / OIDC / SAML-based SSO) without rewriting existing email/password flows.  
* UI considerations:  
* Pluggable provider buttons (e.g. “Continue with Enterprise SSO”, “Continue with Microsoft”).  
* Clear indication of which method was last used for a given browser (for UX only, not security-critical).  
* Behavioural considerations:  
* Support redirect-based flows initiated from the login page and completed via callback routes (e.g. /auth/callback/:provider).  
* Handle linking of external identities to existing organisation accounts as defined in the backend TRD.  
* This TRD does not define a specific provider list, but **all login/registration UI and routing decisions must avoid blocking future OAuth/SSO integration.**

### **6.2 Organisation & User Management (FR‑FE‑ORG)**

**Backend references:** /organizations/me, /organizations/{id}, /organizations/{id}/invitations, /organizations/{id}/members.

#### ***6.2.1 Organisation Profile View***

* **UI:**  
* Read‑only view for non‑Admins; editable form for Admins.  
* Fields: organisation name, basic settings (e.g., default timezone, default notification preferences if exposed by backend).  
* **Behaviour:**  
* Fetch from /organizations/me on entry.  
* Admins can update via PUT /organizations/{organization\_id}.

**Acceptance Criteria:**

* Non‑Admins see fields but cannot edit (controls disabled).  
* Successful save shows confirmation, and local state syncs with the backend.

#### ***6.2.2 Member List & Role Management***

* **UI:**  
* Table of members with columns: name, email, role, status (active/inactive), last seen (if available), actions.  
* Invite member modal: email \+ role selector.  
* **Behaviour:**  
* Fetch via GET /organizations/{organization\_id}/members.  
* Invite via POST /organizations/{organization\_id}/invitations.  
* Update member role via PUT /organizations/{organization\_id}/members/{member\_id}.  
* Deactivate/remove via DELETE /organizations/{organization\_id}/members/{member\_id} endpoint.

**Acceptance Criteria:**

* Only Admins can change roles or deactivate members.  
* Deactivated members are visually indicated and cannot login.  
* Attempts by non‑Admin to access this screen show a 403‑appropriate error view.

### **6.3 Project & Jurisdiction Management (FR‑FE‑PROJECTS)**

**Backend references:** /projects, /projects/{project\_id}, /projects/{project\_id}/jurisdictions.

#### ***6.3.1 Projects List***

**UI:**

* Table or card list with filters: search by title, owner, status.  
* Columns: title, description, owner, \#jurisdictions, last run, status (active/archived).

**Behaviour:**

* Fetch via GET /projects (with pagination and filters).  
* “New project” button (Manager & Admin roles) opens a modal or dedicated page.

**Acceptance Criteria:**

* Only users with permission see the “New project” button.  
* Empty state is explicit: call‑to‑action to create the first project.

#### ***6.3.2 Project Create/Edit***

**UI:**

* Form fields: title, description, default/master prompt, optional settings.

**Behaviour:**

* Create: POST /projects.  
* Update: PATCH /projects/{project\_id}.  
* Archive: DELETE /projects/{project\_id} (soft delete) with confirmation dialogue.

**Acceptance Criteria:**

* Client‑side validation for required fields and prompt length.  
* Archiving hides projects from default views but allows access via filters.

#### ***6.3.3 Jurisdiction Tree Management***

**UI:**

* Tree view showing jurisdiction hierarchy per project (Jurisdiction \-\> Sub-jurisdictions \-\> Source).\*\*maximum embeddable jurisdictions defined by backend  
* Node details panel with: name, type, additional prompt, metadata, attached sources count.

**Behaviour:**

* List: GET /projects/{project\_id}/jurisdictions.  
* Create: POST /projects/{project\_id}/jurisdictions with parent reference for sub‑jurisdictions.  
* Edit: PATCH per jurisdiction.  
* Delete: DELETE with safeguards if children exist.

**Prompt Inheritance UX:**

* Show the **effective prompt** calculated from project \+ jurisdiction \+ source.  
* Indicate overridden vs inherited sections via visual treatment (e.g., labels on sections).

**Acceptance Criteria:**

* Users can visually distinguish parent/child jurisdictions and see counts of nested units.  
* Deleting a jurisdiction with children requires confirmation text acknowledging effect on subtree.

### **6.4 Source Discovery & Management (FR‑FE‑SOURCES)**

**Backend references:** /sources/search, /sources, /sources/{source\_id}, /projects/{project\_id}/jurisdictions/{jurisdiction\_id}/sources.

#### ***6.4.1 Source Search & Library***

**UI:**

* Search page with query input and filters (type, region, reliability if provided).  
* Results list: title, URL, type, last checked, status.

**Behaviour:**

* Call GET /sources/search with query parameters.  
* Selected sources can be **added to the org library** via POST /sources if not already present.

**Acceptance Criteria:**

* Search supports debounced queries; loading state is visible.  
* Adding the same source twice is prevented or handled gracefully.

#### ***6.4.2 Attach/Detach Sources to Jurisdictions***

**UI:**

* Within Jurisdiction detail, tab for “Sources” listing attached sources.  
* Control to “Attach existing source” (autocomplete search).

**Behaviour:**

* Attach: POST /projects/{project\_id}/jurisdictions/{jurisdiction\_id}/sources.  
* Detach: DELETE /projects/{project\_id}/jurisdictions/{jurisdiction\_id}/sources/{source\_id}.

**Acceptance Criteria:**

* Attaching reflects immediately in the UI list.  
* Attempting to detach the last source in a critical jurisdiction surfaces a warning but is allowed per backend rules.

#### ***6.4.3 Source Status & Health***

**UI:**

* Status badge (healthy, warning, failing, pending) per source, reflecting last scrape results.

**Behaviour:**

* Display summary from source metadata (error messages, last success timestamp, failure count).

**Acceptance Criteria:**

* Failing sources are visually emphasised in jurisdiction and global source lists.  
* Hover or detail view surfaces underlying error message from backend.

### 

### **6.5 Monitoring & Jobs (FR‑FE‑MONITORING)**

**Backend references:** /projects/{project\_id}/baseline, /projects/{project\_id}/scrape, /scrape-jobs/{job\_id}, /projects/{project\_id}/schedule.

#### ***6.5.1 Baseline Run***

**UI:**

* Project‑level action: “Run Baseline” if baseline not yet created.  
* Confirmation dialogue summarising scope and expected time.

**Behaviour:**

* Call POST /projects/{project\_id}/baseline and receive job\_id.  
* Show job in job status area with live polling via /scrape-jobs/{job\_id}.

**Acceptance Criteria:**

* Users can leave the page; job status should be recoverable when re‑opening project view.  
* Once baseline completes, revision views become available.

#### ***6.5.2 Manual Re‑Scrape***

**UI:**

* Project or jurisdiction‑level “Re‑scrape” action with optional scope selection.

**Behaviour:**

* Call POST /projects/{project\_id}/scrape with optional jurisdiction\_id.  
* Show job status similarly to baseline.

**Acceptance Criteria:**

* Multiple re‑scrapes queue correctly; UX shows their status separately.  
* If the user tries to trigger re‑scrape too frequently, backend validation errors surface with a clear message.

#### 

#### 

#### ***6.5.3 Schedule Configuration***

**UI:**

* Form for scan\_interval\_minutes, enabled with human‑readable explanation (e.g., “Every 6 hours”).

**Behaviour:**

* Call POST /projects/{project\_id}/schedule to update.

**Acceptance Criteria:**

* Changes persist and are reflected on revisit.  
* Invalid values (e.g., extremely low interval if backend restricts) show explicit validation errors.

### **6.6 Outputs, Revisions & Diff (FR‑FE‑REVISIONS)**

**Backend references:** /projects/{project\_id}/jurisdictions/{jurisdiction\_id}/revisions, /revisions/{revision\_id}, /revisions/{revision\_id}/raw, /revisions/{revision\_id}/summary, /revisions/{revision\_id}/diff.

#### ***6.6.1 Revisions List***

**UI:**

* Table of revisions per jurisdiction with columns: timestamp, change detected?, triggering job, ticket linked?, status.  
* Filters: date range, change vs no‑change, has ticket.

**Acceptance Criteria:**

* No‑change revisions are listed explicitly but visually deemphasised.  
* Each revision links to its detailed view.

#### ***6.6.2 Revision Detail View***

**UI:**

* Panels:  
* Metadata (timestamp, source(s), job, status, AI validation state).  
* AI summary (from /revisions/{revision\_id}/summary).  
* Structured data / markdown preview (from extracted\_data).  
* Links to raw download and diff view.

**Acceptance Criteria:**

* Summary and data are read‑only.  
* If parsing fails on the backend, show a clear error state and any available raw content.

#### ***6.6.3 Diff View***

**UI:**

* For text/markdown: side‑by‑side or unified diff showing additions/removals.  
* For structured JSON: key‑level changes with badges (+, −, \~) and highlighted values.  
* Controls to switch base revision for comparison.

**Behaviour:**

* Call /revisions/{revision\_id}/diff?compare\_to=....

**Acceptance Criteria:**

* Diff view is performant on large documents (chunking or lazy rendering if needed).  
* Impossible combinations (e.g., comparing to non‑adjacent revisions if backend disallows) are handled gracefully.

### **6.7 Tickets & Collaboration (FR‑FE‑TICKETS)**

**Backend references:** /tickets, /tickets/{ticket\_id}, /tickets/{ticket\_id}/close, /tickets/{ticket\_id}/responders, /tickets/{ticket\_id}/comments.

#### ***6.7.1 Ticket List***

**UI:**

* Table with filters: project, jurisdiction, status, priority, created by, assigned to, has external responders.  
* Basic summarised columns: title, status, priority, last updated, change summary snippet, linked revision.

**Acceptance Criteria:**

* Filtering and pagination must be responsive and not freeze on large datasets.  
* Tickets with external responders are clearly flagged.

#### 

#### 

#### ***.7.2 Ticket Detail***

**UI:**

* Header: title, status, priority, assignees, linked project/jurisdiction, linked revision(s).  
* Sections:  
* Change summary and quick diff preview.  
* Timeline of events (opened, comments, status changes, re‑scrapes).  
* Comment thread with author badges (internal vs external).  
* Responder management panel (for PM/Admin).

**Behaviour:**

* Data from GET /tickets/{ticket\_id}.  
* Update ticket status/assignees via PATCH /tickets/{ticket\_id}.  
* Close via /tickets/{ticket\_id}/close.  
* Comments via /tickets/{ticket\_id}/comments.

**Acceptance Criteria:**

* Comment form supports rich text (minimum: basic formatting) and attachments (if supported later, at least placeholder spec now).  
* Closing a ticket visually marks it as archived and disables further comments from external responders.

#### ***6.7.3 External Responder Management***

**UI:**

* Panel listing responders: email, role, token status (active/expired), last access.  
* Invite form: email, role, expiry.

**Behaviour:**

* Invite via POST /tickets/{ticket\_id}/responders.  
* Revoke via DELETE /tickets/{ticket\_id}/responders/{responder\_id}.

**Acceptance Criteria:**

* UI emphasises that responders only see scoped ticket data.  
* Revocation takes effect immediately in the participant portal.

### 

### **6.8 Notifications (FR‑FE‑NOTIFICATIONS)**

**Backend references:** /notifications, /notifications/{id}/read, /notifications/read-all.

**UI:**

* Bell icon in top bar with unread count.  
* Dropdown with recent notifications; link to full notifications page.  
* Notifications list screen with filters: type (change, ticket, assignment), read/unread.

**Behaviour:**

* Fetch GET /notifications for current users.  
* Mark single as read via PATCH /notifications/{id}/read.  
* Mark all as read via /notifications/read-all.

**Acceptance Criteria:**

* New change events show a real‑time or near‑real‑time badge update (polling or SSE if available later; initial version can use simple periodic refresh or user‑initiated refresh).  
* Read/unread state visually distinct and persisted via backend.

### **6.9 API Keys & External Access (FR‑FE‑API-KEYS)**

**Backend references:** /api-keys, /external/projects, /external/projects/{project\_id}/outputs.

**UI:**

* API Keys page accessible to Admin (and optionally PMs if allowed).  
* Table listing keys (masked), name, scopes, created date, last used, status.  
* Key creation modal: name, scopes, note that key will be shown once.

**Behaviour:**

* Create via POST /api-keys.  
* List via GET /api-keys.  
* Delete via DELETE /api-keys/{api\_key\_id}.

**Acceptance Criteria:**

* Newly created key value displayed exactly once with clear copy warning.  
* Masked values and partial display (e.g., last 4 chars) match backend response.

### 

### **6.10 Admin & System Health (FR‑FE‑ADMIN)**

**Backend references:** /health, /admin/metrics.

**UI:**

* Dashboard for Admins only:  
* Overall system health (UP/DOWN per subsystem).  
* Key metrics: \#scrapes/day, failure rate, average job duration, \#tickets open vs closed.

**Behaviour:**

* Use /health for status pill.  
* Use /admin/metrics for charts/tables.

**Acceptance Criteria:**

* Non‑Admins navigating to this route see a permission denied view.  
* Health indicators update on refresh and accurately reflect backend responses.

### **6.11 Participant Portal (FR‑FE‑PARTICIPANT)**

**Backend references:** ticket endpoints with participant tokens (backend validates token & scoping).

**Route:** /p/tickets/:participantToken

**UI:**

* Minimal layout (no main app nav).  
* Ticket title \+ status, change summary, relevant revision/diff view, comment thread.  
* Comment form with optional attachment support (if in scope later).

**Behaviour:**

* Participant token handled as URL param; no login.  
* Backend returns only data allowed by token (single ticket context).  
* If the token is invalid/expired, show a dedicated error screen with no data leak.

**Acceptance Criteria:**

* Participants cannot navigate to other tickets or org data by manipulating URLs.  
* When the ticket is closed, participants read‑only history and cannot comment.

## 

## **7\. Frontend Architecture & State Management**

### **7.1 Technology Stack (Frontend)**

* **Framework:** Vue 3 (Composition API).  
* **Language:** TypeScript.  
* **Routing:** Vue Router.  
* **State Management:** Pinia.  
* **Styling:** TailwindCSS, with tokens mapped to Legal WatchDog design system.  
* **UI Library:** shadcn-vue component library for consistent primitives aligned with the design system.

### **7.2 State Stores (Indicative)**

* authStore: current user, tokens (if not cookie‑based), roles, permissions.  
* orgStore: organisation details, members.  
* projectStore: projects list, active project metadata.  
* jurisdictionStore: tree structure per project, cached by project ID.  
* sourceStore: sources library, search results, source details.  
* jobStore: current and recent jobs, statuses.  
* revisionStore: revision lists and cache of recent details.  
* ticketStore: ticket lists, current ticket, comments.  
* notificationStore: notifications and unread count.  
* adminStore: metrics and system health.

### **7.3 API Client Layer**

* Shared HTTP client abstraction:  
* Typed request/response models aligned with backend schemas.  
* Response wrapper handling success shape { data, message } and error shape { error, message, details }.  
* Global interceptors for:  
* Injecting auth tokens or handling cookies.  
* Transforming backend errors to UI‑friendly error objects.  
* Handling 401/403 centrally.

**Acceptance Criteria:**

* No direct fetch/axios calls inside components; they must go via the API client or services.  
* Error hand‑offs are structured (error codes mapped to UX patterns where appropriate).

### 

### **7.4 Request & Response Data Shapes**

* For every endpoint listed in section 6, the frontend MUST define and use TypeScript interfaces/types for:  
* Request payloads.  
* Query parameters.  
* Response bodies (success and known error variants where the backend uses structured error responses).  
* The canonical field-level definitions live in the Backend TRD; the frontend types must stay in sync and be updated as part of any API change.  
* The API client layer should expose these types so that:  
* Stores and components consume strongly-typed data.  
* Breaking API changes are detected at compile-time as much as possible.  
* Any dynamic or unknown-shaped fields (e.g. free-form metadata) must be explicitly marked and handled defensively in the UI.

## **8\. Error Handling, Empty States & Edge Cases**

### **8.1 Global Error Patterns**

* **Network errors:** full‑width banner in app shell \+ inline errors on affected components.  
* **Permission errors (403):** dedicated “Not Allowed” view with explanation and optional link back to dashboard.  
* **Not found (404):** route‑level 404 within app shell; for participant portal, separate minimal 404\.

### **8.2 Empty States**

Each primary list screen (projects, jurisdictions, sources, tickets, revisions, notifications) must:

* Show a clear empty state message.  
* Provide an action where appropriate (e.g., “Create first project”, “Attach sources”).

### **8.3 Rate Limiting & API Errors**

* On 429 Too Many Requests:  
* Show a dedicated message indicating rate limit and suggested wait period (if provided).  
* Avoid auto‑retry loops (disable buttons during wait period).  
* On 500 series errors:  
* Generic but non‑patronising message \+ “Try again” action.

## **9\. Security, Privacy & Compliance (Frontend)**

* Never log sensitive data (tokens, passwords, raw personally identifiable content) to the browser console.  
* Authentication tokens MUST be stored in HTTP‑only cookies wherever possible. In‑memory storage is acceptable for short-lived access tokens **in addition** to HTTP‑only cookies, but tokens MUST NOT be stored in localStorage or sessionStorage.  
* Prevent XSS via:  
* Avoiding v-html for untrusted content; if required (e.g., for diff rendering), use a sanitation step.  
* Participant links:  
* Must not reveal org or project identifiers in URL beyond what backend deems safe (use opaque tokens).  
* Ensure logout clears all in‑memory and persisted state.

**Acceptance Criteria:**

* Manual security review for areas rendering arbitrary text/markdown/HTML.  
* No hard‑coded secrets or environment keys in frontend code.

## **10\. Performance & Observability**

### **10.1 Performance Targets**

* Initial authenticated route load (dashboard) **\< 3s** on standard enterprise laptop \+ average corporate network.  
* Route transitions **\< 1s** for most screens with cached data.  
* Avoid rendering freezes on:  
* Large tables (use pagination & virtualisation if needed).  
* Large diffs (chunking or collapsed sections).

### **10.2 Techniques**

* Route‑level code splitting (lazy loaded routes).  
* Use table pagination with sensible default page size (20–50 rows).  
* Debounced search inputs and filter changes.  
* Memoised computed properties in heavy components.

### **10.3 Frontend Observability**

* Instrument critical events (login success/failure, baseline runs started/completed, ticket created, scraping error surfaced) via the org‑level analytics system (if available).  
* Capture JS errors via a central error handler; display user‑friendly error pages as needed.

## **11\. Accessibility & Internationalisation**

### **11.1 Accessibility**

* Keyboard navigation for all interactive controls (tabs, menus, modals, forms).  
* Visible focus states for all clickable/focusable elements.  
* Proper aria attributes for:  
* Dialogs, alerts, status badges, and live regions (e.g. notifications count updates).  
* All icons must have accessible names or be hidden from assistive tech when decorative.

### **11.2 Internationalisation (i18n)**

* Initial release in English; however, UI copy must be structured to allow future localisation (no hard‑coded concatenated strings with variables where it would break grammatical order).  
* All user‑visible strings routed through a translation layer or constant file.

## **12\. Analytics & Audit UI**

* **Analytics (lightweight):**  
* Frontend must emit events to backend/analytics when key flows occur (e.g. project created, ticket closed).  
* Events must include minimal necessary metadata (no sensitive content).  
* **Audit UI:**  
* Where the backend exposes audit logs (e.g. user management actions), frontend presents them in read-only tables with filters.  
* This can be part of Admin or project‑level detail views.

## **13\. Testing & Quality Criteria**

### **13.1 Unit & Component Tests**

* Critical stores (auth, projects, tickets) covered by unit tests for core logic.  
* Components handling complex logic (diff viewer, jurisdiction tree) require component tests.

### **13.2 Integration / E2E**

* Automated E2E tests for:  
* Login & session expiry.  
* Project creation and first baseline run (mocked backend).  
* Ticket creation from revision and comment posting.  
* Participants accessing tickets via token and submitting comment.

### **13.3 Definition of Done (Frontend)**

A feature is “Done” only when:

* UX matches this TRD and the design system spec.  
* Role‑based visibility verified.  
* Error states and empty states implemented.  
* Tests exist and pass (unit where applicable, plus at least 1 E2E per critical path).  
* Accessibility basics (keyboard, labels, focus) checked.

### **13.4 Core Features Under Mandatory Automated Test Coverage**

At minimum, the following feature areas MUST have automated test coverage (unit/component and/or E2E where appropriate):

**Authentication & Session Management:**

* Email/password login, logout, session refresh and expiry handling.  
* Registration \+ OTP verification.  
* Password reset request and completion.

**RBAC & Navigation:**

* Access control to admin/org/member-management views.  
* Project and ticket visibility according to role.

**Projects & Jurisdictions:**

* Project CRUD (create, update, archive).  
* Jurisdiction tree operations (create/edit/delete nodes, prompt inheritance display).

**Sources:**

* Source search and library add/remove.  
* Attach/detach sources to/from jurisdictions.

**Monitoring & Jobs:**

* Trigger baseline and re-scrape.  
* Polling and display of job status.

**Outputs & Revisions:**

* Listing revisions for a jurisdiction.  
* Rendering revision details and diff views for typical and large payloads.

**Tickets & Collaboration:**

* Ticket creation from revisions.  
* Status/assignee updates and close flow.  
* Commenting (internal users) and visibility of external responders.

**Participant Portal:**

* Access via tokenised link.  
* Posting comments (when ticket open) and read-only behaviour when closed.

**Notifications:**

* Fetching notifications, marking single/all as read, and badge updates.

**API Keys:**

* Creating, listing, and revoking API keys, including one-time display of key value.

**Admin & System Health:**

* Health status rendering based on /health.  
* Metrics cards/charts rendering based on /admin/metrics responses.

These core flows form the regression baseline; no release is acceptable if any of these tests are failing.

## **14\. Risks & Assumptions**

### **14.1 Risks**

* Highly nested jurisdiction trees and revision histories may create heavy UI if not paginated or limited.  
* Large diffs could degrade browser performance.  
* Complex RBAC could produce inconsistent visibility if not centrally enforced in route guards.  
* Participant link misuse if backend token handling is misconfigured.

### **14.2 Assumptions**

* Backend adheres to documented API contracts (status codes, response shapes, rate limits).  
* Email delivery for OTP and password reset is handled outside frontend scope.  
* Design system tokens (colors, spacing, typography) are defined and stable.

## **15\. Open Questions (to be resolved before build or during early sprints)**

* Exact role matrix for certain actions (e.g., can Team Members invite participants or only Project Managers?).  
* Maximum size for attachments and whether inline preview is required in v1.  
* Real‑time notifications vs. polling (depends on backend capabilities).  
* Level of detail expected in Admin metrics (per‑project vs org‑wide only).

These questions do **not block** the majority of implementation but must be answered before finalising related screens.

