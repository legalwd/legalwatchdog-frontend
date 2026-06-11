import type { StorybookConfig } from '@storybook/vue3-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [],
  framework: '@storybook/vue3-vite',
  viteFinal: async (config) => {
    // Remove vite-plugin-inspect to avoid environment context errors
    return {
      ...config,
      plugins: (config.plugins || []).filter((plugin) => {
        if (Array.isArray(plugin)) {
          return plugin[0]?.name !== 'inspect'
        }
        return plugin?.name !== 'vite:inspect'
      }),
    }
  },
}

export default config
