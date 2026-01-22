#!/usr/bin/env node

/**
 * Copies the web app's built output into the desktop app's renderer directory.
 * This script runs as a postbuild step after electron-vite builds main/preload.
 */

import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const webDistPath = join(__dirname, '../../web/dist')
const rendererOutPath = join(__dirname, '../out/renderer')

// Check if web dist exists
if (!existsSync(webDistPath)) {
  console.error('Error: Web dist not found at', webDistPath)
  console.error('Run "npm run build -w @just-recordings/web" first')
  process.exit(1)
}

// Clean and recreate renderer output directory
if (existsSync(rendererOutPath)) {
  rmSync(rendererOutPath, { recursive: true })
}
mkdirSync(rendererOutPath, { recursive: true })

// Copy web dist to renderer output
cpSync(webDistPath, rendererOutPath, { recursive: true })

console.log('Copied web dist to desktop renderer output')
