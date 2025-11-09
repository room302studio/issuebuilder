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

  // Build transpile configuration
  build: {
    transpile: ['isomorphic-dompurify']
  },

  // Server configuration to handle large headers
  server: {
    maxHeaderSize: 32768 // 32KB max header size
  },

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
      siteUrl:
        process.env.NODE_ENV === 'production'
          ? process.env.SITE_URL || 'https://issuebuilder.com'
          : undefined, // Let Nuxt handle the development URL dynamically
      githubClientId: process.env.GITHUB_CLIENT_ID,
      disableAuth: process.env.DISABLE_AUTH === 'true',
      CLICKHOUSE_HOST: process.env.CLICKHOUSE_HOST || '',
      CLICKHOUSE_USER: process.env.CLICKHOUSE_USER || 'default',
      CLICKHOUSE_PASSWORD: process.env.CLICKHOUSE_PASSWORD || ''
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
      sameSite: 'lax',
      maxAge: 60 * 60 * 8 // 8 hours (shorter session might help with header size)
    },
    clientOptions: {
      auth: {
        persistSession: process.env.DISABLE_AUTH !== 'true',
        autoRefreshToken: process.env.DISABLE_AUTH !== 'true',
        detectSessionInUrl: process.env.DISABLE_AUTH !== 'true',
        flowType: 'pkce'
      },
      global: {
        headers: {
          // Add timeout headers to prevent hung connections
          'X-Client-Timeout': '5000'
        },
        fetch: {
          // 5 second timeout for all Supabase requests
          timeout: 5000
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
    },
    // Add timeout for external requests to prevent ECONNRESET/EPIPE
    experimental: {
      asyncContext: true
    },
    routeRules: {
      // Disable server routes that require Supabase when auth is disabled
      '/api/stripe-webhook': process.env.DISABLE_AUTH === 'true' ? { cors: true, headers: { 'cache-control': 'no-cache' } } : {},
    }
  },

  vite: {
    build: {
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
    },
    server: {
      // Prevent connection timeouts during development
      hmr: {
        protocol: 'ws',
        timeout: 60000
      }
    }
  },

  // Add UI config if needed
  ui: {
    global: true,
    strategy: 'merge',
    tailwindMerge: {
      extend: {
        classGroups: {
          colors: ['zinc']
        }
      }
    }
  },

  colorMode: {
    preference: 'dark',
    fallback: 'dark',
    classSuffix: ''
  }
})
