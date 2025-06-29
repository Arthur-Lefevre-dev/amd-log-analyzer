// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxt/icon", "@nuxt/image", "@nuxt/fonts", "@nuxt/eslint"],
  css: ["~/assets/css/main.css"],
  compatibilityDate: "2024-12-29",
});
