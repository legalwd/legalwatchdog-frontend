<script setup lang="ts">
import { useRouter } from 'vue-router'

import Dialog from '@/components/ui/dialog/Dialog.vue'
import DialogContent from '@/components/ui/dialog/DialogContent.vue'
import DialogDescription from '@/components/ui/dialog/DialogDescription.vue'
import DialogFooter from '@/components/ui/dialog/DialogFooter.vue'
import DialogHeader from '@/components/ui/dialog/DialogHeader.vue'
import DialogTitle from '@/components/ui/dialog/DialogTitle.vue'

const router = useRouter()

const handleGoHome = async () => {
  router.push({ name: 'dashboard' })
}
</script>

<template>
  <Dialog default-open @update:open="handleGoHome">
    <DialogContent>
      <DialogHeader class="text-center">
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

        <DialogTitle> Payment Successful </DialogTitle>
        <DialogDescription class="py-4"> Your Subscription is active </DialogDescription>
      </DialogHeader>
      <DialogFooter class="flex w-full flex-row items-center justify-center! gap-4 text-center">
        <button class="btn--default btn--md" @click="handleGoHome">Return to Dashboard</button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
