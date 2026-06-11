<script setup lang="ts">
const termsContent = [
  {
    id: 'A',
    title: 'Accepting Terms and Conditions',
    preamble:
      'By creating an account, accessing the Platform, or using any of our features, you confirm that:',
    items: [
      'You have read and understood these Terms.',
      'You are at least 18 years old, or have legal permission to use the service.',
      'You have the authority to accept these terms on behalf of yourself or your organization.',
    ],
    note: null,
  },
  {
    id: 'B',
    title: 'Description of Service',
    preamble: 'The platform offers the following services:',
    items: [
      'Monitoring legal, compliance, and policy changes across selected sources.',
      'Tracking updates across jurisdictions.',
      'Generating summaries using AI.',
      'Sending notifications or alerts when changes occur.',
      'Managing projects, sources, and data insights.',
    ],
    note: 'We may update or improve our services periodically.',
  },
  {
    id: 'C',
    title: 'User Responsibilities',
    preamble: 'You agree to:',
    items: [
      'Provide accurate and complete information during registration.',
      'Use the Platform in compliance with applicable laws and regulations.',
      'Not misuse, modify, disrupt, or interfere with the Platform.',
      'Maintain confidentiality of your login credentials.',
      'Ensure you have rights to upload any content or data provided.',
    ],
    note: 'You are responsible for all activity under your account.',
  },
  {
    id: 'D',
    title: 'Data, Content & AI-generated Outputs',
    preamble: 'You acknowledge that:',
    items: [
      'AI-generated outputs may contain errors or omissions.',
      'You are responsible for independently verifying critical legal information.',
      'We do not provide legal advice.',
    ],
    note: 'Outputs are for informational purposes only.',
  },
  {
    id: 'E',
    title: 'Source Scraping & Monitoring',
    preamble: null,
    items: [
      'We only scrape or process sources you add to your project',
      'Some websites may restrict or prevent scraping.',
      'Results may vary based on website availability or structure.',
      'Scraping frequency is based on your selected configuration.',
    ],
    note: 'We do not guarantee 100% data accuracy or availability.',
  },
]
</script>

<template>
  <div class="terms-page relative flex min-h-screen flex-col overflow-hidden">
    <main class="relative grow">
      <div class="mx-auto max-w-4xl px-6 py-20 lg:px-8">
        <h1 class="mb-2 text-4xl font-extrabold md:text-5xl">Terms and Conditions</h1>
        <p class="text-sm">Last updated 25th November, 2025</p>

        <div class="md:p-12">
          <h2 class="mb-4 text-2xl font-medium">
            Welcome to Legal Watch Dog Terms and Conditions.
          </h2>
          <p class="mb-4">
            These Terms and conditions outline the rules and conditions that govern your use of our
            website, web application and related services. By accepting or using our platform, you
            agree to comply with these terms.
          </p>
          <p class="mb-16">
            Please if you do not agree, please discontinue use immediately. By creating an account
            or accessing the service, you agree to this policy.
          </p>

          <section v-for="(section, index) in termsContent" :key="index" class="text-muted mb-8">
            <h2 class="mb-4 text-xl font-semibold">{{ section.id }}. {{ section.title }}</h2>

            <p v-if="section.preamble" tone="muted" class="mb-3 block">
              {{ section.preamble }}
            </p>

            <ul class="list-none space-y-1 pl-4">
              <li
                v-for="(item, i) in section.items"
                :key="i"
                class="text-muted relative list-disc before:absolute"
              >
                {{ item }}
              </li>
            </ul>

            <p v-if="section.note" class="text-primary mt-4 block">
              {{ section.note }}
            </p>
          </section>
        </div>
      </div>
    </main>
  </div>
</template>
