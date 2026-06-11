<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

type Section = {
  id: string
  label: string
}

const sections: Section[] = [
  { id: 'introduction', label: 'Introduction' },
  { id: 'information-we-collect', label: 'Information We Collect' },
  { id: 'use-of-information', label: 'How We Use Information' },
  { id: 'legal-basis', label: 'Regulatory Basis for Processing' },
  { id: 'data-sharing', label: 'How We Share Information' },
  { id: 'data-retention', label: 'Data Storage & Retention' },
  { id: 'security', label: 'Security Measures' },
  { id: 'rights', label: 'Your Rights' },
  { id: 'ai-transparency', label: 'AI Transparency' },
  { id: 'international-transfers', label: 'International Data Transfers' },
  { id: 'children', label: "Children's Privacy" },
  { id: 'updates', label: 'Updates to this Policy' },
  { id: 'contact', label: 'Contact Information' },
]

const activeSection = ref(sections[0]?.id)
let observer: IntersectionObserver | null = null

const setActiveSection = (id: string) => {
  activeSection.value = id
}

onMounted(() => {
  if (typeof window === 'undefined') return

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id)
        }
      })
    },
    {
      rootMargin: '-10% 0px -50% 0px',
      threshold: 0,
    },
  )

  sections.forEach(({ id }) => {
    const el = document.getElementById(id)
    if (el) observer?.observe(el)
  })
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
})
</script>

