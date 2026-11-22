// `pnpm dev`: the docs (rspress) and the integration demos (Vite, port 5180)
// together, since the docs pages embed the demos in iframes. Ctrl+C stops both.
import { spawn } from 'node:child_process'

const run = (name, args) => {
  const child = spawn('pnpm', ['exec', ...args], { stdio: 'inherit', shell: process.platform === 'win32' })
  child.on('exit', (code) => {
    console.log(`[dev] ${name} exited (${code ?? 0}); stopping`)
    stop(code ?? 0)
  })
  return child
}

const children = [
  run('demos', ['vite', '-c', 'integrations/vite.config.ts', '--clearScreen', 'false']),
  run('docs', ['rspress', 'dev']),
]

let stopping = false
function stop(code = 0) {
  if (stopping) return
  stopping = true
  for (const child of children) {
    if (child.exitCode !== null) continue
    // On Windows the child is a shell; kill its whole process tree.
    if (process.platform === 'win32') spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' })
    else child.kill()
  }
  setTimeout(() => process.exit(code), 300)
}
process.on('SIGINT', () => stop(0))
process.on('SIGTERM', () => stop(0))
