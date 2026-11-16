// Concurrent dev-server supervision for `write dev --all`.
// No third-party dependencies: node:net for port preflight, node:child_process
// for spawning, node:readline for line-prefixed logs.
import fs from 'node:fs'
import net from 'node:net'
import { spawn } from 'node:child_process'
import readline from 'node:readline'

const COLORS = [36, 35, 33, 32, 34, 31]
const SIGNAL_GRACE_MS = 5000

export function colorize(text, index) {
  if (!process.stdout.isTTY) return text
  return `\u001b[${COLORS[index % COLORS.length]}m${text}\u001b[0m`
}

export function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer()
    server.once('error', () => resolve(false))
    server.once('listening', () => server.close(() => resolve(true)))
    server.listen(port, '127.0.0.1')
  })
}

export async function waitForHttp(url, timeoutMs = 90000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(2000) })
      return true // any response, including 4xx, means the server is listening
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 400))
    }
  }
  return false
}

export function formatTable(rows) {
  const headers = ['REPOSITORY', 'PORT', 'STATUS', 'URL']
  const body = rows.map((row) => [row.name, String(row.port ?? '-'), row.status, row.url ?? '-'])
  const widths = headers.map((header, index) => Math.max(header.length, ...body.map((row) => row[index].length)))
  const line = (cells) => cells.map((cell, index) => cell.padEnd(widths[index])).join('  ').trimEnd()
  return [line(headers), ...body.map(line)].join('\n')
}

export function commandLine(service) {
  return `${service.command} ${service.args.join(' ')}`
}

function preface(child, label, colorIndex) {
  const prefix = colorize(`[${label}]`, colorIndex)
  for (const [stream, target] of [[child.stdout, process.stdout], [child.stderr, process.stderr]]) {
    if (!stream) continue
    readline.createInterface({ input: stream }).on('line', (line) => target.write(`${prefix} ${line}\n`))
  }
}

export function systemOpen(url) {
  const command = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'explorer' : 'xdg-open'
  try {
    spawn(command, [url], { stdio: 'ignore', detached: true }).unref()
  } catch {
    // Opening a browser is best effort.
  }
}

function killTree(child, signal) {
  if (!child.pid || child.exitCode !== null) return
  try {
    process.kill(-child.pid, signal)
  } catch {
    try { child.kill(signal) } catch { /* already gone */ }
  }
}

export async function runServices(services, options = {}) {
  const { open = true, dryRun = false, timeoutMs = 90000 } = options
  const rows = services.map((service) => ({
    name: service.name, port: service.port, url: service.url,
    status: service.skipped ? `skipped (${service.skipped})` : 'pending',
  }))

  if (dryRun) {
    for (const service of services) {
      if (service.skipped) { console.log(`${service.name}: skipped (${service.skipped})`); continue }
      console.log(`${service.name}: cd ${service.cwd} && ${commandLine(service)}`)
    }
    console.log(`\n${formatTable(rows)}`)
    return 0
  }

  const running = services.filter((service) => !service.skipped)
  for (const service of running) {
    if (!(await checkPort(service.port))) {
      throw new Error(`Port ${service.port} for ${service.name} is already in use. Stop the process holding it (lsof -nP -iTCP:${service.port} -sTCP:LISTEN) and retry.`)
    }
  }

  const children = []
  let shuttingDown = false
  const shutdown = (code = 0) => {
    if (shuttingDown) return
    shuttingDown = true
    for (const child of children) killTree(child, 'SIGTERM')
    const force = setTimeout(() => { for (const child of children) killTree(child, 'SIGKILL') }, SIGNAL_GRACE_MS)
    force.unref()
    process.exitCode = code
    setTimeout(() => process.exit(code), SIGNAL_GRACE_MS + 200).unref()
  }
  process.once('SIGINT', () => shutdown(130))
  process.once('SIGTERM', () => shutdown(143))

  running.forEach((service, index) => {
    const child = spawn(service.command, service.args, {
      cwd: service.cwd, detached: true, stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, ...service.env },
    })
    preface(child, service.name, index)
    child.on('exit', (code) => {
      if (shuttingDown) return
      if (code) {
        console.error(`${service.name} exited with code ${code}; stopping all services.`)
        shutdown(code)
      }
    })
    children.push(child)
  })

  const ready = await Promise.all(running.map(async (service) => ({ service, ok: await waitForHttp(service.url, timeoutMs) })))
  for (const { service, ok } of ready) {
    const row = rows.find((entry) => entry.name === service.name)
    row.status = ok ? 'ready' : 'not responding'
  }
  console.log(`\n${formatTable(rows)}\n\nCtrl-C stops all services.`)
  if (open) {
    const target = ready.find((entry) => entry.ok && entry.service.name === 'site-source') ?? ready.find((entry) => entry.ok)
    if (target) systemOpen(target.service.url)
  }

  // Keep the process alive until every child exits or the user interrupts.
  await Promise.all(children.map((child) => new Promise((resolve) => {
    if (child.exitCode !== null) resolve()
    else child.once('exit', resolve)
  })))
  return process.exitCode || 0
}

export function checkoutProblem(root) {
  if (!fs.existsSync(root)) return 'not checked out'
  if (!fs.existsSync(`${root}/node_modules`)) return 'dependencies not installed'
  return null
}
