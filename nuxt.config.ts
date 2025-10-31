// https://nuxt.com/docs/api/configuration/nuxt-config
import Aura from "@primeuix/themes/aura";
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: [
    "@nuxt/icon",
    "@nuxt/fonts",
    "@nuxt/image",
    "@pinia/nuxt",
    "@pinia/colada-nuxt",
    "@primevue/nuxt-module",
    "@nuxtjs/tailwindcss",
  ],
  css: ["@/assets/css/tailwind.css"],
  primevue: {
    importTheme: { from: '@/themes/mytheme.ts' },
    options: {

      theme: {
        options: {
          cssLayer: {
                          name: 'primevue',
                          order: 'tailwind-base, primevue, tailwind-utilities'
                      }
        },
      },
    },
  },
  fonts:{
    families: [
     {
      name: 'Poppins',
      provider: 'google'
     }
    ]
  },
  runtimeConfig: {
     public: {
       apiUrl: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:8000/api',
       wsUrl: process.env.NUXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws'
     }
   },
  ssr: false,
});
