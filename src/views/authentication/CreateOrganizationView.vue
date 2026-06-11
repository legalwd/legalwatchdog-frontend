<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

import AuthCard from '@/components/authentication/AuthCard.vue'
import FormControl from '@/components/composables/FormControl.vue'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from '@/components/ui/select'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { useAuthStore } from '@/stores/auth-store'
import { useOrganizationStore } from '@/stores/organization-store'

const organizationStore = useOrganizationStore()
const router = useRouter()
const authStore = useAuthStore()
const { confirm: openConfirm } = useConfirmDialog()

const name = ref('')
const email = ref(authStore.user?.email || authStore.email || '')
const industry = ref('')
const customIndustry = ref('')
const jobTitle = ref('')
const orgType = ref('')
const companySize = ref('')
const country = ref('')
const saving = ref(false)
const error = ref<string | null>(null)
const fieldErrors = ref<Record<string, string[]> | null>(null)

const ensureUserId = async () => {
  const immediateId = authStore.user?.id || authStore.user?.user_id
  if (immediateId) return immediateId
  const loadedUser = await authStore.loadCurrentUser()
  return loadedUser?.id || (loadedUser as { user_id?: string } | null)?.user_id || null
}

const isFormValid = () => {
  if (!name.value.trim()) return false
  if (!email.value.trim()) return false
  if (!jobTitle.value.trim()) return false
  if (!orgType.value.trim()) return false
  if (!companySize.value.trim()) return false
  if (!country.value.trim()) return false
  if (industry.value === 'Other' && !customIndustry.value.trim()) return false
  return true
}

const handleLogout = async () => {
  openConfirm({
    title: 'Log out?',
    description: 'You will need to sign in again to continue onboarding.',
    confirmText: 'Log out',
    cancelText: 'Cancel',
    async onConfirm() {
      await authStore.logout()
      toast.success('You have been logged out')
      router.replace({ name: 'login' })
    },
  })
}

const handleSubmit = async () => {
  fieldErrors.value = null
  if (!name.value.trim()) {
    error.value = 'Company name is required'
    return
  }

  if (industry.value === 'Other' && !customIndustry.value.trim()) {
    error.value = 'Please specify your industry'
    return
  }

  if (!email.value.trim()) {
    error.value = 'Work email is required'
    return
  }

  if (!jobTitle.value.trim()) {
    error.value = 'Job title is required'
    return
  }

  if (!orgType.value.trim()) {
    error.value = 'Organization type is required'
    return
  }

  if (!companySize.value.trim()) {
    error.value = 'Company size is required'
    return
  }

  if (!country.value.trim()) {
    error.value = 'Country is required'
    return
  }

  organizationStore.clearErrors()
  fieldErrors.value = null
  error.value = null
  saving.value = true

  const finalIndustry =
    industry.value === 'Other' ? customIndustry.value.trim() : industry.value.trim()

  const created = await organizationStore.addOrganization({
    company_size: companySize.value.trim(),
    country: country.value.trim(),
    email: email.value.trim(),
    name: name.value.trim(),
    industry: finalIndustry,
    job_title: jobTitle.value.trim(),
    org_type: orgType.value.trim(),
  })

  if (created) {
    toast.success('Organization created successfully.')
    const userId = await ensureUserId()
    if (userId) {
      await organizationStore.fetchOrganizations(userId)
    }
    const orgId = organizationStore.currentOrganizationId

    if (!orgId) {
      if (!authStore.accountPendingApproval) {
        await authStore.loadCurrentUser()
      }
      if (authStore.accountPendingApproval) {
        router.replace({ name: 'account-pending-approval' })
        return
      }
      error.value = 'Organization created, but could not determine organization ID.'
      return
    }

    router.push({
      name: 'organization-projects',
      params: { organizationId: orgId },
    })
  } else if (organizationStore.error) {
    error.value = organizationStore.error
    fieldErrors.value = organizationStore.fieldErrors
  } else if (organizationStore.fieldErrors) {
    fieldErrors.value = organizationStore.fieldErrors
    error.value = 'Please check the highlighted fields.'
  }

  saving.value = false
}
</script>

