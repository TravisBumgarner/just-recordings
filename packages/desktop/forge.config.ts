import * as fs from 'node:fs'
import * as path from 'node:path'
import { MakerDeb } from '@electron-forge/maker-deb'
import { MakerDMG } from '@electron-forge/maker-dmg'
import { MakerSquirrel } from '@electron-forge/maker-squirrel'
import { MakerZIP } from '@electron-forge/maker-zip'
import { VitePlugin } from '@electron-forge/plugin-vite'
import type { ForgeConfig } from '@electron-forge/shared-types'
import { z } from 'zod'

const safeConfig = z.object({
  APPLE_ID: z.string().email(),
  APPLE_PASSWORD: z.string().min(1),
  APPLE_TEAM_ID: z.string().min(1),
})

const config: ForgeConfig = {
  packagerConfig: {
    executableName: 'just-recordings',
    asar: true,
    icon: './resources/icon',
    extraResource: ['./resources'],
    osxSign:
      process.env.SHOULD_APPLE_SIGN === '1'
        ? {
            identity: process.env.APPLE_IDENTITY,
            optionsForFile: () => ({
              hardenedRuntime: true,
              entitlements: './build/entitlements.mac.plist',
            }),
          }
        : undefined,
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({
      name: 'just-recordings',
      setupExe: 'Just-Recordings-win32-x64-setup.exe',
    }),
    new MakerDMG({
      name: 'Just-Recordings-darwin',
    }),
    new MakerZIP({}, ['darwin']),
    new MakerDeb({
      options: {
        name: 'just-recordings',
        bin: 'just-recordings',
        productName: 'Just Recordings',
      },
    }),
  ],
  plugins: [
    new VitePlugin({
      build: [
        {
          entry: 'src/main/index.ts',
          config: 'vite.main.config.ts',
          target: 'main',
        },
        {
          entry: 'src/preload/preload.ts',
          config: 'vite.preload.config.ts',
          target: 'preload',
        },
      ],
      renderer: [],
    }),
  ],
  hooks: {
    packageAfterCopy: async (_forgeConfig, buildPath) => {
      // Copy web app dist to the packaged app's .vite/renderer directory
      const webDistPath = path.join(__dirname, '../web/dist')
      const rendererPath = path.join(buildPath, '.vite/renderer')

      if (fs.existsSync(webDistPath)) {
        fs.mkdirSync(rendererPath, { recursive: true })
        fs.cpSync(webDistPath, rendererPath, { recursive: true })
        // biome-ignore lint/suspicious/noConsole: Build script output
        console.log('Copied web dist to', rendererPath)
      } else {
        throw new Error(
          `Web dist not found at ${webDistPath}. Run "npm run build -w @just-recordings/web" first`
        )
      }
    },
    postPackage: async (_forgeConfig, options) => {
      if (options.platform === 'darwin' && process.env.SHOULD_APPLE_SIGN === '1') {
        const { notarize } = await import('@electron/notarize')
        const appPath = `${options.outputPaths[0]}/Just Recordings.app`

        const safeConfigParsed = safeConfig.parse({
          APPLE_ID: process.env.APPLE_ID,
          APPLE_PASSWORD: process.env.APPLE_PASSWORD,
          APPLE_TEAM_ID: process.env.APPLE_TEAM_ID,
        })

        await notarize({
          appPath,
          appleId: safeConfigParsed.APPLE_ID,
          appleIdPassword: safeConfigParsed.APPLE_PASSWORD,
          teamId: safeConfigParsed.APPLE_TEAM_ID,
        })
      }
    },
  },
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: { owner: 'TravisBumgarner', name: 'just-recordings' },
        prerelease: false,
        draft: false,
      },
    },
  ],
}

export default config
