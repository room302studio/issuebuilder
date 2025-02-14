/* composables/useFeatureFlags.ts */
import { useRuntimeConfig } from 'nuxt/app'

export function useFeatureFlags() {
  const config = useRuntimeConfig()
  return {
    experimentalFeatures: Boolean(config.public.experimentalFeatures)
  }
}
