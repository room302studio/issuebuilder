import pkg from './package.json';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: pkg.name,
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: pkg.version },
      ],
    }
  },
  nitro: {
    future: {
      nativeSWR: true
    },
    preset: 'netlify'
  },
  routeRules: {
    '/**': { cache: { swr: true } }
  },
  ssr: false,
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/supabase',
    '@vueuse/nuxt',
    '@nuxt/ui',
    [
      '@nuxtjs/google-fonts',
      {
        families: {
          Figtree: [400, 500, 700, 800],
        },
      },
    ],
    ['@unlok-co/nuxt-stripe', {
      server: {
        key: process.env.STRIPE_SECRET_KEY,
        options: {}
      },
      client: {
        key: process.env.STRIPE_PUBLISHABLE_KEY,
        options: {
          locale: 'en'
        }
      }
    }],
  ],
  runtimeConfig: {
    WEATHER_KEY: process.env.WEATHER_KEY,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    public: {
      SITE_URL: process.env.SITE_URL || 'http://localhost:3000',
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    }
  },
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
  vite: {
    optimizeDeps: {
      include: ['marked']
    },
    build: {
      rollupOptions: {
        external: process.env.NODE_ENV === 'development' ? [] : ['marked']
      }
    }
  },
  experimental: {
    payloadExtraction: false
  },
  hooks: {
    'pages:extend': (pages) => {
      pages.forEach(page => {
        if (page.path === '/') {
          page.middleware = page.middleware || []
          if (Array.isArray(page.middleware)) {
            page.middleware.push('manifest-route-rule')
          }
        }
      })
    }
  }
});
