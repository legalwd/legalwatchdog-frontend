export const routes = [
  {
    path: '/billing/cancel',
    name: 'billing-cancel',
    component: () => import('@/views/dashboard/payments/CancelView.vue'),
    meta: { requiresAuth: true, title: 'Billing Cancelled' },
  },
  {
    path: '/billing/success',
    name: 'billing-success',
    component: () => import('@/views/dashboard/payments/SuccessView.vue'),
    meta: { requiresAuth: true, title: 'Billing Success' },
  },
  {
    path: '/',
    name: 'landing',
    component: () => import('@/layout/LandingLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/views/HomeView.vue'),
        meta: { title: 'Home' },
      },
      {
        path: 'demo',
        name: 'squeeze',
        component: () => import('@/views/SqueezePageView.vue'),
        meta: { title: 'Book a Demo' },
      },
      {
        path: 'about-us',
        name: 'about-us',
        component: () => import('@/views/AboutUsView.vue'),
        meta: { title: 'About Us' },
      },
      {
        path: 'contact-us',
        name: 'contact-us',
        component: () => import('@/views/ContactView.vue'),
        meta: { title: 'Contact Us' },
      },
      // { path: 'careers', name: 'careers', component: () => import('@/views/CareersView.vue') },
      {
        path: 'help-center',
        name: 'help-center',
        component: () => import('@/components/external-pages/HelpCenter.vue'),
        meta: { title: 'Help Center' },
      },
      {
        path: 'terms',
        name: 'terms',
        component: () => import('@/components/external-pages/Terms.vue'),
        meta: { title: 'Terms and Conditions' },
      },

      {
        path: 'features',
        name: 'features',
        component: () => import('@/components/external-pages/Features.vue'),
        meta: { title: 'Features' },
      },
      // { path: 'waitlist', name: 'waitlist', component: () => import('@/views/WaitlistView.vue') },
      /* {
        path: 'request-demo',
        name: 'request-demo',
        component: () => import('@/views/RequestDemoView.vue'),
      }, */

      {
        path: 'how-it-works',
        name: 'how-it-works',
        component: () => import('@/views/HowItWorksView.vue'),
        meta: { title: 'How It Works' },
      },
      {
        path: 'privacy-policy',
        name: 'privacy-policy',
        component: () => import('@/views/PrivacyPolicyView.vue'),
        meta: { title: 'Privacy Policy' },
      },
      {
        path: 'faq',
        name: 'faq',
        component: () => import('@/views/FAQView.vue'),
        meta: { title: 'FAQ' },
      },
      { path: 'blog', name: 'blog', component: () => import('@/views/BlogView.vue') },
      {
        path: 'blog/:slug',
        name: 'blog-detail',
        component: () => import('@/views/BlogDetailView.vue'),
        props: true,
      },
      {
        path: 'resources/:resourcePath(.*)*',
        name: 'blog-resource-detail',
        component: () => import('@/views/BlogDetailView.vue'),
        props: true,
      },
      {
        path: 'guides/:industry',
        name: 'guides-industry',
        component: () => import('@/views/guides/GuidesIndustryView.vue'),
        meta: { title: 'Industry Guides' },
      },
      {
        path: 'guides/:industry/:region',
        name: 'guides-region',
        component: () => import('@/views/guides/GuidesRegionView.vue'),
        meta: { title: 'Region Jurisdictions' },
      },
      {
        path: 'guides/:industry/:region/:jurisdiction',
        name: 'guides-jurisdiction-detail',
        component: () => import('@/views/guides/GuidesJurisdictionDetailView.vue'),
        meta: { title: 'Jurisdiction Detail' },
      },
      /* {
        path: 'pricing',
        name: 'pricing',
        component: () => import('@/views/PricingView.vue'),
      }, */
      {
        path: 'onboarding',
        name: 'onboarding',
        component: () => import('@/views/OnboardingView.vue'),
        meta: { title: 'Onboarding' },
      },
      {
        path: 'guest/access',
        name: 'guest-access',
        component: () => import('@/views/guest/GuestAccessView.vue'),
        meta: { title: 'Guest Access' },
      },
    ],
  },
  {
    path: '/',
    component: () => import('@/layout/AuthLayout.vue'),
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('@/views/authentication/LoginView.vue'),
        meta: { title: 'Login' },
      },
      {
        path: 'create-organization',
        name: 'create-organization',
        component: () => import('@/views/authentication/CreateOrganizationView.vue'),
        meta: { requiresAuth: true, title: 'Create Organization' },
      },
      {
        path: 'account-pending-approval',
        name: 'account-pending-approval',
        component: () => import('@/views/authentication/AccountPendingApprovalView.vue'),
        meta: { requiresAuth: true, title: 'Account Pending Approval' },
      },
      {
        path: 'signup',
        name: 'signup',
        component: () => import('@/views/authentication/SignupView.vue'),
        meta: { title: 'Sign Up' },
      },
      {
        path: 'forgot-password',
        name: 'forgot-password',
        component: () => import('@/views/authentication/ForgotPasswordView.vue'),
        meta: { title: 'Forgot Password' },
      },
      {
        path: 'reset-password',
        name: 'reset-password',
        component: () => import('@/views/authentication/ResetPasswordView.vue'),
        meta: { title: 'Reset Password' },
      },
      {
        path: 'otp',
        name: 'otp',
        component: () => import('@/views/authentication/OtpView.vue'),
        meta: { title: 'Verify OTP' },
      },
      {
        path: 'auth-status',
        name: 'auth-status',
        component: () => import('@/views/authentication/AuthStatusView.vue'),
        alias: '/success',
        meta: { title: 'Authentication Status' },
      },
      {
        path: 'auth/google/callback',
        name: 'google-callback',
        component: () => import('@/views/authentication/GoogleCallbackView.vue'),
        meta: { title: 'Google Sign-In' },
      },
      {
        path: 'auth/accept-invite/:token',
        name: 'accept-org-invite',
        component: () => import('@/views/authentication/AcceptInviteView.vue'),
        meta: { title: 'Accept Invitation' },
      },
    ],
  },
  // Super Admin routes (dedicated layout)
  {
    path: '/super-admin',
    component: () => import('@/layout/SuperAdminLayout.vue'),
    meta: { requiresSuperAdmin: true, title: 'Super Admin' },
    children: [
      {
        path: 'login',
        name: 'super-admin-login',
        component: () => import('@/views/super-admin/authentication/LoginView.vue'),
        meta: { title: 'Super Admin Login' },
      },
      {
        path: '',
        name: 'super-admin-overview',
        component: () => import('@/views/super-admin/OverviewView.vue'),
        meta: { requiresAuth: true, requiresSuperAdmin: true, title: 'Super Admin Overview' },
      },
      {
        path: 'customers',
        name: 'super-admin-customers',
        component: () => import('@/views/super-admin/CustomersView.vue'),
        meta: { requiresAuth: true, requiresSuperAdmin: true, title: 'Customers' },
      },
      {
        path: 'blog',
        name: 'super-admin-blog',
        component: () => import('@/views/super-admin/blog/BlogView.vue'),
        meta: { requiresAuth: true, requiresSuperAdmin: true, title: 'Blog Generation' },
      },
      {
        path: 'blog/posts/:organizationId/:jurisdictionId',
        name: 'super-admin-blog-post',
        component: () => import('@/views/super-admin/blog/SingleBlogPostView.vue'),
        meta: { requiresAuth: true, requiresSuperAdmin: true, title: 'Blog Post' },
      },
      {
        path: 'campaigns',
        name: 'super-admin-campaigns',
        component: () => import('@/views/super-admin/campaigns/CampaignsView.vue'),
        meta: { requiresAuth: true, requiresSuperAdmin: true, title: 'Campaigns' },
      },
      {
        path: 'campaigns/:id',
        name: 'super-admin-campaign-detail',
        component: () => import('@/views/super-admin/campaigns/CampaignDetailView.vue'),
        meta: { requiresAuth: true, requiresSuperAdmin: true, title: 'Campaign Details' },
      },
      {
        path: 'campaigns/:id/taxonomy',
        name: 'super-admin-campaign-taxonomy',
        component: () => import('@/views/super-admin/campaigns/CampaignTaxonomyView.vue'),
        meta: { requiresAuth: true, requiresSuperAdmin: true, title: 'Campaign Taxonomy' },
      },
    ],
  },

  {
    path: '/app',
    component: () => import('@/layout/DashboardLayout.vue'),
    meta: { requiresAuth: true, title: 'Dashboard' },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('@/views/dashboard/DashboardEntryView.vue'),
        alias: 'dashboard',
        meta: { title: 'Dashboard' },
      },
      {
        path: 'organizations',
        name: 'organizations',
        component: () => import('@/views/dashboard/organization/OrganizationView.vue'),
        alias: '/organizations',
        meta: { title: 'Organizations' },
      },
      {
        path: 'invitations',
        name: 'invitations',
        component: () => import('@/views/dashboard/InvitationsView.vue'),
        alias: '/invitations',
        meta: { title: 'Invitations' },
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('@/views/dashboard/profile/ProfileView.vue'),
        meta: { title: 'Profile' },
      },
      {
        path: 'organizations/:organizationId',
        name: 'organization-profile',
        component: () => import('@/views/dashboard/organization/OrganizationProfileView.vue'),
        meta: { title: 'Organization Profile' },
      },
      {
        path: 'organizations/:organizationId/members',
        name: 'organization-members',
        component: () => import('@/views/dashboard/organization/OrganizationMembersView.vue'),
        alias: [
          '/organizations/:organizationId/members',
          '/organizations/:organizationId/invitations',
        ],
        meta: { title: 'Organization Members' },
      },
      {
        path: 'organizations/:organizationId/projects',
        name: 'organization-projects',
        component: () => import('@/views/dashboard/ProjectView.vue'),
        meta: { title: 'Projects' },
      },
      {
        path: 'organizations/:organizationId/projects/:id',
        name: 'project-detail',
        component: () => import('@/views/dashboard/projects/SingleProjectView.vue'),
        meta: { title: 'Project Details' },
      },
      {
        path: 'jurisdictions',
        name: 'jurisdictions',
        component: () => import('@/views/dashboard/JurisdictionView.vue'),
        alias: '/jurisdictions',
        meta: { title: 'Jurisdictions' },
      },
      {
        path: 'jurisdictions/:id',
        name: 'jurisdiction-detail',
        component: () => import('@/views/dashboard/jurisdictions/Jurisdiction.vue'),
        meta: { title: 'Jurisdiction Details' },
      },
      {
        path: 'jurisdictions/archive',
        name: 'jurisdictions-archive',
        component: () => import('@/views/dashboard/jurisdictions/archive.vue'),
        meta: { title: 'Archived Jurisdictions' },
      },
      {
        path: 'jurisdictions/:id/sources',
        name: 'jurisdiction-sources',
        component: () => import('@/views/dashboard/jurisdictions/sources/Source.vue'),
        meta: { title: 'Jurisdiction Sources' },
      },
      {
        path: 'settings/billing',
        name: 'billing',
        component: () => import('@/views/dashboard/settings/BillingView.vue'),
        meta: { title: 'Billing Settings' },
      },
      {
        path: 'tickets',
        name: 'tickets',
        component: () => import('@/views/dashboard/tickets/AssignedTicket.vue'),
        meta: { title: 'Tickets' },
      },
      {
        path: 'tickets/:ticketId',
        name: 'ticket-detail',
        component: () => import('@/views/dashboard/tickets/TicketDetail.vue'),
        meta: { title: 'Ticket Details' },
      },
      {
        path: 'tickets/:ticketId/invited-users',
        name: 'ticket-invited-users',
        component: () => import('@/views/dashboard/tickets/TicketInvitesView.vue'),
        meta: { title: 'Invited Users' },
      },
      {
        path: 'payment/plan',
        name: 'payment-plan',
        component: () => import('@/views/dashboard/payments/PlanView.vue'),
        meta: { title: 'Choose Plan' },
      },
      {
        path: 'api',
        name: 'api-access',
        component: () => import('@/views/dashboard/api/APIAccessView.vue'),
        meta: { title: 'API Access' },
      },
    ],
  },
  {
    path: '/dashboard/:pathMatch(.*)*',
    redirect: (to: { params: { pathMatch?: string } }) => {
      const rest = to.params.pathMatch ? `/${to.params.pathMatch}` : ''
      return `/app${rest}`
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: 'Page Not Found' },
  },
]
