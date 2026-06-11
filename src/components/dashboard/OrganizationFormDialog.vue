<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'

import ProfileImage from '@/components/reusable/ProfileImage.vue'
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogScrollContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const props = withDefaults(
  defineProps<{
    open: boolean
    title?: string
    submitLabel?: string
    initialName?: string
    initialIndustry?: string
    initialLocation?: string
    initialLogoUrl?: string
    initialEmail?: string
    initialJobTitle?: string
    initialOrgType?: string
    initialCompanySize?: string
    initialCountry?: string
    mode?: 'create' | 'edit'
    error?: string | null
    fieldErrors?: Record<string, string[]> | null
    loading?: boolean
  }>(),
  {
    title: 'Edit Profile',
    submitLabel: 'Save',
    initialName: '',
    initialIndustry: '',
    initialLocation: '',
    initialLogoUrl: '',
    initialEmail: '',
    initialJobTitle: '',
    initialOrgType: '',
    initialCompanySize: '',
    initialCountry: '',
    mode: 'edit',
    error: null,
    fieldErrors: null,
  },
)

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (
    e: 'save',
    payload: {
      company_size?: string
      country?: string
      email?: string
      name: string
      industry: string
      job_title?: string
      org_type?: string
      location?: string
      logoFile?: File | null
    },
  ): void
}>()

const form = reactive({
  name: props.initialName ?? '',
  email: props.initialEmail ?? '',
  industry: props.initialIndustry ?? '',
  jobTitle: props.initialJobTitle ?? '',
  orgType: props.initialOrgType ?? '',
  companySize: props.initialCompanySize ?? '',
  country: props.initialCountry ?? '',
  location: props.initialLocation ?? '',
})

const logoInputRef = ref<HTMLInputElement | null>(null)
const logoFile = ref<File | null>(null)
const logoPreview = ref(props.initialLogoUrl ?? '')
const logoPreviewUrl = ref<string | null>(null)

const resetLogoPreview = () => {
  if (logoPreviewUrl.value) {
    URL.revokeObjectURL(logoPreviewUrl.value)
    logoPreviewUrl.value = null
  }
  logoFile.value = null
  logoPreview.value = props.initialLogoUrl ?? ''
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      form.name = props.initialName ?? ''
      form.email = props.initialEmail ?? ''
      form.industry = props.initialIndustry ?? ''
      form.jobTitle = props.initialJobTitle ?? ''
      form.orgType = props.initialOrgType ?? ''
      form.companySize = props.initialCompanySize ?? ''
      form.country = props.initialCountry ?? ''
      form.location = props.initialLocation ?? ''
      resetLogoPreview()
    }
  },
)

watch(
  () => props.initialName,
  (val) => {
    if (props.open) form.name = val ?? ''
  },
)
watch(
  () => props.initialEmail,
  (val) => {
    if (props.open) form.email = val ?? ''
  },
)
watch(
  () => props.initialIndustry,
  (val) => {
    if (props.open) form.industry = val ?? ''
  },
)
watch(
  () => props.initialJobTitle,
  (val) => {
    if (props.open) form.jobTitle = val ?? ''
  },
)
watch(
  () => props.initialOrgType,
  (val) => {
    if (props.open) form.orgType = val ?? ''
  },
)
watch(
  () => props.initialCompanySize,
  (val) => {
    if (props.open) form.companySize = val ?? ''
  },
)
watch(
  () => props.initialCountry,
  (val) => {
    if (props.open) form.country = val ?? ''
  },
)
watch(
  () => props.initialLocation,
  (val) => {
    if (props.open) form.location = val ?? ''
  },
)
watch(
  () => props.initialLogoUrl,
  (val) => {
    if (props.open && !logoFile.value) logoPreview.value = val ?? ''
  },
)

const isCreateMode = computed(() => props.mode === 'create')
const isValid = computed(() => {
  if (!form.name.trim() || !form.industry.trim()) return false
  if (!isCreateMode.value) return true
  if (!form.email.trim()) return false
  if (!form.jobTitle.trim()) return false
  if (!form.orgType.trim()) return false
  if (!form.companySize.trim()) return false
  if (!form.country.trim()) return false
  return true
})

