import pkg from './package.json';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: 'IssueBuilder',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'AI-Powered GitHub Issue Generator' },
      ],
    }
  },

  // Netlify deployment settings
  ssr: true,
  compatibilityDate: '2024-10-15',

  // Development
  devtools: { enabled: true },

  // Core modules
  modules: [
    '@nuxt/ui',
    '@vueuse/nuxt',
    '@nuxtjs/supabase',
    '@unlok-co/nuxt-stripe',
    '@vueuse/motion/nuxt',
    [
      '@nuxtjs/google-fonts',
      {
        families: {
          Figtree: [400, 700]
        }
      }
    ]
  ],

  // Runtime config
  runtimeConfig: {
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    public: {
      SITE_URL: process.env.SITE_URL || 'http://localhost:3000',
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    }
  },

  // Stripe configuration
  stripe: {
    server: {
      key: process.env.STRIPE_SECRET_KEY,
      options: {}
    },
    client: {
      key: process.env.STRIPE_PUBLISHABLE_KEY,
      options: { locale: 'en' }
    }
  },

  // Supabase auth configuration
  supabase: {
    redirectOptions: {
      login: '/auth/login',
      callback: '/auth/confirm',
      exclude: ['/auth/login', '/auth/confirm']
    },
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production'
    }
  },

  // Nitro configuration
  nitro: {
    preset: 'netlify'
  },

  vite: {
    optimizeDeps: {
      exclude: ['@/anime.esm.min.js']
    },
    build: {
      rollupOptions: {
        external: []
      }
    }
  },

  // Add alias for cleaner imports
  alias: {
    '@anime': './anime.esm.min.js'
  }
})
