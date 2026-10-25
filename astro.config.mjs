import { defineConfig } from 'astro/config'

export default defineConfig({
  output: 'static',
  site: 'https://www.lkkllk404.top',
  srcDir: 'src',
  outDir: 'dist',
  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
  },
})
