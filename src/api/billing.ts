import axios from 'axios'

import api from '@/lib/api'
import { API_BASE_URL } from '@/lib/config'

export const billingService = {
  getOrganizationSubscriptionStatus: (organizationId: string) =>
    api.get(`/organizations/${organizationId}/billing/subscription`),

  getOrganizationBillingAccount: (organizationId: string) =>
    api.get(`/organizations/${organizationId}/billing`),

  createOrganizationBillingAccount: (organizationId: string) =>
    api.post(`/organizations/${organizationId}/billing/accounts`, {
      currency: 'USD',
    }),

  getPlans: () => axios.get(API_BASE_URL + '/billing/plans'),

  checkout: (organizationId: string, plan_id: string) =>
    api.post(`/organizations/${organizationId}/billing/checkout`, {
      plan_id,
      description: `Subscription for ${organizationId}`,
    }),

  getOrganizationPaymentHistory: (organizationId: string) =>
    api.get(`/organizations/${organizationId}/billing/invoices`),

  changeOrganizationSubscription: (organizationId: string, plan_id: string) =>
    api.post(`/organizations/${organizationId}/billing/subscription/change-plan`, {
      plan_id,
    }),

  cancelOrganizationSubscriptionAtPeriodEnd: (organizationId: string) =>
    api.post(`/organizations/${organizationId}/billing/subscription/cancel`),
}
