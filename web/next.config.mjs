/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['react-force-graph-2d', 'three'], // 그래프 라이브러리 트랜스파일 추가
  webpack: (config) => {
    config.externals.push({
      'canvas': 'commonjs canvas',
    })
    return config
  },
};

export default nextConfig;
