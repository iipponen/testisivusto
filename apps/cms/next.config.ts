import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  // pnpm-monorepo: node_modules on repon juuressa (template/).
  turbopack: {
    root: path.resolve(dirname, '../..'),
  },
  output: 'standalone',
  outputFileTracingRoot: path.resolve(dirname, '../..'),
  agentRules: false,
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
