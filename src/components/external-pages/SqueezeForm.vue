<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { toast } from 'vue-sonner'
import { z } from 'zod'

import { requestDemoForm } from '@/api/contact-us'
import { requestDemoSchema, type RequestDemoApiError } from '@/types/contact-us'

import { Button } from '../ui/button'
import { Field, FieldGroup } from '../ui/field'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

const formData = ref({
  first_name: '',
  last_name: '',
  company_name: '',
  company_size: '',
  industry: '',
  country: '',
  company_website_url: '',
  work_email: '',
  job_title: '',
})

const errors = ref<Record<string, string[] | undefined>>({})
const isSubmitting = ref(false)

const handleSubmit = async () => {
  isSubmitting.value = true
  errors.value = {}

  const validatedData = requestDemoSchema.safeParse(formData.value)

  if (!validatedData.success) {
    errors.value = z.flattenError(validatedData.error).fieldErrors
  } else {
    const res = await requestDemoForm(validatedData.data)

    if (res.status === 201) {
      toast.success(res.data?.message ?? 'Demo request has been sent successfully.')
    } else if (res.status === 422) {
      errors.value = res.data?.errors as RequestDemoApiError
    } else {
      toast.error('Something went wrong. Please try again later.')
    }
  }

  isSubmitting.value = false
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <FieldGroup class="gap-6">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field>
          <Input
            id="first_name"
            v-model="formData.first_name"
            name="first_name"
            aria-label="First name"
            placeholder="First Name"
            :class="{ 'border-error': errors.first_name }"
          />
          <span v-if="errors.first_name" class="text-error text-xs">{{
            errors.first_name[0]
          }}</span>
        </Field>
        <Field>
          <Input
            id="last_name"
            v-model="formData.last_name"
            name="last_name"
            aria-label="Last name"
            placeholder="Last Name"
            :class="{ 'border-error': errors.last_name }"
          />
          <span v-if="errors.last_name" class="text-error text-xs">{{ errors.last_name[0] }}</span>
        </Field>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field>
          <Input
            id="work_email"
            v-model="formData.work_email"
            name="work_email"
            type="email"
            aria-label="Work Email"
            placeholder="Work Email"
            :class="{ 'border-error': errors.work_email }"
          />
          <span v-if="errors.work_email" class="text-error text-xs">{{
            errors.work_email[0]
          }}</span>
        </Field>
        <Field>
          <Input
            id="job_title"
            v-model="formData.job_title"
            name="job_title"
            aria-label="Job Title"
            placeholder="Job Title"
            :class="{ 'border-error': errors.job_title }"
          />
          <span v-if="errors.job_title" class="text-error text-xs">{{ errors.job_title[0] }}</span>
        </Field>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field>
          <Input
            id="company_name"
            v-model="formData.company_name"
            name="company_name"
            aria-label="Company name"
            placeholder="Company Name"
            :class="{ 'border-error': errors.company_name }"
          />
          <span v-if="errors.company_name" class="text-error text-xs">{{
            errors.company_name[0]
          }}</span>
        </Field>

        <Field>
          <Select v-model="formData.company_size">
            <SelectTrigger :class="{ 'border-error': errors.company_size }">
              <SelectValue placeholder="Company Size" aria-label="Company Size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-50">1-50 employees</SelectItem>
              <SelectItem value="51-200">51-200 employees</SelectItem>
              <SelectItem value="201-500">201-500 employees</SelectItem>
              <SelectItem value="500-1000">500-1000 employees</SelectItem>
              <SelectItem value="1000+">1000+ employees</SelectItem>
            </SelectContent>
          </Select>
          <span v-if="errors.company_size" class="text-error text-xs">{{
            errors.company_size[0]
          }}</span>
        </Field>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field>
          <Select v-model="formData.industry">
            <SelectTrigger :class="{ 'border-error': errors.industry }">
              <SelectValue placeholder="Industry" aria-label="Industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="technology">Technology</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="healthcare">Healthcare</SelectItem>
              <SelectItem value="legal">Legal</SelectItem>
              <SelectItem value="manufacturing">Manufacturing</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <span v-if="errors.industry" class="text-error text-xs">{{ errors.industry[0] }}</span>
        </Field>

        <Field>
          <Select v-model="formData.country">
            <SelectTrigger :class="{ 'border-error': errors.country }">
              <SelectValue placeholder="Country" aria-label="Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="us">United States</SelectItem>
              <SelectItem value="uk">United Kingdom</SelectItem>
              <SelectItem value="ca">Canada</SelectItem>
              <SelectItem value="au">Australia</SelectItem>
              <SelectItem value="de">Germany</SelectItem>
              <SelectItem value="ng">Nigeria</SelectItem>
              <SelectItem value="fr">France</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <span v-if="errors.country" class="text-error text-xs">{{ errors.country[0] }}</span>
        </Field>
      </div>

      <Field>
        <Input
          id="company_website_url"
          v-model="formData.company_website_url"
          name="company_website_url"
          aria-label="Company Website URL"
          placeholder="Company website URL"
          :class="{ 'border-error': errors.company_website_url }"
        />
        <span v-if="errors.company_website_url" class="text-error text-xs">{{
          errors.company_website_url[0]
        }}</span>
      </Field>
    </FieldGroup>

    <p class="mt-4 text-sm">
      We're committed to your privacy. Legalwatchdog uses the information you provide to us to
      contact you about our relevant content, products, and services. For more information, check
      out our
      <RouterLink to="/privacy-policy" class="text-primary hover:underline"
        >privacy policy</RouterLink
      >
    </p>

    <Button type="submit" class="mt-4 w-full" :disabled="isSubmitting">
      <span v-if="isSubmitting">Requesting...</span>
      <span v-else>Request a Demo</span>
    </Button>
  </form>
</template>
