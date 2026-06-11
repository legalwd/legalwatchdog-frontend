import { spawn } from 'node:child_process'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const cwd = process.cwd()
const previewPort = Number(process.env.LIGHTHOUSE_PORT || 4173)
const previewHost = process.env.LIGHTHOUSE_HOST || '127.0.0.1'
const baseUrl = `http://${previewHost}:${previewPort}`
const useExistingServer =
  process.argv.includes('--use-existing-server') ||
  process.env.LIGHTHOUSE_USE_EXISTING_SERVER === '1'

const routes = [
  { slug: 'home', path: '/' },
  { slug: 'about-us', path: '/about-us' },
  { slug: 'features', path: '/features' },
  { slug: 'contact-us', path: '/contact-us' },
  { slug: 'help-center', path: '/help-center' },
  { slug: 'terms', path: '/terms' },
  { slug: 'privacy-policy', path: '/privacy-policy' },
  { slug: 'faq', path: '/faq' },
  { slug: 'demo', path: '/demo' },
]

const run = (command, args, options = {}) =>
  new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, {
      cwd,
      stdio: options.stdio ?? 'inherit',
      env: { ...process.env, ...(options.env ?? {}) },
      shell: false,
    })

    let stdout = ''
    let stderr = ''

    if (child.stdout) {
      child.stdout.on('data', (chunk) => {
        stdout += chunk.toString()
      })
    }

    if (child.stderr) {
      child.stderr.on('data', (chunk) => {
        stderr += chunk.toString()
      })
    }

    child.on('error', rejectPromise)
    child.on('close', (code) => {
      if (code === 0) {
        resolvePromise({ stdout, stderr })
        return
      }

      rejectPromise(
        new Error(
          `Command failed: ${command} ${args.join(' ')}\nExit code: ${code}\n${stderr || stdout}`,
        ),
      )
    })
  })

const sleep = (ms) => new Promise((resolvePromise) => setTimeout(resolvePromise, ms))

const waitForServer = async (url, timeoutMs = 30_000) => {
  const start = Date.now()

  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url)
      if (response.ok) return
    } catch {
      // Server is still starting.
    }

    await sleep(500)
  }

  throw new Error(`Preview server did not become ready within ${timeoutMs}ms at ${url}`)
}

const toPercent = (score) => Math.round((score ?? 0) * 100)

const formatTimestamp = () => {
  const iso = new Date().toISOString().replace(/[:.]/g, '-')
  return iso.replace('T', '_').replace('Z', '')
}

const buildSummary = (results, outputDir) => {
  const lines = [
    '# Lighthouse Marketing Audit',
    '',
    `Base URL: \`${baseUrl}\``,
    `Generated: ${new Date().toISOString()}`,
    '',
    '| Page | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT | Report |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |',
  ]

  for (const result of results) {
    lines.push(
      `| ${result.path} | ${result.performance} | ${result.accessibility} | ${result.bestPractices} | ${result.seo} | ${result.lcp} | ${result.cls} | ${result.tbt} | [html](./${result.slug}.report.html) / [json](./${result.slug}.report.json) |`,
    )
  }

  lines.push('')
  lines.push('## Notes')
  lines.push('')
  lines.push('- Scores are Lighthouse category scores out of 100.')
  lines.push('- LCP is shown in seconds.')
  lines.push('- CLS is unitless; lower is better.')
  lines.push('- TBT is shown in milliseconds.')
  lines.push('')
  lines.push('## Follow-up')
  lines.push('')
  lines.push('- Review the lowest-scoring pages first.')
  lines.push('- Cross-check SEO scores with manual metadata/content review.')
  lines.push(`- Raw reports are in \`${outputDir}\`.`)

  return `${lines.join('\n')}\n`
}

const main = async () => {
  const stamp = formatTimestamp()
  const outputDir = resolve(cwd, '.docs/lighthouse-reports', stamp)

  await rm(outputDir, { recursive: true, force: true })
  await mkdir(outputDir, { recursive: true })

  if (!useExistingServer) {
    console.log('Building production bundle...')
    await run('pnpm', ['build'])
  }

  let preview = null

  try {
    if (useExistingServer) {
      console.log(`Using existing preview server at ${baseUrl} ...`)
    } else {
      console.log(`Starting preview server at ${baseUrl} ...`)
      preview = spawn(
        'pnpm',
        ['preview', '--host', previewHost, '--port', String(previewPort), '--strictPort'],
        {
          cwd,
          stdio: 'inherit',
          shell: false,
        },
      )
    }

    await waitForServer(baseUrl)

    const results = []

    for (const route of routes) {
      const url = new URL(route.path, baseUrl).toString()
      const htmlPath = resolve(outputDir, `${route.slug}.report.html`)
      const jsonPath = resolve(outputDir, `${route.slug}.report.json`)

      console.log(`Auditing ${url} ...`)

      await run(
        'npx',
        [
          '--yes',
          'lighthouse',
          url,
          '--quiet',
          '--chrome-flags=--headless=new --no-sandbox --disable-dev-shm-usage',
          '--only-categories=performance,accessibility,best-practices,seo',
          '--output=html',
          '--output=json',
          `--output-path=${resolve(outputDir, route.slug)}`,
        ],
        { stdio: 'inherit' },
      )

      const report = JSON.parse(await readFile(jsonPath, 'utf8'))
      const metrics = report.audits

      results.push({
        slug: route.slug,
        path: route.path,
        performance: toPercent(report.categories.performance?.score),
        accessibility: toPercent(report.categories.accessibility?.score),
        bestPractices: toPercent(report.categories['best-practices']?.score),
        seo: toPercent(report.categories.seo?.score),
        lcp: Number((metrics['largest-contentful-paint']?.numericValue / 1000 || 0).toFixed(2)),
        cls: Number((metrics['cumulative-layout-shift']?.numericValue || 0).toFixed(3)),
        tbt: Math.round(metrics['total-blocking-time']?.numericValue || 0),
        htmlPath,
        jsonPath,
      })
    }

    const summary = buildSummary(results, outputDir)
    await writeFile(resolve(outputDir, 'SUMMARY.md'), summary, 'utf8')

    console.log(`Lighthouse audit complete. Reports written to ${outputDir}`)
  } finally {
    preview?.kill('SIGTERM')
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
