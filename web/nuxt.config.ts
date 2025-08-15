export default defineNuxtConfig({
  modules: ['@nuxt/ui'],
  app: { head: { title: 'Zeropoint Protocol' } },
  typescript: { typeCheck: true },
  nitro: { preset: 'cloudflare-pages' } // explicit guard
})
