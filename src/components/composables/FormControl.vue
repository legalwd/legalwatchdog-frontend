<script setup lang="ts">
import { computed, useAttrs } from 'vue'

import { Input } from '../ui/input'
import { Label } from '../ui/label'

type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<{
    modelValue: string | number
    label?: string
    hint?: string
    error?: string
    type?: InputType
    placeholder?: string
    id?: string
    name?: string
    disabled?: boolean
    required?: boolean
    autocomplete?: string
  }>(),
  {
    label: '',
    type: 'text',
    placeholder: '',
    hint: '',
    error: '',
    id: '',
    name: '',
    disabled: false,
    required: false,
    autocomplete: 'off',
  },
)

const attrs = useAttrs()

const emit = defineEmits<{
  (event: 'update:modelValue', value: string | number | boolean): void
  (event: 'blur' | 'focus', value: FocusEvent): void
}>()

const inputId = computed(() => props.id || `input-${Math.random().toString(36).slice(2, 9)}`)

const handleBlur = (event: FocusEvent) => emit('blur', event)
const handleFocus = (event: FocusEvent) => emit('focus', event)
</script>

<template>
  <Label class="block space-y-2" :for="inputId">
    <div class="flex items-center gap-1">
      <slot name="label">
        <span>{{ label }}</span>
      </slot>
      <span v-if="required" class="text-destructive text-xs font-semibold">*</span>
    </div>

    <div class="relative w-full">
      <div class="absolute top-1/2 left-3 flex -translate-y-1/2 items-center">
        <slot name="leading" />
      </div>
      <Input
        :id="inputId"
        :name="name || inputId"
        :model-value="modelValue"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :autocomplete="autocomplete"
        class="w-full"
        :class="[$slots.trailing && 'pr-8', $slots.leading && 'pl-12']"
        v-bind="attrs"
        @update:model-value="(v) => emit('update:modelValue', v)"
        @blur="handleBlur"
        @focus="handleFocus"
      />
      <div class="absolute top-1/2 right-2 flex -translate-y-1/2 items-center">
        <slot name="trailing" />
      </div>
    </div>

    <p v-if="error" class="text-error text-xs font-medium">{{ error }}</p>
    <p v-else-if="hint" class="text-disabled-background text-xs">
      <slot name="hint">{{ hint }}</slot>
    </p>
  </Label>
</template>
