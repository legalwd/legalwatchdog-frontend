<script setup lang="ts">
import { RouterLink } from 'vue-router'
// import Icon from '../reusable/Icon.vue'
// import {
//   Facebook02Icon,
//   InstagramIcon,
//   Linkedin02Icon,
//   NewTwitterIcon,
//   YoutubeIcon,
// } from '@hugeicons/core-free-icons'

const products = [
  { label: 'Features', path: '/features' },
  // { label: 'Pricing', path: '/pricing' },
  { label: 'How it Works', path: '/how-it-works' },
  { label: 'FAQ', path: '/faq' },
]

const companies = [
  { label: 'About', path: '/about-us' },
  // { label: 'Contact us', path: '/contact-us' },
  // { label: 'Careers', path: '/careers' },
  // { label: 'Blog', path: '/blog' },
]

const supports = [
  { label: 'Help center', path: '/help-center' },
  { label: 'Contact Us', path: '/contact-us' },
]

const privacys = [
  { label: 'Privacy Policy', path: '/privacy-policy' },
  { label: 'Terms of Service', path: '/terms' },
]
</script>

<template>
  <footer class="bg-background border-t border-gray-100">
    <div class="app-container mx-auto px-6 pt-16 pb-6 lg:px-0">
      <div class="mb-12">
        <div class="flex items-center gap-3">
          <img
            src="/images/logo.png"
            alt="Legal Watch Dog logo"
            class="h-10 w-auto object-contain"
            loading="lazy"
          />

          <h2 class="text-primary text-lg font-bold">Watch Dog</h2>
        </div>

        <p class="mt-3 text-sm font-semibold">
          Legal WatchDog helps us track cross-border regulation updates in hours, not weeks.
        </p>
      </div>

      <div class="mb-12 border-t border-gray-300"></div>

      <nav aria-label="Footer navigation">
        <div class="grid grid-cols-2 gap-y-10 md:mb-24 md:grid-cols-3 lg:grid-cols-4 lg:gap-8">
          <!-- PRODUCT -->
          <div>
            <h3 class="text-primary mb-5 text-base font-bold">Product</h3>
            <ul class="text-muted space-y-3 text-sm">
              <li v-for="(item, i) in products" :key="i">
                <router-link :to="item.path" class="hover:text-foreground">
                  {{ item.label }}
                </router-link>
              </li>
            </ul>
          </div>

          <!-- COMPANY -->
          <div>
            <h3 class="text-primary mb-5 text-base font-bold">Company</h3>
            <ul class="text-muted space-y-3 text-sm">
              <li v-for="(item, i) in companies" :key="i">
                <router-link :to="item.path" class="hover:text-foreground">
                  {{ item.label }}
                </router-link>
              </li>
            </ul>
          </div>

          <!-- SUPPORT -->
          <div>
            <h3 class="text-primary mb-5 text-base font-bold">Support</h3>
            <ul class="text-muted space-y-3 text-sm">
              <li v-for="(item, i) in supports" :key="i">
                <router-link :to="item.path" class="hover:text-foreground">
                  {{ item.label }}
                </router-link>
              </li>
            </ul>
          </div>

          <!-- PRIVACY (now comes BEFORE subscribe on mobile) -->
          <div class="order-4 md:order-4">
            <h3 class="text-primary mb-5 text-base font-bold">Privacy</h3>
            <ul class="text-muted space-y-3 text-sm">
              <li v-for="(item, i) in privacys" :key="i">
                <router-link :to="item.path" class="hover:text-foreground">
                  {{ item.label }}
                </router-link>
              </li>
            </ul>
          </div>

          <!-- SUBSCRIBE (now LAST on mobile) -->
          <!-- <div class="order-5 col-span-2 md:order-5 lg:col-span-1">
            <h3 class="mb-5 text-base font-bold text-primary">Subscribe to our newsletter</h3>
            <p class="mb-4 text-sm ">
              Join our newsletter to get early alerts on regulation updates, price fluctuations, and
              compliance insights that matter to your business.
            </p>

            <form class="space-y-3">
              <input
                type="email"
                placeholder="Enter your email"
                class="w-full rounded border px-4 py-3 text-sm placeholder-gray-400 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                required
              />
              <button
                type="submit"
                class="w-full rounded bg-primary px-4 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-[#3F1A0F] lg:w-1/2"
              >
                Subscribe
              </button>
            </form>
          </div> -->
        </div>
      </nav>

      <div
        class="mt-12 flex flex-col items-center justify-between border-t pt-6 text-sm md:flex-row"
      >
        <p class="text-primary mb-4 md:mb-0">
          Copyright &copy; 2025 Legal WatchDog | All Rights Reserved
        </p>

        <!-- <div class="flex items-center space-x-4 text-lg text-[#5D2D18]">
          <a href="#" aria-label="Facebook" class="transition duration-150 hover:text-black">
            <Icon :icon="Facebook02Icon" :size="20" color="var(--color-primary)" />
          </a>
          <a href="#" aria-label="Twitter" class="transition duration-150 hover:text-black">
            <Icon :icon="NewTwitterIcon" :size="20" color="var(--color-primary)" />
          </a>
          <a href="#" aria-label="Instagram" class="transition duration-150 hover:text-black">
            <Icon :icon="InstagramIcon" :size="20" color="var(--color-primary)" />
          </a>
          <a href="#" aria-label="LinkedIn" class="transition duration-150 hover:text-black">
            <Icon :icon="Linkedin02Icon" :size="20" color="var(--color-primary)" />
          </a>
          <a href="#" aria-label="YouTube" class="transition duration-150 hover:text-black">
            <Icon :icon="YoutubeIcon" :size="20" color="var(--color-primary)" />
          </a>
        </div> -->
      </div>
    </div>
  </footer>
</template>
