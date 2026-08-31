import type { NextConfig } from 'next'

const config: NextConfig = {
  transpilePackages: ['@lakon/cv-core', '@lakon/sign-compiler', '@lakon/sign-schema'],
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
      ],
    },
  ],
}

export default config
