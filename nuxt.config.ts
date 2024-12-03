import pkg from './package.json'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: 'IssueBuilder',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'AI-Powered GitHub Issue Generator' }
      ]
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
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    public: {
      siteUrl: process.env.SITE_URL || 'http://localhost:3000',
      githubClientId: process.env.GITHUB_CLIENT_ID
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
      callback: '/auth/callback',
      exclude: ['/auth/login', '/auth/callback', '/'],
      cookieRedirect: true
    },
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax'
    },
    clientOptions: {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        providers: {
          github: {
            scopes: 'repo read:user user:email'
          }
        }
      }
    }
  },

  // Nitro configuration
  nitro: {
    preset: 'netlify',
    prerender: {
      crawlLinks: true,
      routes: ['/']
    }
  },

  vite: {
    build: {
      transpile: ['isomorphic-dompurify'],
      rollupOptions: {
        output: {
          inlineDynamicImports: true
        }
      }
    },
    ssr: {
      noExternal: [
        'anime.esm.js',
        '@nuxt/ui',
        '@nuxt/ui-templates',
        'isomorphic-dompurify'
      ]
    }
  },

  // Add UI config if needed
  ui: {
    icons: ['heroicons', 'mdi']
  },

  colorMode: {
    preference: 'dark',
    fallback: 'dark',
    classSuffix: ''
  }
})
