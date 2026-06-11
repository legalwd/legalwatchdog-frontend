import { useRouter } from 'vue-router'

import { useInvitationStore } from '@/stores/invitation-store'

export const useInvitationPrompt = () => {
  const invitationStore = useInvitationStore()
  const router = useRouter()

  const promptToAcceptInvite = async (
    token?: string | null,
    options?: { onProcessingChange?: (isProcessing: boolean) => void },
  ) => {
    const onProcessingChange = options?.onProcessingChange
    const inviteToken = token ?? invitationStore.token
    if (!inviteToken) return false

    onProcessingChange?.(true)
    await router.push({ name: 'accept-org-invite', params: { token: inviteToken } })
    onProcessingChange?.(false)
    return true
  }

  return { promptToAcceptInvite }
}
