import { defineStore } from 'pinia'

interface State {
  ready: boolean
}

export const useAppStore = defineStore('app', {
  state: (): State => ({
    ready: false,
  }),
  actions: {
    setReady(value: boolean) {
      this.ready = value
    },
  },
})
