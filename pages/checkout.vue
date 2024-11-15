<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header with fade-in animation -->
      <div ref="headerEl" class="text-center mb-12 opacity-0">
        <h1 class="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl">
          Lifetime Access
        </h1>
        <p class="mt-4 text-xl text-gray-600 dark:text-gray-300">
          One-time payment, unlimited access forever
        </p>
      </div>

      <!-- Pricing Card with slide-up animation -->
      <div ref="cardEl" class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden opacity-0 translate-y-8">
        <div class="px-6 py-8 sm:p-10">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-2xl font-semibold text-gray-900 dark:text-white">Lifetime Plan</h3>
              <p class="mt-2 text-gray-500 dark:text-gray-400">Full access to all features, forever</p>
            </div>
            <div class="text-right">
              <p ref="priceEl" class="text-3xl font-bold text-gray-900 dark:text-white opacity-0 scale-95">$80</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">One-time payment</p>
            </div>
          </div>

          <!-- Feature List with staggered animation -->
          <ul ref="featureListEl" class="mt-8 space-y-4">
            <li v-for="(feature, index) in features" :key="index" class="flex items-center opacity-0 translate-x-4">
              <Icon name="heroicons:check-circle" class="h-5 w-5 text-green-500" />
              <span class="ml-3 text-gray-700 dark:text-gray-300">{{ feature }}</span>
            </li>
          </ul>
        </div>

        <div ref="buttonContainerEl" class="px-6 py-8 bg-gray-50 dark:bg-gray-700/50 space-y-4 opacity-0">
          <!-- Checkout Button with hover animation -->
          <button @click="handleCheckout" :disabled="loading" class="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg
                   transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                   flex items-center justify-center gap-2">
            <Icon v-if="loading" name="heroicons:arrow-path" class="h-5 w-5 animate-spin" />
            {{ loading ? 'Processing...' : 'Purchase Lifetime Access' }}
          </button>

          <p class="text-sm text-center text-gray-500 dark:text-gray-400">
            Secure payment powered by Stripe
          </p>
        </div>
      </div>

      <!-- Trust Badges with fade-in animation -->
      <div ref="trustBadgesEl" class="mt-8 flex items-center justify-center gap-6 opacity-0">
        <div v-for="(badge, index) in trustBadges" :key="index"
          class="flex items-center text-gray-400 dark:text-gray-500 hover:text-purple-500 dark:hover:text-purple-400 transition-colors duration-300">
          <Icon :name="badge.icon" class="h-5 w-5 mr-2" />
          <span class="text-sm">{{ badge.text }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { createAnimatable } from '~/anime.esm.min.js'

const loading = ref(false)
const toast = useToast()
const config = useRuntimeConfig()
const { stripe } = useClientStripe()

// Refs for animations
const headerEl = ref<HTMLElement>()
const cardEl = ref<HTMLElement>()
const priceEl = ref<HTMLElement>()
const featureListEl = ref<HTMLElement>()
const buttonContainerEl = ref<HTMLElement>()
const trustBadgesEl = ref<HTMLElement>()

// Content data
const features = [
  'Unlimited issues',
  'AI-powered issue refinement',
  'All future updates included',
  'Priority support'
]

const trustBadges = [
  { icon: 'heroicons:lock-closed', text: 'Secure Payment' },
  { icon: 'heroicons:clock', text: 'Instant Access' },
  { icon: 'heroicons:shield-check', text: 'Money Back Guarantee' }
]

const PRODUCT_ID = 'price_your_stripe_price_id_here'

// Animation setup
onMounted(() => {
  // Create animatables for each element
  const headerAnimatable = createAnimatable(headerEl.value, {
    opacity: 1,
    translateY: 0,
    duration: 800,
    ease: 'outCubic'
  })

  const cardAnimatable = createAnimatable(cardEl.value, {
    opacity: 1,
    translateY: 0,
    duration: 800,
    ease: 'outCubic'
  })

  const priceAnimatable = createAnimatable(priceEl.value, {
    opacity: 1,
    scale: 1,
    duration: 600,
    ease: 'outCubic'
  })

  // Feature list items
  if (featureListEl.value?.children) {
    Array.from(featureListEl.value.children).forEach((item, index) => {
      createAnimatable(item, {
        opacity: 1,
        translateX: 0,
        duration: 600,
        delay: index * 100,
        ease: 'outCubic'
      })
    })
  }

  // Button and badges
  const buttonAnimatable = createAnimatable(buttonContainerEl.value, {
    opacity: 1,
    translateY: 0,
    duration: 600,
    ease: 'outCubic'
  })

  const trustBadgesAnimatable = createAnimatable(trustBadgesEl.value, {
    opacity: 1,
    translateY: 0,
    duration: 600,
    ease: 'outCubic'
  })

  // Trigger animations
  headerAnimatable.opacity(1)
  headerAnimatable.translateY(0)

  setTimeout(() => {
    cardAnimatable.opacity(1)
    cardAnimatable.translateY(0)
  }, 200)

  setTimeout(() => {
    priceAnimatable.opacity(1)
    priceAnimatable.scale(1)
  }, 400)

  setTimeout(() => {
    buttonAnimatable.opacity(1)
    buttonAnimatable.translateY(0)
  }, 600)

  setTimeout(() => {
    trustBadgesAnimatable.opacity(1)
    trustBadgesAnimatable.translateY(0)
  }, 800)
})

// Update checkout handler
const handleCheckout = async () => {
  loading.value = true

  try {
    console.log('Starting checkout process...')

    const { data, error } = await useFetch('/api/create-checkout-session', {
      method: 'POST'
    })

    console.log('Checkout response:', { data, error })

    if (error.value) {
      throw new Error(`API Error: ${error.value.message}`)
    }

    if (!data.value?.url) {
      throw new Error('No checkout URL returned from API')
    }

    // Redirect to Stripe Checkout
    console.log('Redirecting to:', data.value.url)
    window.location.href = data.value.url

  } catch (error) {
    console.error('Detailed checkout error:', error)
    toast.add({
      title: 'Checkout Error',
      description: error instanceof Error ? error.message : 'Failed to start checkout',
      color: 'red'
    })
  } finally {
    loading.value = false
  }
}
</script>