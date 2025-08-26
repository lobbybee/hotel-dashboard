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
    options: {
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: false || "none",
          cssLayer: {
                          name: 'primevue',
                          order: 'tailwind-base, primevue, tailwind-utilities'
                      }
        },
      },
    },
  },
  runtimeConfig: {
     public: {
       apiUrl: 'http://localhost:8000/api'
     }
   },
  ssr: false,
});
