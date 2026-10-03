import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { agentDocs } from './agentDocs'

// https://vite.dev/config/
export default defineConfig({
  // agentDocs: Markdown copies of every article, llms.txt, sitemap.xml and a
  // static article index in index.html, so the site is readable without JS.
  plugins: [react(), agentDocs()],
})