const industries = [
  'Government, Politics & Public Sector',
  'Law, Regulation & Compliance',
  'Business, Finance & Professional Services',
  'Technology, Media & Telecommunications',
  'Health, Science & Education',
  'Energy, Environment & Infrastructure',
  'Manufacturing, Trade & Logistics',
]

const companySizes = [
  { value: '1-50', label: 'Small company' },
  { value: '51-200', label: 'Medium company' },
  { value: '201-500', label: 'Large company' },
  { value: '501-1000', label: 'Extra Large company' },
  { value: '1000+', label: 'Enterprise' },
]

const getFieldErrors = (key: string) => props.fieldErrors?.[key] || []

const handleSubmit = () => {
  if (!isValid.value || props.loading) return
  const locationValue = form.location.trim()
  const payload: {
    company_size?: string
    country?: string
    email?: string
    name: string
    industry: string
    job_title?: string
    org_type?: string
    location?: string
    logoFile?: File | null
  } = {
    name: form.name.trim(),
    industry: form.industry.trim(),
  }
  const emailValue = form.email.trim()
  const jobTitleValue = form.jobTitle.trim()
  const orgTypeValue = form.orgType.trim()
  const companySizeValue = form.companySize.trim()
  const countryValue = form.country.trim()
  if (isCreateMode.value || emailValue) payload.email = emailValue
  if (isCreateMode.value || jobTitleValue) payload.job_title = jobTitleValue
  if (isCreateMode.value || orgTypeValue) payload.org_type = orgTypeValue
  if (isCreateMode.value || companySizeValue) payload.company_size = companySizeValue
  if (isCreateMode.value || countryValue) payload.country = countryValue
  if (locationValue.length) {
    payload.location = locationValue
  }
  if (logoFile.value) {
    payload.logoFile = logoFile.value
  }
  emit('save', payload)
}

const triggerLogoSelect = () => {
  logoInputRef.value?.click()
}

const handleLogoChange = (event: Event) => {
  const target = event.target as HTMLInputElement | null
  const file = target?.files?.[0]
  if (!file) return
  resetLogoPreview()
  const objectUrl = URL.createObjectURL(file)
  logoPreviewUrl.value = objectUrl
  logoPreview.value = objectUrl
  logoFile.value = file
}

