import * as fs from 'node:fs'
import * as path from 'node:path'
import { MakerDeb } from '@electron-forge/maker-deb'
import { MakerDMG } from '@electron-forge/maker-dmg'
import { MakerSquirrel } from '@electron-forge/maker-squirrel'
import { MakerZIP } from '@electron-forge/maker-zip'
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives'
import { VitePlugin } from '@electron-forge/plugin-vite'
import type { ForgeConfig } from '@electron-forge/shared-types'
import { z } from 'zod'

const safeConfig = z.object({
  APPLE_ID: z.string().email(),
  APPLE_PASSWORD: z.string().min(1),
  APPLE_TEAM_ID: z.string().min(1),
  GITHUB_TOKEN: z.string().min(1),
})

const config: ForgeConfig = {
  packagerConfig: {
    executableName: 'just-recordings',
    asar: true,
    icon: './build/icon',
    extraResource: ['./resources'],
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
        categories: ['AudioVideo'],
      },
    }),
  ],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new VitePlugin({
      build: [
        {
          entry: 'src/main/index.ts',
          config: 'vite.main.config.ts',
          target: 'main',
        },
        {
          entry: 'src/preload/index.ts',
          config: 'vite.preload.config.ts',
          target: 'preload',
        },
      ],
      renderer: [],
    }),
  ],
  hooks: {
    postPackage: async (_forgeConfig, options) => {
      if (options.platform === 'darwin' && process.env.SHOULD_APPLE_SIGN === '1') {
        const { notarize } = await import('@electron/notarize')
        const appPath = `${options.outputPaths[0]}/Just Recordings.app`

        const safeConfigParsed = safeConfig.parse({
          APPLE_ID: process.env.APPLE_ID,
          APPLE_PASSWORD: process.env.APPLE_PASSWORD,
          APPLE_TEAM_ID: process.env.APPLE_TEAM_ID,
          GITHUB_TOKEN: process.env.GITHUB_TOKEN,
        })

        await notarize({
          appPath,
          appleId: safeConfigParsed.APPLE_ID,
          appleIdPassword: safeConfigParsed.APPLE_PASSWORD,
          teamId: safeConfigParsed.APPLE_TEAM_ID,
        })
      }
    },
    postMake: async (_forgeConfig, makeResults) => {
      for (const result of makeResults) {
        for (let i = 0; i < result.artifacts.length; i++) {
          const artifact = result.artifacts[i]
          const dir = path.dirname(artifact)
          const ext = path.extname(artifact)

          let newName: string | null = null
          if (ext === '.deb') {
            newName = `just-recordings-linux-${result.arch}.deb`
          } else if (ext === '.zip' && result.platform === 'darwin') {
            newName = `Just-Recordings-darwin-${result.arch}.zip`
          }

          if (newName) {
            const newPath = path.join(dir, newName)
            fs.renameSync(artifact, newPath)
            result.artifacts[i] = newPath
          }
        }
      }
      return makeResults
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
