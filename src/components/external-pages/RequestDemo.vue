<script setup lang="ts">
import { LoaderCircle } from 'lucide-vue-next'
import { ref, type Ref } from 'vue'

import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectTrigger, SelectValue } from '../ui/select'
import SelectItem from '../ui/select/SelectItem.vue'
import { Textarea } from '../ui/textarea'

interface DemoForm {
  fullName: string
  email: string
  componyName: string
  companySize: string
  industry: string
  inquiry: string
}

interface FormErrors {
  fullName: string
  email: string
  componyName: string
  companySize: string
  industry: string
  inquiry: string
}

const form: Ref<DemoForm> = ref({
  fullName: '',
  email: '',
  componyName: '',
  companySize: '',
  industry: '',
  inquiry: '',
})

const initialErrors: FormErrors = {
  fullName: '',
  email: '',
  componyName: '',
  companySize: '',
  industry: '',
  inquiry: '',
}

const errors: Ref<FormErrors> = ref({ ...initialErrors })

const isSubmitting = ref(false)
const submitSuccess = ref(false)

const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

const validateForm = (): boolean => {
  let isValid = true
  errors.value = { ...initialErrors }

  if (!form.value.fullName.trim()) {
    errors.value.fullName = 'Full Name is required.'
    isValid = false
  }

  if (!form.value.email.trim()) {
    errors.value.email = "Company's Email is required."
    isValid = false
  } else if (!validateEmail(form.value.email)) {
    errors.value.email = 'Please enter a valid email address.'
    isValid = false
  }

  if (!form.value.componyName.trim()) {
    errors.value.componyName = "Company's Name is required."
    isValid = false
  }

  if (!form.value.companySize.trim()) {
    errors.value.companySize = 'Company Size is required.'
    isValid = false
  }

  if (!form.value.industry.trim()) {
    errors.value.industry = 'Industry is required.'
    isValid = false
  }

  if (!form.value.inquiry.trim()) {
    errors.value.inquiry = 'Inquiry is required.'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  console.log('Submitting form with data:', form.value)
  if (!validateForm()) {
    console.error('Validation failed.')
    return
  }

  isSubmitting.value = true
  submitSuccess.value = false

  try {
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // --- Successful Submission Logic ---
    isSubmitting.value = false
    submitSuccess.value = true
  } catch (error) {
    isSubmitting.value = false
    // --- Error Handling ---
    console.error('Submission failed:', error)
    alert('Failed to send request. Please try again.')
  }
}
</script>

<template>
  <div class="flex min-h-screen justify-center px-4" :class="[submitSuccess && 'items-center']">
    <div class="mx-auto w-full">
      <div v-if="submitSuccess" class="max-w-md text-center">
        <svg
          width="118"
          height="118"
          viewBox="0 0 118 118"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="mx-auto"
        >
          <path
            d="M58.9997 9.83398C49.2754 9.83398 39.7696 12.7176 31.6842 18.1201C23.5987 23.5226 17.2969 31.2013 13.5756 40.1854C9.85431 49.1694 8.88065 59.0552 10.7778 68.5926C12.6749 78.13 17.3575 86.8907 24.2336 93.7667C31.1097 100.643 39.8704 105.325 49.4078 107.223C58.9452 109.12 68.8309 108.146 77.815 104.425C86.799 100.703 94.4778 94.4016 99.8803 86.3162C105.283 78.2308 108.166 68.7249 108.166 59.0006C108.166 52.544 106.895 46.1506 104.424 40.1854C101.953 34.2202 98.3313 28.8001 93.7658 24.2346C89.2002 19.669 83.7801 16.0474 77.815 13.5766C71.8498 11.1057 65.4564 9.83398 58.9997 9.83398V9.83398ZM80.1414 47.2498L57.6722 76.7498C57.2142 77.3448 56.626 77.827 55.9527 78.1594C55.2794 78.4918 54.5389 78.6655 53.788 78.6673C53.0412 78.6713 52.3033 78.5052 51.6303 78.1815C50.9573 77.8577 50.3669 77.3849 49.9039 76.799L37.9072 61.5082C37.5101 60.9981 37.2174 60.4148 37.0457 59.7916C36.8741 59.1684 36.8268 58.5175 36.9067 57.876C36.9866 57.2345 37.1921 56.6151 37.5114 56.053C37.8307 55.491 38.2575 54.9973 38.7676 54.6002C39.7978 53.7983 41.1043 53.4384 42.3998 53.5998C43.0412 53.6797 43.6607 53.8851 44.2227 54.2044C44.7848 54.5237 45.2784 54.9506 45.6755 55.4606L53.6897 65.6873L72.2747 41.104C72.6686 40.5874 73.1603 40.1536 73.7218 39.8271C74.2834 39.5006 74.9037 39.2879 75.5475 39.2011C76.1912 39.1144 76.8457 39.1553 77.4737 39.3215C78.1016 39.4877 78.6907 39.776 79.2072 40.1698C79.7237 40.5637 80.1576 41.0554 80.4841 41.617C80.8106 42.1785 81.0233 42.7989 81.11 43.4426C81.1968 44.0863 81.1559 44.7409 80.9897 45.3688C80.8235 45.9967 80.5352 46.5858 80.1414 47.1023V47.2498Z"
            fill="#17A31A"
          />
        </svg>
        <h3 class="text-2xl font-semibold">Thank you for your request!</h3>
        <p class="my-4">
          We have received your details and will be in touch shortly to schedule your demo.
        </p>
        <Button @click="submitSuccess = false"> Close </Button>
      </div>

      <section v-else class="mx-auto max-w-6xl py-16 lg:py-28">
        <div class="mb-8 text-center">
          <h2 class="text-primary mx-auto max-w-2xl text-3xl leading-normal font-bold sm:text-5xl">
            Talk To A Member Of Our Sales Team.
          </h2>
          <p class="mt-2 text-lg">Have questions or want a demo? Our team is here to guide you.</p>
        </div>
        <form
          class="bg-background flex flex-col gap-6 rounded-4xl px-4 py-8 shadow-md sm:px-8 sm:py-12"
          @submit.prevent="handleSubmit"
        >
          <div>
            <Label for="fullName">
              Full Name
              <Input id="fullName" v-model="form.fullName" type="text" placeholder="John Doe" />
            </Label>
            <p v-if="errors.fullName" class="text-error mt-1 text-sm">
              {{ errors.fullName }}
            </p>
          </div>

          <div>
            <Label for="email">
              Work Email
              <Input
                id="email"
                v-model="form.email"
                type="email"
                placeholder="olivia@company.com"
              />
            </Label>
            <p v-if="errors.email" class="text-error mt-1 text-sm">
              {{ errors.email }}
            </p>
          </div>

          <div>
            <Label for="componyName">
              Company Name
              <Input
                id="componyName"
                v-model="form.componyName"
                type="text"
                placeholder="Company Inc."
              />
            </Label>
            <p v-if="errors.componyName" class="text-error mt-1 text-sm">
              {{ errors.componyName }}
            </p>
          </div>

          <div class="flex flex-col gap-6 md:flex-row">
            <div class="flex-1">
              <Label for="companySize">
                Company Size

                <Select id="companySize" v-model="form.companySize">
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="10-50" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10</SelectItem>
                    <SelectItem value="10-50">10-50</SelectItem>
                    <SelectItem value="50-200">50-200</SelectItem>
                    <SelectItem value="200-500">200-500</SelectItem>
                    <SelectItem value="500+">500+</SelectItem>
                  </SelectContent>
                </Select>
              </Label>
              <p v-if="errors.companySize" class="text-error mt-1 text-sm">
                {{ errors.companySize }}
              </p>
            </div>
            <div class="flex-1">
              <Label for="industry">
                Industry
                <Input id="industry" v-model="form.industry" type="text" placeholder="Technology" />
              </Label>
              <p v-if="errors.industry" class="text-error mt-1 text-sm">
                {{ errors.industry }}
              </p>
            </div>
          </div>

          <div>
            <Label for="inquiry">
              Describe Your Inquiry Here
              <Textarea
                id="inquiry"
                v-model="form.inquiry"
                rows="5"
                type="text"
                placeholder="Tell us what you need..."
              />
            </Label>
            <p v-if="errors.inquiry" class="text-error mt-1 text-sm">
              {{ errors.inquiry }}
            </p>
          </div>

          <Button type="submit" class="mx-auto mt-6 w-full max-w-md" :disabled="isSubmitting">
            <span v-if="!isSubmitting" class="flex items-center justify-center">Submit</span>
            <span v-else class="flex items-center justify-center gap-2">
              <LoaderCircle class="animate-spin" />
              Submitting Request...
            </span>
          </Button>
        </form>
        <p class="mt-6 text-center text-sm">
          By clicking "Submit" you agree to our
          <RouterLink to="/terms" class="hover:text-primary underline">Terms</RouterLink> and
          <RouterLink to="/privacy-policy" class="hover:text-primary underline"
            >Privacy Policy</RouterLink
          >
        </p>
      </section>
    </div>
  </div>
</template>
