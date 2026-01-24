# Desktop App Cross-Platform Releases

## Overview

Set up automated builds for the Just Recordings desktop app targeting Windows, macOS, and Linux using electron-builder with electron-vite, plus GitHub Actions for CI/CD releases.

## Goals

1. Configure electron-builder for cross-platform builds
2. Create GitHub Actions workflow for automated releases
3. Support macOS code signing and notarization
4. Publish releases to GitHub Releases
5. Document the setup process

## Technical Approach

### Build Tool: electron-builder

electron-vite recommends electron-builder for distribution. This provides:
- Cross-platform builds (Windows, macOS, Linux)
- Auto-update support
- Code signing integration
- GitHub Releases publishing

### Configuration

#### electron-builder.yml

```yaml
appId: com.justrecordings.app
productName: Just Recordings
directories:
  buildResources: build
  output: dist
files:
  - out/**/*
  - package.json
asarUnpack:
  - resources/**
win:
  target:
    - nsis
  icon: build/icon.ico
mac:
  target:
    - dmg
    - zip
  icon: build/icon.icns
  hardenedRuntime: true
  gatekeeperAssess: false
  entitlements: build/entitlements.mac.plist
  entitlementsInherit: build/entitlements.mac.plist
  notarize:
    teamId: ${env.APPLE_TEAM_ID}
linux:
  target:
    - AppImage
    - deb
  icon: build/icon.png
  category: Utility
publish:
  provider: github
  owner: TravisBumgarner
  repo: just-recordings
```

#### Build Scripts (package.json)

```json
{
  "scripts": {
    "build:win": "npm run build && electron-builder --win --config",
    "build:mac": "npm run build && electron-builder --mac --config",
    "build:linux": "npm run build && electron-builder --linux --config",
    "publish": "npm run build && electron-builder --publish always"
  }
}
```

### GitHub Actions Workflow

Based on fast-classifieds/releases.yml pattern:

```yaml
name: Release Desktop App
on:
  workflow_dispatch:

permissions:
  contents: write

jobs:
  build:
    strategy:
      matrix:
        os:
          - { name: 'windows', image: 'windows-latest' }
          - { name: 'linux', image: 'ubuntu-latest' }
          - { name: 'macos', image: 'macos-latest' }
    runs-on: ${{ matrix.os.image }}
    continue-on-error: true
    env:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
      APPLE_ID: ${{ secrets.APPLE_ID }}
      APPLE_PASSWORD: ${{ secrets.APPLE_PASSWORD }}
      APPLE_IDENTITY: ${{ secrets.APPLE_IDENTITY }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - name: Import Apple certificate (macOS only)
        if: matrix.os.name == 'macos'
        # Certificate import steps...
      - run: npm ci
      - name: Build and publish
        run: npm run publish -w @just-recordings/desktop
```

### Required Assets

#### Build Resources (packages/desktop/build/)

- `icon.icns` - macOS app icon (512x512 minimum)
- `icon.ico` - Windows app icon
- `icon.png` - Linux app icon (512x512)
- `entitlements.mac.plist` - macOS entitlements for hardened runtime

#### macOS Entitlements

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>com.apple.security.cs.allow-jit</key>
  <true/>
  <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
  <true/>
  <key>com.apple.security.cs.disable-library-validation</key>
  <true/>
  <key>com.apple.security.device.audio-input</key>
  <true/>
  <key>com.apple.security.device.camera</key>
  <true/>
</dict>
</plist>
```

### README Documentation

Create `.github/README.md` documenting:
- Required GitHub Secrets
- macOS code signing setup
- Certificate regeneration process
- How to trigger a release

## Dependencies

New dev dependencies for desktop package:
- `electron-builder` - Build and distribution tool

## File Structure

```
packages/desktop/
├── build/
│   ├── icon.icns
│   ├── icon.ico
│   ├── icon.png
│   └── entitlements.mac.plist
├── electron-builder.yml
└── package.json (updated scripts)

.github/
├── workflows/
│   └── desktop-release.yml
└── README.md
```

## References

- [electron-vite Distribution Guide](https://electron-vite.org/guide/distribution)
- [electron-builder Documentation](https://www.electron.build/)
- fast-classifieds releases.yml workflow
