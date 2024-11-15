<template>
  <NuxtLayout>
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
        <div ref="cardEl"
          class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden opacity-0 translate-y-8">
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
  </NuxtLayout>
</template>

<script setup lang="ts">
import { animate, timeline } from '~/anime.esm.min.js'  // Import specific functions instead of default

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

const PRODUCT_ID = 'prod_RDyn1tMw4jCP72'

// Animation timeline
onMounted(() => {
  const tl = timeline({
    easing: 'easeOutCubic',
    duration: 800
  })

  tl
    .add({
      targets: headerEl.value,
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 800
    })
    .add({
      targets: cardEl.value,
      opacity: [0, 1],
      translateY: [40, 0],
      duration: 800
    }, '-=400')
    .add({
      targets: priceEl.value,
      opacity: [0, 1],
      scale: [0.95, 1],
      duration: 600
    }, '-=400')
    .add({
      targets: featureListEl.value?.children,
      opacity: [0, 1],
      translateX: [20, 0],
      delay: 100, // Use number instead of stagger in v4
      duration: 600
    }, '-=400')
    .add({
      targets: buttonContainerEl.value,
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 600
    }, '-=200')
    .add({
      targets: trustBadgesEl.value,
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 600
    }, '-=400')
})

// Checkout handler
const handleCheckout = async () => {
  loading.value = true

  // Animate button when loading
  animate({
    targets: buttonContainerEl.value,
    scale: [1, 0.98],
    duration: 300,
    easing: 'easeInOutQuad'
  })

  try {
    const { data: session } = await useFetch('/api/create-checkout-session', {
      method: 'POST',
      body: {
        productId: PRODUCT_ID,
        successUrl: `${config.public.SITE_URL}/checkout/success`,
        cancelUrl: `${config.public.SITE_URL}/checkout`
      }
    })

    if (!session?.id) {
      throw new Error('Failed to create checkout session')
    }

    if (stripe.value) {
      await stripe.value.redirectToCheckout({
        sessionId: session.id
      })
    }
  } catch (error) {
    // Animate button back to normal
    animate({
      targets: buttonContainerEl.value,
      scale: 1,
      duration: 300,
      easing: 'easeOutQuad'
    })

    toast.add({
      title: 'Error',
      description: error.message,
      color: 'red'
    })
  } finally {
    loading.value = false
  }
}
</script>