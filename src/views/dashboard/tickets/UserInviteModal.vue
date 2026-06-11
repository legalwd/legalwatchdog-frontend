<script setup lang="ts">
import { ref, watch /* , computed */ } from 'vue'
import { toast } from 'vue-sonner'

import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'

const props = defineProps<{
  open: boolean
  isLoading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'close'): void
  (e: 'invite', emails: string[]): void
}>()

const emailInput = ref<HTMLInputElement | null>(null)
const inputValue = ref('')
const emails = ref<string[]>([])

// const canSubmit = computed(() => {
//   return !props.isLoading && (emails.value.length > 0 || inputValue.value.trim().length > 0)
// })

const focusInput = () => {
  if (props.isLoading) return
  emailInput.value?.focus()
}

const resetState = () => {
  inputValue.value = ''
  emails.value = []
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const normalize = (v: string) => v.trim().toLowerCase()

const addEmail = () => {
  if (props.isLoading) return

  const raw = inputValue.value.trim()
  if (!raw) return

  const value = normalize(raw)

  if (!emailRegex.test(value)) {
    toast.error('Please enter a valid email address')
    return
  }

  if (emails.value.some((e) => normalize(e) === value)) {
    toast.error('That email has already been added')
    inputValue.value = ''
    return
  }

  emails.value.push(value)
  inputValue.value = ''
}

const submitInvites = () => {
  if (props.isLoading) return

  // capture if user has something typed and clicks submit
  if (inputValue.value.trim()) addEmail()

  if (!emails.value.length) {
    toast.error('Add at least one email to invite')
    return
  }

  emit('invite', [...emails.value])

  // optional: optimistic toast (I prefer parent to confirm success)
  // toast.message('Sending invites...')
}

const removeEmail = (index: number) => {
  if (props.isLoading) return
  emails.value.splice(index, 1)
}

const handleKeydown = (e: KeyboardEvent) => {
  if (props.isLoading) return

  if (['Enter', ',', ' '].includes(e.key)) {
    e.preventDefault()
    addEmail()
  } else if (e.key === 'Backspace' && !inputValue.value && emails.value.length > 0) {
    removeEmail(emails.value.length - 1)
  }
}

const handleBlur = () => {
  if (props.isLoading) return
  if (inputValue.value.trim()) addEmail()
}

const closeModal = () => {
  if (props.isLoading) return
  emit('update:open', false)
  emit('close')
  resetState()
}

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) resetState()
    else setTimeout(focusInput, 0)
  },
)
</script>

<template>
  <Dialog :open="open" @update:open="!isLoading && emit('update:open', $event)">
    <DialogContent
      class="bg-background gap-0 overflow-hidden rounded-xl border-0 p-0 shadow-2xl focus:outline-none sm:max-w-130"
    >
      <div class="p-8">
        <button
          type="button"
          class="mb-6 -ml-1 text-[#4B4B4B] transition-colors hover:text-black focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="isLoading"
          aria-label="Go back"
          @click="closeModal"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 12H5M5 12L12 19M5 12L12 5"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>

        <div class="mb-8">
          <DialogTitle class="mb-2 text-[32px] leading-tight font-bold text-[#1A1A1A]">
            Invite Users
          </DialogTitle>
          <DialogDescription class="text-[15px] font-normal text-[#5C5956]">
            Invite users into the workspace
          </DialogDescription>
        </div>

        <div class="mb-10">
          <label class="mb-2.5 block text-[15px] font-bold text-[#1A1A1A]" @click="focusInput">
            Email Addresses
          </label>

          <div
            class="bg-background flex min-h-40 w-full cursor-text flex-wrap content-start gap-2 rounded-lg border border-[#E5E7EB] p-3 transition-colors focus-within:border-[#3E1C05] focus-within:ring-2 focus-within:ring-[#3E1C05]/10 hover:border-[#D1D5DB]"
            :class="{ 'cursor-not-allowed opacity-50': isLoading }"
            @click="focusInput"
          >
            <div
              v-for="(email, index) in emails"
              :key="email"
              class="group animate-in fade-in zoom-in inline-flex items-center gap-1.5 rounded-full border border-[#F5EFEA] bg-[#FFF9F5] px-3 py-1.5 duration-200"
            >
              <span class="text-[13px] font-medium text-[#3E1C05]">{{ email }}</span>
              <button
                type="button"
                :disabled="isLoading"
                class="text-[#3E1C05]/60 hover:text-[#3E1C05] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                @click.stop="removeEmail(index)"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>

            <input
              ref="emailInput"
              v-model="inputValue"
              type="text"
              placeholder="Email"
              :disabled="isLoading"
              class="h-8 min-w-30 flex-1 bg-transparent text-[15px] text-[#1A1A1A] outline-none placeholder:text-[#A3A3A3] disabled:cursor-not-allowed disabled:opacity-50"
              @keydown="handleKeydown"
              @blur="handleBlur"
            />
          </div>
        </div>

        <div class="flex flex-col gap-4">
          <button
            type="button"
            class="w-full rounded-lg bg-[#3E1C05] px-4 py-3.5 text-[15px] font-semibold text-white shadow-sm transition-all hover:bg-[#3E1C05]/90 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="(emails.length === 0 && !inputValue) || isLoading"
            @click="submitInvites"
          >
            <span v-if="isLoading" class="inline-flex items-center gap-2">
              <svg
                class="h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Sending invites...
            </span>
            <span v-else>Invite User{{ emails.length > 1 ? 's' : '' }}</span>
          </button>

          <button
            type="button"
            class="w-full rounded-lg py-2 text-[14px] font-semibold text-[#1A1A1A] transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="isLoading"
            @click="closeModal"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
input::placeholder {
  color: #9ca3af;
  opacity: 1;
}
</style>
