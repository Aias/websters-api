import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: [
    '@huggingface/transformers',
    'better-sqlite3',
    'onnxruntime-node',
    'sqlite-vec',
  ],
};

export default nextConfig;
