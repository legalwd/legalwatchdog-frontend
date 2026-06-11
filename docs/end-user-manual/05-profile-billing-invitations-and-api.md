# Profile, Billing, Invitations, and API Access

Back to the [manual index](./README.md).

## Profile

The profile area is your personal account page inside the app.

You can use it to:

- view your name, role, and email
- update your display name
- upload or change your profile image
- review organizations you belong to
- jump into member management for an organization
- sign out

This page is useful when a user belongs to more than one organization and wants a quick account-level overview.

## Profile Notes

The Security section is currently labeled as coming soon. End users should not rely on it yet for self-service security management.

## Invitations

There are two invitation-related experiences:

1. The personal Invitations page, where you accept invitations sent to you.
2. The organization Members & Invitations page, where authorized users invite other people.

Use the personal page when you are joining someone else’s workspace.
Use the organization page when you are managing your own team.

## Billing

The Billing & Subscription area helps users understand plan and payment status.

What it can show:

- current plan
- whether you are on a free trial
- remaining days in the billing period or trial
- subscription cancellation status
- payment history

Common tasks:

- review current plan
- upgrade plan
- cancel subscription
- view past payments

## Billing Use Cases

- A trial user checks how many days are left before being charged.
- An admin upgrades from trial to a paid plan.
- A finance stakeholder reviews payment history.
- A user confirms whether a subscription has already been cancelled at period end.

## Payment Method Note

The billing screen currently presents payment method messaging, but the visible UI suggests this area may still be light on direct self-service payment method management.

## API Access

The app includes an API Access page for personal access tokens.

The interface is intended for:

- generating tokens
- viewing token names
- seeing expiration information
- checking whether a token is expired

## Important API Access Caveat

The current screen appears partially implemented and may behave more like a placeholder or limited-release feature than a full production token console. End users should treat it as:

- available only if your organization has a supported API workflow
- subject to future changes
- something to confirm with your platform admin before depending on operationally

## When to Use API Access

Use API access only when:

- your team integrates Legal WatchDog with another internal system
- you have been told to use a token-based workflow
- you understand how your organization handles secret storage and rotation

Do not use it casually if your work is entirely in the browser app.

## Sign-Out and Session Management

Users can sign out from:

- their profile area
- the super admin navigation if they have that role

Login also supports a remember-me preference, which helps users keep their session behavior consistent across visits.
