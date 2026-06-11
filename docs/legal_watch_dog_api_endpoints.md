# Legal WatchDog API Endpoints

## Waitlist
**POST** `/api/v1/waitlist/signup` – Signup Waitlist

---

## Contact Us
**POST** `/api/v1/contact-us` – Contact Us
**GET** `/api/v1/contact-us` – Get All Contact Submissions

---

## Auth
**POST** `/api/v1/auth/register` – Company Signup
**POST** `/api/v1/auth/otp/verification` – Verify Otp
**POST** `/api/v1/auth/otp/requests` – Request New Otp
**POST** `/api/v1/auth/invitations/{token}/accept` – Accept Invitation
**POST** `/api/v1/auth/login` – Login
**POST** `/api/v1/auth/token/refresh` – Refresh Token
**POST** `/api/v1/auth/logout` – Logout
**POST** `/api/v1/auth/password/resets` – Request Password Reset
**POST** `/api/v1/auth/password/resets/verification` – Verify Reset Code
**POST** `/api/v1/auth/password/resets/confirmation` – Confirm Password Reset

---

## Social Auth
**GET** `/api/v1/oauth/microsoft/login` – Microsoft Login
**GET** `/api/v1/oauth/microsoft/callback` – Microsoft Callback
**GET** `/api/v1/oauth/google/login` – Google Login
**GET** `/api/v1/oauth/google/callback` – Google Callback
**GET** `/api/v1/oauth/google/profile` – Get Oauth Profile
**POST** `/api/v1/auth/apple/signin` – Apple Login
**POST** `/api/v1/auth/apple/callback` – Apple Callback

---

## Organizations
**POST** `/api/v1/organizations` – Create Organization
**PATCH** `/api/v1/organizations/{organization_id}` – Update Organization
**GET** `/api/v1/organizations/{organization_id}` – Get Organization
**DELETE** `/api/v1/organizations/{organization_id}` – Delete Organization
**POST** `/api/v1/organizations/{organization_id}/invitations` – Invite User
**PATCH** `/api/v1/organizations/{organization_id}/members/{user_id}/status` – Update Member Status
**PATCH** `/api/v1/organizations/{organization_id}/members/{user_id}/role` – Update Member Role
**PATCH** `/api/v1/organizations/{organization_id}/members/{user_id}` – Update Member Details
**DELETE** `/api/v1/organizations/{organization_id}/members/{user_id}` – Delete Member
**GET** `/api/v1/organizations/{organization_id}/users` – Get All Users In Organization

---

## Users
**GET** `/api/v1/users/me` – Get Current User Profile
**PATCH** `/api/v1/users/me` – Update Current User Profile
**POST** `/api/v1/users/me/upload-profile-picture` – Upload Profile Picture
**GET** `/api/v1/users/me/invitations` – Get My Invitations
**GET** `/api/v1/users/me/organizations` – Get All User Organizations
**GET** `/api/v1/users/{user_id}/organisations/{organization_id}` – Get User Organization Details
**GET** `/api/v1/users/me/organizations/{organization_id}` – Get Organization Details

---

## Sources
**POST** `/api/v1/sources` – Create Source
**GET** `/api/v1/sources` – Get Sources
**POST** `/api/v1/sources/bulk` – Bulk Create Sources
**GET** `/api/v1/sources/{source_id}` – Get Source
**PUT** `/api/v1/sources/{source_id}` – Update Source
**DELETE** `/api/v1/sources/{source_id}` – Delete Source
**PATCH** `/api/v1/sources/{source_id}` – Update Source Patch
**GET** `/api/v1/sources/{source_id}/revisions` – Get Source Revisions
**POST** `/api/v1/sources/{source_id}/scrapes` – Manual Scrape Trigger

---

## AI Source Discovery
**POST** `/api/v1/sources/suggest` – Suggest Official Sources Using AI
**POST** `/api/v1/sources/accept-suggestions` – Accept AI‑Suggested Sources

---

## Projects
**POST** `/api/v1/organizations/{organization_id}/projects` – Create Project
**GET** `/api/v1/organizations/{organization_id}/projects` – List Projects In Organization
**GET** `/api/v1/organizations/{organization_id}/projects/{project_id}` – Get Project
**PATCH** `/api/v1/organizations/{organization_id}/projects/{project_id}` – Update Project
**DELETE** `/api/v1/organizations/{organization_id}/projects/{project_id}` – Delete Project

---

## Jurisdictions
**POST** `/api/v1/organizations/{organization_id}/jurisdictions/` – Create Jurisdiction
**GET** `/api/v1/organizations/{organization_id}/jurisdictions/` – Get All Jurisdictions
**GET** `/api/v1/organizations/{organization_id}/jurisdictions/project/{project_id}` – Get Jurisdictions By Project
**DELETE** `/api/v1/organizations/{organization_id}/jurisdictions/project/{project_id}` – Soft Delete Jurisdictions By Project
**GET** `/api/v1/organizations/{organization_id}/jurisdictions/{jurisdiction_id}` – Get Jurisdiction
**PATCH** `/api/v1/organizations/{organization_id}/jurisdictions/{jurisdiction_id}` – Update Jurisdiction
**DELETE** `/api/v1/organizations/{organization_id}/jurisdictions/{jurisdiction_id}` – Soft Delete Jurisdiction
**POST** `/api/v1/organizations/{organization_id}/jurisdictions/{jurisdiction_id}/restoration` – Restore Jurisdiction
**POST** `/api/v1/organizations/{organization_id}/jurisdictions/project/{project_id}/restoration` – Restore Jurisdictions By Project Id
**GET** `/api/v1/organizations/{organization_id}/jurisdictions/{jurisdiction_id}/sources` – Get Sources For Jurisdiction

---

## Billing
**POST** `/api/v1/organizations/{organization_id}/billing/checkout` – Create Stripe Checkout Session
**GET** `/api/v1/organizations/{organization_id}/billing/subscription` – Get Subscription Status
**POST** `/api/v1/organizations/{organization_id}/billing/subscription/change-plan` – Change Subscription Plan
**POST** `/api/v1/organizations/{organization_id}/billing/subscription/cancel` – Cancel Subscription
**POST** `/api/v1/organizations/{organization_id}/billing/accounts` – Create Billing Account
**GET** `/api/v1/organizations/{organization_id}/billing` – Get Billing Account
**POST** `/api/v1/organizations/{organization_id}/billing/payment-methods` – Add Payment Method
**GET** `/api/v1/organizations/{organization_id}/billing/payment-methods` – List Payment Methods
**POST** `/api/v1/organizations/{organization_id}/billing/payment-methods/{payment_method_id}/default` – Set Default Payment Method
**DELETE** `/api/v1/organizations/{organization_id}/billing/payment-methods/{payment_method_id}` – Delete Payment Method
**GET** `/api/v1/organizations/{organization_id}/billing/plans` – List Subscription Plans
**POST** `/api/v1/organizations/{organization_id}/billing/invoices` – Create Invoice
**GET** `/api/v1/organizations/{organization_id}/billing/invoices` – List Invoices
**POST** `/api/v1/billing/webhook` – Stripe Webhook

---

## Data Revision Search
**POST** `/api/v1/data-revisions/` – Search Data Revisions

---

## Default
**GET** `/` – Read Root
**GET** `/health` – Health Check

