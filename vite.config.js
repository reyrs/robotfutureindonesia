import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { RENTABLE } from './src/data/robots.js'

// One static page per rentable robot (/robot/<id>/index.html) from robot.html, with its own title and
// link-preview tags, so the URLs work on any static host and WhatsApp/Google see the right text.
function robotPages() {
  let outDir
  return {
    name: 'robot-pages',
    configResolved(config) {
      outDir = config.build.outDir
    },
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (/^\/robot\/[\w-]+\/?(\?.*)?$/.test(req.url)) req.url = '/robot.html'
        next()
      })
    },
    writeBundle() {
      const template = readFileSync(join(outDir, 'robot.html'), 'utf8')
      for (const robot of RENTABLE) {
        const html = template
          .replaceAll('%ROBOT_ID%', robot.id)
          .replaceAll('%ROBOT_NAME%', robot.name)
          .replaceAll('%ROBOT_SUMMARY%', robot.summary)
        mkdirSync(join(outDir, 'robot', robot.id), { recursive: true })
        writeFileSync(join(outDir, 'robot', robot.id, 'index.html'), html)
      }
      rmSync(join(outDir, 'robot.html'))
    }
  }
}

export default defineConfig({
  plugins: [react(), robotPages()],
  server: {
    watch: {
      ignored: ['**/temp_*/**', '**/screen_*.png']
    }
  },
  build: {
    rolldownOptions: {
      input: { main: 'index.html', robot: 'robot.html', casting: 'casting/index.html' }
    }
  }
})