onBeforeUnmount(() => {
  if (logoPreviewUrl.value) {
    URL.revokeObjectURL(logoPreviewUrl.value)
  }
})
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogScrollContent class="sm:max-w-140">
      <DialogHeader>
        <DialogTitle class="text-foreground text-xl font-semibold">
          {{ title || 'Edit Profile' }}
        </DialogTitle>
        <DialogDescription class="sr-only">
          Update your organization details, then save your changes.
        </DialogDescription>
      </DialogHeader>

      <div class="mt-3 flex flex-col gap-4">
        <div class="border-border bg-muted-background rounded-lg border px-4 py-5">
          <ProfileImage
            :src="logoPreview"
            :name="form.name"
            class="mx-auto"
            editable
            @edit="triggerLogoSelect"
          />
          <input
            ref="logoInputRef"
            type="file"
            accept="image/*"
            class="sr-only"
            @change="handleLogoChange"
          />
        </div>

        <Field :data-invalid="getFieldErrors('name').length ? 'true' : 'false'">
          <FieldLabel class="text-foreground text-sm font-medium">Company Name</FieldLabel>
          <FieldContent>
            <Input
              v-model="form.name"
              placeholder="Organization name"
              class="h-11"
              :aria-invalid="getFieldErrors('name').length ? 'true' : 'false'"
            />
          </FieldContent>
          <FieldError :errors="getFieldErrors('name')" />
        </Field>

        <Field :data-invalid="getFieldErrors('industry').length ? 'true' : 'false'">
          <FieldLabel class="text-foreground text-sm font-medium">Industry</FieldLabel>
          <FieldContent>
            <Input
              v-model="form.industry"
              placeholder="Start typing an industry"
              :list="'org-industry-suggestions'"
              class="h-11 w-full"
              :aria-invalid="getFieldErrors('industry').length ? 'true' : 'false'"
            />
            <datalist id="org-industry-suggestions">
              <option v-for="industry in industries" :key="industry" :value="industry" />
            </datalist>
          </FieldContent>
          <FieldError :errors="getFieldErrors('industry')" />
        </Field>

        <Field :data-invalid="getFieldErrors('email').length ? 'true' : 'false'">
          <FieldLabel class="text-foreground text-sm font-medium">Work Email</FieldLabel>
          <FieldContent>
            <Input
              v-model="form.email"
              type="email"
              placeholder="name@company.com"
              class="h-11"
              :aria-invalid="getFieldErrors('email').length ? 'true' : 'false'"
            />
          </FieldContent>
          <FieldError :errors="getFieldErrors('email')" />
        </Field>

        <Field :data-invalid="getFieldErrors('jobTitle').length ? 'true' : 'false'">
          <FieldLabel class="text-foreground text-sm font-medium">Job Title</FieldLabel>
          <FieldContent>
            <Input
              v-model="form.jobTitle"
              placeholder="Your role"
              class="h-11"
              :aria-invalid="getFieldErrors('jobTitle').length ? 'true' : 'false'"
            />
          </FieldContent>
          <FieldError :errors="getFieldErrors('jobTitle')" />
        </Field>

        <Field :data-invalid="getFieldErrors('orgType').length ? 'true' : 'false'">
          <FieldLabel class="text-foreground text-sm font-medium">Organization Type</FieldLabel>
          <FieldContent>
            <Input
              v-model="form.orgType"
              placeholder="Private, Public, etc."
              class="h-11"
              :aria-invalid="getFieldErrors('orgType').length ? 'true' : 'false'"
            />
          </FieldContent>
          <FieldError :errors="getFieldErrors('orgType')" />
        </Field>

        <Field :data-invalid="getFieldErrors('companySize').length ? 'true' : 'false'">
          <FieldLabel class="text-foreground text-sm font-medium">Company Size</FieldLabel>
          <FieldContent>
            <Select v-model="form.companySize">
              <SelectTrigger
                class="h-11 w-full"
                :aria-invalid="getFieldErrors('companySize').length ? 'true' : 'false'"
              >
                <SelectValue placeholder="Select company size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="size in companySizes" :key="size.value" :value="size.value">
                  {{ size.value }} - {{ size.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </FieldContent>
          <FieldError :errors="getFieldErrors('companySize')" />
        </Field>

        <Field :data-invalid="getFieldErrors('country').length ? 'true' : 'false'">
          <FieldLabel class="text-foreground text-sm font-medium">Country</FieldLabel>
          <FieldContent>
            <Input
              v-model="form.country"
              placeholder="Country"
              class="h-11"
              :aria-invalid="getFieldErrors('country').length ? 'true' : 'false'"
            />
          </FieldContent>
          <FieldError :errors="getFieldErrors('country')" />
        </Field>

        <Field :data-invalid="getFieldErrors('location').length ? 'true' : 'false'">
          <FieldLabel class="text-foreground text-sm font-medium">Location</FieldLabel>
          <FieldContent>
            <Input
              v-model="form.location"
              placeholder="Location"
              class="h-11"
              :aria-invalid="getFieldErrors('location').length ? 'true' : 'false'"
            />
          </FieldContent>
          <FieldError :errors="getFieldErrors('location')" />
        </Field>

        <p v-if="error" class="text-error text-sm">{{ error }}</p>
      </div>

      <DialogFooter class="mt-4 flex justify-center gap-4">
        <button
          type="button"
          class="btn--secondary btn--lg"
          :disabled="loading"
          @click="emit('update:open', false)"
        >
          Cancel
        </button>
        <button
          type="button"
          class="btn--default btn--lg disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="!isValid || loading"
          @click="handleSubmit"
        >
          <span v-if="loading">Saving...</span>
          <span v-else>{{ submitLabel || 'Save' }}</span>
        </button>
      </DialogFooter>
    </DialogScrollContent>
  </Dialog>
</template>
