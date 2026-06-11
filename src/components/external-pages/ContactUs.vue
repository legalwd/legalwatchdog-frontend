<script setup lang="ts">
import { Location06Icon, Mail01Icon } from '@hugeicons/core-free-icons'
import { reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { toast } from 'vue-sonner'

import { submitContactForm } from '@/api/contact-us'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { ContactUsApiPayload } from '@/types/contact-us'

import Icon from '../reusable/Icon.vue'
import { Checkbox } from '../ui/checkbox'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'

interface ContactUsPayload {
  fullName: string
  phoneNumber: string
  email: string
  message: string
  agreement: boolean
}

const form = reactive<ContactUsPayload>({
  fullName: '',
  phoneNumber: '',
  email: '',
  message: '',
  agreement: false,
})

const errors = reactive({
  fullName: '',
  phoneNumber: '',
  email: '',
  message: '',
  agreement: '',
})

const isSubmitting = ref(false)
const characterCount = ref(0)
const maxCharacters = 800

const updateCharacterCount = () => {
  characterCount.value = form.message.length
}

const validateForm = () => {
  let isValid = true

  errors.fullName = ''
  errors.phoneNumber = ''
  errors.email = ''
  errors.message = ''
  errors.agreement = ''

  if (!form.fullName.trim()) {
    errors.fullName = 'Full name is required'
    isValid = false
  }

  if (!form.phoneNumber.trim()) {
    errors.phoneNumber = 'Phone number is required'
    isValid = false
  } else if (!/^[0-9\s\-\+\(\)]+$/.test(form.phoneNumber)) {
    errors.phoneNumber = 'Phone number can only contain numbers and special characters'
    isValid = false
  }

  if (!form.email.trim()) {
    errors.email = 'Email is required'
    isValid = false
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = 'Invalid email format'
    isValid = false
  }

  if (!form.message.trim()) {
    errors.message = 'Message is required'
    isValid = false
  }

  if (!form.agreement) {
    errors.agreement = 'You must agree to the terms'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) return
  if (isSubmitting.value) return

  isSubmitting.value = true

  try {
    const payload: ContactUsApiPayload = {
      full_name: form.fullName,
      phone_number: form.phoneNumber,
      email: form.email,
      message: form.message,
    }

    const response = await submitContactForm(payload)

    // Reset form on success
    form.fullName = ''
    form.phoneNumber = ''
    form.email = ''
    form.message = ''
    form.agreement = false
    characterCount.value = 0

    toast.success(response.data?.message ?? 'Your message has been sent successfully.')
  } catch (error: unknown) {
    const axiosError = error as {
      response?: { data?: { message?: string; errors?: { [key: string]: string[] } } }
      message?: string
    }

    const msgs: string[] = []

    if (axiosError.message) msgs.push(axiosError.message)

    if (axiosError.response?.data?.errors?.phone_number) {
      msgs.push(...axiosError.response.data.errors.phone_number)
    }

    if (axiosError.response?.data?.errors?.email) {
      msgs.push(...axiosError.response.data.errors.email)
    }

    if (axiosError.response?.data?.errors?.message) {
      msgs.push(
        ...axiosError.response.data.errors.message.map((err) => err.replace(/string/gi, 'Message')),
      )
    }

    const finalMessage =
      msgs.length > 0
        ? msgs.join('\n')
        : 'An error occurred while submitting the form. Please try again later.'

    toast.error(finalMessage)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="relative min-h-screen overflow-hidden py-8 sm:py-12 lg:py-16">
    <!-- Content Container -->
    <div class="app-container relative z-10">
      <div class="mx-auto">
        <div class="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <!-- Left Column - Contact Info -->
          <div class="flex flex-col">
            <h1 class="mb-4 text-3xl font-bold sm:text-4xl lg:text-[48px]">Contact Us</h1>

            <p class="mb-8 max-w-md text-sm leading-relaxed sm:mb-10 sm:text-base lg:mb-12">
              Have any enquiry? You have come to the right place. Get in touch with us through the
              form and we will get back to you as soon as possible.
            </p>

            <!-- Contact Info Items -->
            <div class="flex flex-col gap-5 sm:gap-6">
              <!-- Email -->
              <div class="flex items-start gap-3 sm:items-center sm:gap-4">
                <div
                  class="bg-accent flex h-10 w-10 shrink-0 items-center justify-center rounded-full sm:h-12 sm:w-12"
                >
                  <Icon :icon="Mail01Icon" :size="24" color="white" />
                </div>
                <div class="flex flex-col justify-center">
                  <p class="mt-3 text-sm font-medium sm:text-base lg:mt-0">info@emerj.net</p>
                </div>
              </div>

              <!-- Office Address -->
              <div class="flex items-start gap-3 sm:items-center sm:gap-4">
                <div
                  class="bg-accent flex h-10 w-10 shrink-0 items-center justify-center rounded-full sm:h-12 sm:w-12"
                >
                  <Icon :icon="Location06Icon" :size="24" color="white" />
                </div>
                <div class="flex flex-col justify-center">
                  <p class="mt-3 text-sm font-medium sm:text-base lg:mt-0">
                    Emerj LLC 30 N Gould St Ste R, Sheridan,<br />
                    Wyoming, 82801, United States
                  </p>
                </div>
              </div>

              <!-- Phone -->
              <!-- <div class="flex items-start gap-3 sm:items-center sm:gap-4">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full sm:h-12 sm:w-12"
                style="background: #f1a75f">
                <img :src="PhoneIcon" alt="Phone" class="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div class="flex flex-col justify-center">
                <p class="mt-3 text-sm font-medium  sm:text-base lg:mt-0">
                  +44 123 654 7890
                </p>
              </div>
            </div> -->
            </div>
          </div>

          <!-- Right Column - Form -->
          <div class="bg-background flex flex-col rounded-4xl px-4 py-8 sm:px-8 sm:py-12">
            <form class="flex flex-col gap-5 sm:gap-6" @submit.prevent="handleSubmit">
              <!-- Full Name -->
              <div>
                <Label for="fullName" class="mb-2 block text-sm font-medium"> Full Name </Label>
                <Input id="fullName" v-model="form.fullName" type="text" placeholder="John Doe" />
                <p v-if="errors.fullName" class="text-error mt-1 text-sm">
                  {{ errors.fullName }}
                </p>
              </div>

              <!-- Phone Number -->
              <div>
                <Label for="phoneNumber">
                  Phone Number

                  <Input
                    id="phoneNumber"
                    v-model="form.phoneNumber"
                    type="tel"
                    placeholder="+15550000000"
                    class=""
                  />
                </Label>

                <p v-if="errors.phoneNumber" class="text-error mt-1 text-sm">
                  {{ errors.phoneNumber }}
                </p>
              </div>

              <!-- Company's Email Address -->
              <div>
                <Label for="email">
                  Company's Email Address
                  <Input
                    id="email"
                    v-model="form.email"
                    type="email"
                    placeholder="olivia@untitledui.com"
                  />
                </Label>
                <p v-if="errors.email" class="text-error mt-1 text-sm">
                  {{ errors.email }}
                </p>
              </div>

              <!-- Message -->
              <div>
                <Label for="message">
                  Message

                  <Textarea
                    id="message"
                    v-model="form.message"
                    :maxlength="maxCharacters"
                    rows="5"
                    placeholder="Add message"
                    @input="updateCharacterCount"
                  ></Textarea>
                </Label>
                <div
                  class="mt-2 flex flex-col justify-between gap-1 sm:flex-row sm:items-center sm:gap-0"
                >
                  <div class="order-2 sm:order-1">
                    <p v-if="errors.message" class="text-error text-sm">
                      {{ errors.message }}
                    </p>
                  </div>
                  <p class="order-1 text-xs sm:order-2">
                    {{ characterCount }}/{{ maxCharacters }} characters
                  </p>
                </div>
              </div>

              <!-- Agreement Section -->
              <div>
                <Label
                  row
                  for="agreement"
                  class="text-muted cursor-pointer text-xs leading-relaxed font-normal sm:text-sm"
                >
                  <Checkbox id="agreement" v-model="form.agreement" />
                  <span>
                    By completing and submitting this form, I agree to have this website store my
                    submitted information so they can respond to my inquiry or send occasional
                    updates. For information on how to unsubscribe, as well as our privacy practices
                    and commitment to protecting your privacy, please refer to our
                    <RouterLink to="/privacy-policy" class="text-primary inline hover:underline">
                      privacy policy</RouterLink
                    >.
                  </span>
                </Label>

                <p v-if="errors.agreement" class="text-error mt-2 text-sm">
                  {{ errors.agreement }}
                </p>
              </div>

              <!-- Submit Button -->
              <Button type="submit" :disabled="isSubmitting" @click="handleSubmit">
                <span v-if="!isSubmitting">Submit</span>
                <span v-else>Submitting...</span>
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
