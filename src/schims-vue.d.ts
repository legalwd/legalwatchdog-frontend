declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  /* eslint-disable @typescript-eslint/no-explicit-any */

  const component: DefineComponent<object, object, any>

  export default component
}