<template>
  <div class="relative flex min-h-screen flex-col">
    <main class="relative z-10 flex-1">
      <section
        class="app-container mx-auto flex w-full flex-col gap-10 px-4 py-14 sm:px-6 lg:flex-row lg:gap-14 lg:py-20"
      >
        <aside
          class="sticky top-24 z-10 hidden w-64 shrink-0 self-start lg:block"
          aria-label="Privacy policy sections"
        >
          <nav class="mt-4 space-y-1" aria-label="On-page navigation">
            <a
              v-for="section in sections"
              :key="section.id"
              :href="`#${section.id}`"
              class="focus-visible:ring-primary decoration-accent group flex items-center gap-2 rounded-xl py-2 text-sm font-medium underline-offset-4 transition-all duration-150 focus-visible:ring-2 focus-visible:ring-offset-2"
              :class="{
                'text-accent pl-2 underline': activeSection === section.id,
                'text-muted hover:underline': activeSection !== section.id,
              }"
              :aria-current="activeSection === section.id ? 'true' : undefined"
              @click="setActiveSection(section.id)"
            >
              <span>{{ section.label }}</span>
            </a>
          </nav>
        </aside>

        <div class="app-container w-full space-y-10">
          <header class="space-y-3">
            <div>
              <h1 class="text-foregroud text-4xl font-bold sm:text-[60px]">Privacy Policy</h1>
              <p class="font-medium sm:text-[36px]">How we handle and protect your data</p>
              <p class="text-gray-400 sm:text-[16px]">Last updated: 20th January, 2026.</p>
            </div>
          </header>

          <div class="policy-content grid gap-10 lg:grid-cols-[minmax(0,1fr)]">
            <nav class="lg:hidden" aria-label="Privacy policy sections (mobile)">
              <div
                class="bg-background flex flex-col gap-2 overflow-x-auto rounded-xl border border-[accent] p-3"
              >
                <a
                  v-for="section in sections"
                  :key="section.id"
                  :href="`#${section.id}`"
                  class="rounded-full px-4 py-2 text-xs font-medium whitespace-nowrap transition-colors duration-150"
                  :class="
                    activeSection === section.id
                      ? 'text-primary bg-accent-background'
                      : 'text-muted hover:bg-accent-background'
                  "
                  :aria-current="activeSection === section.id ? 'true' : undefined"
                  @click="setActiveSection(section.id)"
                >
                  {{ section.label }}
                </a>
              </div>
            </nav>

            <section id="introduction" class="space-y-4">
              <div>
                <h2 class="text-primary text-2xl font-bold">Introduction</h2>
                <p class="mt-2">
                  Legal Watchdog provides automated regulatory monitoring, source tracking, and
                  AI-powered summarization for enterprise teams. <br />This Privacy Policy explains
                  how we collect, use, store, and protect information when organizations use our
                  platform. By creating an account or accessing the service, you agree to this
                  policy.
                </p>
              </div>
            </section>

            <section id="information-we-collect" class="space-y-6">
              <div class="space-y-3">
                <h2 class="text-primary text-2xl font-bold">Information We Collect</h2>
                <p class="">We collect information to provide and improve our services.</p>
              </div>

              <div class="text-muted space-y-6">
                <div class="space-y-2">
                  <h3 class="text-primary text-lg font-semibold">
                    A. Company &amp; Account Information
                  </h3>
                  <p class="">We may collect:</p>
                  <ul class="mt-2 list-disc space-y-1 pl-6">
                    <li>Company name</li>
                    <li>Work email</li>
                    <li>Industry</li>
                    <li>Company size</li>
                    <li>Admin details</li>
                    <li>User roles and permissions within the organization</li>
                  </ul>
                </div>

                <div class="space-y-2">
                  <h3 class="text-primary text-lg font-semibold">B. Platform Usage Data</h3>
                  <p class="">This includes:</p>
                  <ul class="mt-2 list-disc space-y-1 pl-6">
                    <li>Created projects and jurisdictions</li>
                    <li>Added sources (URLs, files, documents)</li>
                    <li>Sub-jurisdiction selections</li>
                    <li>AI instructions or monitoring preferences</li>
                    <li>Activity logs (views, uploads, edits, assignments)</li>
                  </ul>
                </div>

                <div class="space-y-2">
                  <h3 class="text-primary text-lg font-semibold">C. Uploaded Documents</h3>
                  <p class="">If your team uploads documents, we store:</p>
                  <ul class="mt-2 list-disc space-y-1 pl-6">
                    <li>Internal compliance files</li>
                    <li>Regulatory documents</li>
                    <li>Regulatory filings</li>
                    <li>News articles</li>
                  </ul>
                </div>

                <div class="space-y-2">
                  <h3 class="text-primary text-lg font-semibold">
                    D. Automatically Collected Technical Data
                  </h3>
                  <p class="">This includes:</p>
                  <ul class="mt-2 list-disc space-y-1 pl-6">
                    <li>Device type</li>
                    <li>Browser and OS</li>
                    <li>IP address</li>
                    <li>Session logs</li>
                    <li>Time of access</li>
                    <li>Performance logs</li>
                    <li>Security events</li>
                  </ul>
                </div>

                <div class="space-y-2">
                  <h3 class="text-primary text-lg font-semibold">E. AI Processing Data</h3>
                  <p class="">To provide accurate monitoring:</p>
                  <ul class="mt-2 list-disc space-y-1 pl-6">
                    <li>Extracted text from scanned sources</li>
                    <li>AI-generated summaries</li>
                    <li>Content-derived scores</li>
                    <li>Detected website changes</li>
                  </ul>
                </div>

                <div class="space-y-2">
                  <h3 class="text-primary text-lg font-semibold">
                    F. Cookies &amp; Tracking Technologies
                  </h3>
                  <p class="">We use:</p>
                  <ul class="mt-2 list-disc space-y-1 pl-6">
                    <li>Session cookies</li>
                    <li>Analytics cookies</li>
                    <li>Preference cookies</li>
                  </ul>
                </div>
              </div>
            </section>

            <section id="use-of-information" class="space-y-4">
              <div>
                <h2 class="text-primary text-2xl font-bold">How We Use Information</h2>
                <p class="mt-2">We process data to:</p>
              </div>
              <ul class="text-muted list-disc space-y-2 pl-6">
                <li>Create and manage enterprise accounts</li>
                <li>Track regulatory sources</li>
                <li>Detect changes and issue alerts</li>
                <li>Generate AI summaries</li>
                <li>Power the dashboard and reporting features</li>
                <li>Provide customer support</li>
                <li>Improve service accuracy and reliability</li>
                <li>Ensure security and prevent fraud</li>
              </ul>
            </section>

            <section id="legal-basis" class="space-y-4">
              <div>
                <h2 class="text-primary text-2xl font-bold">Basis for Processing</h2>
                <p class="mt-2">Depending on your region, we rely on:</p>
              </div>
              <ul class="text-muted list-disc space-y-2 pl-6">
                <li>Performance of a contract</li>
                <li>Legitimate business interest</li>
                <li>Compliance with obligations</li>
                <li>Consent for optional analytics</li>
              </ul>
            </section>

            <section id="data-sharing" class="space-y-4">
              <div>
                <h2 class="text-primary text-2xl font-bold">How We Share Information</h2>
                <p class="mt-2">We may share information with:</p>
              </div>
              <ul class="text-muted list-disc space-y-2 pl-6">
                <li>Authorized users within your organization</li>
                <li>External partners added to tickets or reviews</li>
                <li>Service providers (hosting, data processing, AI processing)</li>
                <li>Authorities if required by law</li>
              </ul>
              <p class="">We do not sell personal data.</p>
            </section>

            <section id="data-retention" class="space-y-4">
              <div>
                <h2 class="text-primary text-2xl font-bold">Data Storage &amp; Retention</h2>
                <p class="mt-2">We store all information securely and retain:</p>
              </div>
              <ul class="text-muted list-disc space-y-2 pl-6">
                <li>
                  Projects, activity logs, and documents as long as your account remains active
                </li>
                <li>Deleted account data for a limited period for compliance purposes</li>
                <li>Scan history for audit-tracking unless requested to be removed</li>
              </ul>
            </section>

            <section id="security" class="space-y-4">
              <div>
                <h2 class="text-primary text-2xl font-bold">Security Measures</h2>
                <p class="mt-2">We use enterprise-grade security:</p>
              </div>
              <ul class="text-muted list-disc space-y-2 pl-6">
                <li>Encryption at rest and in transit</li>
                <li>Access control &amp; RBAC</li>
                <li>Audit logs</li>
                <li>Two-factor authentication</li>
                <li>Network-level security</li>
                <li>Regular penetration testing</li>
              </ul>
            </section>

            <section id="rights" class="space-y-4">
              <div>
                <h2 class="text-primary text-2xl font-bold">Your Rights</h2>
                <p class="mt-2">Depending on your jurisdiction, you may request to:</p>
              </div>
              <ul class="text-muted list-disc space-y-2 pl-6">
                <li>Access your data</li>
                <li>Update or correct information</li>
                <li>Delete your data</li>
                <li>Export your data</li>
                <li>Limit or object to certain processing</li>
              </ul>
            </section>

            <section id="ai-transparency" class="space-y-4">
              <div>
                <h2 class="text-primary text-2xl font-bold">AI Transparency</h2>
                <p class="mt-2">Legal WatchDog uses AI to:</p>
              </div>
              <ul class="text-muted list-disc space-y-2 pl-6">
                <li>Parse regulatory websites</li>
                <li>Compare changes between versions</li>
                <li>Generate summaries</li>
              </ul>
              <p class="">
                All outputs are provided to assist your team but should not replace review. We do
                not use your private data to train public AI models.
              </p>
            </section>

            <section id="international-transfers" class="space-y-4">
              <div>
                <h2 class="text-primary text-2xl font-bold">International Data Transfers</h2>
                <p class="mt-2">
                  Data may be processed in other countries using secure frameworks like SCCs.
                </p>
              </div>
            </section>

            <section id="children" class="space-y-4">
              <div>
                <h2 class="text-primary text-2xl font-bold">Children's Privacy</h2>
                <p class="mt-2">Our services are not intended for children under 16.</p>
              </div>
            </section>

            <section id="updates" class="space-y-4">
              <div>
                <h2 class="text-primary text-2xl font-bold">Updates to this Policy</h2>
                <p class="mt-2">
                  We may update this policy and notify organizations of major changes.
                </p>
              </div>
            </section>

            <section id="contact" class="space-y-4">
              <div>
                <h2 class="text-primary text-2xl font-bold">Contact Information</h2>
                <p class="mt-2">For privacy concerns, contact:</p>
                <p class="text-muted">
                  Email:
                  <a
                    class="text-accent hover:text-peach-amber-500 underline decoration-2 underline-offset-2"
                    href="mailto:privacy@legalwatchdog.com"
                  >
                    privacy@legalwatchdog.com
                  </a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.policy-content section {
  scroll-margin-top: 140px;
}

@media (min-width: 1024px) {
  .policy-content section {
    scroll-margin-top: 180px;
  }
}
</style>
