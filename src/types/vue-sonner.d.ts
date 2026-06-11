declare module 'vue-sonner' {
  export const toast: {
    success: (message: string) => void
    error: (message: string) => void
    info: (message: string) => void;
    (message: string): void
  }

  export const Toaster: (props: Record<string, unknown>) => unknown
  export type ToasterProps = Record<string, unknown>
}