<template>
  <AuthCard header-text="Set up new Organization">
    <template #header-actions>
      <Button variant="link" type="button" class="text-sm" @click="handleLogout"> Log out </Button>
    </template>
    <template #description>
      <p class="mt-2 text-center text-sm">Tell us a bit about your organization</p>
    </template>

    <form class="space-y-6" @submit.prevent="handleSubmit">
      <div
        v-if="error"
        class="border-error bg-error-background text-error rounded-md border p-4 text-left text-sm"
      >
        {{ error }}
      </div>

      <FormControl
        v-model="name"
        type="text"
        label="Company name"
        placeholder="Enter company name"
        required
        :disabled="saving"
        :error="fieldErrors?.name?.[0] || ''"
      />

      <FormControl
        v-model="email"
        type="email"
        label="Work email"
        placeholder="Enter work email"
        required
        :disabled="saving"
        :error="fieldErrors?.email?.[0] || ''"
      />

      <FormControl
        v-model="jobTitle"
        type="text"
        label="Job title"
        placeholder="Enter job title"
        required
        :disabled="saving"
        :error="fieldErrors?.jobTitle?.[0] || ''"
      />

      <div class="space-y-2">
        <Label for="industry">
          Industry

          <Select id="industry" v-model="industry" class="w-full" :disabled="saving">
            <SelectTrigger
              class="focus:border-primary focus:ring-primary/20 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:outline-none"
              :class="{ 'border-error': fieldErrors?.industry?.length }"
            >
              <SelectValue placeholder="Select Industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Law, Regulation & Compliance">
                Law, Regulation & Compliance
              </SelectItem>
              <SelectItem value="Government, Politics & Public Sector">
                Government, Politics & Public Sector
              </SelectItem>
              <SelectItem value="Business, Finance & Professional Services">
                Business, Finance & Professional Services
              </SelectItem>
              <SelectItem value="Technology, Media & Telecommunication">
                Technology, Media & Telecommunication
              </SelectItem>
              <SelectItem value="Health, Science & Education">
                Health, Science & Education
              </SelectItem>
              <SelectItem value="Energy, Environment & Infrastructure">
                Energy, Environment & Infrastructure
              </SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </Label>
        <p v-if="fieldErrors?.industry?.length" class="text-error text-xs">
          {{ fieldErrors.industry[0] }}
        </p>
      </div>

      <FormControl
        v-if="industry === 'Other'"
        v-model="customIndustry"
        type="text"
        label="Others"
        placeholder="Enter your industry"
        required
        :disabled="saving"
        :error="fieldErrors?.industry?.[0] || ''"
      />

      <div class="space-y-2">
        <Label for="org-type">
          Organization type

          <Select id="org-type" v-model="orgType" class="w-full" :disabled="saving">
            <SelectTrigger
              class="focus:border-primary focus:ring-primary/20 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:outline-none"
              :class="{ 'border-error': fieldErrors?.orgType?.length }"
            >
              <SelectValue placeholder="Select organization type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Private">Private</SelectItem>
              <SelectItem value="Public">Public</SelectItem>
              <SelectItem value="Nonprofit">Nonprofit</SelectItem>
              <SelectItem value="Government">Government</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </Label>
        <p v-if="fieldErrors?.orgType?.length" class="text-error text-xs">
          {{ fieldErrors.orgType[0] }}
        </p>
      </div>

      <div class="space-y-2">
        <Label for="company-size">
          Company size

          <Select id="company-size" v-model="companySize" class="w-full" :disabled="saving">
            <SelectTrigger
              class="focus:border-primary focus:ring-primary/20 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:outline-none"
              :class="{ 'border-error': fieldErrors?.companySize?.length }"
            >
              <SelectValue placeholder="Select company size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-50">1-50 - Small company</SelectItem>
              <SelectItem value="51-200">51-200 - Medium company</SelectItem>
              <SelectItem value="201-500">201-500 - Large company</SelectItem>
              <SelectItem value="501-1000">501-1000 - Extra Large company</SelectItem>
              <SelectItem value="1000+">1000+ - Enterprise</SelectItem>
            </SelectContent>
          </Select>
        </Label>
        <p v-if="fieldErrors?.companySize?.length" class="text-error text-xs">
          {{ fieldErrors.companySize[0] }}
        </p>
      </div>

      <FormControl
        v-model="country"
        type="text"
        label="Country"
        placeholder="Enter country"
        required
        :disabled="saving"
        :error="fieldErrors?.country?.[0] || ''"
      />

      <Button type="submit" class="w-full" :disabled="saving || !isFormValid()">
        <span v-if="saving">Creating...</span>
        <span v-else>Create organization</span>
      </Button>
    </form>
  </AuthCard>
</template>
